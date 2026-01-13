import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { checkSubscription } from "@/lib/subscription";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { createAgent, createToolAgent, BUILTIN_TOOLS, TOOL_PRESETS } from "@/lib/agents";

/**
 * Claude Agent SDK API Route
 * Handles agentic conversations using the official Claude Agent SDK
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const {
      prompt,
      systemPrompt = "You are a helpful AI assistant.",
      agentType = "default",
      tools,
      maxTurns = 10,
    } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return new NextResponse("Anthropic API Key not configured.", {
        status: 500,
      });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse(
        "Free trial has expired. Please upgrade to pro.",
        { status: 403 }
      );
    }

    // System prompts for different agent types
    const systemPrompts: Record<string, string> = {
      default: systemPrompt,
      researcher:
        "You are a research assistant. Find and summarize information clearly and accurately. Use web search when needed.",
      writer:
        "You are a content writer. Create engaging, well-structured content based on the given topic.",
      analyst:
        "You are a data analyst. Analyze information and provide actionable insights.",
      developer:
        "You are a software developer. Help write, review, and debug code. Use file tools when needed.",
    };

    // Tool presets for different agent types
    const toolPresets: Record<string, string[]> = {
      default: [],
      researcher: [...TOOL_PRESETS.research],
      writer: [],
      analyst: [...TOOL_PRESETS.readOnly],
      developer: [...TOOL_PRESETS.development],
    };

    const effectiveSystemPrompt = systemPrompts[agentType] || systemPrompts.default;
    const effectiveTools = tools || toolPresets[agentType] || [];

    // Create agent with appropriate configuration
    const agent = effectiveTools.length > 0
      ? createToolAgent(`${agentType}-agent`, effectiveSystemPrompt, effectiveTools, { maxTurns })
      : createAgent(`${agentType}-agent`, effectiveSystemPrompt, { maxTurns });

    const result = await agent.run(prompt);

    if (!isPro) {
      await incrementApiLimit();
    }

    return NextResponse.json({
      success: result.success,
      result: result.result,
      sessionId: result.sessionId,
      numTurns: result.numTurns,
      usage: result.usage,
      totalCostUsd: result.totalCostUsd,
      error: result.error,
    });
  } catch (error) {
    console.error("[AGENT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
