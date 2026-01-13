import { query } from "@anthropic-ai/claude-agent-sdk";
import type { SDKResultMessage } from "@anthropic-ai/claude-agent-sdk";
import { BaseAgent, createAgent } from "../base-agent";
import type { AgentConfig, AgentResult, AgentHandoff } from "../types";

/**
 * Multi-agent orchestrator using Claude Agent SDK
 * Manages a chain of agents that can hand off tasks to each other
 */
export class AgentOrchestrator {
  private agents: Map<string, BaseAgent> = new Map();
  private handoffHistory: AgentHandoff[] = [];
  private currentAgent: string | null = null;

  /**
   * Register an agent with the orchestrator
   */
  registerAgent(config: AgentConfig): void {
    const agent = new BaseAgent(config);
    this.agents.set(config.name, agent);
  }

  /**
   * Get a registered agent by name
   */
  getAgent(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }

  /**
   * Execute a task starting with a specific agent
   */
  async execute(startAgent: string, task: string): Promise<AgentResult> {
    const agent = this.agents.get(startAgent);
    if (!agent) {
      return {
        success: false,
        error: `Agent not found: ${startAgent}`,
      };
    }

    this.currentAgent = startAgent;
    return agent.run(task);
  }

  /**
   * Hand off from current agent to another agent
   */
  async handoff(
    toAgent: string,
    context: string,
    data?: unknown
  ): Promise<AgentResult> {
    if (!this.currentAgent) {
      return {
        success: false,
        error: "No current agent to hand off from",
      };
    }

    const nextAgent = this.agents.get(toAgent);
    if (!nextAgent) {
      return {
        success: false,
        error: `Target agent not found: ${toAgent}`,
      };
    }

    // Record the handoff
    this.handoffHistory.push({
      fromAgent: this.currentAgent,
      toAgent,
      context,
      data,
    });

    // Prepare handoff message with context
    const handoffMessage = `
[HANDOFF FROM ${this.currentAgent}]
Context: ${context}
${data ? `Data: ${JSON.stringify(data, null, 2)}` : ""}

Please continue with this task based on the context provided.
    `.trim();

    this.currentAgent = toAgent;
    return nextAgent.run(handoffMessage);
  }

  /**
   * Get handoff history
   */
  getHandoffHistory(): AgentHandoff[] {
    return [...this.handoffHistory];
  }

  /**
   * Reset all agents and history
   */
  reset(): void {
    this.agents.forEach((agent) => agent.reset());
    this.handoffHistory = [];
    this.currentAgent = null;
  }
}

/**
 * Create a simple sequential agent chain
 * Agents execute in order, passing output to the next
 */
export async function runSequentialChain(
  agents: Array<{ name: string; systemPrompt: string }>,
  initialInput: string
): Promise<AgentResult[]> {
  const results: AgentResult[] = [];
  let currentInput = initialInput;

  for (const agentConfig of agents) {
    const agent = createAgent(agentConfig.name, agentConfig.systemPrompt);
    const result = await agent.run(currentInput);
    results.push(result);

    if (!result.success) {
      break; // Stop chain on failure
    }

    // Pass output to next agent
    currentInput = `Previous agent output:\n${result.result}\n\nPlease continue with your task.`;
  }

  return results;
}

/**
 * Create a parallel agent execution
 * All agents run simultaneously on the same input
 */
export async function runParallelAgents(
  agents: Array<{ name: string; systemPrompt: string }>,
  input: string
): Promise<Map<string, AgentResult>> {
  const results = new Map<string, AgentResult>();

  const promises = agents.map(async (agentConfig) => {
    const agent = createAgent(agentConfig.name, agentConfig.systemPrompt);
    const result = await agent.run(input);
    return { name: agentConfig.name, result };
  });

  const outcomes = await Promise.all(promises);
  outcomes.forEach(({ name, result }) => {
    results.set(name, result);
  });

  return results;
}

/**
 * Create a voting/consensus mechanism
 * Multiple agents vote on a decision
 */
export async function runConsensusAgents(
  agents: Array<{ name: string; systemPrompt: string }>,
  question: string,
  options: string[]
): Promise<{ winner: string; votes: Map<string, string> }> {
  const votingPrompt = `
${question}

Please choose ONE of the following options and explain your reasoning:
${options.map((opt, i) => `${i + 1}. ${opt}`).join("\n")}

Respond with your choice number first, then your reasoning.
  `.trim();

  const results = await runParallelAgents(agents, votingPrompt);
  const votes = new Map<string, string>();

  // Parse votes from each agent
  results.forEach((result, agentName) => {
    if (result.success && result.result) {
      // Simple parsing - look for first number
      const match = result.result.match(/^(\d+)/);
      if (match) {
        const choiceIndex = parseInt(match[1]) - 1;
        if (choiceIndex >= 0 && choiceIndex < options.length) {
          votes.set(agentName, options[choiceIndex]);
        }
      }
    }
  });

  // Count votes
  const voteCounts = new Map<string, number>();
  votes.forEach((vote) => {
    voteCounts.set(vote, (voteCounts.get(vote) || 0) + 1);
  });

  // Find winner
  let winner = options[0];
  let maxVotes = 0;
  voteCounts.forEach((count, option) => {
    if (count > maxVotes) {
      maxVotes = count;
      winner = option;
    }
  });

  return { winner, votes };
}

/**
 * Pipeline agent - chains multiple agents where each agent processes
 * and transforms the output before passing to the next
 */
export async function runPipeline(
  stages: Array<{
    name: string;
    systemPrompt: string;
    transform?: (result: string) => string;
  }>,
  initialInput: string
): Promise<{
  finalResult: AgentResult;
  stageResults: Map<string, AgentResult>;
}> {
  const stageResults = new Map<string, AgentResult>();
  let currentInput = initialInput;
  let finalResult: AgentResult = { success: false, error: "No stages executed" };

  for (const stage of stages) {
    const agent = createAgent(stage.name, stage.systemPrompt);
    const result = await agent.run(currentInput);
    stageResults.set(stage.name, result);

    if (!result.success) {
      finalResult = result;
      break;
    }

    // Apply transform if provided, otherwise use raw result
    currentInput = stage.transform
      ? stage.transform(result.result || "")
      : result.result || "";
    finalResult = result;
  }

  return { finalResult, stageResults };
}

/**
 * Supervisor pattern - one agent coordinates and delegates to sub-agents
 */
export async function runWithSupervisor(
  supervisorPrompt: string,
  subAgents: Array<{ name: string; systemPrompt: string; description: string }>,
  task: string
): Promise<AgentResult> {
  // Build supervisor context with available sub-agents
  const agentList = subAgents
    .map((a) => `- ${a.name}: ${a.description}`)
    .join("\n");

  const enhancedPrompt = `
${supervisorPrompt}

You have access to the following specialized agents:
${agentList}

When you need to delegate a task, describe which agent should handle it and what they should do.
The system will execute the delegation and return the results.

Task: ${task}
  `.trim();

  const supervisor = createAgent("supervisor", enhancedPrompt);
  return supervisor.run(task);
}
