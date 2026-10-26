---
name: encore-go-getting-started
description: Take a new Encore Go project from zero to a running endpoint. Install the CLI, log in, create the app, run it, and add a first endpoint, with a pointer to the skill for each step. Not for architecture or feature questions.
when_to_use: >-
  User has no Encore project yet and wants to get started with Encore Go end to end: install, create a hello-world Go service, and run their very first `encore run`. For a single step, use `encore-install`, `encore-login`, `encore-create-app`, or `encore-run`. SKIP if the user already has an Encore Go project and is asking about architecture, services, endpoints, or specific features. Those go to `encore-go-service`, `encore-go-api`, `encore-go-pubsub`, etc. Trigger phrases: "completely new to Encore", "first time", "get started with Encore Go", "hello world Go", "just starting out".
---

# Getting Started with Encore Go

## Instructions

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

### 5. Add an endpoint

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

### 6. Next steps

| To | Load |
|----|------|
| Add endpoints, validation, and errors | `encore-go-api` |
| Add services or call one service from another | `encore-go-service` |
| Add a SQL database | `encore-go-database` |
| Require login on endpoints | `encore-go-auth` |
| Add Pub/Sub, cron jobs, buckets, secrets, or caching | `encore-go-pubsub`, `encore-go-cron`, `encore-go-bucket`, `encore-go-secret`, `encore-go-cache` |
| Write tests | `encore-go-testing` |
| Deploy: commit, then `git push encore` | `encore-deploy` |
