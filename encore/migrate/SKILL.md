---
name: encore-migrate
description: Migrate existing backend applications to Encore. Supports any source language/framework, targeting Encore.ts or Encore Go. Groups entities into migration units, creates a hierarchical plan, and migrates one unit at a time with validation.
---

# Migrate to Encore

This skill guides migrating any existing backend application to Encore, one migration unit at a time. It supports any source language or framework and targets both Encore.ts and Encore Go. A `migration-plan.md` summary file and `migration-plan/` directory of per-unit detail files are created at the Encore project root to track progress across sessions. This skill contains no Encore code examples — it delegates all Encore-specific implementation to the appropriate language-specific skills.

## Phase Detection

Before doing anything, determine which phase to enter:

- **No `migration-plan.md` exists** in the Encore project directory → Start at **Phase 1: DISCOVER**
- **`migration-plan.md` exists but no `migration-plan/` directory** → Resume at **Phase 2: PLAN** (discovery done, detail files not yet written)
- **`migration-plan/` directory exists with pending units** (any unit in the summary with status `pending` or `in progress`) → Resume at **Phase 3: MIGRATE**
- **All units in the summary are `migrated`, `skipped`, or `manual validation needed`** → Go to **Phase 4: COMPLETE**

### Resuming a Migration (Phase 3)

When `migration-plan.md` and `migration-plan/` exist with pending units:

1. Read `migration-plan.md` (summary only — do NOT read all detail files)
2. Report current status to the user — for example: "3 of 7 units migrated, next suggested: billing (all its dependencies are migrated)"
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
| Frontend code | React/Vue/Angular components, static HTML, CSS, client-side JS — these are out of scope |

### 3. Identify Frontend Code

Full-stack repos and monorepos often mix backend and frontend code. The migration targets backend only — frontend code is out of scope.

**Detect frontend directories and mark them as out of scope.** Common indicators:

| Pattern | Examples |
|---------|----------|
| Dedicated frontend directories | `frontend/`, `client/`, `web/`, `app/` (when it contains React/Vue/Angular), `src/components/`, `public/` |
| Frontend config files | `next.config.js`, `vite.config.ts`, `nuxt.config.ts`, `angular.json`, `.svelte-kit/`, `remix.config.js` |
| Package dependencies | `react`, `vue`, `@angular/core`, `svelte` in `package.json` |

**Flag framework server-side code that *should* be migrated.** Some frontend frameworks embed backend logic that contains API endpoints, database queries, or server-side business logic:

| Framework | Server-side locations | What to look for |
|-----------|----------------------|-----------------|
| Next.js | `pages/api/`, `app/*/route.ts` | API route handlers — these are backend endpoints |
| Remix | `app/routes/*.tsx` (loader/action exports) | `loader` and `action` functions contain server logic |
| Nuxt | `server/api/`, `server/routes/` | Server API routes |
| SvelteKit | `src/routes/+server.ts`, `+page.server.ts` | Server endpoints and load functions |
| Astro | `src/pages/*.ts` (non-`.astro`) | API endpoints |

When framework server-side code is found, **ask the user what to do with it.** Not all server-side code should move to Encore — sometimes a thin backend layer (BFF, auth proxy, SSR data fetching) should stay in the frontend framework alongside an Encore backend.

Present the user with what was found and ask:

> "I found <N> server-side routes in your <framework> app (e.g., `pages/api/users.ts`, `app/billing/route.ts`). These contain backend logic that *could* be migrated to Encore, but some teams prefer to keep a thin server layer in their frontend framework for things like SSR data fetching or BFF proxying. Would you like to:
> 1. **Migrate all** server-side routes to Encore
> 2. **Migrate some** — I'll list them and you pick which ones move
> 3. **Keep all in <framework>** — only migrate the standalone backend code"

Based on the user's choice:

- **Migrate all:** Extract the backend logic into migration units. Leave frontend rendering code out of scope. Note in the migration plan which source files contain mixed frontend/backend code.
- **Migrate some:** Present the list of server-side routes and let the user select. Include selected routes in migration units, mark the rest as out of scope.
- **Keep all:** Mark all framework server-side code as out of scope alongside the frontend. Only standalone backend code (Express routes, standalone API servers, etc.) enters migration units.

