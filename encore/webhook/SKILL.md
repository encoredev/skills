---
name: encore-webhook
description: Receive inbound webhooks from external services (Stripe, GitHub, Slack, Twilio, etc.) using `api.raw(...)` from `encore.dev/api`. The right skill any time the user names a third-party provider that POSTs events to a URL you own.
when_to_use: >-
  User mentions a webhook, a /webhooks/* path, raw HTTP, `api.raw()`, accepting external callbacks, verifying webhook signatures (Stripe-Signature, X-Hub-Signature-256), reading the raw request body, parsing form-encoded payloads, or any time the user names a third-party provider that posts events — Stripe, GitHub, GitLab, Bitbucket, Shopify, Twilio, SendGrid, Mailgun, Auth0, Clerk, Slack, Discord, PayPal, Square. Use `encore-api` instead for typed JSON endpoints in your own service. Trigger phrases: "Stripe webhook", "GitHub webhook", "/webhooks/stripe", "raw HTTP endpoint", "api.raw", "verify the signature", "inbound webhook", "external callback".
---

# Encore Webhook Endpoints

## Instructions

Use `api.raw(...)` to receive inbound webhooks from third-party services. Raw endpoints give you direct access to the Node.js-style request and response objects, which you need for signature verification (the verification typically requires the unparsed raw body).

### 1. Import

```typescript
import { api } from "encore.dev/api";
```

### 2. Define the endpoint with `api.raw`

```typescript
export const stripeWebhook = api.raw(
  { expose: true, path: "/webhooks/stripe", method: "POST" },
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    // Read raw body
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks).toString("utf8");

    // Verify signature, parse event...

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ received: true }));
  }
);
```

### 3. Verify the signature

Most providers sign webhooks. Read the secret with `secret(...)` from `encore.dev/config` (see the `encore-secret` skill) and verify before trusting the payload:

```typescript
import { secret } from "encore.dev/config";
const stripeWebhookSecret = secret("StripeWebhookSecret");

// inside handler:
import Stripe from "stripe";
const stripe = new Stripe(stripeApiKey());
const event = stripe.webhooks.constructEvent(rawBody, sig, stripeWebhookSecret());
```

For GitHub, verify the HMAC-SHA256 in the `X-Hub-Signature-256` header against the raw body using your webhook secret.

## Common providers

| Provider | Signature header | Verification |
|---|---|---|
| Stripe | `Stripe-Signature` | `stripe.webhooks.constructEvent(rawBody, sig, secret)` |
| GitHub | `X-Hub-Signature-256` | HMAC-SHA256 over the raw body |
| Slack | `X-Slack-Signature` | HMAC-SHA256 over `v0:{timestamp}:{rawBody}` |
| Shopify | `X-Shopify-Hmac-Sha256` | HMAC-SHA256 (base64) over the raw body |
| Twilio | `X-Twilio-Signature` | HMAC-SHA1 over URL + sorted form fields |

## Always respond quickly

Webhook senders retry on non-2xx or slow responses. Acknowledge with a 2xx as soon as the payload is verified, then enqueue the actual work via Pub/Sub (see `encore-pubsub`) instead of doing it in the request handler.

```typescript
import { Topic } from "encore.dev/pubsub";

interface StripeEvent { id: string; type: string; data: unknown; }
const stripeEvents = new Topic<StripeEvent>("stripe-events", {
  deliveryGuarantee: "at-least-once",
});

// inside the raw handler, after verification:
await stripeEvents.publish({ id: event.id, type: event.type, data: event.data });
res.writeHead(200); res.end();
```

## Guidelines

- Use `api.raw` *only* for webhooks and other low-level HTTP integrations.
- Always verify the provider's signature before trusting the payload.
- Always respond 2xx fast — push slow work onto Pub/Sub.
- Store the signing secret with `secret(...)`; never inline it.
- For typed JSON endpoints in your own service, use plain `api(...)` from the `encore-api` skill.
