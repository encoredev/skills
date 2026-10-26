---
name: encore-go-getting-started
description: Take a new Encore Go project from zero to a running endpoint. Install the CLI, log in, create the app, run it, connect Encore's MCP servers, and add a first endpoint, with a pointer to the skill for each step. Not for architecture or feature questions.
when_to_use: >-
  User has no Encore project yet and wants to get started with Encore Go end to end: install, create a hello-world Go service, run their very first `encore run`, and connect Encore's MCP servers. For a single step, use `encore-install`, `encore-login`, `encore-create-app`, or `encore-run`. SKIP if the user already has an Encore Go project and is asking about architecture, services, endpoints, or specific features. Those go to `encore-go-service`, `encore-go-api`, `encore-go-pubsub`, etc. Trigger phrases: "completely new to Encore", "first time", "get started with Encore Go", "hello world Go", "just starting out".
---

# Getting Started with Encore Go

## Instructions

This guide is for Encore Go. For Encore.ts, use `encore-getting-started`. If the user hasn't said which language they want, ask.

Do the steps in order. Each step says how to tell it worked. If a step fails, load the skill it names.

### 1. Check the CLI

```bash
encore version
```

- **Prints `encore version v...`:** go to step 2.
- **Command not found:** install it (`encore-install`), then go to step 2.

### 2. Log in

Skip this step if the user only wants to run the app locally.

```bash
encore auth whoami
```

- **`logged in as <email>`:** go to step 3.
- **`not logged in.`:** start `encore auth login` in the background. Send the user the pairing code and URL it prints, and ask them to approve it in a browser on any device. Wait for `Successfully logged in!` (`encore-login`).
- **`logged in as app <app-id>`, or no person can approve a login (CI):** an auth key can't create apps. Ask the user to create the app in the Cloud Dashboard, then run `encore app clone <app-id>`, `cd` into it, and go to step 4.

### 3. Create the app

```bash
encore app create my-app --example=hello-world
cd my-app
```

- **Ends with `Successfully created app my-app!`:** go to step 4.
- **Empty app:** for an app with no services, use `--example=empty` instead.
- **Other templates and errors:** see `encore-create-app`.

### 4. Check that it runs

```bash
encore check 'curl /hello/world'
```

- **Prints `"Message": "Hello, world!"` and exits 0:** go to step 5.
- **Fails:** see `encore-run`.

To keep the app running for the user, start `encore run` in the background, never in the foreground (`encore-run`). The API is at `http://localhost:4000`, and the local development dashboard, with a trace of every request, is at `http://localhost:9400`.

### 5. Connect Encore's MCP servers

The MCP servers let you inspect and call the app while you build it, and read its deploys once it's on Encore Cloud. If the user created the app with `--llm-rules=<tool>`, the local server may already be configured for that tool: check before adding it again.

1. **Local server:** from the app's root directory, run `encore mcp start`. It prints `MCP stdio Command: encore mcp run --app=<app-id>`. Add that command to the user's tool. In Claude Code:

   ```bash
   claude mcp add --transport stdio encore-local -- encore mcp run --app=<app-id>
   ```

2. **Encore Cloud server** (only if you logged in at step 2):

   ```bash
   claude mcp add --transport http --scope user encore-cloud https://api.encore.dev/mcp
   ```

   Then ask the user to authenticate: in Claude Code, they run `/mcp`, select `encore-cloud`, and choose **Authenticate**.
3. **Cursor, VS Code, other tools, or an API key instead of signing in:** see `encore-mcp`.

The user's tool loads the new servers when it restarts. Tell the user, and go on to step 6 in the meantime.

### 6. Add an endpoint

The template has one service, `hello`. A Go package with at least one `//encore:api` endpoint is a service:

```
my-app/
├── encore.app        # Marks the app root and holds the app ID
├── go.mod
└── hello/
    ├── hello.go      # GET /hello/:name
    ├── hello_test.go
    └── index.go      # Landing page at /
```

Add a file to the package:

```go
// hello/goodbye.go
package hello

import "context"

type GoodbyeResponse struct {
	Message string `json:"message"`
}

//encore:api public method=GET path=/goodbye/:name
func Goodbye(ctx context.Context, name string) (*GoodbyeResponse, error) {
	return &GoodbyeResponse{Message: "Goodbye, " + name + "!"}, nil
}
```

Check it:

```bash
encore check 'curl /goodbye/world'
```

### 7. Next steps

| To | Load |
|----|------|
| Add endpoints, validation, and errors | `encore-go-api` |
| Add services or call one service from another | `encore-go-service` |
| Add a SQL database | `encore-go-database` |
| Require login on endpoints | `encore-go-auth` |
| Add Pub/Sub, cron jobs, buckets, secrets, or caching | `encore-go-pubsub`, `encore-go-cron`, `encore-go-bucket`, `encore-go-secret`, `encore-go-cache` |
| Write tests | `encore-go-testing` |
| Deploy: commit, then `git push encore` | `encore-deploy` |
