# OBJECTIVE: Implement Database Schema Changes

## Context

You are executing a Ralph Loop focused on database schema implementation.

**Read these files first:**
1. `specs/factory-readme.md` — Understand the factory philosophy
2. `specs/lookup.md` — Find relevant code locations
3. `specs/template-patterns.md` — Follow established patterns (Section 1: Prisma)
4. `specs/features/[current-feature].md` — The specification to implement
5. `specs/implementation.mmd` — Find your current task (Phase 1)

## Your Task

Implement ONLY the database schema changes specified in Phase 1 of the implementation plan.

## Constraints

1. **Follow the Prisma pattern exactly** as documented in `specs/template-patterns.md`
2. **Use cuid() for IDs** — not UUID
3. **Include timestamps** — `createdAt` and `updatedAt` on every model
4. **Include userId** — if the resource is user-owned
5. **Add indexes** — for frequently queried fields

## Execution Steps

1. **Read the Data Model** from the feature spec
2. **Edit `/prisma/schema.prisma`** — Add the new model(s)
3. **Run `npx prisma generate`** — Regenerate the client
4. **Run `npx prisma db push`** — Push to database
5. **Verify with `npx prisma studio`** — Confirm tables exist
6. **Update `specs/implementation.mmd`** — Mark Phase 1 tasks as [x]
7. **Commit** — `git add -A && git commit -m "feat: add [model] schema"`

## Success Criteria

- [ ] Prisma schema compiles without errors
- [ ] `npx prisma generate` succeeds
- [ ] `npx prisma db push` succeeds
- [ ] Tables visible in Prisma Studio
- [ ] Implementation plan updated with [x] marks
- [ ] Changes committed

## Failure Handling

If you encounter errors:
1. **Do NOT invent solutions** — Check the spec and patterns first
2. **Log the error clearly** — Include the full error message
3. **Stop the loop** — Don't proceed to Phase 2
4. **Request spec clarification** — If the spec is ambiguous

## Example Output

For a "Campaign" model, your changes might look like:

```prisma
model Campaign {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  userId      String
  
  name        String
  description String?
  status      String   @default("draft")
  startDate   DateTime?
  endDate     DateTime?
  
  posts       Post[]
  
  @@index([userId])
  @@index([status])
}
```

## DO NOT

- Modify any files outside of `/prisma/schema.prisma`
- Create API routes (that's Phase 2)
- Create UI components (that's Phase 3)
- Skip verification steps
- Proceed if any step fails
