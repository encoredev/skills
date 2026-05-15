---
name: encore-go-webhook
description: Receive inbound webhooks from external services (Stripe, GitHub, Slack, Twilio, etc.) in Encore Go using `//encore:api raw`. The right skill any time the user names a third-party provider that POSTs events to a URL you own.
when_to_use: >-
  User mentions a webhook, a /webhooks/* path, raw HTTP, `//encore:api raw`, accepting external callbacks, verifying webhook signatures (Stripe-Signature, X-Hub-Signature-256), reading the raw request body, parsing form-encoded payloads, or any time the user names a third-party provider that posts events — Stripe, GitHub, GitLab, Bitbucket, Shopify, Twilio, SendGrid, Mailgun, Auth0, Clerk, Slack, Discord, PayPal, Square. Use `encore-go-api` instead for typed JSON endpoints in your own service. Trigger phrases: "Stripe webhook", "GitHub webhook", "/webhooks/stripe", "raw HTTP endpoint", "raw endpoint", "verify the signature", "inbound webhook", "external callback".
---

# Encore Go Webhook Endpoints

## Instructions

Use `//encore:api raw` to receive inbound webhooks from third-party services. Raw endpoints give you direct access to `http.ResponseWriter` and `*http.Request`, which you need for signature verification (the verification typically requires the unparsed raw body).

### 1. Define the endpoint with `//encore:api raw`

```go
package webhooks

import (
    "io"
    "net/http"
)

//encore:api public raw path=/webhooks/stripe method=POST
func StripeWebhook(w http.ResponseWriter, req *http.Request) {
    sig := req.Header.Get("Stripe-Signature")

    // Read the raw body — needed for signature verification.
    body, err := io.ReadAll(req.Body)
    if err != nil {
        http.Error(w, "could not read body", http.StatusBadRequest)
        return
    }

    // Verify signature, parse event, handle, then respond...

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    w.Write([]byte(`{"received":true}`))
}
```

### 2. Verify the signature

Most providers sign webhooks. Read the secret with `secrets` (see the `encore-go-secret` skill) and verify before trusting the payload.

```go
package webhooks

import (
    "github.com/stripe/stripe-go/v76/webhook"
)

var secrets struct {
    StripeWebhookSecret string
}

//encore:api public raw path=/webhooks/stripe method=POST
func StripeWebhook(w http.ResponseWriter, req *http.Request) {
    body, _ := io.ReadAll(req.Body)
    sig := req.Header.Get("Stripe-Signature")

    event, err := webhook.ConstructEvent(body, sig, secrets.StripeWebhookSecret)
    if err != nil {
        http.Error(w, "signature verification failed", http.StatusBadRequest)
        return
    }

    // event is now trusted — handle it.
    _ = event
    w.WriteHeader(http.StatusOK)
}
```

For GitHub, verify the HMAC-SHA256 in the `X-Hub-Signature-256` header against the raw body using your webhook secret.

## Common providers

| Provider | Signature header | Verification |
|---|---|---|
| Stripe | `Stripe-Signature` | `stripe.webhook.ConstructEvent(rawBody, sig, secret)` |
| GitHub | `X-Hub-Signature-256` | HMAC-SHA256 over the raw body |
| Slack | `X-Slack-Signature` | HMAC-SHA256 over `v0:{timestamp}:{rawBody}` |
| Shopify | `X-Shopify-Hmac-Sha256` | HMAC-SHA256 (base64) over the raw body |
| Twilio | `X-Twilio-Signature` | HMAC-SHA1 over URL + sorted form fields |

## Always respond quickly

Webhook senders retry on non-2xx or slow responses. Acknowledge with a 2xx as soon as the payload is verified, then enqueue the actual work via Pub/Sub (see `encore-go-pubsub`) instead of doing it in the request handler.

```go
package webhooks

import (
    "encore.dev/pubsub"
    "net/http"
)

type StripeEvent struct {
    ID   string `json:"id"`
    Type string `json:"type"`
    Data any    `json:"data"`
}

var StripeEvents = pubsub.NewTopic[*StripeEvent]("stripe-events", pubsub.TopicConfig{
    DeliveryGuarantee: pubsub.AtLeastOnce,
})

//encore:api public raw path=/webhooks/stripe method=POST
func StripeWebhook(w http.ResponseWriter, req *http.Request) {
    // ... verify signature, parse event ...

    _, _ = StripeEvents.Publish(req.Context(), &StripeEvent{
        ID: event.ID, Type: string(event.Type), Data: event.Data,
    })
    w.WriteHeader(http.StatusOK)
}
```

## Guidelines

- Use `//encore:api raw` *only* for webhooks and other low-level HTTP integrations.
- Always verify the provider's signature before trusting the payload.
- Always respond 2xx fast — push slow work onto Pub/Sub.
- Store the signing secret in `secrets struct{...}`; never inline it.
- For typed JSON endpoints in your own service, use plain `//encore:api` from the `encore-go-api` skill.
