# Feature Specifications

This directory contains detailed specifications for each feature being built.

## Naming Convention

`[feature-name].md` — lowercase, hyphenated

## Creating a New Feature Spec

1. Use the spec-generator prompt (`.ralph/prompts/spec-generator.md`)
2. Interview yourself thoroughly
3. Save output here as `[feature-name].md`
4. Update `specs/implementation.mmd` with phases

## Spec Template

```markdown
# [Feature Name] Specification

## Overview
[One paragraph summary of what this feature does]

## User Story
As a [user type], I want to [action] so that [benefit].

## Data Model

### [Entity Name]
| Field | Type | Description |
|-------|------|-------------|
| id | cuid | Primary key |
| ... | ... | ... |

## User Interface

### Pages
- `/[route]` — [Description]

### Components
- `[ComponentName]` — [Description]

## API Endpoints

### GET /api/[resource]
- **Auth:** Required
- **Response:** List of [resource]

### POST /api/[resource]
- **Auth:** Required
- **Body:** { ... }
- **Response:** Created [resource]

## Integrations
- [Service Name] — [How it's used]

## Auth & Billing
- **Access:** [Public / Logged-in / Pro tier]
- **Limits:** [Rate limits, usage caps]

## Edge Cases
- [Edge case 1] — [How to handle]
- [Edge case 2] — [How to handle]

## Acceptance Criteria
- [ ] User can [action 1]
- [ ] User can [action 2]
- [ ] System handles [edge case]
```

---

## Current Features

(None yet — start by running the spec-generator!)
