/**
 * Claude Agent SDK Types
 *
 * Type definitions for working with the Claude Agent SDK.
 * Re-exports SDK types and defines application-specific interfaces.
 */

// Re-export SDK types
export type {
  SDKMessage,
  SDKAssistantMessage,
  SDKUserMessage,
  SDKResultMessage,
  SDKSystemMessage,
} from "@anthropic-ai/claude-agent-sdk";

/**
 * Agent configuration for creating agents
 */
export interface AgentConfig {
  name: string;
  systemPrompt: string;
  model?: string;
  maxTurns?: number;
  permissionMode?: "default" | "acceptEdits" | "bypassPermissions" | "plan";
  allowedTools?: string[];
  disallowedTools?: string[];
  mcpServers?: Record<string, McpServerConfig>;
}

/**
 * MCP Server configuration
 */
export interface McpServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

/**
 * Result from an agent execution
 */
export interface AgentResult {
  success: boolean;
  result?: string;
  sessionId?: string;
  numTurns?: number;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  totalCostUsd?: number;
  error?: string;
  errors?: string[];
}

/**
 * Agent handoff context for multi-agent workflows
 */
export interface AgentHandoff {
  fromAgent: string;
  toAgent: string;
  context: string;
  data?: unknown;
}

/**
 * Conversation message for streaming input
 */
export interface ConversationMessage {
  type: "user";
  message: {
    role: "user";
    content: string;
  };
}

/**
 * Agent state for session management
 */
export interface AgentState {
  agentName: string;
  sessionId?: string;
  conversationHistory: ConversationMessage[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
