---
name: encore-go-cache
description: Cache data in Redis from Encore Go using `cache.NewCluster` and typed keyspaces from `encore.dev/storage/cache`. Type-safe key/value access with TTLs, atomic increments, and per-keyspace data shapes.
when_to_use: >-
  User wants to cache values in a Go service, store ephemeral state, rate-limit by counter, build a leaderboard, speed up a hot read, or store short-lived tokens. Covers `cache.NewCluster`, `cache.NewStringKeyspace`, `cache.NewIntKeyspace`, `cache.NewStructKeyspace`, list/set keyspaces, TTL helpers (`cache.ExpireIn`, `cache.ExpireDailyAt`, `cache.NeverExpire`), atomic `Increment`/`Decrement`, `SetIfNotExists`, `Replace`, eviction policies, and `cache.Miss`/`cache.KeyExists` errors. Trigger phrases: "cache this", "Redis", "key-value store", "rate limit", "TTL", "expire after", "in-memory store", "session token store", "leaderboard counter".
---

# Encore Go Caching (Redis)

## Instructions

Encore Go's cache is a typed wrapper around Redis. Declare a `cache.Cluster` once, then create `Keyspace` objects for each shape of data you need.

### Cluster

```go
package mycache

import "encore.dev/storage/cache"

var Cluster = cache.NewCluster("my-cache", cache.ClusterConfig{
    EvictionPolicy: cache.AllKeysLRU,
})
```

Eviction policies: `cache.AllKeysLRU` (default), `cache.NoEviction`, `cache.AllKeysLFU`, `cache.AllKeysRandom`, `cache.VolatileLRU`, `cache.VolatileLFU`, `cache.VolatileTTL`, `cache.VolatileRandom`.

### Keyspace types

Each keyspace has a key shape (used to build the Redis key from `KeyPattern`) and a value type.

```go
package mycache

import (
    "context"
    "time"
    "encore.dev/storage/cache"
)

type TokenKey struct {
    TokenID string
}

// Strings
var Tokens = cache.NewStringKeyspace[TokenKey](Cluster, cache.KeyspaceConfig{
    KeyPattern:    "token/:TokenID",
    DefaultExpiry: cache.ExpireIn(time.Hour),
})

func example(ctx context.Context) {
    _ = Tokens.Set(ctx, TokenKey{TokenID: "abc"}, "value")
    val, err := Tokens.Get(ctx, TokenKey{TokenID: "abc"}) // cache.Miss on miss
    _ = Tokens.Delete(ctx, TokenKey{TokenID: "abc"})
    _ = val
    _ = err
}
```

```go
// Integers (atomic counters)
type CounterKey struct {
    UserID string
}

var Counters = cache.NewIntKeyspace[CounterKey](Cluster, cache.KeyspaceConfig{
    KeyPattern:    "requests/:UserID",
    DefaultExpiry: cache.ExpireIn(10 * time.Second),
})

func incr(ctx context.Context) {
    count, _ := Counters.Increment(ctx, CounterKey{UserID: "user123"}, 1)
    _, _ = Counters.Decrement(ctx, CounterKey{UserID: "user123"}, 1)
    _ = count
}
```

```go
// Structs (JSON-encoded)
type ProfileKey struct {
    UserID string
}

type UserProfile struct {
    Name  string
    Email string
}

var Profiles = cache.NewStructKeyspace[ProfileKey, UserProfile](Cluster, cache.KeyspaceConfig{
    KeyPattern:    "profile/:UserID",
    DefaultExpiry: cache.ExpireIn(time.Hour),
})

func setProfile(ctx context.Context) {
    _ = Profiles.Set(ctx, ProfileKey{UserID: "123"}, UserProfile{
        Name: "Alice", Email: "alice@example.com",
    })
}
```

### Other keyspace types

All from `encore.dev/storage/cache`:

- `NewFloatKeyspace` — float64 values, has `Increment`.
- `NewListKeyspace` — list values, with `PushLeft`/`PushRight`/`PopLeft`/`PopRight`/`GetRange`.
- `NewSetKeyspace` — set values, with `Add`/`Remove`/`Contains`/`Items`.

### Multi-field key patterns

```go
type ResourceKey struct {
    UserID       string
    ResourcePath string
}

var ResourceRequests = cache.NewIntKeyspace[ResourceKey](Cluster, cache.KeyspaceConfig{
    KeyPattern:    "requests/:UserID/:ResourcePath",
    DefaultExpiry: cache.ExpireIn(10 * time.Second),
})
```

### Expiry helpers

```go
import (
    "encore.dev/storage/cache"
    "time"
)

cache.ExpireIn(time.Hour)              // relative
cache.ExpireDailyAt(2, 0, 0, time.UTC) // specific UTC time each day
cache.NeverExpire                      // no expiry
cache.KeepTTL                          // keep existing TTL when updating
```

### Errors

```go
import "encore.dev/storage/cache"

val, err := keyspace.Get(ctx, key)
if errors.Is(err, cache.Miss) {
    // not in cache
}

err = keyspace.SetIfNotExists(ctx, key, value)
if errors.Is(err, cache.KeyExists) {
    // already there
}
```

## Guidelines

- Declare `cache.Cluster` and keyspaces as package-level variables.
- Pick the most specific keyspace type — `IntKeyspace` for counters gives you atomic `Increment`/`Decrement` for free.
- `Get()` returns `cache.Miss` on miss; `Replace()` and `SetIfNotExists()` return `cache.Miss`/`cache.KeyExists` on conflict.
- Local development uses an in-memory Redis with a ~100-key cap — don't load-test it.
- For durable storage, use `encore-go-database` (Postgres) or `encore-go-bucket` (object storage) instead.
