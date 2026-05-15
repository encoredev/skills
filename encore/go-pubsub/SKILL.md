---
name: encore-go-pubsub
description: Asynchronous messaging in Encore Go via `pubsub.NewTopic` and `pubsub.NewSubscription` from `encore.dev/pubsub` — broadcast events, decouple producers from consumers, and run background handlers.
when_to_use: >-
  User wants to publish/broadcast events, fan out a single event to many handlers, fire-and-forget messages between Go services, react to something asynchronously, set up a worker that consumes events, configure delivery guarantees (at-least-once, exactly-once), or use ordering attributes. Trigger phrases: "publish an event", "broadcast", "subscribe to", "topic", "Pub/Sub", "pubsub", "event bus", "OrderCreated event", "send to anyone listening", "background event handler", "queue", "fan out".
---

# Encore Go Pub/Sub

## Instructions

Pub/Sub is for asynchronous messaging between services. Producers publish events to a `Topic`; consumers attach `Subscription`s to react. Resources must be declared as package-level variables — never inside functions.

## Topics

```go
package events

import "encore.dev/pubsub"

type OrderCreatedEvent struct {
    OrderID string `json:"order_id"`
    UserID  string `json:"user_id"`
    Total   int    `json:"total"`
}

// Package level declaration
var OrderCreated = pubsub.NewTopic[*OrderCreatedEvent]("order-created", pubsub.TopicConfig{
    DeliveryGuarantee: pubsub.AtLeastOnce,
})
```

### Publishing

```go
msgID, err := events.OrderCreated.Publish(ctx, &events.OrderCreatedEvent{
    OrderID: "123",
    UserID:  "user-456",
    Total:   9999,
})
```

### Subscriptions

```go
package notifications

import (
    "context"
    "myapp/events"
    "encore.dev/pubsub"
)

var _ = pubsub.NewSubscription(events.OrderCreated, "send-confirmation-email",
    pubsub.SubscriptionConfig[*events.OrderCreatedEvent]{
        Handler: sendConfirmationEmail,
    },
)

func sendConfirmationEmail(ctx context.Context, event *events.OrderCreatedEvent) error {
    // Send email...
    return nil
}
```

### Topic References

Pass topic access to library code while maintaining static analysis:

```go
// Create a reference with publish permission
ref := pubsub.TopicRef[pubsub.Publisher[*OrderCreatedEvent]](OrderCreated)

// Use the reference in library code
func publishEvent(ref pubsub.Publisher[*OrderCreatedEvent], event *OrderCreatedEvent) error {
    _, err := ref.Publish(ctx, event)
    return err
}
```

## Delivery Guarantees

- `pubsub.AtLeastOnce` (default): may deliver duplicates → handlers must be idempotent.
- `pubsub.ExactlyOnce`: stricter, capped throughput (AWS 300 msg/s/topic, GCP 3000+ msg/s/region). Does not deduplicate on the publish side.

## Guidelines

- Topics and subscriptions must be declared as package-level variables.
- Subscription handlers must be idempotent (at-least-once delivery is the default).
- Subscription handlers receive a `context.Context` and the event pointer; return an `error` to retry per the topic's retry policy.
- Don't do heavy synchronous work in `Publish` callers — `Publish` returns once the message is queued.
