/**
 * Claude Agent SDK - Main Exports
 *
 * This module provides a complete agent framework built on the official
 * Claude Agent SDK (@anthropic-ai/claude-agent-sdk).
 *
 * @see https://platform.claude.com/docs/en/agent-sdk/typescript
 */

// Re-export SDK query function and types
export { query } from "@anthropic-ai/claude-agent-sdk";
export type {
  SDKMessage,
  SDKAssistantMessage,
  SDKUserMessage,
  SDKResultMessage,
  SDKSystemMessage,
} from "./client";

// Agent classes and factories
export {
  BaseAgent,
  createAgent,
  createToolAgent,
  createMcpAgent,
  runQuery,
} from "./base-agent";

// Types
export type {
  AgentConfig,
  AgentResult,
  AgentHandoff,
  AgentState,
  McpServerConfig,
  ConversationMessage,
} from "./types";

// Custom MCP tool servers
export {
  databaseToolsServer,
  notificationToolsServer,
  contentToolsServer,
  handoffToolsServer,
  allCustomServers,
  BUILTIN_TOOLS,
  TOOL_PRESETS,
} from "./tools";

// Orchestration patterns
export {
  AgentOrchestrator,
  runSequentialChain,
  runParallelAgents,
  runConsensusAgents,
  runPipeline,
  runWithSupervisor,
} from "./chains/orchestrator";
