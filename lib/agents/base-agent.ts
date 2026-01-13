import { query } from "@anthropic-ai/claude-agent-sdk";
import type {
  SDKMessage,
  SDKResultMessage,
  SDKAssistantMessage,
} from "@anthropic-ai/claude-agent-sdk";
import type { AgentConfig, AgentResult, ConversationMessage } from "./types";

const DEFAULT_MODEL = "claude-sonnet-4-5-20250929";
const DEFAULT_MAX_TURNS = 10;

/**
 * Base agent class using Claude Agent SDK
 * Wraps the SDK's query function with a convenient interface
 */
export class BaseAgent {
  private config: AgentConfig;
  private sessionId?: string;

  constructor(config: AgentConfig) {
    this.config = {
      model: DEFAULT_MODEL,
      maxTurns: DEFAULT_MAX_TURNS,
      permissionMode: "default",
      ...config,
    };
  }

  /**
   * Execute a single query with the agent
   */
  async run(prompt: string): Promise<AgentResult> {
    try {
      const q = query({
        prompt,
        options: {
          model: this.config.model,
          systemPrompt: this.config.systemPrompt,
          maxTurns: this.config.maxTurns,
          permissionMode: this.config.permissionMode,
          allowedTools: this.config.allowedTools,
          disallowedTools: this.config.disallowedTools,
          mcpServers: this.config.mcpServers,
          resume: this.sessionId,
        },
      });

      let result: AgentResult = {
        success: false,
        error: "No result received",
      };

      for await (const message of q) {
        if (message.type === "result") {
          const resultMsg = message as SDKResultMessage;
          this.sessionId = resultMsg.session_id;

          if (resultMsg.subtype === "success") {
            result = {
              success: true,
              result: resultMsg.result,
              sessionId: resultMsg.session_id,
              numTurns: resultMsg.num_turns,
              usage: {
                inputTokens: resultMsg.usage.input_tokens,
                outputTokens: resultMsg.usage.output_tokens,
              },
              totalCostUsd: resultMsg.total_cost_usd,
            };
          } else {
            result = {
              success: false,
              sessionId: resultMsg.session_id,
              numTurns: resultMsg.num_turns,
              error: resultMsg.subtype,
              errors: "errors" in resultMsg ? resultMsg.errors : undefined,
            };
          }
        }
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Stream agent responses
   * Yields assistant message content as it arrives
   */
  async *stream(prompt: string): AsyncGenerator<SDKMessage, AgentResult> {
    try {
      const q = query({
        prompt,
        options: {
          model: this.config.model,
          systemPrompt: this.config.systemPrompt,
          maxTurns: this.config.maxTurns,
          permissionMode: this.config.permissionMode,
          allowedTools: this.config.allowedTools,
          disallowedTools: this.config.disallowedTools,
          mcpServers: this.config.mcpServers,
          resume: this.sessionId,
        },
      });

      let result: AgentResult = {
        success: false,
        error: "No result received",
      };

      for await (const message of q) {
        yield message;

        if (message.type === "result") {
          const resultMsg = message as SDKResultMessage;
          this.sessionId = resultMsg.session_id;

          if (resultMsg.subtype === "success") {
            result = {
              success: true,
              result: resultMsg.result,
              sessionId: resultMsg.session_id,
              numTurns: resultMsg.num_turns,
              usage: {
                inputTokens: resultMsg.usage.input_tokens,
                outputTokens: resultMsg.usage.output_tokens,
              },
              totalCostUsd: resultMsg.total_cost_usd,
            };
          } else {
            result = {
              success: false,
              sessionId: resultMsg.session_id,
              error: resultMsg.subtype,
            };
          }
        }
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Continue a conversation with streaming input
   * Note: The messages generator should yield SDKUserMessage format
   */
  async runConversation(
    messages: AsyncIterable<{ type: "user"; message: { role: "user"; content: string } }>
  ): Promise<AgentResult> {
    try {
      const q = query({
        prompt: messages as any,
        options: {
          model: this.config.model,
          systemPrompt: this.config.systemPrompt,
          maxTurns: this.config.maxTurns,
          permissionMode: this.config.permissionMode,
          mcpServers: this.config.mcpServers,
          resume: this.sessionId,
        },
      });

      let result: AgentResult = {
        success: false,
        error: "No result received",
      };

      for await (const message of q) {
        if (message.type === "result") {
          const resultMsg = message as SDKResultMessage;
          this.sessionId = resultMsg.session_id;

          if (resultMsg.subtype === "success") {
            result = {
              success: true,
              result: resultMsg.result,
              sessionId: resultMsg.session_id,
              numTurns: resultMsg.num_turns,
              usage: {
                inputTokens: resultMsg.usage.input_tokens,
                outputTokens: resultMsg.usage.output_tokens,
              },
              totalCostUsd: resultMsg.total_cost_usd,
            };
          }
        }
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get the current session ID for resuming conversations
   */
  getSessionId(): string | undefined {
    return this.sessionId;
  }

  /**
   * Set a session ID to resume a previous conversation
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /**
   * Reset the agent (clear session)
   */
  reset(): void {
    this.sessionId = undefined;
  }
}

/**
 * Create a simple agent
 */
export function createAgent(
  name: string,
  systemPrompt: string,
  options?: Partial<AgentConfig>
): BaseAgent {
  return new BaseAgent({
    name,
    systemPrompt,
    ...options,
  });
}

/**
 * Create an agent with specific tools enabled
 */
export function createToolAgent(
  name: string,
  systemPrompt: string,
  allowedTools: string[],
  options?: Partial<AgentConfig>
): BaseAgent {
  return new BaseAgent({
    name,
    systemPrompt,
    allowedTools,
    ...options,
  });
}

/**
 * Create an agent with MCP servers
 */
export function createMcpAgent(
  name: string,
  systemPrompt: string,
  mcpServers: AgentConfig["mcpServers"],
  options?: Partial<AgentConfig>
): BaseAgent {
  return new BaseAgent({
    name,
    systemPrompt,
    mcpServers,
    ...options,
  });
}

/**
 * Execute a one-shot query without creating an agent instance
 */
export async function runQuery(
  prompt: string,
  systemPrompt?: string,
  options?: Partial<AgentConfig>
): Promise<AgentResult> {
  const agent = createAgent("one-shot", systemPrompt || "You are a helpful assistant.", options);
  return agent.run(prompt);
}
