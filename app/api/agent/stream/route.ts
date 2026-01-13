import { auth } from "@clerk/nextjs/server";
import { checkSubscription } from "@/lib/subscription";
import { checkApiLimit, incrementApiLimit } from "@/lib/api-limit";
import { createAgent } from "@/lib/agents";
import type { SDKAssistantMessage } from "@/lib/agents";

/**
 * Claude Agent SDK Streaming API Route
 * Returns streaming responses using Server-Sent Events
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const {
      prompt,
      systemPrompt = "You are a helpful AI assistant.",
      maxTurns = 10,
    } = body;

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response("Anthropic API Key not configured.", { status: 500 });
    }

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new Response("Free trial has expired. Please upgrade to pro.", {
        status: 403,
      });
    }

    const agent = createAgent("streaming-agent", systemPrompt, { maxTurns });
    const stream = agent.stream(prompt);

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const message of stream) {
            // Stream assistant messages
            if (message.type === "assistant") {
              const assistantMsg = message as SDKAssistantMessage;
              const content = assistantMsg.message.content;

              // Extract text content from the message
              if (Array.isArray(content)) {
                for (const block of content) {
                  if (block.type === "text") {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ type: "text", text: block.text })}\n\n`)
                    );
                  } else if (block.type === "tool_use") {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ type: "tool_use", tool: block.name })}\n\n`
                      )
                    );
                  }
                }
              } else if (typeof content === "string") {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: "text", text: content })}\n\n`)
                );
              }
            }

            // Stream result message at the end
            if (message.type === "result") {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "result",
                    success: message.subtype === "success",
                    sessionId: message.session_id,
                    numTurns: message.num_turns,
                  })}\n\n`
                )
              );
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();

          if (!isPro) {
            await incrementApiLimit();
          }
        } catch (error) {
          console.error("[AGENT_STREAM_ERROR]", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: "Stream error occurred" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[AGENT_STREAM_ERROR]", error);
    return new Response("Internal Error", { status: 500 });
  }
}
