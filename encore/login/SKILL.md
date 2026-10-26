---
name: encore-login
description: Log the Encore CLI in to Encore Cloud, check who is logged in, sign up for an account, and log in without a browser with an auth key. A login is needed to create apps on Encore Cloud and to deploy them.
when_to_use: >-
  User wants to log in or sign up to Encore, check which account the CLI uses, or log out. Also use when a command fails with "not logged in" or "could not get Encore auth token", `encore auth whoami` prints "not logged in.", the agent runs without a browser (SSH, container, cloud sandbox, CI), or the user mentions an auth key or `ENCORE_AUTH_KEY`. SKIP for adding login or authentication to the user's own app (auth handlers, JWT, sessions): use `encore-auth` or `encore-go-auth`. Trigger phrases: "log in to Encore", "encore auth login", "sign up for Encore", "Encore account", "not logged in", "auth key", "ENCORE_AUTH_KEY", "log in from CI".
---

# Logging in to Encore Cloud

The CLI needs a login to create apps on Encore Cloud and to deploy them. Local development (`encore run`, `encore test`, `encore check`) works logged out. The same steps work for Encore.ts and Encore.go.

## Instructions

### Check who is logged in

```bash
encore auth whoami
```

- **`logged in as <email>`:** a person is logged in. Nothing to do.
- **`logged in as app <app-id>`:** logged in with an auth key, which only works with that one app. See [Log in without a person](#log-in-without-a-person).
- **`not logged in.`:** log in.

### Log in with a browser

A person has to approve the login, so the agent can't finish it alone:

```bash
encore auth login
```

It prints `Your pairing code is <code>` and a URL, then waits until someone approves the code in a browser. It may also open the browser itself.

1. Run it as a background or long-running command, so it can keep waiting.
2. Give the user the pairing code and the URL from its output. Ask them to open the URL, check that the code matches, and approve. The URL works from any device, so this also works when the agent runs over SSH, in a container, or in a cloud sandbox.
3. When they approve, the command prints `Successfully logged in!` and exits. Confirm with `encore auth whoami`.

New users can sign up from the same page. `encore auth signup` runs the same flow.

### Log in without a person

For CI and unattended agents, use an auth key. Auth keys belong to one app: create one in the Cloud Dashboard (**App Settings** > **Auth Keys**), and put it in the `ENCORE_AUTH_KEY` environment variable, for example from a secret store. Every `encore` command then logs in with it automatically, as long as nobody is logged in already. If someone is, the CLI ignores the key.

Don't pass a real key on the command line with `encore auth login --auth-key`: it ends up in shell history and process listings. Never ask the user to paste a key into the chat. Ask them to set the environment variable themselves.

An auth key logs the CLI in as its app, so `encore auth whoami` prints `logged in as app <app-id>`. That's enough to deploy that app with `git push encore`, but not to create apps: `encore app create` and `encore app init` need a person's login.

If the key is wrong or was deleted, commands print `warning: ENCORE_AUTH_KEY login failed: <error>`. Create a new key.

### Log out

```bash
encore auth logout
```

This also stops the Encore daemon, which starts again with the next `encore` command.

## Guidelines

- Log in before `encore app create` when the app should deploy to Encore Cloud. An app created logged out is local only, and linking it later takes extra steps (see `encore-deploy`).
- Don't wait silently on `encore auth login`. Show the user the pairing code and URL right away.
- Keep auth keys out of command lines, files in the repository, and the chat.
- Next steps: create an app (`encore-create-app`) or deploy one (`encore-deploy`).
- Docs: https://encore.dev/docs/cli/cli-reference
