# SaaS Factory - Master Specification

## What This Is

This repository is a **factory** for building micro-SaaS applications. It contains:
- A base template (Next.js + Supabase + Clerk + Stripe + Prisma)
- Specification-driven development workflows (Ralph Loops)
- Agent architectures for AI-powered features (Claude SDK + MCP)

## Core Philosophy

1. **Specs are the anchor** — Never write code without a spec. Generate specs through conversation, review them, then execute.
2. **Files are memory** — The context window is temporary. Persist everything important to disk.
3. **Single objective per loop** — Each Ralph loop does one thing. Chain them for complex work.
4. **Attended before unattended** — Watch the loops run before letting them run autonomously.

## Factory Workflow

```
Idea → Interview → PRD → Spec Files → Ralph Loops → Deployed App
```

### Phase 1: Spec Generation
- Use the spec-generator prompt to interview yourself
- Output: `specs/features/[feature].md`, `specs/implementation.mmd`

### Phase 2: Lookup Table
- Update `specs/lookup.md` with domain terms
- This helps agents find the right code when searching

### Phase 3: Implementation Planning
- Create explicit links between spec sections and code locations
- Point to specific files, functions, hunks

### Phase 4: Loop Execution
- Run Ralph loops with `.ralph/scripts/run_loop.sh`
- Each loop reads the spec, executes one task, commits

### Phase 5: Quality Gates
- Tests must pass before commit
- Linting must pass
- Feature flags wrap new code

## Directory Structure

```
/saas-factory/
├── specs/                    # The Pin (Source of Truth)
│   ├── factory-readme.md     # This file
│   ├── lookup.md             # Search index for agents
│   ├── template-patterns.md  # How to extend the base template
│   ├── features/             # Feature specifications
│   └── implementation.mmd    # Task checklist with status
│
├── .ralph/                   # Loop execution engine
│   ├── prompts/              # Instruction files for loops
│   ├── scripts/              # Bash execution harnesses
│   └── state/                # Checkpoint persistence
│
├── docs/                     # API documentation for agents
│   ├── stripe/
│   ├── supabase/
│   ├── clerk/
│   ├── claude-sdk/
│   └── buffer/
│
├── mcp-servers/              # Custom MCP tool servers
│
└── [app code]                # The actual application
    ├── app/
    ├── components/
    ├── lib/
    ├── prisma/
    └── ...
```

## Base Template Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14 + React | UI and routing |
| Styling | Tailwind + shadcn/ui | Component library |
| Auth | Clerk | User management |
| Database | Supabase + Prisma | Postgres with type-safe ORM |
| Payments | Stripe | Subscriptions and billing |
| AI | Claude SDK + MCP | Agent orchestration |

## Agent Architecture (For AI-Powered Apps)

When building apps that include AI agents:

```
┌─────────────────────────────────────────┐
│           Claude Agent SDK              │
│  (Orchestrates agents, manages state)   │
├─────────────────────────────────────────┤
│  Agent Chain Example:                   │
│    Researcher → Strategist → Writer     │
├─────────────────────────────────────────┤
│           MCP Servers                   │
│  (Provide tools: search, post, etc.)    │
└─────────────────────────────────────────┘
```

## Key Principles

### For Spec Writing
- Be explicit about data models
- Define edge cases
- Link to existing patterns (don't reinvent)
- Include acceptance criteria

### For Loop Execution
- One task per iteration
- Tests gate commits
- External state tracks progress
- Kill and restart if context rots

### For Agent Design
- Single objective per agent
- Tools are explicit (MCP or custom)
- Human checkpoints for destructive actions
- Feature flags for gradual rollout

## Getting Started

1. Run `/init` in Claude Code to create CLAUDE.md
2. Read `specs/template-patterns.md` to understand the base template
3. Use `specs/lookup.md` to navigate the codebase
4. Start with the spec-generator to define your first feature
