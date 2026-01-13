# Template Patterns Guide

This document explains how to extend the base SaaS template. Follow these patterns to maintain consistency and enable automated code generation.

---

## 1. Adding a New Prisma Model

### Pattern
```prisma
// In /prisma/schema.prisma

model NewModel {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Foreign key to User (via Clerk)
  userId    String
  
  // Your fields here
  name      String
  status    String   @default("active")
  
  // Relations
  items     Item[]
  
  @@index([userId])
}
```

### Steps
1. Add model to `/prisma/schema.prisma`
2. Run: `npx prisma generate`
3. Run: `npx prisma db push` (dev) or `npx prisma migrate dev` (prod)
4. Verify in Prisma Studio: `npx prisma studio`

### Conventions
- Use `cuid()` for IDs (not UUID)
- Always include `createdAt` and `updatedAt`
- Always include `userId` for user-owned resources
- Add `@@index` for frequently queried fields

---

## 2. Adding a New API Route

### Pattern
```typescript
// In /app/api/[resource]/route.ts

import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const items = await prisma.newModel.findMany({
      where: { userId }
    });
    
    return NextResponse.json(items);
  } catch (error) {
    console.error("[RESOURCE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Validate with Zod here
    
    const item = await prisma.newModel.create({
      data: {
        userId,
        ...body
      }
    });
    
    return NextResponse.json(item);
  } catch (error) {
    console.error("[RESOURCE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
```

### Steps
1. Create folder: `/app/api/[resource]/`
2. Create `route.ts` with handlers
3. For dynamic routes: `/app/api/[resource]/[id]/route.ts`
4. Add Zod validation schema in `/lib/validations/[resource].ts`

### Conventions
- Always check `auth()` first
- Always wrap in try/catch
- Log errors with descriptive prefixes: `[RESOURCE_ACTION]`
- Return proper HTTP status codes

---

## 3. Adding a New Page

### Pattern
```typescript
// In /app/[feature]/page.tsx

import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function FeaturePage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Feature Name</h1>
      {/* Content */}
    </div>
  );
}
```

### Steps
1. Create folder: `/app/[feature]/`
2. Create `page.tsx`
3. If needed, create `layout.tsx` for feature-specific layout
4. Add to navigation in `/components/layout/navbar.tsx`
5. If protected, middleware handles auth redirect

### Conventions
- Use Server Components by default
- Add `"use client"` only when needed (interactivity)
- Fetch data in Server Components, not Client Components
- Use Tailwind for styling

---

## 4. Adding Stripe Integration

### Pattern: New Subscription Tier
```typescript
// In /constants/stripe.ts (or similar)

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    priceId: null,
    features: ["Feature 1", "Feature 2"],
    limits: {
      apiCalls: 100,
      storage: "1GB"
    }
  },
  pro: {
    name: "Pro",
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: ["Everything in Free", "Feature 3", "Feature 4"],
    limits: {
      apiCalls: 10000,
      storage: "100GB"
    }
  }
};
```

### Pattern: Check Subscription
```typescript
// In any API route or server component

import { checkSubscription } from "@/lib/subscription";

const isPro = await checkSubscription(userId);

if (!isPro) {
  return new NextResponse("Upgrade required", { status: 403 });
}
```

### Webhook Events to Handle
- `checkout.session.completed` — User subscribed
- `invoice.payment_succeeded` — Renewal succeeded
- `invoice.payment_failed` — Payment failed
- `customer.subscription.deleted` — User canceled

---

## 5. Claude Agent SDK Patterns

The Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) is the PRIMARY AI driver for this template. It provides Claude Code's full capabilities including file system access, tool use, MCP server integration, and session management.

### Pattern: Simple Agent Query
```typescript
// Direct SDK usage with query function

import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Analyze this code",
  options: {
    model: "claude-sonnet-4-5-20250929",
    systemPrompt: "You are a code reviewer."
  }
})) {
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
  }
}
```

### Pattern: Using the Agent Wrapper
```typescript
// In /lib/agents/example.ts

import { createAgent } from "@/lib/agents";

export async function runSimpleAgent(prompt: string) {
  const agent = createAgent(
    "example-agent",
    "You are a helpful assistant."
  );

  const result = await agent.run(prompt);
  return result.result;
}
```

### Pattern: Agent with Built-in Tools
```typescript
// Enable Claude Code's built-in tools (Read, Write, Bash, etc.)

import { createToolAgent, TOOL_PRESETS, BUILTIN_TOOLS } from "@/lib/agents";

// Use tool presets
const devAgent = createToolAgent(
  "developer",
  "You are a software developer.",
  TOOL_PRESETS.development  // Read, Write, Edit, Glob, Grep, Bash
);

// Or specify individual tools
const readOnlyAgent = createToolAgent(
  "analyst",
  "You are a code analyst.",
  [BUILTIN_TOOLS.Read, BUILTIN_TOOLS.Glob, BUILTIN_TOOLS.Grep]
);

const result = await devAgent.run("Fix the bug in auth.ts");
```