**Report to the user:** List all detected frontend directories and the decision made about framework server-side code. Example: "I found a Next.js frontend in `app/` — the React components are out of scope. You chose to migrate 8 of the 12 API routes from `pages/api/` to Encore and keep 4 thin proxy routes in Next.js."

### 4. Group Entities into Migration Units

Group the discovered entities into migration units using these heuristics in priority order:

1. **Existing service boundaries** — If the source app already has services, modules, or packages, use those as the starting point for chunks
2. **URL path prefixes** — Group endpoints sharing a path prefix (e.g., `/users/*`, `/billing/*`)
3. **Shared database tables** — Endpoints that read/write the same tables belong together
4. **Shared types/models** — Endpoints that share request/response types or domain models

**Chunk sizing:** Aim for 5-15 endpoints per migration unit. If a group exceeds ~15 endpoints, suggest splitting it further (e.g., `users-crud` and `users-admin`). If a group has fewer than 3 endpoints, consider merging it with a related chunk.

**Cross-cutting concerns** get their own migration units: auth, secrets, and standalone infrastructure (pub/sub topics, cron jobs not tightly coupled to one service) are separate units since they follow different dependency tiers.

**For monoliths with no clear boundaries:** Fall back to URL path prefix grouping, then ask: "These groupings are based on URL paths — would you like to reorganize them by domain?"

### 5. Present the Migration Units

Present the migration units to the user as a summary table:

| Unit | Endpoints | DB Tables | Other | Complexity |
|------|-----------|-----------|-------|------------|

Include total counts (e.g., "7 migration units covering 42 endpoints, 3 databases"). For each unit, assess overall migration complexity:

- **Low** — direct Encore equivalents exist, straightforward mapping
- **Medium** — requires restructuring or has partial Encore equivalents
- **High** — no direct equivalent, needs redesign or custom solution

Offer to show the detail of any unit if the user wants to inspect what's inside before confirming.

### 6. Show Code Previews

For 2-3 representative entities (pick a mix of simple and complex from different units), show a short "before and after" preview of what the source code looks like now and what the Encore version will look like. Use the appropriate language-specific skill to inform the preview. Keep previews brief — one endpoint, one query, or one topic declaration is enough per preview.

### 7. Confirm with the User

Ask the user to confirm the migration units are correct. Specifically ask:

- "Are there any services, endpoints, or other entities I missed?"
- "Would you like to split, merge, or rename any of these migration units?"
- "Is there anything you want to exclude from the migration?"

### 8. Iterate if Needed

If the user identifies missing entities or wants to adjust chunk boundaries, update the units and re-present the summary table. Repeat until the user confirms the migration units are accurate.

## Phase 2 — Plan

### 1. Check for Existing Encore Project

Check if an Encore project already exists at the target path (look for `encore.app` file). If yes, confirm with the user that this is the correct project. If no, help create one by invoking the `encore-getting-started` skill (or `encore-go-getting-started` for Go).

### 2. Gather Target Information

Ask the user for:

- **Path to the Encore project** (where the migrated code will live)
- **Local URL where the Encore app will run** (default: `http://localhost:4000`)

### 3. Determine Dependency Order

Order migration units based on dependencies. Follow this tier order:

1. **Secrets / config** — no dependencies, needed by everything
2. **Databases** — schema and migrations must exist before services can use them
3. **Auth** — auth handlers are needed before protected endpoints
4. **Leaf units** — units with no cross-service dependencies
5. **Dependent units** — units that depend on already-migrated units
6. **Pub/Sub topics and subscriptions** — often depend on services being in place
7. **Cron jobs** — typically depend on service endpoints

Within each tier, suggest the simplest unit first (fewest endpoints, smallest schema, least complexity).

### 4. Write migration-plan.md (Summary)

Write the `migration-plan.md` summary file to the Encore project root using the template in the "migration-plan.md Format" section below. Fill in all migration units with status `pending`.

### 5. Write Detail Files

Create a `migration-plan/` directory at the Encore project root. Write one detail file per migration unit using the template in the "Detail File Format" section below. Each file is named `migration-plan/<unit-name>.md`.

### 6. Propose First Unit

Propose the first migration unit, explaining why it should go first based on the dependency order. Wait for user approval before proceeding to Phase 3.

## Phase 3 — Migrate (Loop)

### 1. Identify Next Unit

Read `migration-plan.md` (summary only) and identify the next pending migration unit based on the dependency order.

