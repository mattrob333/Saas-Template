# CLAUDE.md - Factory Instructions

This file provides persistent context for Claude Code operating in this repository.

## What This Repository Is

This is a **SaaS Factory** — a system for building micro-SaaS applications using specification-driven development (Ralph Loops).

## How To Operate

### Before Writing Any Code

1. **Read the Pin** — Check `specs/factory-readme.md` for philosophy
2. **Check the Lookup Table** — Use `specs/lookup.md` to find code
3. **Follow Patterns** — Use `specs/template-patterns.md` exactly
4. **Check the Plan** — See `specs/implementation.mmd` for current task

### When Implementing

1. **One task at a time** — Don't do Phase 2 while in Phase 1
2. **Link to specs** — Every change should trace to a spec section
3. **Test before commit** — Run tests, verify in browser/studio
4. **Update the plan** — Mark tasks [x] when done
5. **Commit atomically** — One logical change per commit

### When You're Stuck

1. **Don't invent** — If the spec is unclear, ask for clarification
2. **Check patterns** — The answer is usually in template-patterns.md
3. **Search the codebase** — Use lookup.md terms
4. **Stop the loop** — If context is rotting, restart fresh

## Key Files

| File | Purpose |
|------|---------|
| `specs/factory-readme.md` | Master philosophy and structure |
| `specs/lookup.md` | Search index for finding code |
| `specs/template-patterns.md` | How to extend the template |
| `specs/features/*.md` | Feature specifications |
| `specs/implementation.mmd` | Task checklist with status |
| `.ralph/prompts/*.md` | Loop instruction files |

## Technology Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind, shadcn/ui
- **Auth:** Clerk
- **Database:** Supabase + Prisma
- **Payments:** Stripe
- **AI:** Claude SDK (when building AI features)

## Commands You'll Need

```bash
# Development
npm run dev                    # Start dev server (port 3000)
npx prisma studio             # Database GUI
npx prisma db push            # Push schema changes
npx prisma generate           # Regenerate client

# Testing
npm test                      # Run tests
npm run lint                  # Check linting

# Git
git status                    # Check changes
git add -A && git commit -m "feat: description"
git push

# Stripe (local testing)
stripe listen --forward-to localhost:3000/api/webhook
```

## Current Project State

**Active Feature:** [Update this when starting a new feature]

**Current Phase:** [Update this as you progress]

**Blockers:** [Note any issues here]

---

## Rules (Non-Negotiable)

1. **Never modify specs without permission** — Specs are the source of truth
2. **Never skip phases** — Complete Phase N before starting Phase N+1
3. **Never commit failing tests** — Tests gate all commits
4. **Never invent patterns** — Follow template-patterns.md exactly
5. **Always update implementation.mmd** — Track your progress

---

*This file is read by Claude Code on every invocation. Keep it updated.*
