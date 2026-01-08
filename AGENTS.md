# Encore Skills - Agent Instructions

This repository contains skills for building backend applications with Encore.ts.

## What is Encore.ts?

Encore.ts is a TypeScript backend framework where your code defines infrastructure. Write your application → Encore provisions databases, Pub/Sub, cron jobs, and more in your AWS/GCP account automatically.

## When to Use These Skills

### TypeScript Skills

| Skill | Trigger Keywords |
|-------|------------------|
| `encore-api` | typescript, ts, api, endpoint, route, REST, HTTP, webhook |
| `encore-auth` | typescript, ts, auth, authentication, login, token, jwt, gateway |
| `encore-infrastructure` | typescript, ts, database, pubsub, topic, cron, bucket, secret |
| `encore-service` | typescript, ts, service, microservice, structure, architecture |
| `encore-database` | typescript, ts, sql, query, migration, drizzle, prisma |
| `encore-code-review` | typescript, ts, review, audit, check, best practices |
| `encore-migrate` | migrate, convert, express, fastify, node |

### Go Skills

| Skill | Trigger Keywords |
|-------|------------------|
| `encore-go-api` | go, golang, api, endpoint, route, REST, HTTP, webhook |
| `encore-go-auth` | go, golang, auth, authentication, login, token, jwt |
| `encore-go-infrastructure` | go, golang, database, pubsub, topic, cron, bucket, secret |
| `encore-go-service` | go, golang, service, microservice, structure, architecture |
| `encore-go-database` | go, golang, sql, query, migration, sqldb, postgres |
| `encore-go-code-review` | go, golang, review, audit, check, best practices |

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

