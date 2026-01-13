# SaaS Factory Template

A modern, production-ready SaaS template powered by the **Claude Agent SDK** for building AI-native applications with multi-agent orchestration capabilities.

## Overview

SaaS Factory is a comprehensive template for rapidly building AI-powered SaaS applications. It combines the official Claude Agent SDK with a robust Next.js foundation, providing everything you need to create intelligent, scalable applications with sophisticated agent workflows.

### Why Claude Agent SDK?

The Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) is the **primary AI driver** for this template, enabling:

- **Agentic Interactions**: Multi-turn conversations with tool use and reasoning
- **Built-in Tools**: Access to Claude's native tools (Read, Write, Edit, Bash, WebSearch, etc.)
- **Session Management**: Persistent conversations with session resumption
- **Custom MCP Servers**: Extend capabilities with Model Context Protocol tools
- **Multi-Agent Orchestration**: Sequential chains, parallel execution, consensus workflows

## Features

### AI Agent System
- **BaseAgent Class**: Flexible agent wrapper around the SDK's `query()` function
- **Tool Presets**: Pre-configured tool sets for different agent types (researcher, developer, analyst)
- **Custom MCP Tools**: Database, notification, content, and handoff tool servers
- **Orchestration Patterns**: Sequential chains, parallel agents, consensus voting, pipelines, supervisor patterns

### Agent Types
- **Default Agent**: General-purpose assistant
- **Researcher Agent**: Web search and information synthesis
- **Writer Agent**: Content creation and editing
- **Analyst Agent**: Data analysis with read-only file access
- **Developer Agent**: Code generation with full development tools

### Core Infrastructure
- **Authentication**: Clerk for user management and authentication
- **Database**: Supabase + Prisma ORM
- **Payments**: Stripe integration with subscription management
- **Rate Limiting**: Free tier limits with Pro plan upgrades
- **UI Components**: shadcn/ui + Tailwind CSS

## Technology Stack

| Category | Technologies |
|----------|-------------|
| **AI** | Claude Agent SDK, Anthropic API |
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **UI Components** | shadcn/ui, Radix UI, Lucide Icons |
| **Backend** | Next.js API Routes, Prisma ORM |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Clerk |
| **Payments** | Stripe |
| **State** | Zustand |
| **Forms** | React Hook Form, Zod |

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── agent/           # Claude Agent SDK endpoints
│   │   │   ├── route.ts     # Main agent API
│   │   │   └── stream/      # Streaming responses
│   │   ├── conversation/    # Legacy OpenAI route
│   │   ├── stripe/          # Payment webhooks
│   │   └── webhook/         # Stripe webhooks
│   └── (dashboard)/         # Protected dashboard routes
├── lib/
│   ├── agents/              # Agent SDK integration
│   │   ├── base-agent.ts    # BaseAgent class
│   │   ├── types.ts         # TypeScript types
│   │   ├── tools/           # Custom MCP tool servers
│   │   └── chains/          # Orchestration patterns
│   ├── api-limit.ts         # Rate limiting
│   └── subscription.ts      # Stripe subscription checks
├── components/              # React components
├── specs/                   # Technical specifications
└── .ralph/                  # Ralph loop configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Supabase account
- Clerk account
- Stripe account
- Anthropic API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/saas-factory.git
   cd saas-factory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Set up your environment variables** in `.env`:
   ```bash
   # Required - Claude Agent SDK
   ANTHROPIC_API_KEY=sk-ant-xxxxx

   # Required - Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

   # Required - Database
   DATABASE_URL=postgresql://user:password@localhost:5432/database
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx

   # Required - Payments
   STRIPE_API_KEY=sk_test_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   STRIPE_PRO_PRICE_ID=price_xxxxx
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Optional - Additional AI providers
   OPENAI_API_KEY=sk-xxxxx
   REPLICATE_API_TOKEN=r8_xxxxx
   ```

5. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see your app.

## Using the Agent API

### Basic Request

```typescript
const response = await fetch('/api/agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Analyze this code and suggest improvements',
    agentType: 'developer',
    maxTurns: 10,
  }),
});

const result = await response.json();
console.log(result.result);
```

### Agent Types

| Type | Description | Tools |
|------|-------------|-------|
| `default` | General assistant | None |
| `researcher` | Web search & synthesis | WebSearch, WebFetch, Read |
| `writer` | Content creation | None |
| `analyst` | Data analysis | Read, Glob, Grep |
| `developer` | Code generation | Read, Write, Edit, Bash, Glob, Grep |

### Custom System Prompts

```typescript
const response = await fetch('/api/agent', {
  method: 'POST',
  body: JSON.stringify({
    prompt: 'Your task here',
    systemPrompt: 'You are a specialized assistant for...',
    tools: ['Read', 'Write', 'Edit'],
  }),
});
```

### Streaming Responses

```typescript
const response = await fetch('/api/agent/stream', {
  method: 'POST',
  body: JSON.stringify({
    prompt: 'Generate a detailed report',
    agentType: 'analyst',
  }),
});

const reader = response.body?.getReader();
// Process SSE stream
```

## Agent Architecture

### BaseAgent Class

The `BaseAgent` class wraps the Claude Agent SDK's `query()` function:

```typescript
import { createAgent, createToolAgent } from '@/lib/agents';

// Simple agent
const agent = createAgent('assistant', 'You are helpful.');
const result = await agent.run('Hello!');

// Agent with tools
const devAgent = createToolAgent(
  'developer',
  'You are a senior developer.',
  ['Read', 'Write', 'Edit', 'Bash']
);
const result = await devAgent.run('Create a React component');
```

### Multi-Agent Orchestration

```typescript
import { runSequentialChain, runParallelAgents } from '@/lib/agents';

// Sequential chain
const result = await runSequentialChain(
  [researchAgent, writerAgent, editorAgent],
  'Write an article about AI'
);

// Parallel execution
const results = await runParallelAgents(
  [analyzerA, analyzerB, analyzerC],
  'Analyze this data'
);
```

## Prisma Commands

```bash
npx prisma generate      # Generate client
npx prisma db push       # Push schema to database
npx prisma studio        # Open Prisma Studio
npx prisma migrate reset # Reset database (destructive)
```

## Stripe Setup

1. Create a Stripe account and get API keys
2. Set up a webhook endpoint pointing to `/api/webhook`
3. For local development:
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/webhook
   ```
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`
5. Create a Pro plan product and copy the price ID to `STRIPE_PRO_PRICE_ID`

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the [MIT License](LICENSE).

## Credits

This template builds upon work from:
- [@RicardoGEsteves' Omniscient](https://github.com/RicardoGEsteves/omniscient)
- [@AntonioErdeljac's tutorial](https://www.youtube.com/watch?v=ffJ38dBzrlY)
- [Anthropic Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/typescript)
