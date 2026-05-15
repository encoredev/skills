---
name: encore-cron
description: >-
  Schedule periodic / recurring work in Encore.ts using `CronJob` from `encore.dev/cron`. Covers `every: "1h"` interval syntax and `schedule: "0 9 * * 1"` cron expressions.
when_to_use: >-
  User wants to run a job on a schedule — anything with the words schedule, scheduled, daily, hourly, weekly, periodic, recurring, every N minutes/hours, "at HH:MM UTC", midnight, batch job, aggregation job, nightly, cleanup job, or background work that runs on a timer rather than in response to a request. Trigger phrases: "every day at 02:00 UTC", "daily aggregation", "run hourly", "scheduled task", "cron", "nightly cleanup", "on a schedule".
---

# Encore Cron Jobs

## Instructions

A `CronJob` declaration in Encore.ts ties a schedule to an existing `api(...)` endpoint. The endpoint runs at the chosen cadence. Declare the `CronJob` at package level — not inside a function.

```typescript
import { CronJob } from "encore.dev/cron";
import { api } from "encore.dev/api";

// 1. The endpoint to call (typically internal: expose: false)
export const aggregateDailyOrders = api(
  { expose: false },
  async (): Promise<void> => {
    // Aggregation logic
  }
);

// 2. Package-level cron declaration
const _ = new CronJob("aggregate-daily-orders", {
  title: "Aggregate orders for the previous day",
  schedule: "0 2 * * *",  // 02:00 UTC every day
  endpoint: aggregateDailyOrders,
});
```

## Schedule Formats

| Field | Example | Description |
|---|---|---|
| `every` | `"1h"`, `"30m"`, `"6h"` | Simple interval. **Must divide 24h evenly** — `"7h"` is invalid. |
| `schedule` | `"0 9 * * 1"` | Standard cron expression (5 fields, UTC). |

### Common cron expressions

| Cron | Meaning |
|---|---|
| `"0 * * * *"` | Every hour, on the hour |
| `"0 2 * * *"` | Daily at 02:00 UTC |
| `"0 0 * * 0"` | Weekly on Sunday at midnight UTC |
| `"0 4 15 * *"` | 04:00 UTC on the 15th of each month |

## Important behaviour

- **Cron jobs do not execute when running locally with `encore run`.** Only deployed environments fire crons.
- The cron endpoint should be `expose: false` so it can't be triggered externally — only the cron scheduler should call it.
- All times in `schedule` are UTC. Convert from local time when designing the schedule.
- The endpoint must already exist at module load — declare it before the `CronJob`.

## Guidelines

- Use `every` for "run on a regular interval" (must divide 24h).
- Use `schedule` for specific times of day or days of week.
- Keep endpoint logic idempotent: a cron may fire late or be retried in a redeploy window.
- For event-driven background work (not time-driven), use the `encore-pubsub` skill instead.
