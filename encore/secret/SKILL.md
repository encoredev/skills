---
name: encore-secret
description: Manage API keys, credentials, and other secrets in Encore.ts using `secret(...)` from `encore.dev/config`.
when_to_use: >-
  User wants to load a private credential into the service without committing it to the repo — third-party API keys (Stripe, OpenAI, Twilio, SendGrid), database passwords, signing keys, OAuth client secrets, JWT signing keys, webhook signing secrets. Covers `secret()` declarations, calling the secret as a function to read its value, setting values via `encore secret set`, and `.secrets.local.cue` for local overrides. Trigger phrases: "API key", "third-party token", "credentials", "without committing", "private key", "signing secret", "secret manager", ".env replacement", "encore secret set".
---

# Encore Secrets

## Instructions

Secrets are encrypted, environment-scoped values managed by Encore. Declare them at package level by calling `secret(name)` and read them by calling the returned function.

```typescript
import { secret } from "encore.dev/config";

// Package-level declaration
const stripeKey = secret("StripeSecretKey");

// Read inside a handler
async function chargeCustomer() {
  const key = stripeKey();        // <-- function call returns the value
  const stripe = new Stripe(key);
  // ...
}
```

Secret names are globally unique across the application (the same name resolves to the same value everywhere).

## Setting values

```bash
# Set per environment type
encore secret set --type prod StripeSecretKey
encore secret set --type dev StripeSecretKey
encore secret set --type local StripeSecretKey
```

Environment types: `production` (alias `prod`), `development` (alias `dev`), `preview` (alias `pr`), `local`.

## Local overrides

For local development without going through `encore secret set`, create a `.secrets.local.cue` file at the repo root (gitignore it):

```cue
StripeSecretKey: "sk_test_local_..."
GitHubAPIToken:  "ghp_local_..."
```

## Common usage patterns

```typescript
// HTTP headers
const githubToken = secret("GitHubAPIToken");
const resp = await fetch("https://api.github.com/user", {
  headers: { Authorization: `token ${githubToken()}` },
});

// Webhook signature verification
const stripeWebhookSecret = secret("StripeWebhookSecret");
stripe.webhooks.constructEvent(rawBody, sig, stripeWebhookSecret());

// Connecting to a third-party SDK
const openaiKey = secret("OpenAIKey");
const openai = new OpenAI({ apiKey: openaiKey() });
```

## Guidelines

- Always declare `secret(...)` at package level, never inside functions.
- Read with a function call: `stripeKey()` not `stripeKey`.
- Set distinct values per environment via `encore secret set --type <env>`.
- Never commit secret values; use `.secrets.local.cue` for local overrides and gitignore it.
- For webhook signature secrets specifically, see also the `encore-webhook` skill.
