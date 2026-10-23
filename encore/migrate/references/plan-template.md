# migration-plan.md template

Copy this to `migration-plan.md` at the Encore app root. Replace each `<...>` placeholder. Mark a section `TODO` until its phase fills it in. Remove sections that do not apply.

```markdown
# Migration Plan

## Status: discovering

## Source
- **Path:** <path>
- **Runs locally:** <yes, at http://localhost:3000 | no, because ...>
- **Start command:** <runtime version, database container, env vars, and the command that starts the source>
- **Language / framework:** <e.g. TypeScript / NestJS 10>
- **Serves production traffic:** <yes | no>
- **Out of scope:** <frontend directories and server-side routes that stay in the frontend framework>

## Target
- **Path:** <Encore app path>
- **Language:** <Encore.ts | Encore Go>
- **Strategy:** <forklift | rebuild>, because <reason>

## Inventory
- **Endpoints:** <count>, listed per unit below
- **Data stores:** <engine, table count, ORM, migration tool>
- **Background work:** <queues, workers, scheduled tasks>
- **Auth:** <strategy and where it is enforced>
- **Configuration:** <env vars, sensitive ones marked>
- **Non-JSON surfaces:** <uploads, static files, WebSockets, ...>
- **Process state:** <in-memory caches, sessions, local disk writes>
- **Contracts and tests:** <specs, collections, test suites>
- **Bugs and quirks:** <behavior that looks wrong or surprising, with the routes it affects>

## Services
| Service | Responsibility | Owns |
|---------|----------------|------|

## Decisions
- **Behavior target:** <reproduce source | fix toward <contract>>
- **Error responses:** <Encore format | source format through middleware | raw endpoints for <routes>>
- **Data store:** <PostgreSQL | external <store> via secret>
- **Production data:** <none | data migration needed before cutover, owned by the user>
- **Deviations:** <each intentional difference from the source as `D1`, `D2`, ..., with its reason; the suite applies each one by its ID>

## Characterization Suite
- **Location:** migration/characterization/
- **Run:** <command, with how to set the base URL>
- **Against source:** <passed N/N on <date> | recorded from contract suite | written from code>

## Units
| # | Unit | Service | Endpoints | Status |
|---|------|---------|-----------|--------|
| 0 | fallback (forklift only) | | all, through the fallback route | pending |

Status values: `pending`, `in progress`, `done`, `blocked`.

### <unit name>
- **Source files:** <files>
- **Endpoints:** <one line each, e.g. `GET /users/:id`>
- **Tables / topics / cron jobs / secrets:** <...>
- **Depends on:** <units>
- **Evidence:** <commands run with pass counts, or the reason the unit is blocked>

## Finish
- <open items from Phase 4: blocked units, deviations awaiting acceptance, production data migration>
```

Plan status values, in order: `discovering`, `planned`, `migrating`, `finishing`, `complete`.