### 2. Suggest and Confirm

Suggest the next unit to migrate and explain why this one is next (e.g., "This unit has no dependencies on unmigrated units" or "The database must exist before we can migrate the service that uses it"). Ask the user if they want to proceed with this unit or pick a different one.

### 3. Load the Unit Detail

Read the detail file for the chosen unit (`migration-plan/<unit-name>.md`). Do NOT read detail files for other units.

### 4. Migrate Each Entity

For each entity in the unit:

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

If the source entity has associated tests, migrate them using the appropriate testing skill (`encore-testing` or `encore-go-testing`). Adapt test assertions to match Encore API patterns. If the source entity has no tests, note this in the detail file.

#### c. Validate

Three validation layers are applied to each entity before it can be marked as `migrated`. Every entity must go through all applicable layers.

##### Layer 1: Test Migration (Primary)

- When migrating an entity, also migrate its associated tests
- Use the `encore-testing` skill (or `encore-go-testing` for Go) to implement the tests
- Run the tests — they must pass before the entity can be marked as `migrated`
- If the source entity had no tests, note "no source tests" in the plan and rely on the other layers

##### Layer 2: HTTP Comparison (Endpoints Only, Best-Effort)

When both systems are running locally, call the same endpoint on both the source system and the Encore app, then compare:

- **HTTP status code** — must match
- **Response body structure** — keys and shape must match (values may differ for dynamic data like timestamps or IDs)

**Skip this layer when:**

- The endpoint requires auth credentials the agent cannot obtain (ask the user — allow skip)

**If a request to either system fails to connect**, ask the user to start the app before retrying. Do not silently skip — the user may have simply forgotten to start it.

**Always ask the user before making any HTTP call that could have side effects.**

##### Layer 3: Verification-Before-Completion Gate

Before marking ANY entity as `migrated`, the agent MUST have fresh evidence from the current session:

- Test command output showing pass count and exit code, OR
- HTTP comparison results showing a match, OR
- Explicit user approval to skip validation

**Rules:**

- No "should work", "looks correct", or "seems fine" — only evidence-backed claims
- The agent must state exactly what it verified and what the output was
- If evidence is insufficient, mark the entity as `manual validation needed`, not `migrated`
- Stale evidence from a previous session does not count — re-run validation if resuming

#### d. Update the Detail File

Update the entity's status in the unit's detail file (`migration-plan/<unit-name>.md`) and record validation evidence in that file's Validation Log table.

#### e. Update the Summary

When all entities in a unit are complete, update the unit's status in `migration-plan.md` to `migrated`. If some entities are pending, set the unit status to `in progress`.

### 5. Continue or Pause

After completing a unit, ask "What would you like to migrate next?" and suggest the next unit based on dependency order.

### 6. Batching

The default is one unit at a time. If the user says "keep going", "do them all", or similar, batch multiple units but still validate each entity individually before marking it as migrated.

## Phase 4 — Complete

When all units in `migration-plan.md` are `migrated`, `skipped`, or `manual validation needed`:

1. **Present a final summary** from `migration-plan.md`:
   - Total units migrated
   - Units marked as `manual validation needed` — read those specific detail files and list the entities that need attention with reasons
   - Units skipped (list them with reasons)
2. **Suggest running the full test suite** one final time to catch any integration issues
3. **Note any manual validation items** that still need human attention
4. **If the source system had frontend code**, suggest using the `encore-frontend` skill to reconnect the frontend to the new Encore backend (generate a typed API client, configure CORS, update base URLs)
5. **Suggest removing `migration-plan.md` and `migration-plan/`** from the project once the user is satisfied with the migration

## Asking Questions

Ask the user before acting when:

- **Service boundaries are unclear** — e.g., "These route files could be 1 service or 3 — how would you like to split them?"
- **No clean Encore equivalent exists** — e.g., Redis caching layer, custom middleware chains, WebSocket handlers
- **Multiple valid migration strategies exist** — present the options with tradeoffs
- **Before making any HTTP call that could have side effects** — always ask first
- **Source code is ambiguous** — when the agent is not confident about what the code does, ask rather than guess
- **Source system appears to have changed** — if files referenced in a detail file no longer exist or have changed significantly

## Source System Protection

The source system must never be modified during migration. Follow these rules:

