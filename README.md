# SaaS Factory

**Clone. Answer Questions. Get a Working SaaS.**

This is not just a template—it's an **autonomous SaaS builder**. The Ralph Loop interviews you about your idea, then builds your application through automated PRs while you watch (or grab coffee).

## The Idea

Every SaaS needs the same boring stuff: authentication, payments, database, UI components. That's already done here. What makes YOUR SaaS unique is the business logic—and that's what the Ralph Loop builds for you.

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR NEXT SAAS                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              🤖 RALPH LOOP BUILDS THIS                    │  │
│  │         (Your unique features & business logic)           │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              📦 ALREADY BUILT FOR YOU                     │  │
│  │    Auth (Clerk) │ Payments (Stripe) │ DB (Supabase)      │  │
│  │    UI (shadcn)  │ AI Agents (Claude SDK) │ API Routes    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## How It Works

### Step 1: Clone & Setup
```bash
git clone https://github.com/mattrob333/Saas-Template.git my-saas
cd my-saas
npm install
cp .env.example .env  # Add your API keys
```

### Step 2: Run the Interview
```bash
cat .ralph/prompts/spec-generator.md | claude
```

The Spec Generator interviews you about:
- Who is your target user?
- What problem are you solving?
- What's the core functionality?
- What data needs to persist?
- What integrations do you need?

**Output**: A complete specification in `specs/features/[your-feature].md` and an implementation plan in `specs/implementation.mmd`.

### Step 3: Start the Ralph Loop
```bash
.ralph/scripts/run_loop.sh schema-loop
```

The Ralph Loop takes over:
1. Reads your specs
2. Implements Phase 1 (Database Schema)
3. Commits the changes
4. Moves to Phase 2 (API Routes)
5. Commits the changes
6. Continues until `## Status: COMPLETE`

**You can walk away.** The loop runs autonomously with `--dangerously-skip-permissions`.

### Step 4: Review & Ship
```bash
git log --oneline  # See what Ralph built
npm run dev        # Test your new SaaS
```

## The Ralph Loop

The Ralph Loop is the core innovation of this template. It's an autonomous spec-to-code pipeline powered by the Claude Agent SDK.

### What Makes It Work

| Component | Purpose |
|-----------|---------|
| **Spec Generator** | Interviews you, outputs structured specs |
| **Implementation Plan** | Phased checklist that Ralph follows |
| **Loop Prompts** | Focused instructions for each phase |
| **Claude Agent SDK** | AI that can read, write, and edit code |
| **Run Script** | Orchestrates iterations until complete |

### The Loop Cycle

```
┌────────────────────────────────────────────────────┐
│                                                    │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐   │
│   │  READ    │───▶│ IMPLEMENT│───▶│  COMMIT  │   │
│   │  SPECS   │    │  PHASE   │    │  CHANGES │   │
│   └──────────┘    └──────────┘    └──────────┘   │
│        ▲                               │          │
│        │                               ▼          │
│        │         ┌──────────┐                    │
│        └─────────│  CHECK   │◀───────────────────┤
│                  │ COMPLETE?│                    │
│                  └──────────┘                    │
│                       │                          │
│              ┌────────┴────────┐                 │
│              ▼                 ▼                 │
│         [Continue]         [Done!]              │
│                                                  │
└────────────────────────────────────────────────────┘
```

### Available Loop Prompts

| Prompt | What It Does |
|--------|--------------|
| `schema-loop` | Implements Prisma models from your data spec |
| `spec-generator` | Interviews you, generates feature specs |
| *More coming* | API routes, UI components, integrations |

### Customizing the Loop

Create your own loop prompts in `.ralph/prompts/`:

```markdown
# My Custom Loop

## Context
Read these files first: [list relevant specs]

## Your Task
[What should Claude do in this phase?]

## Constraints
[Rules to follow]

## Success Criteria
- [ ] Checklist items

## DO NOT
- [Guardrails]
```

## What's Already Built

You start with a production-ready foundation:

### Authentication (Clerk)
- Sign up / Sign in / Sign out
- User management
- Protected routes
- Webhook handling

### Payments (Stripe)
- Subscription management
- Free tier with limits
- Pro tier upgrade flow
- Webhook processing
- Customer portal

### Database (Supabase + Prisma)
- PostgreSQL database
- Type-safe ORM
- Migration system
- User-scoped data

### UI Components (shadcn/ui)
- 40+ accessible components
- Dark mode support
- Responsive layouts
- Form handling with React Hook Form

### AI Infrastructure (Claude Agent SDK)
- Agent API routes (`/api/agent`)
- Streaming responses (`/api/agent/stream`)
- Multiple agent types (researcher, developer, analyst)
- Tool presets for different tasks
- Multi-agent orchestration

## Project Structure

```
├── .ralph/                  # 🤖 Ralph Loop configuration
│   ├── prompts/            # Loop prompts (spec-generator, schema-loop, etc.)
│   ├── scripts/            # Execution scripts
│   └── state/              # Loop state tracking
├── specs/                   # 📋 Specifications
│   ├── features/           # Feature specs (generated by interview)
│   ├── implementation.mmd  # Implementation checklist
│   ├── lookup.md           # Code location reference
│   └── template-patterns.md # Patterns for Ralph to follow
├── app/
│   ├── api/
│   │   ├── agent/          # Claude Agent SDK endpoints
│   │   ├── webhook/        # Stripe webhooks
│   │   └── ...
│   └── (dashboard)/        # Protected routes
├── lib/
│   ├── agents/             # Agent SDK integration
│   │   ├── base-agent.ts   # BaseAgent class
│   │   ├── chains/         # Orchestration patterns
│   │   └── tools/          # Custom MCP tools
│   └── ...
└── components/              # UI components
```

## Quick Start

### Prerequisites
- Node.js 18+
- Anthropic API key ([get one here](https://console.anthropic.com/))
- Supabase account
- Clerk account
- Stripe account

### Setup

```bash
# Clone
git clone https://github.com/mattrob333/Saas-Template.git my-saas
cd my-saas

# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your API keys

# Database
npx prisma generate
npx prisma db push

# Run
npm run dev
```

### Environment Variables

```bash
# Required - Claude Agent SDK (THE CORE)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Required - Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Required - Database
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx

# Required - Payments
STRIPE_API_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Reuse This Template

**This is a factory, not a one-time template.**

Every time you have a new SaaS idea:

1. Clone this repo fresh
2. Run the interview
3. Let Ralph build
4. Ship your SaaS

The foundation stays the same. The Ralph Loop builds your unique features on top.

## Technology Stack

| Layer | Technologies |
|-------|--------------|
| **AI Core** | Claude Agent SDK, Anthropic API |
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui, Radix UI |
| **Backend** | Next.js API Routes, Prisma ORM |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Clerk |
| **Payments** | Stripe |
| **State** | Zustand |

## Contributing

This template is meant to evolve. Contributions welcome:
- New loop prompts for different phases
- Better spec templates
- Additional agent types
- UI component additions

## License

MIT License - Build whatever you want.

## Credits

Built on shoulders of giants:
- [Anthropic Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/typescript)
- [@RicardoGEsteves' Omniscient](https://github.com/RicardoGEsteves/omniscient)
- [@AntonioErdeljac's tutorial](https://www.youtube.com/watch?v=ffJ38dBzrlY)

---

**Ready to build your SaaS?**

```bash
git clone https://github.com/mattrob333/Saas-Template.git my-next-saas
```
