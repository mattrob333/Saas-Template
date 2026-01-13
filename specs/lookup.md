# Context Lookup Table

This file assists AI agents in linking concepts to code locations. When searching, agents should use these synonyms and file references to improve hit rates.

## Core Application Patterns

| Concept | Synonyms / Search Terms | Related Files |
|---------|------------------------|---------------|
| User Authentication | Login, Sign-in, Session, AuthZ, Identity, Clerk | `/middleware.ts`, `/app/(auth)/*` |
| User Management | Profile, Account, Settings, User data | `/lib/clerk.ts`, `/app/settings/*` |
| Database Access | Prisma, Query, ORM, DB, Postgres, Supabase | `/lib/prismadb.ts`, `/prisma/schema.prisma` |
| API Routes | Endpoint, Handler, REST, Backend | `/app/api/*` |
| Billing | Stripe, Payment, Subscription, Plan, Tier | `/lib/stripe.ts`, `/app/api/webhook/*` |
| UI Components | Button, Modal, Form, Card, shadcn | `/components/ui/*` |
| Layout | Header, Footer, Sidebar, Navigation | `/components/layout/*`, `/app/layout.tsx` |
| State Management | Zustand, Store, Global state | `/hooks/*`, `/lib/store.ts` |
| Form Handling | React Hook Form, Validation, Zod | `/lib/validations/*` |
| AI Integration | Claude SDK, Anthropic, Agent, LLM | `/lib/agents/*`, `/app/api/agent/*` |

## Stripe-Specific Patterns

| Concept | Search Terms | Files |
|---------|-------------|-------|
| Checkout | Payment page, Buy, Purchase | `/app/api/stripe/checkout/*` |
| Webhooks | Stripe events, Invoice, Subscription update | `/app/api/webhook/route.ts` |
| Customer Portal | Manage subscription, Cancel, Upgrade | `/lib/stripe.ts` |
| Price IDs | Plan, Tier, Product | `/constants/stripe.ts` |

## Prisma-Specific Patterns

| Concept | Search Terms | Files |
|---------|-------------|-------|
| Schema Definition | Model, Table, Relation, Field | `/prisma/schema.prisma` |
| Migrations | DB change, Alter table | `/prisma/migrations/*` |
| Client Usage | prisma.model.findMany, CRUD | `/lib/prismadb.ts` |
| Seeding | Test data, Initial data | `/prisma/seed.ts` |

## Clerk-Specific Patterns

| Concept | Search Terms | Files |
|---------|-------------|-------|
| Auth Middleware | Protected routes, Auth check | `/middleware.ts` |
| User Object | currentUser, auth(), userId | `/lib/clerk.ts` |
| Sign In/Up | Login page, Register | `/app/(auth)/sign-in/*`, `/app/(auth)/sign-up/*` |
| Webhooks | User created, User updated | `/app/api/clerk/webhook/*` |

## Claude Agent SDK (Primary AI Driver)

The official Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) provides full Claude Code capabilities.

| Concept | Search Terms | Files |
|---------|-------------|-------|
| SDK Query Function | query, SDK message | `/lib/agents/client.ts` |
| Base Agent | BaseAgent, agent wrapper | `/lib/agents/base-agent.ts` |
| Agent Factories | createAgent, createToolAgent, createMcpAgent | `/lib/agents/base-agent.ts` |
| Agent Types | AgentConfig, AgentResult, SDKMessage | `/lib/agents/types.ts` |
| MCP Tool Servers | createSdkMcpServer, custom tools | `/lib/agents/tools/index.ts` |
| Built-in Tool Presets | BUILTIN_TOOLS, TOOL_PRESETS | `/lib/agents/tools/index.ts` |
| Agent Orchestrator | Multi-agent, coordination, handoff | `/lib/agents/chains/orchestrator.ts` |
| Sequential Chain | runSequentialChain | `/lib/agents/chains/orchestrator.ts` |
| Parallel Agents | runParallelAgents, concurrent | `/lib/agents/chains/orchestrator.ts` |
| Consensus Agents | runConsensusAgents, voting | `/lib/agents/chains/orchestrator.ts` |
| Pipeline | runPipeline, transforms | `/lib/agents/chains/orchestrator.ts` |
| Supervisor Pattern | runWithSupervisor | `/lib/agents/chains/orchestrator.ts` |
| Streaming Response | Real-time, SSE, stream | `/app/api/agent/stream/route.ts` |
| Agent API | REST endpoint, POST handler | `/app/api/agent/route.ts` |
| Session Management | sessionId, resume | `/lib/agents/base-agent.ts` |

