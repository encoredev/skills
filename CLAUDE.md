# Encore Skills - Agent Instructions

This repository contains skills for building backend applications with Encore.ts.

## What is Encore.ts?

Encore.ts is a TypeScript backend framework where your code defines infrastructure. Write your application → Encore provisions databases, Pub/Sub, cron jobs, and more in your AWS/GCP account automatically.

## When to Use These Skills

### TypeScript Skills

| Skill | Trigger Keywords |
|-------|------------------|
| `encore-getting-started` | brand new, first time, install CLI, encore app create, hello world |
| `encore-api` | typed endpoint, route, REST, GET/POST, request/response, validation |
| `encore-webhook` | webhook, /webhooks/*, raw HTTP, api.raw, Stripe, GitHub, signature |
| `encore-auth` | auth, login, bearer token, JWT, Authorization header, 401, 403 |
| `encore-database` | postgres, table, sql, query, migration, drizzle, prisma, schema |
| `encore-pubsub` | pub/sub, topic, subscription, broadcast, event, queue, fan out |
| `encore-cron` | cron, schedule, daily, hourly, periodic, batch job, every N |
| `encore-bucket` | bucket, object storage, S3, GCS, file upload, image upload, blob |
| `encore-cache` | cache, redis, key-value, TTL, rate limit, leaderboard, expire |
| `encore-secret` | secret, API key, credentials, signing key, encore secret set |
| `encore-service` | service, microservice, structure, architecture, lay out, monolith |
| `encore-testing` | test, vitest, unit test, integration, encore test, isolated database |
| `encore-frontend` | frontend, client, react, nextjs, cors, fetch, generate client |
| `encore-code-review` | review, audit, anti-pattern, best practices, before merge |
| `encore-migrate` | migrate, convert, port, transition, express, fastify, hono |

### Go Skills

| Skill | Trigger Keywords |
|-------|------------------|
| `encore-go-getting-started` | brand new Go, first time, install CLI, encore app create, hello world |
| `encore-go-api` | go, typed endpoint, //encore:api, route, REST, GET/POST, request/response |
| `encore-go-webhook` | go, webhook, /webhooks/*, //encore:api raw, Stripe, GitHub, signature |
| `encore-go-auth` | go, auth, login, bearer token, JWT, Authorization header, 401, 403 |
| `encore-go-database` | go, postgres, table, sql, query, migration, sqldb |
| `encore-go-pubsub` | go, pub/sub, topic, subscription, broadcast, event, queue, fan out |
| `encore-go-cron` | go, cron, schedule, daily, hourly, periodic, batch job, every N |
| `encore-go-bucket` | go, bucket, object storage, S3, GCS, file upload, image upload, blob |
| `encore-go-cache` | go, cache, redis, key-value, TTL, rate limit, leaderboard, expire |
| `encore-go-secret` | go, secret, API key, credentials, secrets struct, encore secret set |
| `encore-go-service` | go, service, microservice, structure, architecture, lay out |
| `encore-go-testing` | go, test, *_test.go, encore test, isolated database |
| `encore-go-code-review` | go, review, audit, anti-pattern, best practices, before merge |
| `encore-frontend` | frontend, client, react, nextjs, cors, fetch, generate client |

## Key Patterns to Remember

### Infrastructure is Declarative

All infrastructure (databases, topics, cron jobs, buckets, secrets) must be declared at package level:

```typescript
// CORRECT: Package level
const db = new SQLDatabase("mydb", { migrations: "./migrations" });

// WRONG: Inside functions
function setup() {
  const db = new SQLDatabase("mydb", { migrations: "./migrations" });
}
```

### APIs are Functions, Not Routes

```typescript
// CORRECT: Encore
export const getUser = api(
  { method: "GET", path: "/users/:id", expose: true },
  async ({ id }) => findUser(id)
);

// WRONG: Express-style routes
app.get('/users/:id', handler);
```

### Cross-Service Calls Use ~encore/clients

```typescript
// CORRECT
import { user } from "~encore/clients";
await user.getUser({ id });

// WRONG: Direct imports across services
import { getUser } from "../user/api";
```

### Use ES6 Imports

```typescript
// CORRECT
import { api } from "encore.dev/api";

// WRONG
const { api } = require("encore.dev/api");
```

## Common Mistakes to Avoid

1. Declaring infrastructure inside functions
2. Using `require()` instead of `import`
3. Direct imports between services instead of `~encore/clients`
4. String concatenation in SQL (use template literals)
5. Returning error objects instead of throwing `APIError`
6. Non-idempotent Pub/Sub subscription handlers

## Skill Files Location

All skills are in `plugins/encore-skills/skills/*/SKILL.md`

