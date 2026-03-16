# Design: Hierarchical Migration Plan

**Date:** 2026-03-16
**Status:** Approved
**Modifies:** `encore/migrate/SKILL.md`

## Problem

For large applications (200+ endpoints, 15+ services), the `migration-plan.md` file becomes too large. The current design puts every endpoint in its own row plus a growing validation log, resulting in 25,000-40,000 tokens. The skill instructs the agent to "read `migration-plan.md` in full" on every resume, consuming a significant portion of the context window before any actual migration work begins.

## Solution

Replace the single flat `migration-plan.md` with a hierarchical structure:

- `migration-plan.md` — summary file with chunk-level status and dependency order (~30-40 lines regardless of app size)
- `migration-plan/<unit>.md` — one detail file per migration unit, containing that unit's endpoints, database tables, tests, and validation evidence

The agent only reads the summary on resume, and only loads the detail file for the chunk it's actively working on.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Granularity of detail files | Per migration unit (chunk) | Matches how migration actually happens — one chunk at a time |
| When to chunk | During Phase 1 (Discovery) | User sees migration scope in digestible chunks from the start |
| Who proposes chunks | Agent proposes, user confirms/adjusts | Reduces user effort while keeping them in control |
| Chunk sizing | 5-15 endpoints per chunk | Small enough to fit in context, large enough to be meaningful |
| Validation log location | In detail files, status-only in summary | Prevents summary from growing; evidence stays with the chunk that needs it |
| Monolith handling | URL path prefix grouping as fallback | Works when no service boundaries exist |

## Chunking Algorithm

During Phase 1, after analyzing the source codebase, the agent groups entities into migration units using these heuristics in priority order:

1. **Existing service boundaries** — If the source app already has services/modules/packages, use those as the starting point
2. **URL path prefixes** — Group endpoints sharing a path prefix (e.g., `/users/*`, `/billing/*`)
3. **Shared database tables** — Endpoints that read/write the same tables belong together
4. **Shared types/models** — Endpoints that share request/response types or domain models

Chunk sizing guideline: aim for 5-15 endpoints per chunk. If a group exceeds ~15 endpoints, suggest splitting further. If fewer than 3 endpoints, consider merging with a related chunk.

Cross-cutting concerns (auth, secrets, standalone pub/sub topics, cron jobs) get their own migration units since they follow different dependency tiers.

For monoliths with no clear boundaries, the agent falls back to URL path prefix grouping, then asks: "These groupings are based on URL paths — would you like to reorganize them by domain?"

## File Formats

### Summary plan (`migration-plan.md`)

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

## Migration Units

| Unit | Endpoints | DB Tables | Other | Complexity | Status |
|------|-----------|-----------|-------|------------|--------|

## Dependency Order
1. <ordered list of migration units>
```

Status values: `pending`, `in progress`, `migrated`, `skipped`, `manual validation needed`

### Detail file (`migration-plan/<unit>.md`)

```markdown
# Migration Unit: <unit-name>

## Source
- **Files:** <list of source files>
- **Depends on:** <other migration units this depends on, with their status>

## Endpoints
| Endpoint | Method | Path | Status | Notes |
|----------|--------|------|--------|-------|

## Database
| Table | Complexity | Status | Notes |
|-------|------------|--------|-------|

## Tests
- **Source tests:** <test files and count>
- **Migrated:** <count>

## Validation Log
| Entity | Tests | HTTP Match | Evidence | Status |
|--------|-------|------------|----------|--------|
```

## Phase Changes

### Phase Detection

- No `migration-plan.md` → Phase 1: DISCOVER
- `migration-plan.md` exists, no `migration-plan/` directory → Phase 2: PLAN (discovery done, plan not yet written)
- `migration-plan/` exists with pending units → Phase 3: MIGRATE
- All units migrated/skipped/manual → Phase 4: COMPLETE

### Phase 1: DISCOVER

Same as before, except "Present the Inventory" now presents chunks instead of flat lists:

1. Analyze source codebase
2. Group entities into migration units using the chunking algorithm
3. Present chunk summary table (name, endpoint count, db tables, other, complexity)
4. Offer to show detail for any chunk
5. User adjusts chunk boundaries (merge, split, rename, exclude)
6. Confirm the chunked inventory

### Phase 2: PLAN

1. Check for Encore project (unchanged)
2. Determine dependency order across chunks (unchanged)
3. Write `migration-plan.md` — summary only
4. Create `migration-plan/` directory
5. Write one detail file per chunk
6. Propose first chunk

### Phase 3: MIGRATE

On resume or at the start of each loop iteration:

1. Read `migration-plan.md` only (small, always fits)
2. Report status: "3 of 7 units migrated, next suggested: billing"
3. When working on a unit, read only that unit's detail file
4. Migrate entities within the unit, updating the detail file after each
5. When the unit is complete, update the summary plan's status column
6. Suggest next unit

The agent never reads all detail files at once.

### Phase 4: COMPLETE

1. Read `migration-plan.md` (summary statuses)
2. For units marked `manual validation needed`, read those specific detail files
3. Suggest running full test suite
4. Suggest removing `migration-plan.md` and `migration-plan/` directory

## Edge Cases

### Moving endpoints between chunks

1. Remove the endpoint row from the source detail file
2. Add it to the target detail file
3. Update counts in `migration-plan.md`

### Splitting a chunk mid-migration

1. Create a new detail file for the split-off portion
2. Move pending entities to the new file (already-migrated entities stay)
3. Add the new chunk to `migration-plan.md` summary table
4. Insert it in the dependency order (same tier, after the original)

### Monolith to multiple Encore services

A single source chunk might map to multiple Encore services. The detail file tracks the source grouping, but the "Notes" column can indicate the target Encore service. The agent asks during migration if the chunk maps to one service or should be split across services.

### Resuming when source code has changed

If files referenced in a detail file no longer exist or have changed significantly, the agent flags it and asks the user whether to update the plan.
