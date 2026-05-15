---
name: encore-cache
description: Cache data in Redis from Encore.ts using `CacheCluster` and typed keyspaces from `encore.dev/storage/cache`. Type-safe key/value access with TTLs, atomic increments, and per-keyspace data shapes.
when_to_use: >-
  User wants to cache values, store ephemeral state, rate-limit by counter, build a leaderboard, speed up a hot read, or store short-lived tokens. Covers `CacheCluster`, `StringKeyspace`, `IntKeyspace`, `FloatKeyspace`, `StructKeyspace`, list and set keyspaces, TTL helpers (`expireIn`, `expireDailyAt`, `neverExpire`, `keepTTL`), atomic `increment`/`decrement`, `setIfNotExists`, `replace`, eviction policies, and `CacheMiss`/`CacheKeyExists` errors. Trigger phrases: "cache this", "Redis", "key-value store", "rate limit", "TTL", "expire after", "in-memory store", "session token store", "leaderboard counter".
---

# Encore Caching (Redis)

## Instructions

Encore's cache is a typed wrapper around Redis. Declare a `CacheCluster` once, then create `Keyspace` objects for each shape of data you need.

### Cluster

```typescript
import { CacheCluster } from "encore.dev/storage/cache";

const cluster = new CacheCluster("my-cache", {
  evictionPolicy: "allkeys-lru",
});
```

Reference a cluster from another service: `const cluster = CacheCluster.named("my-cache");`

Eviction policies: `"allkeys-lru"` (default), `"noeviction"`, `"allkeys-lfu"`, `"allkeys-random"`, `"volatile-lru"`, `"volatile-lfu"`, `"volatile-ttl"`, `"volatile-random"`.

### Keyspace types

Each keyspace has a key shape (used to build the Redis key from `keyPattern`) and a value type.

```typescript
import {
  StringKeyspace,
  IntKeyspace,
  FloatKeyspace,
  StructKeyspace,
  StringListKeyspace,
  NumberListKeyspace,
  StringSetKeyspace,
  NumberSetKeyspace,
  expireIn,
} from "encore.dev/storage/cache";

// Strings
const tokens = new StringKeyspace<{ tokenId: string }>(cluster, {
  keyPattern: "token/:tokenId",
  defaultExpiry: expireIn(3600 * 1000),
});
await tokens.set({ tokenId: "abc" }, "value");
const val = await tokens.get({ tokenId: "abc" }); // undefined on miss

// Integers (atomic counters)
const counters = new IntKeyspace<{ userId: string }>(cluster, {
  keyPattern: "requests/:userId",
  defaultExpiry: expireIn(10 * 1000),
});
const count = await counters.increment({ userId: "user123" }, 1);

// Structs (JSON)
interface UserProfile { name: string; email: string; }
const profiles = new StructKeyspace<{ userId: string }, UserProfile>(cluster, {
  keyPattern: "profile/:userId",
  defaultExpiry: expireIn(3600 * 1000),
});
await profiles.set({ userId: "123" }, { name: "Alice", email: "alice@example.com" });

// Lists
const recent = new StringListKeyspace<{ userId: string }>(cluster, {
  keyPattern: "recent/:userId",
});
await recent.pushRight({ userId: "user123" }, "item1", "item2");

// Sets
const tags = new StringSetKeyspace<{ articleId: string }>(cluster, {
  keyPattern: "tags/:articleId",
});
await tags.add({ articleId: "post1" }, "typescript", "encore");
const has = await tags.contains({ articleId: "post1" }, "typescript");
```

### Multi-field key patterns

```typescript
interface Key { userId: string; resourcePath: string; }

const requests = new IntKeyspace<Key>(cluster, {
  keyPattern: "requests/:userId/:resourcePath",
  defaultExpiry: expireIn(10 * 1000),
});
```

### Expiry helpers

```typescript
import {
  expireIn,          // milliseconds
  expireInSeconds,
  expireInMinutes,
  expireInHours,
  expireDailyAt,     // a specific UTC time each day
  neverExpire,
  keepTTL,           // keep existing TTL when updating
} from "encore.dev/storage/cache";
```

### Write options

```typescript
await keyspace.set(key, value, { expiry: expireInMinutes(30) });
await keyspace.set(key, value, { expiry: keepTTL });
await keyspace.setIfNotExists(key, value);  // throws CacheKeyExists if present
await keyspace.replace(key, value);          // throws CacheMiss if absent
```

### Errors

```typescript
import { CacheMiss, CacheKeyExists } from "encore.dev/storage/cache";

const value = await keyspace.get(key);  // undefined on miss (does not throw)
```

## Guidelines

- Declare `CacheCluster` and keyspaces at package level.
- Pick the most specific keyspace type — `IntKeyspace` for counters gives you atomic `increment`/`decrement` for free.
- `get()` returns `undefined` on miss; `replace()` and `setIfNotExists()` throw on conflict.
- Local development uses an in-memory Redis with a ~100-key cap — don't load-test it.
- For durable storage, use `encore-database` (Postgres) or `encore-bucket` (object storage) instead.
