---
name: encore-go-cron
description: >-
  Schedule periodic / recurring work in Encore Go using `cron.NewJob` from `encore.dev/cron`. Covers `Every: "1h"` interval syntax and `Schedule: "0 9 * * 1"` cron expressions.
when_to_use: >-
  User wants to run a Go job on a schedule — anything with the words schedule, scheduled, daily, hourly, weekly, periodic, recurring, every N minutes/hours, "at HH:MM UTC", midnight, batch job, aggregation job, nightly, cleanup job, or background work that runs on a timer rather than in response to a request. Trigger phrases: "every day at 02:00 UTC", "daily aggregation", "run hourly", "scheduled task", "cron", "nightly cleanup", "on a schedule".
---

# Encore Go Cron Jobs

## Instructions

A `cron.NewJob` declaration in Encore Go ties a schedule to an existing `//encore:api` endpoint. The endpoint runs at the chosen cadence. Declare the job as a package-level variable — not inside a function.

```go
package cleanup

import (
    "context"
    "encore.dev/cron"
)

// 1. The endpoint to call (typically private: //encore:api private)
//encore:api private
func CleanupExpiredSessions(ctx context.Context) error {
    // Cleanup logic
    return nil
}

// 2. Package-level cron declaration
var _ = cron.NewJob("cleanup-sessions", cron.JobConfig{
    Title:    "Clean up expired sessions",
    Schedule: "0 * * * *", // Every hour
    Endpoint: CleanupExpiredSessions,
})
```

## Schedule Formats

| Field | Example | Description |
|---|---|---|
| `Every` | `"1h"`, `"30m"`, `"6h"` | Simple interval. **Must divide 24h evenly** — `"7h"` is invalid. |
| `Schedule` | `"0 9 * * 1"` | Standard cron expression (5 fields, UTC). |

### Common cron expressions

| Cron | Meaning |
|---|---|
| `"0 * * * *"` | Every hour, on the hour |
| `"0 2 * * *"` | Daily at 02:00 UTC |
| `"0 0 * * 0"` | Weekly on Sunday at midnight UTC |
| `"0 4 15 * *"` | 04:00 UTC on the 15th of each month |

## Important behaviour

- **Cron jobs do not execute when running locally with `encore run`.** Only deployed environments fire crons.
- The cron endpoint should be `private` so it can't be triggered externally — only the cron scheduler should call it.
- All times in `Schedule` are UTC. Convert from local time when designing the schedule.
- The endpoint must be defined at module load — declare it before the `cron.NewJob` reference.

## Guidelines

- Use `Every` for "run on a regular interval" (must divide 24h).
- Use `Schedule` for specific times of day or days of week.
- Keep endpoint logic idempotent: a cron may fire late or be retried in a redeploy window.
- For event-driven background work (not time-driven), use the `encore-go-pubsub` skill instead.
