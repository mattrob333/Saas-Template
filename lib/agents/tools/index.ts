import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

/**
 * Claude Agent SDK Custom Tools
 *
 * Custom MCP tools for use with the Claude Agent SDK.
 * These tools are created using createSdkMcpServer and can be passed
 * to agents via the mcpServers option.
 *
 * @see https://platform.claude.com/docs/en/agent-sdk/custom-tools
 */

/**
 * Database tools MCP server
 * Provides database query and record creation capabilities
 */
export const databaseToolsServer = createSdkMcpServer({
  name: "database-tools",
  version: "1.0.0",
  tools: [
    tool(
      "query_database",
      "Query records from the database",
      {
        table: z.string().describe("The table to query"),
        filters: z.record(z.unknown()).optional().describe("Filter conditions"),
        limit: z.number().optional().describe("Maximum results to return"),
      },
      async (args) => {
        // Implement your database query logic here
        // This is a placeholder - connect to your actual database
        return JSON.stringify({
          success: true,
          message: `Query executed on table: ${args.table}`,
          filters: args.filters,
          limit: args.limit || 10,
        });
      }
    ),
    tool(
      "create_record",
      "Create a new record in the database",
      {
        table: z.string().describe("The table to insert into"),
        data: z.record(z.unknown()).describe("The data to insert"),
      },
      async (args) => {
        // Implement your database insert logic here
        return JSON.stringify({
          success: true,
          message: `Record created in table: ${args.table}`,
          data: args.data,
        });
      }
    ),
    tool(
      "update_record",
      "Update an existing record in the database",
      {
        table: z.string().describe("The table containing the record"),
        id: z.string().describe("The record ID to update"),
        data: z.record(z.unknown()).describe("The data to update"),
      },
      async (args) => {
        // Implement your database update logic here
        return JSON.stringify({
          success: true,
          message: `Record ${args.id} updated in table: ${args.table}`,
          data: args.data,
        });
      }
    ),
  ],
});

/**
 * Notification tools MCP server
 * Provides notification sending capabilities
 */
export const notificationToolsServer = createSdkMcpServer({
  name: "notification-tools",
  version: "1.0.0",
  tools: [
    tool(
      "send_notification",
      "Send a notification to a user",
      {
        userId: z.string().describe("The user ID to notify"),
        message: z.string().describe("The notification message"),
        type: z
          .enum(["info", "warning", "error", "success"])
          .optional()
          .describe("The notification type"),
      },
      async (args) => {
        // Implement your notification logic here
        return JSON.stringify({
          success: true,
          message: `Notification sent to user: ${args.userId}`,
          notificationType: args.type || "info",
          content: args.message,
        });
      }
    ),
    tool(
      "send_email",
      "Send an email to a user",
      {
        to: z.string().email().describe("The recipient email address"),
        subject: z.string().describe("The email subject"),
        body: z.string().describe("The email body"),
      },
      async (args) => {
        // Implement your email sending logic here
        return JSON.stringify({
          success: true,
          message: `Email sent to: ${args.to}`,
          subject: args.subject,
        });
      }
    ),
  ],
});

/**
 * Content generation tools MCP server
 * Provides content generation capabilities
 */
export const contentToolsServer = createSdkMcpServer({
  name: "content-tools",
  version: "1.0.0",
  tools: [
    tool(
      "generate_summary",
      "Generate a summary of provided text",
      {
        text: z.string().describe("The text to summarize"),
        maxLength: z.number().optional().describe("Maximum summary length"),
      },
      async (args) => {
        // Implement summarization logic (could call another AI model)
        return JSON.stringify({
          success: true,
          summary: `Summary of text (${args.text.length} chars)`,
          maxLength: args.maxLength || 200,
        });
      }
    ),
  ],
});

/**
 * Handoff tools MCP server
 * Provides human handoff capabilities for agent chains
 */
export const handoffToolsServer = createSdkMcpServer({
  name: "handoff-tools",
  version: "1.0.0",
  tools: [
    tool(
      "handoff_to_human",
      "Request human intervention when the task requires human judgment",
      {
        reason: z.string().describe("Why human intervention is needed"),
        context: z.string().optional().describe("Relevant context for the human"),
        suggestedAction: z.string().optional().describe("What the agent suggests"),
      },
      async (args) => {
        // Implement handoff logic (e.g., create a ticket, send alert)
        return JSON.stringify({
          success: true,
          handoffRequested: true,
          reason: args.reason,
          context: args.context,
          suggestedAction: args.suggestedAction,
        });
      }
    ),
    tool(
      "escalate_to_agent",
      "Escalate the task to another specialized agent",
      {
        targetAgent: z.string().describe("The name of the agent to escalate to"),
        context: z.string().describe("Context to pass to the target agent"),
        priority: z
          .enum(["low", "medium", "high", "urgent"])
          .optional()
          .describe("Priority level"),
      },
      async (args) => {
        return JSON.stringify({
          success: true,
          escalated: true,
          targetAgent: args.targetAgent,
          priority: args.priority || "medium",
        });
      }
    ),
  ],
});

/**
 * All custom MCP servers bundled together
 * Use this to quickly add all custom tools to an agent
 */
export const allCustomServers = {
  "database-tools": databaseToolsServer,
  "notification-tools": notificationToolsServer,
  "content-tools": contentToolsServer,
  "handoff-tools": handoffToolsServer,
};

/**
 * Built-in Claude Code tools that can be enabled
 * Use these strings in the allowedTools array
 */
export const BUILTIN_TOOLS = {
  // File system tools
  Read: "Read",
  Write: "Write",
  Edit: "Edit",
  Glob: "Glob",
  Grep: "Grep",

  // Execution tools
  Bash: "Bash",

  // Web tools
  WebFetch: "WebFetch",
  WebSearch: "WebSearch",

  // Notebook tools
  NotebookEdit: "NotebookEdit",

  // Task management
  Task: "Task",
  TodoWrite: "TodoWrite",
} as const;

/**
 * Tool presets for common use cases
 */
export const TOOL_PRESETS = {
  // Read-only file access
  readOnly: [BUILTIN_TOOLS.Read, BUILTIN_TOOLS.Glob, BUILTIN_TOOLS.Grep],

  // Full file access
  fileAccess: [
    BUILTIN_TOOLS.Read,
    BUILTIN_TOOLS.Write,
    BUILTIN_TOOLS.Edit,
    BUILTIN_TOOLS.Glob,
    BUILTIN_TOOLS.Grep,
  ],

  // Development tools
  development: [
    BUILTIN_TOOLS.Read,
    BUILTIN_TOOLS.Write,
    BUILTIN_TOOLS.Edit,
    BUILTIN_TOOLS.Glob,
    BUILTIN_TOOLS.Grep,
    BUILTIN_TOOLS.Bash,
  ],

  // Research tools
  research: [
    BUILTIN_TOOLS.Read,
    BUILTIN_TOOLS.Glob,
    BUILTIN_TOOLS.Grep,
    BUILTIN_TOOLS.WebFetch,
    BUILTIN_TOOLS.WebSearch,
  ],

  // All tools
  all: Object.values(BUILTIN_TOOLS),
} as const;
