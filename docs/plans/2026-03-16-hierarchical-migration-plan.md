# Hierarchical Migration Plan Implementation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite the migrate skill to use a hierarchical plan structure (summary + per-chunk detail files) so large applications don't saturate the agent's context window.

**Architecture:** Replace the flat `migration-plan.md` with a `migration-plan.md` summary (chunk-level status, ~30-40 lines) plus a `migration-plan/` directory of per-chunk detail files. Add a chunking algorithm to Phase 1 that groups entities into migration units of 5-15 endpoints. The agent only reads the summary on resume and loads one detail file at a time during migration.

**Tech Stack:** Markdown skill file (`encore/migrate/SKILL.md`)

**Design doc:** `docs/plans/2026-03-16-hierarchical-migration-plan-design.md`

---

### Task 1: Update frontmatter and intro

**Files:**
- Modify: `encore/migrate/SKILL.md:1-8`

**Step 1: Update the description and intro paragraph**

Replace the frontmatter description and intro paragraph to mention migration units and hierarchical plan:

```markdown
---
name: encore-migrate
description: Migrate existing backend applications to Encore. Supports any source language/framework, targeting Encore.ts or Encore Go. Groups entities into migration units, creates a hierarchical plan, and migrates one unit at a time with validation.
---

# Migrate to Encore

This skill guides migrating any existing backend application to Encore, one migration unit at a time. It supports any source language or framework and targets both Encore.ts and Encore Go. A `migration-plan.md` summary file and `migration-plan/` directory of per-unit detail files are created at the Encore project root to track progress across sessions. This skill contains no Encore code examples — it delegates all Encore-specific implementation to the appropriate language-specific skills.
```

**Step 2: Verify the change reads correctly**

Read `encore/migrate/SKILL.md:1-10` and confirm the frontmatter and intro are updated.

**Step 3: Commit**

```bash
git add encore/migrate/SKILL.md
git commit -m "feat(migrate): update frontmatter and intro for hierarchical plan"
```

---

### Task 2: Update Phase Detection

**Files:**
- Modify: `encore/migrate/SKILL.md:10-24` (Phase Detection and Resuming sections)

**Step 1: Replace Phase Detection**

Replace the Phase Detection section with:

```markdown
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
```

**Step 2: Verify the change**

Read the updated Phase Detection section and confirm it matches the design doc.

**Step 3: Commit**

```bash
git add encore/migrate/SKILL.md
git commit -m "feat(migrate): update phase detection for hierarchical plan"
```

---

### Task 3: Update Phase 1 — Add chunking algorithm

**Files:**
- Modify: `encore/migrate/SKILL.md` (Phase 1 section, lines 26-73)

**Step 1: Replace Phase 1 with chunking-aware version**

Replace the entire Phase 1 section. Keep steps 1 (Gather Information) and 2 (Analyze the Source Codebase) unchanged. Replace steps 3-6 with:

