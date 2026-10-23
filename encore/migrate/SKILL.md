---
name: encore-migrate
description: Port an existing backend application to Encore.ts or Encore Go, from any language or framework. Drives a DISCOVER → PLAN → MIGRATE → FINISH workflow with a characterization test suite and a `migration-plan.md` that persists across sessions. Not for database schema migrations.
when_to_use: >-
  User wants to move an existing backend to Encore: convert or port an Express, NestJS, Fastify, Hono, Koa, Next.js API routes, gin, Echo, Chi, FastAPI, Flask, Django, Rails, Spring Boot, or plain Node.js / Go server. Also use to resume a migration when `migration-plan.md` exists. Trigger phrases: "migrate this app to Encore", "port to Encore", "convert from Express", "rewrite my FastAPI backend in Encore", "forklift migration", "continue the migration".
---

# Migrate to Encore

Port an existing backend to Encore in **units**: each unit is one target Encore service, or one slice of a large service, together with its endpoints, tables, topics, cron jobs, and secrets. A **characterization suite** records how the source behaves over HTTP before any code moves and proves each unit afterwards. `migration-plan.md` at the Encore app root holds the state, so any session can resume.

Read [references/encore-concepts.md](references/encore-concepts.md) before planning: it describes how Encore differs from conventional frameworks and where source code usually needs restructuring. The language skills (`encore-api`, `encore-go-database`, and so on) hold the implementation details.

Wherever this skill says to ask and the user has asked you to proceed without questions, choose a sensible default, record it in Decisions, and list every default in your next report.

## Phase detection

Look for `migration-plan.md` in the Encore app (ask for its path if it is not the current directory):

- **Missing** → Phase 1: Discover.
- **`## Status: discovering`** → resume at the first section still marked `TODO`.
- **`## Status: planned`** → show the plan and ask for approval (Phase 2, step 5).
- **`## Status: migrating`** → Phase 3. Report progress in one line ("3 of 7 units done, next: billing") and continue with the first unit that is `in progress` or `pending`. Once every unit is `done` or `blocked`, go to Phase 4: Finish.
- **`## Status: finishing`** → Phase 4, at the open items it lists.
- **`## Status: complete`** → the migration is finished. Report that and stop.

## Phase 1: Discover

### 1. Ask for the basics

Ask in one message:

- Path to the source code, and where the Encore app should live.
- Target: Encore.ts or Encore Go. Suggest TypeScript for Node.js sources and Go for Go sources. For any other language, say that the business logic gets rewritten, not ported.
- Whether the source serves production traffic.

### 2. Inventory the source

Read the source and record every entity:

| Category | Record |
|---|---|
| Endpoints | Method, path, handler, request and response shape, auth requirement |
| Data stores | Engine, tables or collections, ORM, existing migration files |
| Background work | Queues and job workers, scheduled tasks, event publishers and subscribers |
| Auth | Strategy (session, JWT, API key), where it is enforced, role or ownership checks |
| Configuration | Every env var and config value, marked sensitive or not |
| Global HTTP behavior | Middleware chain, CORS, path prefixes, trailing-slash handling, error response bodies, body size limits |
| Non-JSON surfaces | File uploads, downloads, static files, WebSockets, SSE, redirects, HTML rendering |
| Process state | In-memory caches, sessions, counters, local disk writes |
| Tests and contracts | Test suites, OpenAPI specs, Postman/Hurl/Bruno collections |
| Bugs and quirks | Behavior that looks wrong or surprising (500s on bad input, leaked fields, missing checks); these feed the behavior-target decision |

Endpoints are the hard part. Trace them from the router setup, not the file names, so that prefixes, mounted sub-routers, and routes added by plugins are not missed. Count them and state the count.

### 3. Separate frontend code

The migration covers backend code only. Mark frontend directories (React, Vue, Svelte, and so on) out of scope. If a full-stack framework holds server-side routes (Next.js `app/**/route.ts` or `pages/api`, Remix loaders and actions, Nuxt `server/`, SvelteKit `+server.ts`), list them and ask which ones move to Encore. Thin BFF or SSR data-loading routes often stay in the frontend framework.

### 4. Get the source running

The characterization suite records from the running source, so make it run locally: install the runtime version it needs (old dependencies often break on current releases), start its databases in disposable containers (or point file databases such as SQLite outside the source tree), and pick free ports. Record the exact start command in the plan. If it cannot be made to run, record why; Phase 2 step 4 covers that case.

