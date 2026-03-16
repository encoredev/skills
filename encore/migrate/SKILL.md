---
name: migrate
description: Migrate existing backend applications to Encore. Supports any source language/framework, targeting Encore.ts or Encore Go. Analyzes the existing system, creates a migration plan, and migrates one entity at a time with validation.
---

# Migrate to Encore

This skill guides migrating any existing backend application to Encore, one entity at a time. It supports any source language or framework and targets both Encore.ts and Encore Go. A `migration-plan.md` file is created at the Encore project root to track progress across sessions, so migration can be paused and resumed at any time. This skill contains no Encore code examples — it delegates all Encore-specific implementation to the appropriate language-specific skills.

## Phase Detection

Before doing anything, determine which phase to enter:

- **No `migration-plan.md` exists** in the Encore project directory → Start at **Phase 1: DISCOVER**
- **`migration-plan.md` exists with pending entities** (any entity with status `pending`) → Resume at **Phase 3: MIGRATE**
- **`migration-plan.md` exists with no pending entities** (all entities are `migrated`, `skipped`, or `manual validation needed`) → Go to **Phase 4: COMPLETE**

### Resuming a Migration (Phase 3)

When `migration-plan.md` already exists and has pending entities:

1. Read `migration-plan.md` in full
2. Report current status to the user — for example: "5 of 12 entities migrated, next suggested: payments service (all its dependencies are migrated)"
3. Ask the user what they would like to work on next, offering a suggestion based on the dependency order in the plan

## Phase 1 — Discover

### 1. Gather Information

Ask the user for:

- **Path to the source system** (the existing codebase being migrated)
- **Local URL where the source system runs** (if applicable — needed for HTTP comparison validation later)
- **Target language:** Encore.ts or Encore Go

### 2. Analyze the Source Codebase

Read the source codebase and inventory all entities:

| Category | What to look for |
|----------|-----------------|
| Services / modules / domains | Distinct bounded contexts, separate deployable units, route groupings |
| API endpoints | Method, path, handler function, request/response shapes |
| Databases | Type (Postgres, MySQL, etc.), tables, schemas, migration files |
| Pub/Sub topics and subscriptions | Topic names, publishers, subscribers, message shapes |
| Cron jobs / scheduled tasks | Schedule expressions, handler functions |
| Auth middleware / handlers | Authentication strategies, token validation, session management |
| Secrets / environment variables | All referenced env vars and secrets, noting which are sensitive |
| Existing tests | Test files, which entities they cover, test framework used |

### 3. Present the Inventory

Present the inventory to the user as a summary table grouped by category. Include counts (e.g., "3 services, 14 endpoints, 2 databases").

### 4. Confirm with the User

Ask the user to confirm the inventory is correct. Specifically ask:

- "Are there any services or modules I missed?"
- "Are there any endpoints, databases, or other entities that are incorrect?"
- "Is there anything you want to exclude from the migration?"

### 5. Iterate if Needed

If the user identifies missing or incorrect entities, update the inventory and re-present it. Repeat until the user confirms the inventory is accurate.

## Phase 2 — Plan

### 1. Check for Existing Encore Project

Check if an Encore project already exists at the target path (look for `encore.app` file). If yes, confirm with the user that this is the correct project. If no, help create one by invoking the `encore-getting-started` skill (or `encore-go-getting-started` for Go).

### 2. Gather Target Information

Ask the user for:

- **Path to the Encore project** (where the migrated code will live)
- **Local URL where the Encore app will run** (default: `http://localhost:4000`)

### 3. Determine Dependency Order

Order entities for migration based on dependencies. Follow this tier order:

1. **Secrets / config** — no dependencies, needed by everything
2. **Databases** — schema and migrations must exist before services can use them
3. **Auth** — auth handlers are needed before protected endpoints
4. **Leaf services** — services with no cross-service dependencies
5. **Dependent services** — services that depend on already-migrated services
6. **Pub/Sub topics and subscriptions** — often depend on services being in place
7. **Cron jobs** — typically depend on service endpoints

Within each tier, suggest the simplest entity first (fewest endpoints, smallest schema, least complexity).

### 4. Write migration-plan.md

Write the `migration-plan.md` file to the Encore project root using the template defined in the "migration-plan.md Format" section below. Fill in all discovered entities with status `pending`.

### 5. Propose First Entity Group

Propose the first entity or entity group to migrate, explaining why it should go first based on the dependency order. Wait for user approval before proceeding to Phase 3.

## Phase 3 — Migrate (Loop)

### 1. Identify Next Entity

Read `migration-plan.md` and identify the next pending entity group based on the dependency order.

### 2. Suggest and Confirm

Suggest the next entity to migrate and explain why this one is next (e.g., "This service has no dependencies on other unmigrated services" or "The database must exist before we can migrate the service that uses it"). Ask the user if they want to proceed with this entity or pick a different one.

### 3. Migrate Each Entity

For each entity being migrated:

#### a. Implement

Invoke the appropriate language-specific skill based on the entity type and target language:

