---
name: encore-architecture
description: Design or revise the service architecture of an Encore application in Go or TypeScript. Covers service boundaries, data ownership, synchronous calls versus Pub/Sub, process allocation, public and private interfaces, and evolving a monolith.
when_to_use: >-
  User is deciding how many Encore services to create, where service boundaries belong, whether to split or merge services, which service owns data, or whether services should communicate through APIs or Pub/Sub. Also use for architecture reviews and plans to break up a monolith. Trigger phrases: "design the architecture", "service boundaries", "one service or several", "monolith vs microservices", "split this service", "who owns this database", "API or Pub/Sub", "distributed monolith", "chatty services".
---

# Encore application architecture

Design the logical application before choosing directories and declarations. Apply the same architectural reasoning to Encore.ts and Encore Go; use `encore-service` or `encore-go-service` for language-specific implementation.

## Read the application

Inspect the existing code and the Encore application model when available. Identify:

- User and system operations
- APIs, cron jobs, and Pub/Sub handlers
- Data models and the code that changes them
- Infrastructure resources and the services that use them
- Existing synchronous calls and event flows
- Failure, scaling, deployment, and security requirements

Preserve established application concepts unless the requested change requires redefining them.

## Separate services from processes

Treat an Encore service as a code and API boundary, not a fixed deployment unit. The Encore platform can run all services in one process or place each service in a separate process, configured per environment without code changes.

Use service boundaries to express application responsibilities. Use process allocation to change isolation and scaling without redesigning those responsibilities.

Keep the backend in one Encore application where practical so the application model spans its services, resources, IAM, tracing, and Flow diagram.

## Choose service boundaries

Start a new application with one service unless a stable boundary is already known. Organize code inside it with modules, directories, or Go subpackages.

Consider a separate service for a cohesive business capability with its own operations and data. Failure isolation, independent scaling or deployment, a smaller security interface, or an existing external-system seam can strengthen the case.

Account for the cost of the split: network failure, cross-service coordination, distributed consistency, and an interface that both sides must maintain. Keep behavior together when most changes affect both sides or neither side can complete useful work independently.

Avoid services that represent technical layers such as handlers, business logic, or database access. Expose capability operations such as `ReserveInventory`, not generic access to another service's tables.

Treat repeated sequential calls across one boundary and long chains of forwarding services as evidence that the proposed services may be too narrow.

## Assign data responsibility

Assign one service responsibility for each data model, its business rules, and its schema changes. Prefer calls or events when another service needs the owning service to enforce those rules.

Encore supports shared database access through `SQLDatabase.named` in TypeScript and `sqldb.Named` in Go. Use it deliberately for reporting, incremental migrations, or cases where another service interface would add more complexity than it removes. Define migration ownership and write access before sharing a database.

Do not impose one database per service as an Encore requirement. Evaluate the coupling created by shared schema access against the coupling created by another service interface.

## Choose communication

Use a typed service API when the caller needs a result before continuing, the operation must report success or failure, or one service owns the requested capability.

Use Pub/Sub when the caller need not wait, several consumers react independently, or consumer retries should not repeat the originating request. Account for eventual consistency and make handlers idempotent where duplicate delivery would affect correctness.

Keep immediate request/response workflows synchronous. Keep event consumers independent rather than recreating a synchronous call chain through ordered events.

When a database change and event publication must remain consistent, design for failure between them. Encore Go provides a transactional Pub/Sub outbox; other cases require an application-specific consistency mechanism.

## Define interfaces and authorization

Classify operations as public, authenticated, or private. Keep internal capability operations private unless an external client needs them.

Place authentication and cross-origin policy at the gateway. Keep authorization decisions about a specific capability or record with the service that owns it.

## Organize and evolve

Encore services cannot be nested. Group large sets of related services in system directories; systems organize source code and are not Encore resources or deployment units.

When splitting a service, identify the operations and data moving together, add the new service, replace direct calls with APIs or events, and define data ownership during the transition. Inspect the resulting model in Encore Flow and test calls that now cross the service boundary.

When recommending an architecture, name the proposed services, their responsibilities, owned resources, and communication paths. Explain the concrete reason for each service split and note important consistency or failure tradeoffs. Prefer the smallest architecture that satisfies the stated requirements.

See [App Structure](https://encore.dev/docs/app-structure) for the full guide and language-specific examples.
