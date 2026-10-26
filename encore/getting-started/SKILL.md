---
name: encore-getting-started
description: Set up Encore.ts from scratch. Install the CLI, log in, create an app, check that it runs, and connect Encore's MCP servers, with a pointer to the skill for each step. Ends where building starts. Not for architecture or feature questions.
when_to_use: >-
  User has no Encore project yet and wants to get set up with Encore.ts end to end: install the CLI, log in, create a hello-world app, check that it runs, and connect Encore's MCP servers. For a single step, use `encore-install`, `encore-login`, `encore-create-app`, `encore-run`, or `encore-mcp`. SKIP if the user already has an Encore project and is asking about architecture, services, endpoints, or specific features. Those go to `encore-service`, `encore-api`, `encore-pubsub`, etc. Trigger phrases: "set up Encore", "completely new to Encore", "first time", "get started with Encore", "hello world", "just starting out".
---

# Setting Up Encore.ts

## Instructions

This guide is for Encore.ts. For Encore Go, use `encore-go-getting-started`. If the user hasn't said which language they want, ask.

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
encore app create my-app --example=ts/hello-world
cd my-app
```

- **Ends with `Successfully created app my-app!`:** go to step 4.
- **Keep the `--example` flag.** In a terminal, the CLI asks for a language and template when it's missing. Without a terminal, which is how agents usually run commands, it can't ask, and creates an empty Go app instead.
- **Empty app:** for an app with no services, use `--example=ts/empty` instead, and skip step 4.
- **Other templates and errors:** see `encore-create-app`.

### 4. Check that it runs

```bash
encore check 'curl /hello/world'
```

- **Prints `{"message":"Hello world!"}` and exits 0:** go to step 5.
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

3. **Cursor, VS Code, other tools, or an API key instead of signing in:** see `encore-mcp`.

### 6. Report back

Setup is done. Tell the user:

- **Where the app is:** its directory, and, if it's on Encore Cloud, its Cloud Dashboard at `https://app.encore.dev/<app-id>`.
- **What's left for them:** their tool loads the new MCP servers when it restarts. If you added `encore-cloud`, they also need to authenticate it once: in Claude Code, `/mcp`, select `encore-cloud`, and choose **Authenticate**.

To build on the app, load the skill for the task. The hello-world app has one service, `hello`, in `hello/`.

| To | Load |
|----|------|
| Add endpoints, validation, and errors | `encore-api` |
| Add services or call one service from another | `encore-service` |
| Add a SQL database | `encore-database` |
| Require login on endpoints | `encore-auth` |
| Add Pub/Sub, cron jobs, buckets, secrets, or caching | `encore-pubsub`, `encore-cron`, `encore-bucket`, `encore-secret`, `encore-cache` |
| Write tests | `encore-testing` |
| Deploy: commit, then `git push encore` | `encore-deploy` |