```markdown
### 3. Group Entities into Migration Units

Group the discovered entities into migration units using these heuristics in priority order:

1. **Existing service boundaries** — If the source app already has services, modules, or packages, use those as the starting point for chunks
2. **URL path prefixes** — Group endpoints sharing a path prefix (e.g., `/users/*`, `/billing/*`)
3. **Shared database tables** — Endpoints that read/write the same tables belong together
4. **Shared types/models** — Endpoints that share request/response types or domain models

**Chunk sizing:** Aim for 5-15 endpoints per migration unit. If a group exceeds ~15 endpoints, suggest splitting it further (e.g., `users-crud` and `users-admin`). If a group has fewer than 3 endpoints, consider merging it with a related chunk.

**Cross-cutting concerns** get their own migration units: auth, secrets, and standalone infrastructure (pub/sub topics, cron jobs not tightly coupled to one service) are separate units since they follow different dependency tiers.

**For monoliths with no clear boundaries:** Fall back to URL path prefix grouping, then ask: "These groupings are based on URL paths — would you like to reorganize them by domain?"

### 4. Present the Migration Units

Present the migration units to the user as a summary table:

| Unit | Endpoints | DB Tables | Other | Complexity |
|------|-----------|-----------|-------|------------|

Include total counts (e.g., "7 migration units covering 42 endpoints, 3 databases"). For each unit, assess overall migration complexity:

- **Low** — direct Encore equivalents exist, straightforward mapping
- **Medium** — requires restructuring or has partial Encore equivalents
- **High** — no direct equivalent, needs redesign or custom solution

Offer to show the detail of any unit if the user wants to inspect what's inside before confirming.

### 5. Show Code Previews

For 2-3 representative entities (pick a mix of simple and complex from different units), show a short "before and after" preview of what the source code looks like now and what the Encore version will look like. Use the appropriate language-specific skill to inform the preview. Keep previews brief — one endpoint, one query, or one topic declaration is enough per preview.

### 6. Confirm with the User

Ask the user to confirm the migration units are correct. Specifically ask:

- "Are there any services, endpoints, or other entities I missed?"
- "Would you like to split, merge, or rename any of these migration units?"
- "Is there anything you want to exclude from the migration?"

### 7. Iterate if Needed

If the user identifies missing entities or wants to adjust chunk boundaries, update the units and re-present the summary table. Repeat until the user confirms the migration units are accurate.
```

**Step 2: Verify the change**

Read the updated Phase 1 section and confirm it includes the chunking algorithm.

**Step 3: Commit**

```bash
git add encore/migrate/SKILL.md
git commit -m "feat(migrate): add chunking algorithm to Phase 1 discovery"
```

---

### Task 4: Update Phase 2 — Write hierarchical plan

**Files:**
- Modify: `encore/migrate/SKILL.md` (Phase 2 section)

**Step 1: Replace Phase 2**

Replace the entire Phase 2 section with:

```markdown
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
```

**Step 2: Verify the change**

Read the updated Phase 2 section.

**Step 3: Commit**

```bash
git add encore/migrate/SKILL.md
git commit -m "feat(migrate): update Phase 2 to write hierarchical plan files"
```

---

### Task 5: Update Phase 3 — Scoped reads

**Files:**
- Modify: `encore/migrate/SKILL.md` (Phase 3 section)

**Step 1: Replace Phase 3**

Replace the entire Phase 3 section with:

```markdown
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

Apply the three validation layers described in the "Validation" section below. All three layers must be evaluated before marking an entity as migrated.

#### d. Update the Detail File

Update the entity's status in the unit's detail file (`migration-plan/<unit-name>.md`) and record validation evidence in that file's Validation Log table.

#### e. Update the Summary

When all entities in a unit are complete, update the unit's status in `migration-plan.md` to `migrated`. If some entities are pending, set the unit status to `in progress`.

### 5. Continue or Pause

After completing a unit, ask "What would you like to migrate next?" and suggest the next unit based on dependency order.

### 6. Batching

The default is one unit at a time. If the user says "keep going", "do them all", or similar, batch multiple units but still validate each entity individually before marking it as migrated.
```

**Step 2: Verify the change**

Read the updated Phase 3 section.

**Step 3: Commit**

```bash
git add encore/migrate/SKILL.md
git commit -m "feat(migrate): update Phase 3 for scoped detail file reads"
```

---

### Task 6: Update Phase 4 — Completion

**Files:**
- Modify: `encore/migrate/SKILL.md` (Phase 4 section)

**Step 1: Replace Phase 4**

Replace the Phase 4 section with:

```markdown
## Phase 4 — Complete

When all units in `migration-plan.md` are `migrated`, `skipped`, or `manual validation needed`:

1. **Present a final summary** from `migration-plan.md`:
   - Total units migrated
   - Units marked as `manual validation needed` — read those specific detail files and list the entities that need attention with reasons
   - Units skipped (list them with reasons)
2. **Suggest running the full test suite** one final time to catch any integration issues
3. **Note any manual validation items** that still need human attention
4. **Suggest removing `migration-plan.md` and `migration-plan/`** from the project once the user is satisfied with the migration
```

**Step 2: Verify the change**

Read the updated Phase 4 section.

**Step 3: Commit**

```bash
git add encore/migrate/SKILL.md
git commit -m "feat(migrate): update Phase 4 for hierarchical plan cleanup"
```

---

### Task 7: Add Edge Cases section

**Files:**
- Modify: `encore/migrate/SKILL.md` (add after Source System Protection, before Troubleshooting)

**Step 1: Add the Edge Cases section**

Insert after the "Source System Protection" section:

```markdown
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
```

**Step 2: Verify the change**

Read the section to confirm it's placed correctly.

**Step 3: Commit**

```bash
git add encore/migrate/SKILL.md
git commit -m "feat(migrate): add edge cases for chunk management"
```

---

### Task 8: Replace plan format templates

**Files:**
- Modify: `encore/migrate/SKILL.md` (replace the "migration-plan.md Format" section at the end)

**Step 1: Replace the format section**

Replace everything from `## migration-plan.md Format` to the end of the file with:

```markdown
## migration-plan.md Format

Use this exact template for the summary plan file. Fill in values from the discovery phase.

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
```

**Step 2: Verify the templates**

Read the end of the file and confirm both templates are present and the old flat format is fully replaced.

**Step 3: Commit**

```bash
git add encore/migrate/SKILL.md
git commit -m "feat(migrate): replace flat plan template with hierarchical format"
```

---

### Task 9: Final review and squash commit

**Step 1: Read the complete SKILL.md**

Read the entire file end-to-end to verify:
- Frontmatter and intro mention migration units and hierarchical plan
- Phase Detection uses the new conditions (summary + directory)
- Phase 1 includes the chunking algorithm
- Phase 2 writes summary + detail files
- Phase 3 reads only summary + active detail file
- Phase 4 references the hierarchical structure
- Edge cases section exists
- Both format templates are present
- No references to the old flat plan remain (search for "Entities" section headers from the old format, "Validation Log" in the summary)
- Validation, Asking Questions, Source System Protection, Troubleshooting sections are unchanged

**Step 2: Run a search for stale references**

Search the SKILL.md for any remaining references to the old format:
- `Read \`migration-plan.md\` in full` — should not appear
- `## Entities` — should not appear in format templates
- `### Endpoints` as a top-level plan section — should only appear inside detail file template

**Step 3: Squash into a single commit**

```bash
git reset --soft HEAD~8
git commit -m "feat(migrate): hierarchical migration plan for large applications

Replace flat migration-plan.md with a hierarchical structure:
- migration-plan.md summary (chunk-level status, ~30-40 lines)
- migration-plan/ directory with per-unit detail files

Adds chunking algorithm that groups entities into 5-15 endpoint
migration units during discovery. Agent only loads the summary on
resume and one detail file at a time during migration, keeping
context usage bounded regardless of application size."
```
