---
name: encore-create-app
description: Create a new Encore.ts or Encore.go app with `encore app create` without interactive prompts, from a template or empty, on Encore Cloud or local only. Also covers registering existing Encore code with `encore app init` and getting an app that's already on Encore Cloud with `encore app clone`.
when_to_use: >-
  User wants a new Encore app or project, to scaffold or bootstrap a backend with Encore, to start from a template or example (hello world, URL shortener, uptime monitor, GraphQL), or to get an existing Encore Cloud app onto this machine. Also use when `encore app create` waits on a prompt, creates a Go app when TypeScript was wanted, or fails with "directory already exists", "this directory already contains Encore code", "specify an app name", or a name error. SKIP when the app already exists and the task is adding services, endpoints, or infrastructure. Trigger phrases: "create an Encore app", "new Encore project", "encore app create", "scaffold a backend", "start from a template", "hello world app", "URL shortener template", "encore app init", "encore app clone".
---

# Creating an Encore App

## Instructions

### Before creating

- **The CLI is installed:** `encore version` works. If not, see `encore-install`.
- **Logged in, to deploy to Encore Cloud:** check with `encore auth whoami`, and log in if needed (see `encore-login`). Logged in, the app is created on Encore Cloud with an `encore` git remote, ready to deploy with `git push encore`. Logged out, the app is local only, and linking it later takes extra steps. If you can't tell whether the user wants to deploy to Encore Cloud, ask before creating a local-only app.
- **Only an auth key, no person to log in:** an auth key can't create apps. Ask the user to create the app in the Cloud Dashboard (https://app.encore.dev), then clone it with `encore app clone <app-id>` (see [Existing apps and code](#existing-apps-and-code)) instead of running `encore app create`.

### Create without prompts

In a terminal, `encore app create` asks for a language, a template, AI tool rules, an org, and whether to run the app. Without a terminal, which is how agents usually run commands, it asks nothing and uses the flags. With no `--example`, that's an empty **Go** app, even if the user asked for TypeScript. Always pass `--example`:

```bash
encore app create my-app --example=ts/hello-world   # Encore.ts
encore app create my-app --example=hello-world      # Encore.go
```

| Encore.ts | Encore.go | What you get |
|-----------|-----------|--------------|
| `ts/hello-world` | `hello-world` | One service with a REST endpoint. The default choice |
| `ts/url-shortener` | `url-shortener` | REST API with a SQL database |
| `ts/uptime` | `uptime` | Several services, SQL databases, Pub/Sub, cron jobs |
| | `graphql` | GraphQL API, several services, a SQL database |
| `ts/empty` | `empty` | No services. Add them yourself |

`--example` also takes any other directory of https://github.com/encoredev/examples (for example `ts/nextjs-starter`), or a GitHub URL to a repository or a directory in one: `--example=https://github.com/<owner>/<repo>/tree/<branch>/<path>`.

Other flags:

- **`--llm-rules=<tool>`:** writes Encore's coding instructions for an AI tool into the app and configures the local Encore MCP server for it. One of `cursor`, `claudecode`, `vscode`, `agentsmd`, or `zed`. In a terminal, it also skips the prompt for it.
- **`--org=<id-or-slug>`:** creates the app in that org. Without it, a command run without a terminal creates the app in the user's personal account.
- **`--platform=false`:** creates a local-only app even when logged in.

### Pick a name

The name becomes the directory, which must not exist yet. Use lowercase letters, digits, and single dashes, up to 50 characters, not starting or ending with a dash. On Encore Cloud, the app ID can differ from the name: read it from the output or `encore.app`.

### What it does

1. Creates the directory and downloads the template.
2. Runs `npm install` (Encore.ts) or `go get encore.dev@latest` (Encore.go). This can take a minute.
3. When logged in, creates the app on Encore Cloud and writes its ID to `encore.app`. Logged out, `encore.app` has an empty `"id"`.
4. Makes a git repository with an initial commit. When the app is on Encore Cloud, it adds the `encore` remote that deploys it.

It ends with `Successfully created app <name>!`. For apps on Encore Cloud, the output also has `App ID: <app-id>` and `Web URL: https://app.encore.dev/<app-id>`, the app's Cloud Dashboard.

### Errors

- **`directory <name> already exists`:** pick another name, or ask before removing the directory.
- **`this directory already contains Encore code but isn't initialized as an app`:** don't create a new app here. Register the code in place with `encore app init` (see below).
- **`specify an app name`:** pass the name as the first argument.
- **`name must only contain lowercase letters, digits, or dashes`** (or another name error): fix the name.
- **`--org requires being logged in and --platform`:** log in, or drop `--org`.
- **`creating app on encore.dev: ...`:** check `encore auth whoami`. If it prints `logged in as app <app-id>`, the CLI is logged in with an auth key, which can't create apps. A person needs to log in with `encore auth login`.
- **`npm install` fails or npm isn't installed:** the app is still created, without its dependencies. Install Node.js (see `encore-install`), then run `npm install` in the app.

### Existing apps and code

- **An app that's already on Encore Cloud:** don't create a new one. Clone it with `encore app clone <app-id> [directory]`, which adds the `encore` remote. The app ID is in the Cloud Dashboard URL, `app.encore.dev/<app-id>`. If the app is linked to GitHub, `git clone` the GitHub repository instead.
- **A repository with an `encore.app` file:** it's already an app. Run it as is (see `encore-run`).
- **Encore code without an `encore.app` file:** register it in place, from the directory the app should live in. Always pass `--lang`: without it and without a terminal, the `encore.app` it writes has no `"lang": "typescript"`, and Encore treats the app as Go.

  ```bash
  encore app init my-app --lang ts   # --lang go for Encore.go
  ```

## Guidelines

- Always pass `--example` to `encore app create`. Without it, an agent gets an empty Go app.
- Log in first if the app should deploy to Encore Cloud.
- Don't run `encore app create` inside an existing Encore app, or to deploy an existing app. It creates a new, separate app.
- Next steps: run the app (`encore-run`), build it out (`encore-service`, `encore-api`, or the `encore-go-*` skills), and deploy it (`encore-deploy`).
- Docs: https://encore.dev/docs/quick-start and https://encore.dev/docs/cli/cli-reference