| Migrating... | Encore.ts skill | Encore Go skill |
|---|---|---|
| Service structure | `encore-service` | `encore-go-service` |
| API endpoints | `encore-api` | `encore-go-api` |
| Auth | `encore-auth` | `encore-go-auth` |
| Database + migrations | `encore-database` | `encore-go-database` |
| Pub/Sub, crons, buckets, secrets | `encore-infrastructure` | `encore-go-infrastructure` |
| Tests | `encore-testing` | `encore-go-testing` |

#### b. Migrate Tests

If the source entity has associated tests, migrate them using the appropriate testing skill (`encore-testing` or `encore-go-testing`). Adapt test assertions to match Encore API patterns. If the source entity has no tests, note this in the plan.

#### c. Validate

Apply the three validation layers described in the "Validation" section below. All three layers must be evaluated before marking an entity as migrated.

#### d. Update migration-plan.md

Update the entity's status in `migration-plan.md` and record validation evidence in the Validation Log table.

### 4. Continue or Pause

After completing an entity, ask "What would you like to migrate next?" and suggest the next entity based on dependency order.

### 5. Batching

The default is one entity at a time. If the user says "keep going", "do them all", or similar, batch multiple entities but still validate each one individually before marking it as migrated.

## Phase 4 — Complete

When all entities in `migration-plan.md` are `migrated`, `skipped`, or `manual validation needed`:

1. **Present a final summary:**
   - Total entities migrated
   - Entities marked as `manual validation needed` (list them with reasons)
   - Entities skipped (list them with reasons)
2. **Suggest running the full test suite** one final time to catch any integration issues
3. **Note any manual validation items** that still need human attention
4. **Suggest removing `migration-plan.md`** from the project once the user is satisfied with the migration

## Validation

Three validation layers are applied to each entity before it can be marked as `migrated`. Every entity must go through all applicable layers.

### Layer 1: Test Migration (Primary)

- When migrating an entity, also migrate its associated tests
- Use the `encore-testing` skill (or `encore-go-testing` for Go) to implement the tests
- Run the tests — they must pass before the entity can be marked as `migrated`
- If the source entity had no tests, note "no source tests" in the plan and rely on the other layers

### Layer 2: HTTP Comparison (Endpoints Only, Best-Effort)

When both systems are running locally, call the same endpoint on both the source system and the Encore app, then compare:

- **HTTP status code** — must match
- **Response body structure** — keys and shape must match (values may differ for dynamic data like timestamps or IDs)

**Skip this layer when:**

- The endpoint requires auth credentials the agent cannot obtain (ask the user — allow skip)
- The endpoint has side effects such as creating, updating, or deleting data (ask the user — default to skip)
- The source system is not running (note in plan, skip)

**Always ask the user before making any HTTP call that could have side effects.**

### Layer 3: Verification-Before-Completion Gate

Before marking ANY entity as `migrated`, the agent MUST have fresh evidence from the current session:

- Test command output showing pass count and exit code, OR
- HTTP comparison results showing a match, OR
- Explicit user approval to skip validation

**Rules:**

- No "should work", "looks correct", or "seems fine" — only evidence-backed claims
- The agent must state exactly what it verified and what the output was
- If evidence is insufficient, mark the entity as `manual validation needed`, not `migrated`
- Stale evidence from a previous session does not count — re-run validation if resuming

## Asking Questions

Ask the user before acting when:

- **Service boundaries are unclear** — e.g., "These route files could be 1 service or 3 — how would you like to split them?"
- **No clean Encore equivalent exists** — e.g., Redis caching layer, custom middleware chains, WebSocket handlers
- **Multiple valid migration strategies exist** — present the options with tradeoffs
- **Before making any HTTP call that could have side effects** — always ask first
- **Source code is ambiguous** — when the agent is not confident about what the code does, ask rather than guess
- **Source system appears to have changed** — if files referenced in `migration-plan.md` no longer exist or have changed significantly

## migration-plan.md Format

Use this exact template when creating the migration plan file. Fill in values from the discovery phase.

```markdown
# Migration Plan

## Source System
- **Path:** <source system path>
- **URL:** <source system local URL>
- **Framework:** <detected framework>
- **Language:** <detected language>

## Target System
- **Path:** <encore project path>
- **URL:** <encore local URL>
- **Type:** Encore.ts | Encore Go

## Entities

### Services
| Entity | Source | Status | Notes |
|--------|--------|--------|-------|

### Endpoints
| Entity | Service | Method | Path | Status | Notes |
|--------|---------|--------|------|--------|-------|

### Databases
| Entity | Type | Status | Notes |
|--------|------|--------|-------|

### Pub/Sub Topics
| Entity | Status | Notes |
|--------|--------|-------|

### Cron Jobs
| Entity | Schedule | Status | Notes |
|--------|----------|--------|-------|

### Secrets
| Entity | Status | Notes |
|--------|--------|-------|

### Auth
| Entity | Status | Notes |
|--------|--------|-------|

## Dependency Order
1. <ordered list based on analysis>

## Validation Log
| Entity | Tests | HTTP Match | Evidence | Status |
|--------|-------|------------|----------|--------|
```

**Status values:** `pending`, `migrated`, `skipped`, `manual validation needed`