### Pattern: Custom MCP Tools
```typescript
// In /lib/agents/tools/custom.ts

import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

export const myToolsServer = createSdkMcpServer({
  name: "my-tools",
  version: "1.0.0",
  tools: [
    tool(
      "my_action",
      "Does something specific",
      {
        input: z.string().describe("The input"),
        option: z.boolean().optional().describe("An option"),
      },
      async (args) => {
        // Implement tool logic
        return JSON.stringify({ success: true, data: args.input });
      }
    ),
  ],
});

// Use in an agent
import { createMcpAgent } from "@/lib/agents";

const agent = createMcpAgent(
  "custom-agent",
  "You have custom tools available.",
  { "my-tools": myToolsServer }
);
```

### Pattern: Streaming Agent Response
```typescript
// In /app/api/ai/stream/route.ts

import { createAgent } from "@/lib/agents";

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const agent = createAgent("streaming-agent", "You are helpful.");

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const message of agent.stream(prompt)) {
        if (message.type === "assistant") {
          // Extract and stream text content
          const content = message.message.content;
          // ... stream to client
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/event-stream" }
  });
}
```

### Pattern: Session Management
```typescript
// Resume conversations across requests

import { createAgent } from "@/lib/agents";

const agent = createAgent("assistant", "You are helpful.");

// First interaction
const result1 = await agent.run("Hello, my name is Alice");
const sessionId = agent.getSessionId();

// Later - resume the session
agent.setSessionId(sessionId);
const result2 = await agent.run("What is my name?");
// Agent remembers: "Your name is Alice"
```

### Pattern: Multi-Agent Orchestration
```typescript
import { AgentOrchestrator } from "@/lib/agents";

const orchestrator = new AgentOrchestrator();

orchestrator.registerAgent({
  name: "researcher",
  systemPrompt: "Research the given topic thoroughly.",
});

orchestrator.registerAgent({
  name: "writer",
  systemPrompt: "Write engaging content based on research.",
});

// Execute and hand off
const research = await orchestrator.execute("researcher", task);
const content = await orchestrator.handoff("writer", "Create content", research.result);
```

### Pattern: Pipeline with Transforms
```typescript
import { runPipeline } from "@/lib/agents";

const { finalResult, stageResults } = await runPipeline(
  [
    { name: "extractor", systemPrompt: "Extract key facts." },
    {
      name: "analyzer",
      systemPrompt: "Analyze the facts.",
      transform: (result) => `Analyze these facts:\n${result}`
    },
    { name: "reporter", systemPrompt: "Generate a report." },
  ],
  initialData
);
```

### Pattern: Parallel Agents
```typescript
import { runParallelAgents } from "@/lib/agents";

const results = await runParallelAgents(
  [
    { name: "sentiment", systemPrompt: "Analyze sentiment." },
    { name: "keywords", systemPrompt: "Extract key topics." },
    { name: "summary", systemPrompt: "Write a summary." },
  ],
  "Text to analyze..."
);

const sentiment = results.get("sentiment");
const keywords = results.get("keywords");
```

### Pattern: Consensus/Voting
```typescript
import { runConsensusAgents } from "@/lib/agents";

const { winner, votes } = await runConsensusAgents(
  [
    { name: "expert1", systemPrompt: "You are a UX expert." },
    { name: "expert2", systemPrompt: "You are a tech lead." },
  ],
  "Which approach should we take?",
  ["Option A", "Option B", "Option C"]
);
```

### Permission Modes
```typescript
// Control what the agent can do
const agent = createAgent("assistant", "...", {
  permissionMode: "default",      // Normal permissions
  // permissionMode: "acceptEdits", // Auto-accept file edits
  // permissionMode: "plan",        // Planning mode only
});
```

### Conventions
- Use `query()` directly for simple one-off queries
- Use `createAgent()` for reusable agent instances
- Use `createToolAgent()` with `BUILTIN_TOOLS` or `TOOL_PRESETS` for tool access
- Use `createMcpAgent()` for custom MCP tool servers
- Use `AgentOrchestrator` for complex multi-agent workflows
- Always handle session IDs for conversation continuity
- Use streaming for real-time user feedback

---

## 6. Adding UI Components

### Pattern: New Component
```typescript
// In /components/[feature]/feature-card.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FeatureCardProps {
  title: string;
  description: string;
  onAction: () => void;
}

export function FeatureCard({ title, description, onAction }: FeatureCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>
        <Button onClick={onAction}>Take Action</Button>
      </CardContent>
    </Card>
  );
}
```

### Conventions
- Use shadcn/ui components as base
- Always define TypeScript interfaces for props
- Keep components small and focused
- Use `"use client"` only when needed

---

## 7. Environment Variables

### Required Variables
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Stripe
STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=

# AI (optional)
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Adding New Variables
1. Add to `.env.local` (never commit)
2. Add to `.env.example` with placeholder
3. Document in this file
4. Access via `process.env.VAR_NAME`

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server
npx prisma studio        # Open database GUI
npx prisma db push       # Push schema changes

# Database
npx prisma generate      # Regenerate client
npx prisma migrate dev   # Create migration
npx prisma migrate reset # Reset database (DESTRUCTIVE)

# Stripe CLI (for local testing)
stripe listen --forward-to localhost:3000/api/webhook
stripe trigger checkout.session.completed

# Production
npm run build            # Build for production
npm run start            # Start production server
```

---

**Note to Agents:** When extending the template, always follow these patterns exactly. If a pattern doesn't exist for what you need, request an update to this file before inventing a new approach.
