# Migrate Skill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the existing `encore-migrate` skill with a phase-based migration workflow that handles any source language/framework and targets both Encore.ts and Encore Go.

**Architecture:** Single SKILL.md file with four phases (Discover, Plan, Migrate, Complete). Language-agnostic process skill that delegates Encore-specific implementation to existing language-specific skills. State tracked via `migration-plan.md` in the target project root for cross-session resumability.

**Design doc:** `docs/plans/2026-03-16-migrate-skill-design.md`

---

### Task 1: Replace SKILL.md with new skill frontmatter and overview

**Files:**
- Modify: `encore/migrate/SKILL.md` (full rewrite)

**Step 1: Write the new SKILL.md**

Replace the entire contents of `encore/migrate/SKILL.md` with the new migration workflow skill. The file should contain:

**Frontmatter:**
```yaml
---
name: migrate
description: Migrate existing backend applications to Encore. Supports any source language/framework, targeting Encore.ts or Encore Go. Analyzes the existing system, creates a migration plan, and migrates one entity at a time with validation.
---
```

**Section: Overview**
- One-paragraph description: this skill guides migrating any existing backend to Encore, one entity at a time.
- Supports any source language/framework.
- Targets both Encore.ts and Encore Go.
- Creates a `migration-plan.md` file to track progress across sessions.
- Delegates Encore-specific implementation to language-specific skills.
- Contains no Encore code examples itself.

**Section: Phase Detection**
Instructions for the agent to determine which phase to enter:
- No `migration-plan.md` exists → Phase 1: DISCOVER
- `migration-plan.md` exists with pending entities → Phase 3: MIGRATE
- `migration-plan.md` exists with no pending entities → Phase 4: COMPLETE

When resuming (Phase 3), the agent should:
- Read `migration-plan.md`
- Report current status (e.g., "X of Y entities migrated, next suggested: Z")
- Ask the user what to work on next (with a suggestion)

**Section: Phase 1 — Discover**
Instructions:
1. Ask the user for:
   - Path to the source system
   - Local URL where the source system is running (if applicable)
   - Whether migrating to Encore.ts or Encore Go
2. Analyze the source codebase and inventory all entities:
   - Services / modules / domains
   - API endpoints (method, path, handler)
   - Databases (type, tables/collections)
   - Pub/Sub topics and subscriptions
   - Cron jobs / scheduled tasks
   - Auth middleware / handlers
   - Secrets / environment variables
   - Existing tests (map to entities they cover)
3. Present the inventory to the user as a summary table
4. Ask the user to confirm or correct the inventory
5. If the user identifies missing or incorrect entities, update and re-present

**Section: Phase 2 — Plan**
Instructions:
1. Check if an Encore project already exists at the target path:
   - If yes: confirm with user that this is the target project
   - If no: help create one using the `encore-getting-started` skill (or `encore-go-getting-started` for Go)
2. Ask the user for:
   - Local URL where the Encore app will run (default: `http://localhost:4000`)
   - Path to the Encore project
3. Determine the dependency order for migration:
   1. Secrets/config (other things depend on them)
   2. Databases (endpoints need them)
   3. Auth (endpoints may require auth)
   4. Services with no cross-service dependencies (leaf services)
   5. Services that depend on already-migrated services
   6. Pub/Sub topics and subscriptions (often cross-cutting)
   7. Cron jobs (usually depend on everything else)
   - Within each tier, suggest the simplest entity first to build momentum
4. Write `migration-plan.md` to the Encore project root (format specified in the plan format section below)
5. Propose the first entity group to migrate
6. Wait for user approval before proceeding

**Section: Phase 3 — Migrate (loop)**
Instructions:
1. Read `migration-plan.md` and identify the next pending entity group (based on dependency order)
2. Suggest the next entity to migrate — explain why this one is next
3. Ask the user if they want to proceed or pick a different entity
4. For each entity being migrated:
   a. **Implement:** Invoke the appropriate language-specific skill:

   | Migrating... | Encore.ts skill | Encore Go skill |
   |---|---|---|
   | Service structure | `encore-service` | `encore-go-service` |
   | API endpoints | `encore-api` | `encore-go-api` |
   | Auth | `encore-auth` | `encore-go-auth` |
   | Database + migrations | `encore-database` | `encore-go-database` |
   | Pub/Sub, crons, buckets, secrets | `encore-infrastructure` | `encore-go-infrastructure` |
   | Tests | `encore-testing` | `encore-go-testing` |

   b. **Migrate tests:** If the source entity has tests, migrate them using the testing skill. Adapt test assertions to the Encore API patterns.
   c. **Validate** (three layers — see Validation section)
   d. **Update `migration-plan.md`:** Mark entity status and record validation evidence
