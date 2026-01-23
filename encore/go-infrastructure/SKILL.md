---
name: encore-go-infrastructure
description: Declare infrastructure with Encore Go.
---

# Encore Go Infrastructure Declaration

## Instructions

Encore Go uses declarative infrastructure - you define resources as package-level variables and Encore handles provisioning:

- **Locally** (`encore run`) - Encore runs infrastructure in Docker (Postgres, Redis, etc.)
- **Production** - Deploy via [Encore Cloud](https://encore.dev/cloud) to your AWS/GCP, or self-host using generated infrastructure config

### Critical Rule

**All infrastructure must be declared at package level, not inside functions.**

## Databases (PostgreSQL)

```go
package user

import "encore.dev/storage/sqldb"

// CORRECT: Package level
var db = sqldb.NewDatabase("userdb", sqldb.DatabaseConfig{
    Migrations: "./migrations",
})

// WRONG: Inside function
func setup() {
    db := sqldb.NewDatabase("userdb", sqldb.DatabaseConfig{...})
}
```

### Migrations

Create migrations in the `migrations/` directory:

```
user/
├── user.go
├── db.go
└── migrations/
    ├── 1_create_users.up.sql
    └── 2_add_email_index.up.sql
```

Migration naming: `{number}_{description}.up.sql`

## Pub/Sub

### Topics

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

## Cron Jobs

```go
package cleanup

import (
    "context"
    "encore.dev/cron"
)

// The cron job declaration
var _ = cron.NewJob("cleanup-sessions", cron.JobConfig{
    Title:    "Clean up expired sessions",
    Schedule: "0 * * * *",  // Every hour
    Endpoint: CleanupExpiredSessions,
})

//encore:api private
func CleanupExpiredSessions(ctx context.Context) error {
    // Cleanup logic
    return nil
}
```

### Schedule Formats

| Format | Example | Description |
|--------|---------|-------------|
| Cron expression | `"0 9 * * 1"` | 9am every Monday |
| Every interval | `"every 1h"` | Every hour |
| Every interval | `"every 30m"` | Every 30 minutes |

## Object Storage

```go
package uploads

import "encore.dev/storage/objects"

// Package level
var Uploads = objects.NewBucket("user-uploads", objects.BucketConfig{})

// Public bucket
var PublicAssets = objects.NewBucket("public-assets", objects.BucketConfig{
    Public: true,
})
```

### Operations

```go
// Upload (streaming pattern)
writer := Uploads.Upload(ctx, "path/to/file.jpg")
_, err := io.Copy(writer, dataReader)
if err != nil {
    writer.Abort()
    return err
}
err = writer.Close()

// Download
reader := Uploads.Download(ctx, "path/to/file.jpg")
if err := reader.Err(); err != nil {
    return err
}
defer reader.Close()
data, _ := io.ReadAll(reader)

// Check existence
exists, err := Uploads.Exists(ctx, "path/to/file.jpg")

// Get attributes (size, content type, ETag)
attrs, err := Uploads.Attrs(ctx, "path/to/file.jpg")

// List objects
for err, entry := range Uploads.List(ctx, &objects.Query{}) {
    if err != nil {
        return err
    }
    fmt.Println(entry.Key, entry.Size)
}

// Delete
err := Uploads.Remove(ctx, "path/to/file.jpg")

// Public URL (only for public buckets)
url := PublicAssets.PublicURL("image.jpg")
```

### Signed URLs

Generate temporary URLs for upload/download without exposing your bucket:

```go
import "time"

// Signed upload URL (expires in 2 hours)
url, err := Uploads.SignedUploadURL(ctx, "user-uploads/avatar.jpg",
    objects.WithTTL(time.Duration(7200)*time.Second))

// Signed download URL
url, err := Uploads.SignedDownloadURL(ctx, "documents/report.pdf",
    objects.WithTTL(time.Duration(7200)*time.Second))
```

### Bucket References

Pass bucket access with specific permissions to library code:

```go
// Create a reference with download permission only
ref := objects.BucketRef[objects.Downloader](Uploads)

// Create a reference with multiple permissions
type myPerms interface {
    objects.Downloader
    objects.Uploader
}
ref := objects.BucketRef[myPerms](Uploads)

// Permission types: Downloader, Uploader, Lister, Attrser, Remover,
// SignedDownloader, SignedUploader, ReadWriter
```

## Secrets

```go
package email

import "encore.dev/config"

var secrets struct {
    SendGridAPIKey config.String
    SMTPPassword   config.String
}

func sendEmail() error {
    apiKey := secrets.SendGridAPIKey()
    // Use the secret...
}
```

Set secrets via CLI:
```bash
encore secret set --type prod SendGridAPIKey
```

## Config Values

```go
package myservice

import "encore.dev/config"

var cfg struct {
    MaxRetries config.Int
    BaseURL    config.String
    Debug      config.Bool
}

func doSomething() {
    if cfg.Debug() {
        log.Println("Debug mode enabled")
    }
}
```

## Guidelines

- Infrastructure declarations MUST be at package level
- Use descriptive names for resources
- Keep migrations sequential and numbered
- Subscription handlers must be idempotent (at-least-once delivery)
- Secrets are accessed by calling them as functions
- Cron endpoints should be `private` (internal only)
- Each service typically has its own database
