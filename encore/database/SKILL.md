---
name: encore-database
description: Database queries, migrations, and ORM integration with Encore.ts.
---

# Encore Database Operations

## Instructions

### Database Setup

```typescript
import { SQLDatabase } from "encore.dev/storage/sqldb";

const db = new SQLDatabase("mydb", {
  migrations: "./migrations",
});
```

## Query Methods

Encore provides several query methods:

### `query` - Multiple Rows

Returns an async iterator for multiple rows:

```typescript
interface User {
  id: string;
  email: string;
  name: string;
}

const rows = await db.query<User>`
  SELECT id, email, name FROM users WHERE active = true
`;

const users: User[] = [];
for await (const row of rows) {
  users.push(row);
}
```

### `queryAll` - All Rows as Array

Returns all rows as an array (convenience wrapper around `query`):

```typescript
const users = await db.queryAll<User>`
  SELECT id, email, name FROM users WHERE active = true
`;
// users is User[]
```

### `queryRow` - Single Row

Returns one row or null:

```typescript
const user = await db.queryRow<User>`
  SELECT id, email, name FROM users WHERE id = ${userId}
`;

if (!user) {
  throw APIError.notFound("user not found");
}
```

### `exec` - No Return Value

For INSERT, UPDATE, DELETE operations:

```typescript
await db.exec`
  INSERT INTO users (id, email, name)
  VALUES (${id}, ${email}, ${name})
`;

await db.exec`
  UPDATE users SET name = ${newName} WHERE id = ${id}
`;

await db.exec`
  DELETE FROM users WHERE id = ${id}
`;
```

### Raw Query Methods

Use raw SQL strings with positional parameters (`$1`, `$2`, etc.) instead of template literals:

```typescript
// Raw query returning multiple rows
const rows = await db.rawQuery<User>("SELECT * FROM users WHERE active = $1", true);

// Raw query returning single row
const user = await db.rawQueryRow<User>("SELECT * FROM users WHERE id = $1", userId);

// Raw query returning all rows as array
const users = await db.rawQueryAll<User>("SELECT * FROM users WHERE role = $1", "admin");

// Raw exec for INSERT/UPDATE/DELETE
await db.rawExec("INSERT INTO users (id, email) VALUES ($1, $2)", id, email);
```

## Database Sharing Across Services

Reference a database owned by another service using `SQLDatabase.named()`:

```typescript
import { SQLDatabase } from "encore.dev/storage/sqldb";

// In the service that owns the database
const db = new SQLDatabase("shared-db", {
  migrations: "./migrations",
});

// In another service that needs access
const sharedDb = SQLDatabase.named("shared-db");

// Now you can query the shared database
const user = await sharedDb.queryRow<User>`SELECT * FROM users WHERE id = ${id}`;
```

## Migrations

### File Structure

```
service/
└── migrations/
    ├── 001_create_users.up.sql
    ├── 002_add_posts.up.sql
    └── 003_add_indexes.up.sql
```

### Naming Convention

- Start with a number (001, 002, etc.)
- Followed by underscore and description
- End with `.up.sql`
- Numbers must be sequential

### Example Migration

```sql
-- migrations/001_create_users.up.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

## Drizzle ORM Integration

### Setup

```typescript
// db.ts
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { drizzle } from "drizzle-orm/node-postgres";

const db = new SQLDatabase("mydb", {
  migrations: {
    path: "migrations",
    source: "drizzle",
  },
});

export const orm = drizzle(db.connectionString);
```

### Schema

```typescript
// schema.ts
import * as p from "drizzle-orm/pg-core";

export const users = p.pgTable("users", {
  id: p.uuid().primaryKey().defaultRandom(),
  email: p.text().unique().notNull(),
  name: p.text().notNull(),
  createdAt: p.timestamp().defaultNow(),
});
```

### Drizzle Config

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "migrations",
  schema: "schema.ts",
  dialect: "postgresql",
});
```

Generate migrations: `drizzle-kit generate`

### Using Drizzle

```typescript
import { orm } from "./db";
import { users } from "./schema";
import { eq } from "drizzle-orm";

// Select
const allUsers = await orm.select().from(users);
const user = await orm.select().from(users).where(eq(users.id, id));

// Insert
await orm.insert(users).values({ email, name });

// Update
await orm.update(users).set({ name }).where(eq(users.id, id));

// Delete
await orm.delete(users).where(eq(users.id, id));
```

## SQL Injection Protection

Encore's template literals automatically escape values:

```typescript
// SAFE - values are parameterized
const email = "user@example.com";
await db.queryRow`SELECT * FROM users WHERE email = ${email}`;

// WRONG - SQL injection risk
await db.queryRow(`SELECT * FROM users WHERE email = '${email}'`);
```

## Guidelines

- Always use template literals for queries (automatic escaping)
- Specify types with generics: `query<User>`, `queryRow<User>`
- Migrations are applied automatically on startup
- Use `queryRow` when expecting 0 or 1 result
- Use `query` with async iteration for multiple rows
- Database names should be lowercase, descriptive
- Each service typically has its own database
