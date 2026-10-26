---
name: encore-getting-started
description: Take a new Encore.ts project from zero to a running endpoint. Install the CLI, log in, create the app, run it, and add a first endpoint, with a pointer to the skill for each step. Not for architecture or feature questions.
when_to_use: >-
  User has no Encore project yet and wants to get started with Encore.ts end to end: install, create a hello-world app, and run their very first `encore run`. For a single step, use `encore-install`, `encore-login`, `encore-create-app`, or `encore-run`. SKIP if the user already has an Encore project and is asking about architecture, services, endpoints, or specific features. Those go to `encore-service`, `encore-api`, `encore-pubsub`, etc. Trigger phrases: "completely new to Encore", "first time", "get started with Encore", "hello world", "just starting out".
---

# Getting Started with Encore.ts

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
encore app create my-app --example=ts/hello-world
cd my-app
```

- **Ends with `Successfully created app my-app!`:** go to step 4.
- **Keep the `--example` flag.** Without it, the CLI creates a Go app instead of a TypeScript one.
- **Empty app:** for an app with no services, use `--example=ts/empty` instead.
- **Other templates and errors:** see `encore-create-app`.

### 4. Check that it runs

```bash
encore check 'curl /hello/world'
```

- **Prints `{"message":"Hello world!"}` and exits 0:** go to step 5.
- **Fails:** see `encore-run`.

To keep the app running for the user, start `encore run` in the background, never in the foreground (`encore-run`). The API is at `http://localhost:4000`, and the local development dashboard, with a trace of every request, is at `http://localhost:9400`.

### 5. Add an endpoint

The template has one service, `hello`. A directory with an `encore.service.ts` file is a service, and every file below it belongs to that service:

```
my-app/
├── encore.app              # Marks the app root and holds the app ID
├── package.json
└── hello/
    ├── encore.service.ts   # Declares the "hello" service
    ├── hello.ts            # GET /hello/:name
    ├── hello.test.ts
    └── index.ts            # Landing page at /
```

Add a file to the service:

```typescript
// hello/goodbye.ts
import { api } from "encore.dev/api";

interface GoodbyeResponse {
  message: string;
}

export const goodbye = api(
  { expose: true, method: "GET", path: "/goodbye/:name" },
  async ({ name }: { name: string }): Promise<GoodbyeResponse> => {
    return { message: `Goodbye ${name}!` };
  },
);
```

Check it:

```bash
encore check 'curl /goodbye/world'
```

### 6. Next steps

| To | Load |
|----|------|
| Add endpoints, validation, and errors | `encore-api` |
| Add services or call one service from another | `encore-service` |
| Add a SQL database | `encore-database` |
| Require login on endpoints | `encore-auth` |
| Add Pub/Sub, cron jobs, buckets, secrets, or caching | `encore-pubsub`, `encore-cron`, `encore-bucket`, `encore-secret`, `encore-cache` |
| Write tests | `encore-testing` |
| Deploy: commit, then `git push encore` | `encore-deploy` |