### Built-in Claude Code Tools

| Tool | Constant | Purpose |
|------|----------|---------|
| Read | `BUILTIN_TOOLS.Read` | Read file contents |
| Write | `BUILTIN_TOOLS.Write` | Write/create files |
| Edit | `BUILTIN_TOOLS.Edit` | Edit existing files |
| Glob | `BUILTIN_TOOLS.Glob` | Find files by pattern |
| Grep | `BUILTIN_TOOLS.Grep` | Search file contents |
| Bash | `BUILTIN_TOOLS.Bash` | Execute shell commands |
| WebFetch | `BUILTIN_TOOLS.WebFetch` | Fetch web pages |
| WebSearch | `BUILTIN_TOOLS.WebSearch` | Search the web |

### Tool Presets

| Preset | Tools Included |
|--------|----------------|
| `TOOL_PRESETS.readOnly` | Read, Glob, Grep |
| `TOOL_PRESETS.fileAccess` | Read, Write, Edit, Glob, Grep |
| `TOOL_PRESETS.development` | Read, Write, Edit, Glob, Grep, Bash |
| `TOOL_PRESETS.research` | Read, Glob, Grep, WebFetch, WebSearch |
| `TOOL_PRESETS.all` | All built-in tools |

### Custom MCP Tool Servers

| Server | Tools | File |
|--------|-------|------|
| `databaseToolsServer` | query_database, create_record, update_record | `/lib/agents/tools/index.ts` |
| `notificationToolsServer` | send_notification, send_email | `/lib/agents/tools/index.ts` |
| `contentToolsServer` | generate_summary | `/lib/agents/tools/index.ts` |
| `handoffToolsServer` | handoff_to_human, escalate_to_agent | `/lib/agents/tools/index.ts` |

### Agent Exports

All Claude Agent SDK features are exported from `/lib/agents/index.ts`:
- `query` - Direct SDK query function
- `BaseAgent`, `createAgent`, `createToolAgent`, `createMcpAgent`, `runQuery` - Agent classes/factories
- `AgentOrchestrator`, `runSequentialChain`, `runParallelAgents`, `runConsensusAgents`, `runPipeline`, `runWithSupervisor` - Orchestration
- `BUILTIN_TOOLS`, `TOOL_PRESETS` - Built-in tool constants
- `databaseToolsServer`, `notificationToolsServer`, etc. - Custom MCP servers
- All TypeScript types (SDKMessage, AgentConfig, AgentResult, etc.)

## Common Operations

### Adding a New Database Model
1. Edit `/prisma/schema.prisma`
2. Run `npx prisma generate`
3. Run `npx prisma db push`
4. Create CRUD in `/app/api/[model]/*`

### Adding a New API Route
1. Create `/app/api/[route]/route.ts`
2. Export `GET`, `POST`, `PUT`, `DELETE` handlers
3. Add auth check with `auth()` from Clerk

### Adding a New Page
1. Create `/app/[route]/page.tsx`
2. Add to navigation if needed
3. Protect with middleware if auth required

### Adding a New AI Agent
1. Create agent in `/lib/agents/[name].ts`
2. Define tools in `/lib/agents/tools/[name].ts`
3. Create API route in `/app/api/ai/[name]/route.ts`
4. Add UI in `/app/[feature]/page.tsx`

## Domain-Specific Terms (Update Per Project)

| Term | Definition | Related Code |
|------|------------|--------------|
| [Add project-specific terms here] | | |

---

**Note to Agents:** When you encounter an unfamiliar term, check this table first. If the term isn't here, request an update to this file before proceeding.