- **Never modify source files** — read them, don't edit them
- **Never delete source files** — even after migration is complete
- **Never write to the source directory** — all output goes to the Encore project
- **Never run destructive commands against the source system** (drop tables, delete queues, etc.)
- **Ask before any HTTP call that mutates state** on the source system (POST, PUT, DELETE)

If the user asks to "clean up" or "remove" the old system, confirm explicitly before taking any action. The source system may still be serving production traffic.

## Edge Cases

### Moving Endpoints Between Units

If the user realizes an endpoint belongs in a different migration unit:

1. Remove the endpoint row from the source unit's detail file
2. Add it to the target unit's detail file
3. Update endpoint counts in `migration-plan.md`

### Splitting a Unit Mid-Migration

If a unit turns out to be too large while working on it:

1. Create a new detail file for the split-off portion (`migration-plan/<new-unit>.md`)
2. Move pending entities to the new file (already-migrated entities stay in the original)
3. Add the new unit to the `migration-plan.md` summary table
4. Insert it in the dependency order (same tier, after the original)

### Monolith to Multiple Encore Services

A single migration unit might map to multiple Encore services. The detail file tracks the source grouping, but the "Notes" column can indicate the target Encore service. Ask during migration if the unit maps to one service or should be split across Encore services.

### Source Code Changed Since Discovery

If files referenced in a detail file no longer exist or have changed significantly since discovery:

1. Flag the discrepancy to the user
2. Ask whether to update the detail file with the new state or skip the affected entities
3. If updating, re-assess complexity and adjust the plan accordingly

## Troubleshooting

Common issues during migration and how to resolve them:

| Problem | Cause | Resolution |
|---------|-------|------------|
| Import errors across services | Direct imports between services | Use `~encore/clients` (TS) or service client packages (Go) instead |
| Database migration fails | Incompatible SQL syntax | Check Encore uses PostgreSQL — adapt MySQL/SQLite syntax |
| Pub/Sub messages not received | Subscription not registered | Ensure subscription is declared at package level, not inside a function |
| Cron job not firing | Invalid schedule expression | Encore uses standard cron expressions — verify syntax |
| `encore run` errors on infrastructure | Infrastructure declared inside functions | Move all infrastructure declarations to package level |
| Source and Encore responses differ | Missing business logic or different error handling | Compare response shapes carefully, check edge cases |
| Cannot validate endpoint | Auth required or side effects | Ask user for test credentials, or mark as `manual validation needed` |

## migration-plan.md Format

Use this exact template for the summary plan file. Fill in values from the discovery phase.

```markdown
# Migration Plan

## Source System
- **Path:** <source system path>
- **URL:** <source system local URL>
- **Framework:** <detected framework>
- **Language:** <detected language>

## Frontend (Out of Scope)
- **Detected:** <Yes/No>
- **Directories:** <list of frontend directories, or "None">
- **Framework:** <frontend framework if detected, or "N/A">
- **Note:** <any framework server-side code that WAS included in migration units>

## Target System
- **Path:** <encore project path>
- **URL:** <encore local URL>
- **Type:** Encore.ts | Encore Go

## Migration Units

| Unit | Endpoints | DB Tables | Other | Complexity | Status |
|------|-----------|-----------|-------|------------|--------|

## Dependency Order
1. <ordered list of migration units>
```

**Status values:** `pending`, `in progress`, `migrated`, `skipped`, `manual validation needed`

**Complexity values:** `Low` (direct equivalent), `Medium` (requires restructuring), `High` (needs redesign)

## Detail File Format

Create one file per migration unit at `migration-plan/<unit-name>.md`. Use this exact template:

```markdown
# Migration Unit: <unit-name>

## Source
- **Files:** <list of source files in this unit>
- **Depends on:** <other migration units, with their current status>

## Endpoints
| Endpoint | Method | Path | Status | Notes |
|----------|--------|------|--------|-------|

## Database
| Table | Complexity | Status | Notes |
|-------|------------|--------|-------|

## Tests
- **Source tests:** <test files and count>
- **Migrated:** <count of migrated tests>

## Validation Log
| Entity | Tests | HTTP Match | Evidence | Status |
|--------|-------|------------|----------|--------|
```

Not all sections are required — omit sections that don't apply to a given unit (e.g., a secrets unit won't have Endpoints or Database sections).
