---
name: encore-infrastructure
description: Declare databases, Pub/Sub, cron jobs, and secrets with Encore.ts.
---

# Encore Infrastructure Declaration

## Instructions

Encore.ts uses declarative infrastructure - you define resources in code and Encore handles provisioning:

- **Locally** (`encore run`) - Encore runs infrastructure in Docker (Postgres, Redis, etc.)
- **Production** - Deploy via [Encore Cloud](https://encore.dev/cloud) to your AWS/GCP, or self-host using generated infrastructure config

### Critical Rule

**All infrastructure must be declared at package level (top of file), not inside functions.**

## Databases (PostgreSQL)

```typescript
import { SQLDatabase } from "encore.dev/storage/sqldb";

// CORRECT: Package level
const db = new SQLDatabase("mydb", {
  migrations: "./migrations",
});

// WRONG: Inside function
async function setup() {
  const db = new SQLDatabase("mydb", { migrations: "./migrations" });
}
```

### Migrations

Create migrations in the `migrations/` directory:

```
service/
├── encore.service.ts
├── api.ts
├── db.ts
└── migrations/
    ├── 001_create_users.up.sql
    └── 002_add_email_index.up.sql
```

Migration naming: `{number}_{description}.up.sql`

## Pub/Sub

### Topics

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

Use `Attribute<T>` for fields that should be message attributes (for filtering/ordering):

```typescript
import { Topic, Attribute } from "encore.dev/pubsub";

interface CartEvent {
  cartId: Attribute<string>;  // Used for ordering
  userId: string;
  action: "add" | "remove";
  productId: string;
}

// Ordered topic - events with same cartId delivered in order
export const cartEvents = new Topic<CartEvent>("cart-events", {
  deliveryGuarantee: "at-least-once",
  orderingAttribute: "cartId",
});
```

### Topic References

Pass topic access to other code while maintaining static analysis:

```typescript
import { Publisher } from "encore.dev/pubsub";

// Create a reference with publish permission
const publisherRef = orderCreated.ref<Publisher>();

// Use the reference
async function notifyOrder(ref: typeof publisherRef, orderId: string) {
  await ref.publish({ orderId, userId: "123", total: 99.99 });
}
```

## Cron Jobs

```typescript
import { CronJob } from "encore.dev/cron";
import { api } from "encore.dev/api";

// The endpoint to call
export const cleanupExpiredSessions = api(
  { expose: false },
  async (): Promise<void> => {
    // Cleanup logic
  }
);

// Package level cron declaration
const _ = new CronJob("cleanup-sessions", {
  title: "Clean up expired sessions",
  schedule: "0 * * * *",  // Every hour
  endpoint: cleanupExpiredSessions,
});
```

### Schedule Formats

| Format | Example | Description |
|--------|---------|-------------|
| `every` | `"1h"`, `"30m"` | Simple interval (must divide 24h evenly) |
| `schedule` | `"0 9 * * 1"` | Cron expression (9am every Monday) |

## Object Storage

```typescript
import { Bucket } from "encore.dev/storage/objects";

// Package level
export const uploads = new Bucket("user-uploads", {
  versioned: false,  // Set to true to keep multiple versions of objects
});

// Public bucket (files accessible via public URL)
export const publicAssets = new Bucket("public-assets", {
  public: true,
  versioned: false,
});
```

### Operations

```typescript
// Upload
const attrs = await uploads.upload("path/to/file.jpg", buffer, {
  contentType: "image/jpeg",
});

// Download
const data = await uploads.download("path/to/file.jpg");

// Check existence
const exists = await uploads.exists("path/to/file.jpg");

// Get attributes (size, content type, ETag)
const attrs = await uploads.attrs("path/to/file.jpg");

// Delete
await uploads.remove("path/to/file.jpg");

// List objects
for await (const entry of uploads.list({})) {
  console.log(entry.key, entry.size);
}

// Public URL (only for public buckets)
const url = publicAssets.publicUrl("image.jpg");
```

### Signed URLs

Generate temporary URLs for upload/download without exposing your bucket:

```typescript
// Signed upload URL (expires in 2 hours)
const uploadUrl = await uploads.signedUploadUrl("user-uploads/avatar.jpg", { ttl: 7200 });

// Signed download URL
const downloadUrl = await uploads.signedDownloadUrl("documents/report.pdf", { ttl: 7200 });
```

### Bucket References

Pass bucket access with specific permissions to other code:

```typescript
import { Uploader, Downloader } from "encore.dev/storage/objects";

// Create a reference with upload permission only
const uploaderRef = uploads.ref<Uploader>();

// Create a reference with download permission only
const downloaderRef = uploads.ref<Downloader>();

// Permission types: Downloader, Uploader, Lister, Attrser, Remover,
// SignedDownloader, SignedUploader, ReadWriter
```

## Secrets

```typescript
import { secret } from "encore.dev/config";

// Package level
const stripeKey = secret("StripeSecretKey");

// Usage (call as function)
const key = stripeKey();
```

Set secrets via CLI:
```bash
encore secret set --type prod StripeSecretKey
```

## Guidelines

- Infrastructure declarations MUST be at package level
- Use descriptive names for resources
- Keep migrations sequential and numbered
- Subscription handlers must be idempotent (at-least-once delivery)
- Secrets are accessed by calling the secret as a function
- Cron endpoints should be `expose: false` (internal only)
