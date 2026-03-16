# Design: `encore-migrate` skill (replacement)

**Date:** 2026-03-16
**Status:** Approved
**Replaces:** `encore/migrate/SKILL.md`

## Summary

A phase-based migration workflow skill that replaces the existing `encore-migrate`. Language-agnostic on the source side, supports both Encore.ts and Encore Go as targets. Delegates all Encore-specific code to existing language-specific skills. Contains no Encore code examples itself.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Replace or separate from existing migrate skill | Replace | Single entry point for all migrations |
| Target languages | Both Encore.ts and Encore Go | Skill is language-agnostic, delegates to language-specific skills |
| Validation when not possible | Ask user, allow skip | Mark as "manual validation needed" |
| Encore project setup | Detect or create | Check if Encore project exists, help set one up if not |
| Inventory vs mapping | Full inventory + grouped migration | Shallow inventory upfront, detailed mapping per group |
| Parallel system awareness | Awareness only | Track both URLs for validation, no routing guidance |
| Plan file location | Encore project root | `migration-plan.md` — easy to find, temporary artifact |
| Skill structure | Phase-based (Approach B) | Resumable via plan file, clear checkpoints |

## Four Phases

### Phase 1: DISCOVER
- **Entry:** No `migration-plan.md` exists
- **Actions:**
  - Ask user for source system path and local URL
  - Ask if migrating to Encore.ts or Encore Go
  - Analyze source codebase: endpoints, services, databases, pub/sub topics, cron jobs, auth, secrets, tests
  - Present inventory to user for review
- **Exit:** User confirms inventory is correct

### Phase 2: PLAN
- **Entry:** Inventory confirmed, `migration-plan.md` doesn't exist yet
- **Actions:**
  - Check if Encore project exists, help create one if not (using `encore-getting-started` / `encore-go-getting-started`)
  - Write `migration-plan.md` with full inventory, URLs, paths, dependency order
  - Propose first entity group to migrate
- **Exit:** `migration-plan.md` written, user approves first group

### Phase 3: MIGRATE (loop)
- **Entry:** `migration-plan.md` exists with pending entities
- **Actions:**
  - Read `migration-plan.md`, determine what's next
  - Propose next entity group based on dependency order
  - For each entity:
    - Invoke appropriate language-specific skill
    - Implement the migration
    - Migrate associated tests
    - Validate (three layers — see below)
    - Update `migration-plan.md` (mark as migrated)
  - Ask user what to migrate next (or suggest based on dependency order)
- **Exit:** No pending entities remain

### Phase 4: COMPLETE
- **Entry:** All entities migrated or skipped
- **Actions:**
  - Final review of `migration-plan.md`
  - Note any skipped entities or manual validation items
  - Suggest removing `migration-plan.md`
- **Exit:** User confirms migration is done

## Dependency Order for Migration

1. Secrets/config
2. Databases
3. Auth
4. Services with no cross-service dependencies (leaf services)
5. Services that depend on already-migrated services
6. Pub/Sub topics and subscriptions
7. Cron jobs

Within each tier, simplest entity first.

## Three-Layer Validation

### Layer 1: Test migration
- Inventory existing tests during Discover phase
- When migrating an entity, migrate its tests too (using `encore-testing` / `encore-go-testing`)
- Tests must pass before marking entity as migrated
- Primary validation mechanism

### Layer 2: HTTP comparison (endpoints only)
- When both systems are running, call same endpoint on both, compare responses
- Best-effort — skipped when auth unavailable, side effects exist, or source not running
- Ask user before any call with potential side effects

### Layer 3: Verification-before-completion gate
- Before marking any entity as migrated, agent must have fresh evidence:
  - Test output showing pass count and exit code
  - HTTP comparison results (if applicable)
  - Or explicit user approval to skip
- No "should work" — only evidence-backed claims
- Applies to each individual entity

### When validation is skipped (with user approval)
- No existing tests and endpoint has side effects → `manual validation needed`
- Source system isn't running → test-only validation
- Auth unavailable → ask user for tokens/guidance, allow skip

## migration-plan.md Format

```markdown
# Migration Plan

## Source System
- **Path:** /path/to/old-api
- **URL:** http://localhost:3000
- **Framework:** Express.js (Node.js)
- **Language:** TypeScript

## Target System
- **Path:** /path/to/new-api
- **URL:** http://localhost:4000
- **Type:** Encore.ts

## Entities

### Services
| Entity | Source | Status | Notes |
|--------|--------|--------|-------|
| users | src/routes/users.ts | pending | |

### Endpoints
| Entity | Service | Method | Path | Status | Notes |
|--------|---------|--------|------|--------|-------|
| getUser | users | GET | /users/:id | migrated | validated |

### Databases
| Entity | Type | Status | Notes |
|--------|------|--------|-------|
| users_db | PostgreSQL | pending | 3 tables |

### Pub/Sub Topics
| Entity | Status | Notes |
|--------|--------|-------|
| user.created | pending | consumed by billing |

### Cron Jobs
| Entity | Schedule | Status | Notes |
|--------|----------|--------|-------|
| daily-report | 0 0 * * * | pending | |

### Secrets
| Entity | Status | Notes |
|--------|--------|-------|
| STRIPE_KEY | pending | |

### Auth
| Entity | Status | Notes |
|--------|--------|-------|
| JWT middleware | pending | |

## Dependency Order
1. ...

## Validation Log
| Entity | Tests | HTTP Match | Evidence | Status |
|--------|-------|------------|----------|--------|
| getUser | 3/3 pass | 200 match | test output + curl | migrated |
```

Status values: `pending`, `migrated`, `skipped`, `manual validation needed`

## Skill Delegation

| Migrating... | Encore.ts skill | Encore Go skill |
|---|---|---|
| New Encore project | `encore-getting-started` | `encore-go-getting-started` |
| Service structure | `encore-service` | `encore-go-service` |
| API endpoints | `encore-api` | `encore-go-api` |
| Auth | `encore-auth` | `encore-go-auth` |
| Database + migrations | `encore-database` | `encore-go-database` |
| Pub/Sub, crons, buckets, secrets | `encore-infrastructure` | `encore-go-infrastructure` |
| Tests | `encore-testing` | `encore-go-testing` |

## Agent Behavior

- **Ask questions when uncertain:** service boundaries, ambiguous patterns, entities without clean Encore equivalents, before side-effect HTTP calls
- **One entity at a time** by default, batchable with user approval
- **Cross-session resumability:** reads `migration-plan.md` on start, reports status, picks up where it left off
- **Source system changes:** if discrepancies found, ask user whether to update the plan
