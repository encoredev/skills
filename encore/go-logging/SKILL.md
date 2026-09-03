---
name: encore-go-logging
description: Add or improve structured logging in Encore Go using `encore.dev/rlog`. Covers log placement, levels, stable messages and fields, errors, logging contexts, sensitive data, and log volume.
when_to_use: >-
  User is adding, changing, or reviewing application logs in an Encore Go service. Mentions structured logging, `encore.dev/rlog`, `rlog.Info`, `rlog.Error`, log fields, log levels, noisy or duplicate logs, production debugging, or what to log. Trigger phrases: "add Go logging", "improve these logs", "which log level", "structured log fields", "reduce log volume", "log this error".
---

# Encore Go structured logging

Use `encore.dev/rlog` for application events that need structured fields or trace integration. Preserve an application's established field names and event conventions when they are consistent with this guidance.

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

Keep the message stable and pass alternating string keys and values after it:

```go
import "encore.dev/rlog"

rlog.Info("order rejected",
	"event", "order.rejected",
	"order_id", orderID,
	"product_id", productID,
	"reason", "insufficient_inventory",
	"requested_quantity", requestedQuantity,
	"available_quantity", availableQuantity,
)
```

Avoid interpolating identifiers into the message. Stable messages can be grouped, while fields remain searchable.

For events used by dashboards, alerts, or automation, include a stable `event` field. Prefer `<domain>.<past-tense-event>`, such as `payment.authorized` or `subscription.cancelled`. Diagnostic logs do not require an event name.

Keep each field name and type consistent across events. Prefer numeric values with explicit units and enum-like values over formatted prose:

```go
rlog.Info("payment authorized",
	"event", "payment.authorized",
	"amount_minor_units", 14900,
	"currency", "SEK",
)
```

Encore's runtime fields use snake_case. Field names beginning with `encore_` are reserved; `rlog` rewrites them with an `x_` prefix.

## Choose a level

Encore Go provides `Error`, `Warn`, `Info`, and `Debug`. It does not expose a `Trace` function through `rlog`.

- `Error`: an unexpected failure prevented an operation from completing
- `Warn`: the application recovered or continued in a degraded state
- `Info`: a meaningful, relatively low-volume business event
- `Debug`: diagnostic detail not required for normal operation

Expected outcomes such as validation failures, missing resources, rejected logins, or declined payments are not `Error` events. Use their business meaning to choose a level.

The default minimum level is `trace`, so all four `rlog` levels are emitted. Configure `log_level` in `encore.app` before adding `Debug` calls to frequently executed code.

## Record errors once

Pass the original `error` as a field value:

```go
if err := chargeCustomer(ctx, customerID, amount); err != nil {
	rlog.Error("payment authorization failed",
		"err", err,
		"customer_id", customerID,
		"amount_minor_units", amount,
		"currency", currency,
	)
	return err
}
```

Passing the `error` value lets `rlog` apply its error serialization. Calling `err.Error()` first passes a plain string.

Log a returned failure at the layer that owns the recovery decision and has the domain context to describe its impact. A lower layer should log only when it handles or suppresses the error, retries, detects an invariant violation, or holds context that the returned error will not contain.

## Add shared context

Use `rlog.With` when several events from one domain operation share fields:

```go
logger := rlog.With("import_id", importID, "tenant_id", tenantID)

logger.Info("user import completed", "succeeded_count", succeededCount, "failed_count", failedCount)
logger.Warn("user import row rejected", "row_number", rowNumber, "reason", "invalid_email")
```

Encore already attaches the service, endpoint, trace ID, and authenticated user ID to request logs. Do not add duplicate copies.

## Protect sensitive data

Encore does not redact log fields. Never log credentials, tokens, session identifiers, cookies, authorization headers, secret configuration, payment details, or complete request and response values.

Prefer internal identifiers over personal data. Use a stable non-reversible fingerprint when correlation requires a value that should not be stored.

The `sensitive` API annotation and `encore:"sensitive"` struct tag redact request and response payloads from traces; they do not redact values passed to `rlog`.

## Control volume

Summarize batches and long-running operations with outcomes, counts, and durations. Avoid one log per item unless each failure requires investigation.

Log selected metadata from large values rather than complete provider responses, records, configuration values, slices, or document bodies. Bound previews and review them for sensitive data before logging.

When reviewing an existing application, check loops, Pub/Sub subscribers, middleware, and frequently called helpers first. A small number of these call sites often produces most of the log volume.

See the [Encore Go logging guide](https://encore.dev/docs/go/observability/logging) and [`rlog` package reference](https://pkg.go.dev/encore.dev/rlog).