5. After completing the entity, ask "What would you like to migrate next?" with a suggestion based on dependency order
6. Default is one entity at a time. If the user says "keep going" or similar, batch multiple entities but still validate each individually.

**Section: Phase 4 — Complete**
Instructions:
1. When all entities are migrated or skipped, present a final summary:
   - Total entities migrated
   - Entities marked as `manual validation needed`
   - Entities skipped (and why)
2. Suggest removing `migration-plan.md` from the project
3. Suggest running the full test suite one final time
4. Note any manual validation items that still need attention

**Section: Validation**

Three layers of validation, applied to each entity before marking it as migrated:

**Layer 1: Test migration (primary)**
- When migrating an entity, also migrate its associated tests
- Use the `encore-testing` skill (or `encore-go-testing` for Go) to write tests in Encore patterns
- Run the tests — they must pass before marking the entity as migrated
- If the source entity had no tests, note this in the plan and proceed with other layers

**Layer 2: HTTP comparison (endpoints only, best-effort)**
- When both systems are running, call the same endpoint on both and compare:
  - HTTP status code
  - Response body structure
- Skip when:
  - Endpoint requires auth the agent can't obtain → ask user for help, allow skip
  - Endpoint has side effects (sends email, charges payment, etc.) → ask user, default to skip
  - Source system isn't running → skip, note in plan
- Always ask before making calls that could have side effects

**Layer 3: Verification-before-completion gate**
- Before marking ANY entity as `migrated`, the agent MUST have fresh evidence:
  - Test command output showing pass count and exit code, OR
  - HTTP comparison results showing match, OR
  - Explicit user approval to skip validation
- No "should work", "looks correct", or "seems fine" — only evidence-backed claims
- The agent must state what it verified and what the output was
- If evidence is insufficient, mark entity as `manual validation needed`, not `migrated`

**Section: Asking Questions**

Ask the user before acting when:
- Service boundaries are unclear (e.g., "these route files could be 1 service or 3")
- An entity doesn't have a clean Encore equivalent (e.g., Redis caching, custom middleware)
- Multiple valid migration strategies exist for an entity
- Before making any HTTP call that could have side effects
- When the source code is ambiguous or the agent isn't confident about what it does
- When the source system appears to have changed since the plan was written

**Section: migration-plan.md Format**

The plan file template:

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

Status values: `pending`, `migrated`, `skipped`, `manual validation needed`

**Step 2: Verify the skill file**

Run: `cat encore/migrate/SKILL.md | head -5`
Expected: Frontmatter with `name: migrate`

Run: `wc -l encore/migrate/SKILL.md`
Expected: File exists and has content

**Step 3: Commit**

```bash
git add encore/migrate/SKILL.md
git commit -m "feat: replace encore-migrate with phase-based migration workflow skill"
```

---

### Task 2: Update CLAUDE.md trigger keywords

**Files:**
- Modify: `CLAUDE.md:24` (the encore-migrate row in the TypeScript skills table)

**Step 1: Update the trigger keywords**

Change the `encore-migrate` row from:
```
| `encore-migrate` | migrate, convert, express, fastify, node |
```
to:
```
| `encore-migrate` | migrate, convert, port, transition, move to encore, migration |
```

This reflects the skill's new language-agnostic scope — it's no longer just Express/Fastify/Node.

**Step 2: Verify the change**

Run: `grep "encore-migrate" CLAUDE.md`
Expected: Shows the updated trigger keywords

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update encore-migrate trigger keywords for language-agnostic migration"
```

---

### Task 3: Manual verification — invoke the skill and review

**Step 1: Read the final SKILL.md**

Read the full `encore/migrate/SKILL.md` and verify:
- [ ] Frontmatter has correct name and description
- [ ] All four phases are documented with clear entry/exit criteria
- [ ] Phase detection section tells agent how to determine current phase
- [ ] Skill delegation table maps entity types to correct TS and Go skills
- [ ] Validation section includes all three layers
- [ ] migration-plan.md format template is complete
- [ ] No Encore code examples in the file (all delegated to other skills)
- [ ] Asking questions section covers key uncertainty scenarios

**Step 2: Verify no broken references**

Run: `grep -r "encore-migrate" CLAUDE.md`
Expected: One row in the TypeScript skills table with updated keywords
