# API Documentation

This directory contains API documentation and patterns for external services used by the factory.

## Purpose

When Ralph loops need to integrate with external APIs, they should reference these docs rather than hallucinating from training data.

## Recommended Approach

Use **Context7 MCP** to fetch up-to-date documentation dynamically. These files serve as fallback and quick reference.

## Contents

| Directory | Service | Key Patterns |
|-----------|---------|--------------|
| `stripe/` | Stripe Payments | Checkout, webhooks, subscriptions |
| `supabase/` | Supabase Backend | Auth, database, storage |
| `clerk/` | Clerk Auth | Middleware, user management |
| `claude-sdk/` | Claude Agent SDK | Agent creation, tools, MCP |
| `buffer/` | Buffer API | Social media posting |

## Adding New Documentation

1. Create a directory for the service
2. Add a `README.md` with key patterns
3. Include code snippets for common operations
4. Link from `specs/lookup.md`

## Using Context7 MCP

For the most up-to-date documentation, configure your agent to use Context7:

```python
agent.connect_mcp(
    server_url="https://mcp.context7.com",
    auth_token="..."
)
```

Then agents can query: "How do I [operation] with [service]?"
