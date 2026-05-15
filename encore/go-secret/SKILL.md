---
name: encore-go-secret
description: Manage API keys, credentials, and other secrets in Encore Go using a package-level `secrets` struct.
when_to_use: >-
  User wants to load a private credential into a Go service without committing it to the repo — third-party API keys (Stripe, OpenAI, Twilio, SendGrid), database passwords, signing keys, OAuth client secrets, JWT signing keys, webhook signing secrets. Covers the `var secrets struct{...}` declaration, accessing secrets as struct fields, setting values via `encore secret set`, and `.secrets.local.cue` overrides. Trigger phrases: "API key", "third-party token", "credentials", "without committing", "private key", "signing secret", "secret manager", "encore secret set".
---

# Encore Go Secrets

## Instructions

Secrets are encrypted, environment-scoped values managed by Encore. Declare them as a package-level `secrets` struct — Encore reads the field names and resolves each to the right value at runtime.

```go
package email

var secrets struct {
    SendGridAPIKey string
    SMTPPassword   string
}

func sendEmail() error {
    apiKey := secrets.SendGridAPIKey
    // Use the secret...
    return nil
}
```

Secret keys are globally unique across the application — `SendGridAPIKey` resolves to the same value regardless of which package declares it.

## Setting values

```bash
# Set per environment type
encore secret set --type prod SendGridAPIKey
encore secret set --type dev  SendGridAPIKey
encore secret set --type local SendGridAPIKey
```

Environment types: `production` (alias `prod`), `development` (alias `dev`), `preview` (alias `pr`), `local`.

## Local overrides

For local development without going through `encore secret set`, create a `.secrets.local.cue` file at the repo root (gitignore it):

```cue
SendGridAPIKey: "SG.local-test-key"
GitHubAPIToken: "ghp_local_..."
```

## Common usage patterns

```go
package github

import (
    "context"
    "net/http"
)

var secrets struct {
    GitHubAPIToken string
}

func callGitHub(ctx context.Context) error {
    req, _ := http.NewRequestWithContext(ctx, "GET", "https://api.github.com/user", nil)
    req.Header.Set("Authorization", "token "+secrets.GitHubAPIToken)
    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    return nil
}
```

```go
package webhooks

var secrets struct {
    StripeWebhookSecret string
}
// Verify Stripe signature using secrets.StripeWebhookSecret in a raw endpoint.
```

## Guidelines

- Declare secrets as a package-level `secrets` struct, not as individual `secret(...)` calls.
- Field names must exactly match the secret name set via `encore secret set`.
- Set distinct values per environment via `encore secret set --type <env>`.
- Never commit secret values; use `.secrets.local.cue` for local overrides and gitignore it.
- For webhook signature secrets specifically, see also the `encore-go-webhook` skill.
