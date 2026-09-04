---
name: encore-ts-logging
description: Add or improve structured logging in Encore.ts using `encore.dev/log`. Covers log placement, levels, stable messages and fields, errors, contextual loggers, sensitive data, and log volume.
when_to_use: >-
  User is adding, changing, or reviewing application logs in an Encore.ts service. Mentions structured logging, `encore.dev/log`, `log.info`, `log.error`, log fields, log levels, noisy or duplicate logs, production debugging, or what to log. Trigger phrases: "add logging", "improve these logs", "which log level", "structured log fields", "reduce log volume", "log this error".
---

# Encore.ts structured logging

Use `encore.dev/log` for application events that need structured fields or trace integration. Preserve an application's established field names and event conventions when they are consistent with this guidance.

## Decide what to record

Add logs for information Encore cannot infer from infrastructure operations:

- Business state transitions
- Decisions and the inputs that determined them
- Retries, fallbacks, and degraded operation
- Failures at the boundary that decides whether to retry, recover, or abort
- External-system interactions that require domain context
- Security-relevant or administrative actions

Encore already traces API requests, database queries, service calls, cache operations, and Pub/Sub activity. Do not narrate that execution with logs such as `request started`, `querying database`, or `request completed`.

Use metrics for aggregate counts and levels. Use traces for call flow and timing. Use logs for the context needed to investigate an individual event.

## Emit structured logs

Keep the message stable and put variable data in fields:

```typescript
import log from "encore.dev/log";

log.info("order rejected", {
  event: "order.rejected",
  orderId,
  productId,
  reason: "insufficient_inventory",
  requestedQuantity,
  availableQuantity,
});
```

Avoid interpolating identifiers into the message. Stable messages can be grouped, while fields remain searchable.

For events used by dashboards, alerts, or automation, include a stable `event` field. Prefer `<domain>.<past-tense-event>`, such as `payment.authorized` or `subscription.cancelled`. Diagnostic logs do not require an event name.

Keep each field name and type consistent across events. Prefer numeric values with explicit units and enum-like values over formatted prose:

```typescript
log.info("payment authorized", {
  event: "payment.authorized",
  amountMinorUnits: 14900,
  currency: "SEK",
});
```

## Choose a level

- `error`: an unexpected failure prevented an operation from completing
- `warn`: the application recovered or continued in a degraded state
- `info`: a meaningful, relatively low-volume business event
- `debug`: diagnostic detail not required for normal operation
- `trace`: high-volume internal state

Expected outcomes such as validation failures, missing resources, rejected logins, or declined payments are not `error` events. Use their business meaning to choose a level.

The default minimum level is `trace`. Configure `log_level` in `encore.app` before adding `debug` or `trace` calls to frequently executed code.

## Record errors once

`error` and `warn` accept the original error as their first argument:

```typescript
try {
  await chargeCustomer(customerId, amount);
} catch (err) {
  log.error(err, "payment authorization failed", {
    customerId,
    amountMinorUnits: amount,
    currency,
  });
  throw err;
}
```

Passing the original error preserves its type, message, stack trace, and cause. Converting it to a string discards that information.

Log a propagated failure at the layer that owns the recovery decision and has the domain context to describe its impact. A lower layer should log only when it handles or suppresses the error, retries, detects an invariant violation, or holds context that propagation will lose.

## Add shared context

Use `log.with()` when several events from one domain operation share fields:

```typescript
const logger = log.with({ importId, tenantId });

logger.info("user import completed", { succeededCount, failedCount });
logger.warn("user import row rejected", { rowNumber, reason: "invalid_email" });
```

Encore already attaches the service, endpoint, trace ID, and authenticated user ID to request logs. Do not add duplicate copies.

## Protect sensitive data

Encore does not redact log fields. Never log credentials, tokens, session identifiers, cookies, authorization headers, secret configuration, payment details, or complete request and response objects.

Prefer internal identifiers over personal data. Use a stable non-reversible fingerprint when correlation requires a value that should not be stored.

The `sensitive` API option redacts request and response payloads from traces; it does not redact values passed to `log`.

## Control volume

Summarize batches and long-running operations with outcomes, counts, and durations. Avoid one log per item unless each failure requires investigation.

Log selected metadata from large values rather than complete provider responses, records, configuration objects, arrays, or document bodies. Bound previews and review them for sensitive data before logging.

When reviewing an existing application, check loops, Pub/Sub subscribers, middleware, and frequently called helpers first. A small number of these call sites often produces most of the log volume.

See the [Encore.ts logging guide](https://encore.dev/docs/ts/observability/logging) and [`encore.dev/log` API reference](https://encore.dev/docs/ts/runtime/log).
