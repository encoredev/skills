---
name: encore-pubsub
description: Asynchronous messaging in Encore.ts via `Topic` and `Subscription` from `encore.dev/pubsub` — broadcast events, decouple producers from consumers, and run background handlers.
when_to_use: >-
  User wants to publish/broadcast events, fan out a single event to many handlers, fire-and-forget messages between services, react to something asynchronously, set up a worker that consumes events, configure delivery guarantees (at-least-once, exactly-once), or use ordering attributes. Trigger phrases: "publish an event", "broadcast", "subscribe to", "topic", "Pub/Sub", "pubsub", "event bus", "order_created event", "send to anyone listening", "background event handler", "queue", "fan out".
---

# Encore Pub/Sub

## Instructions

Pub/Sub is for asynchronous messaging between services. Producers publish events to a `Topic`; consumers attach `Subscription`s to react. Resources must be declared at package level — never inside functions.

## Topics

```typescript
import { Topic } from "encore.dev/pubsub";

interface OrderCreatedEvent {
  orderId: string;
  userId: string;
  total: number;
}

// Package level declaration
export const orderCreated = new Topic<OrderCreatedEvent>("order-created", {
  deliveryGuarantee: "at-least-once",
});
```

### Publishing

```typescript
await orderCreated.publish({
  orderId: "123",
  userId: "user-456",
  total: 99.99,
});
```

### Subscriptions

```typescript
import { Subscription } from "encore.dev/pubsub";

const _ = new Subscription(orderCreated, "send-confirmation-email", {
  handler: async (event) => {
    await sendEmail(event.userId, event.orderId);
  },
});
```

### Message Attributes

Use `Attribute<T>` for fields that should be treated as message attributes (for filtering/ordering):

```typescript
import { Topic, Attribute } from "encore.dev/pubsub";

interface CartEvent {
  cartId: Attribute<string>;  // Used for ordering
  userId: string;
  action: "add" | "remove";
  productId: string;
}

// Ordered topic: events with same cartId delivered in order
export const cartEvents = new Topic<CartEvent>("cart-events", {
  deliveryGuarantee: "at-least-once",
  orderingAttribute: "cartId",
});
```

### Topic References

Pass topic access to other code while maintaining static analysis:

```typescript
import { Publisher } from "encore.dev/pubsub";

const publisherRef = orderCreated.ref<Publisher>();

async function notifyOrder(ref: typeof publisherRef, orderId: string) {
  await ref.publish({ orderId, userId: "123", total: 99.99 });
}
```

## Delivery Guarantees

- `at-least-once` (default): may deliver duplicates → handlers must be idempotent.
- `exactly-once`: stricter, capped throughput (AWS 300 msg/s/topic, GCP 3000+ msg/s/region). Does not deduplicate on the publish side.

## Guidelines

- Topics and subscriptions must be declared at package level.
- Subscription handlers must be idempotent (at-least-once delivery is the default).
- Use `Attribute<T>` for fields meant for filtering/ordering, not for arbitrary metadata.
- Don't do heavy synchronous work in `publish` callers — `publish` returns once the message is queued.
