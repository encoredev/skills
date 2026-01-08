# Encore Skills — Agent Instructions

This repository contains skills for building backend applications with Encore.ts.

## What is Encore.ts?

Encore.ts is a TypeScript backend framework where your code defines infrastructure. Write your application → Encore provisions databases, Pub/Sub, cron jobs, and more in your AWS/GCP account automatically.

## When to Use These Skills

| Skill | Trigger Keywords |
|-------|------------------|
| `encore-api` | api, endpoint, route, REST, HTTP, webhook, request, response |
| `encore-auth` | auth, authentication, login, token, jwt, gateway, protect, authorize |
| `encore-infrastructure` | database, pubsub, topic, cron, bucket, secret, queue |
| `encore-service` | service, microservice, structure, architecture, organize |
| `encore-database` | sql, query, migration, drizzle, prisma, postgres |
| `encore-code-review` | review, audit, check, best practices |
| `encore-migrate` | migrate, convert, express, fastify, port |

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

