/**
 * Claude Agent SDK Client
 *
 * The Claude Agent SDK provides the `query` function for building AI agents
 * with Claude Code's capabilities including file system access, tool use,
 * MCP server integration, and multi-turn conversations.
 *
 * @see https://platform.claude.com/docs/en/agent-sdk/typescript
 */

export { query } from "@anthropic-ai/claude-agent-sdk";
export type {
  SDKMessage,
  SDKAssistantMessage,
  SDKUserMessage,
  SDKResultMessage,
  SDKSystemMessage,
} from "@anthropic-ai/claude-agent-sdk";
