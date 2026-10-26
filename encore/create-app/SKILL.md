---
name: encore-create-app
description: Create a new Encore.ts or Encore.go app with `encore app create` without interactive prompts, from a template or empty, on Encore Cloud or local only. Also covers getting an app that's already on Encore Cloud with `encore app clone` and registering existing Encore code with `encore app init`.
when_to_use: >-
  User wants a new Encore app or project, an empty app, to scaffold or bootstrap a backend with Encore, to start from a template or example (hello world, URL shortener, uptime monitor, GraphQL), or to get an existing Encore Cloud app onto this machine. Also use when `encore app create` waits on a prompt, creates a Go app when TypeScript was wanted, or fails with "directory already exists", "this directory already contains Encore code", "specify an app name", or a name error. SKIP when the app already exists and the task is adding services, endpoints, or infrastructure. Trigger phrases: "create an Encore app", "new Encore project", "empty Encore app", "encore app create", "scaffold a backend", "start from a template", "hello world app", "URL shortener template", "encore app init", "encore app clone".
---

# Creating an Encore App

## Instructions

Do the steps in order.

### 1. Check before creating

- **CLI:** `encore version` prints a version. If not, see `encore-install`.
- **Login:** if the app should deploy to Encore Cloud, `encore auth whoami` must print `logged in as <email>`. If not, see `encore-login`. Skip the login only if the user wants a local-only app. If you can't tell, ask.
- **Auth key only** (`logged in as app <app-id>`): don't run `encore app create`, it fails. Ask the user to create the app in the Cloud Dashboard, then follow [Get an existing app](#get-an-existing-app).
- **Already in an app:** if the current directory or a parent has an `encore.app` file, the app exists. Don't create another one.

### 2. Pick a template

| The user wants | Encore.ts | Encore.go |
|----------------|-----------|-----------|
| A small working app (default) | `ts/hello-world` | `hello-world` |
| An empty app, no services | `ts/empty` | `empty` |
| A REST API with a SQL database | `ts/url-shortener` | `url-shortener` |
| Several services, SQL databases, Pub/Sub, cron jobs | `ts/uptime` | `uptime` |
| A GraphQL API with a SQL database | | `graphql` |

`--example` also takes any directory in https://github.com/encoredev/examples, or a GitHub URL: `https://github.com/<owner>/<repo>/tree/<branch>/<path>`.

### 3. Create it

```bash
encore app create my-app --example=ts/hello-world   # Encore.ts
encore app create my-app --example=ts/empty         # Encore.ts, empty
encore app create my-app --example=hello-world      # Encore.go
encore app create my-app --example=empty            # Encore.go, empty
```

- **Always pass `--example`.** Agents usually run commands without a terminal, so the CLI doesn't prompt. With no `--example`, it creates an empty Go app, even for a TypeScript project.
- **Name:** lowercase letters, digits, and single dashes, at most 50 characters, not starting or ending with a dash. It becomes the directory, which must not exist yet.
- **It takes a while:** it downloads the template and runs `npm install` or `go get`. Wait for it to finish.

Optional flags:

- **`--llm-rules=<tool>`:** adds Encore's coding instructions for an AI tool and configures the local Encore MCP server for it. One of `cursor`, `claudecode`, `vscode`, `agentsmd`, or `zed`.
- **`--org=<id-or-slug>`:** creates the app in an org instead of the user's personal account.
- **`--platform=false`:** creates a local-only app even when logged in.

### 4. Check the result

The output ends with `Successfully created app <name>!`.

- **Logged in:** it also prints `App ID: <app-id>` and `Web URL: https://app.encore.dev/<app-id>`. The app ID can differ from the name. The app has an initial commit and an `encore` git remote, so it's ready to deploy.
- **Logged out:** `encore.app` has an empty `"id"`, and there's no `encore` remote. To deploy it later, see `encore-deploy`.

Then `cd <name>` and run the app (see `encore-run`).

## Get an existing app

- **On Encore Cloud:** `encore app clone <app-id> [directory]`. It adds the `encore` remote. The app ID is in the Cloud Dashboard URL, `app.encore.dev/<app-id>`. If the app is linked to GitHub, `git clone` the GitHub repository instead.
- **Code with an `encore.app` file:** it's already an app. Run it (see `encore-run`).
- **Encore code without an `encore.app` file:** register it in place, from its root directory. Always pass `--lang`, or the app is treated as Go.

  ```bash
  encore app init my-app --lang ts   # --lang go for Encore.go
  ```

## Errors

- **`directory <name> already exists`:** pick another name, or ask before removing the directory.
- **`this directory already contains Encore code but isn't initialized as an app`:** use `encore app init` (see above) instead of creating a new app.
- **`specify an app name`:** pass the name as the first argument.
- **`name must only contain lowercase letters, digits, or dashes`, or another name error:** fix the name.
- **`--org requires being logged in and --platform`:** log in, or drop `--org`.
- **`creating app on encore.dev: ...`:** run `encore auth whoami`. If it prints `logged in as app <app-id>`, an auth key can't create apps: a person must log in (see `encore-login`).
- **`npm install` fails:** the app is still created, without dependencies. Install Node.js (see `encore-install`), then run `npm install` in the app.

## Guidelines

- Don't run `encore app create` to deploy or link an existing app. It creates a new, separate app.
- Next: run the app (`encore-run`), build it out (`encore-service` and `encore-api`, or `encore-go-service` and `encore-go-api`), and deploy it (`encore-deploy`).
- Docs: https://encore.dev/docs/quick-start and https://encore.dev/docs/cli/cli-reference