Then send requests to confirm each suspected bug and quirk from the inventory. Reading the code alone mispredicts some of them.

### 5. Write the plan file

Create `migration-plan.md` from [references/plan-template.md](references/plan-template.md), with `## Status: discovering`, in the directory that will become the Encore app root. If that directory does not exist yet, create it; the app itself is set up in Phase 3. Fill in Source, Target, and Inventory now, and mark the remaining sections `TODO`. Discovery work survives a session break only once it is in this file.

## Phase 2: Plan

### 1. Choose the strategy

Pick one and record why in Decisions:

- **Forklift** (same language only, Node.js → Encore.ts or Go → Encore Go). Move the source into the Encore app and mount its existing router behind a raw **fallback route**, so every request that no Encore endpoint matches still reaches the old code. Each unit then replaces routes with Encore endpoints. The app runs and can deploy after every unit. Point the old data access at the Encore database's connection string so old and new code share one database. Prefer this whenever it is possible.
- **Rebuild** (required across languages; also suits small apps). Build the Encore app beside the source. The source keeps serving until the cutover. A fallback route can proxy unmigrated routes to the running source over HTTP only if the two sides never need the same mutable data, because each system has its own database.

Both are described in [references/encore-concepts.md](references/encore-concepts.md#incremental-migration-with-a-fallback-route).

Work in a git branch or a copy that keeps the original source runnable, so that the characterization suite can still record from it. Ask before any change to a source directory that is not under version control.

### 2. Design the target services

Invoke `encore-architecture` to decide the target services, which service owns each table, and where services communicate through APIs or through Pub/Sub. Start from the source's existing modules but follow the skill's guidance: one service is the right answer for many monoliths. Record the services in the plan.

### 3. Settle the cross-cutting decisions

Ask about each item that applies, then record every answer in Decisions:

- **Behavior target.** Default to reproducing the source, so that existing clients keep working, and fixing only clear bugs (500s on bad input, leaked fields, missing ownership checks, wrong counts). If the source claims a published contract (OpenAPI, a partner integration, RealWorld) but differs from it systematically, list the differences and ask before moving toward the contract.
- **Error responses.** Typed Encore endpoints return `{code, message, details}` and status 400 for validation failures. If clients depend on another body or status (such as 422), choose one: accept Encore's format, keep the source's format on typed endpoints (a middleware in TS, response fields in Go; see [Keeping custom error responses](references/encore-concepts.md#keeping-custom-error-responses)), or use raw endpoints for those routes. Validation failures stay 400 either way, unless the handler does the validation itself.
- **Data store.** Encore SQL databases are PostgreSQL. A MySQL or SQLite source needs the steps in [Changing the database engine](references/encore-concepts.md#changing-the-database-engine). A store without an Encore primitive (MongoDB, DynamoDB, Elasticsearch) stays external, reached through a secret connection string.
- **Production data.** Moving existing production data into Encore's databases is outside this skill. If the source holds production data, note in Decisions that a data migration must happen before cutover, and leave its design to the user.

### 4. Build the characterization suite

Write black-box HTTP scenarios that run against a base URL, and store them in the Encore repo under `migration/characterization/`. Follow [references/characterization-suite.md](references/characterization-suite.md) for the layout, the record and verify modes, and normalizing.

- Cover every endpoint, with at least one success case and the main error cases (not found, unauthenticated, invalid input).
- Each scenario creates the data it reads through the API, so that it runs against an empty database on either system.
- Compare status, the full response body, and the headers clients rely on (`Content-Type`, `Location`, `Set-Cookie`, pagination). Normalize generated values such as IDs and timestamps.
- Encode each deviation in Decisions as a named override of the source's recorded response (for example, D3: status 404 instead of 500). The suite applies overrides only when it runs against the Encore app, so its target stays at 100% against both systems.
- Record expected responses from the running source. Recording writes data, so run it against a local instance with a disposable database, and ask before pointing it at anything shared. If the source cannot run, use an existing contract suite (Hurl, Postman/Newman, Schemathesis against an OpenAPI spec). If neither exists, write expected responses from reading the code and tell the user that this is weaker evidence.

Use Vitest for Encore.ts or a Go test for Encore Go. Hurl is a good fit when a dependency is acceptable.

The suite is done when every endpoint in the inventory has a scenario and the suite passes against the source twice in a row.

### 5. Order the units and get approval

Order the units:

0. When forklifting, unit 0 sets up the app with only the fallback route. It proves the database, secrets, and router wiring before any endpoint changes.
1. Auth first, because an Encore app has a single auth handler and protected endpoints depend on it.
2. Then services that others call or subscribe to, before their callers and subscribers.
3. Within a tier, the smallest unit first.

Size units so that one fits in a session. An app with one target service and around 20 endpoints or fewer is a single unit.

Set `## Status: planned`. Present the strategy, services, decisions, and unit order in one message, and wait for approval. This is the only required stop. If the user asked you to proceed without questions, present the plan and continue.

On approval, set `## Status: migrating`.

## Phase 3: Migrate

### Set up the app

If the target directory has no `encore.app` yet:

- **Forklift:** add Encore to the copied source and mount the old router on the fallback route, following [references/encore-concepts.md](references/encore-concepts.md#incremental-migration-with-a-fallback-route). TS needs `encore.app`, an `encore.service.ts`, and the `encore.dev` dependency. Go needs `encore.app`, a service package in place of `package main`, and the `encore.dev` module. Unit 0 is done when the characterization suite passes through the fallback with `CHAR_TARGET=source`; deviations normally appear only once Encore endpoints replace routes. If source tests stop working because the data layer changed, record that in the unit-0 evidence.
- **Rebuild:** `encore app create` makes a new directory, so create the app in a temporary directory and move its files into the target: `encore app create <name> --lang=ts --example=ts/hello-world` (Go: `--lang=go --example=hello-world`, then delete the example's `hello` service, whose `/!path` fallback conflicts with your own). Without an Encore Cloud login, add `--platform=false` and link the app later with `encore-deploy`. For a rebuild across languages, check the source behaviors listed in [references/encore-concepts.md](references/encore-concepts.md#behavior-that-lives-in-libraries).

### Migrate the units

For each unit in order:

1. Set it to `in progress` in the plan.
2. Implement it using the language skills: `encore-service`, `encore-api`, `encore-auth`, `encore-database`, `encore-pubsub`, `encore-cron`, `encore-bucket`, `encore-cache`, `encore-secret`, `encore-webhook`, `encore-logging`, or their `encore-go-*` equivalents. When forklifting, delete the replaced routes from the old router so that the fallback no longer serves them.
3. Port source tests whose assertions describe business behavior, using `encore-testing` or `encore-go-testing`. Tests that exercise framework wiring (routing, DI containers, request mocks) are covered by the characterization suite instead.
4. Prove the unit. It is `done` only when all of these hold in the current session:
   - `encore run` starts with no errors.
   - `encore test` passes.
   - Every characterization scenario for the unit's endpoints passes against the Encore app, apart from deviations listed in Decisions.
5. Record the evidence in the unit's section of the plan: commands run, pass counts, and any deviation with the reason. Set the unit to `done`.

When a unit cannot be proven (missing credentials, an external dependency that cannot run locally, or a decision only the user can make), set it to `blocked` with the reason, and continue with units that do not depend on it.

Report each finished unit in one line and go on to the next. Pause between units only if the user asked to review each one. Before touching a shared or production instance of the source in any way that has side effects (HTTP calls that write, commands against its databases or queues), ask first. The disposable local instance from Phase 1 needs no permission.

## Phase 4: Finish

Set `## Status: finishing`, and add a `## Finish` section to the plan that lists the open items below.

1. Run the full characterization suite and `encore test` once more, and report the results.
2. List every `blocked` unit and every deviation in Decisions. The migration is complete only when the user accepts each one.
3. When forklifting, check the old router for remaining routes. Once every route has an Encore endpoint, remove the fallback route and the old router. List docs, env templates, CI workflows, and scripts that still describe the old runtime.
4. If frontend code calls this backend, suggest `encore-frontend` to generate a typed client and update base URLs.
5. Offer to deploy with `encore-deploy`. Remind the user of any production data migration recorded in Decisions.
6. Suggest deleting `migration-plan.md` and `migration/characterization/`, or keeping the suite as regression tests.

Once the user accepts every open item, set `## Status: complete`. Leave the status at `finishing` until the user has accepted them; accepting on the user's behalf does not count.
