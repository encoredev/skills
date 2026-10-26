---
name: encore-login
description: Log the Encore CLI in to Encore Cloud, check who is logged in, sign up for an account, and log in without a person using an auth key. A login is needed to create apps on Encore Cloud and to deploy them.
when_to_use: >-
  User wants to log in or sign up to Encore, check which account the CLI uses, or log out. Also use when a command fails with "not logged in" or "could not get Encore auth token", `encore auth whoami` prints "not logged in.", the agent runs without a browser (SSH, container, cloud sandbox, CI), or the user mentions an auth key or `ENCORE_AUTH_KEY`. SKIP for adding login or authentication to the user's own app (auth handlers, JWT, sessions): use `encore-auth` or `encore-go-auth`. Trigger phrases: "log in to Encore", "encore auth login", "sign up for Encore", "Encore account", "not logged in", "auth key", "ENCORE_AUTH_KEY", "log in from CI".
---

# Logging in to Encore Cloud

Creating apps on Encore Cloud and deploying need a login. Running locally (`encore run`, `encore test`, `encore check`) doesn't.

## Instructions

### 1. Check who is logged in

```bash
encore auth whoami
```

- **`logged in as <email>`:** done.
- **`logged in as app <app-id>`:** logged in with an auth key. It works for that app only, and can't create apps. If you need to create an app, go to step 2.
- **`not logged in.`:** go to step 2. If no person can approve a login, such as in CI, go to step 3.

### 2. Log in with a person's approval

1. Start `encore auth login` as a background command. It doesn't exit until someone approves the login.
2. Its output has `Your pairing code is <code>` and a URL. Send both to the user right away. Ask them to open the URL on any device, check that the code matches, and approve. New users can sign up on the same page.
3. Wait for `Successfully logged in!`, then run `encore auth whoami` to confirm.

This works over SSH, in containers, and in cloud sandboxes too, because the user can open the URL anywhere.

### 3. Log in without a person: auth key

1. Ask the user to create an auth key in the Cloud Dashboard (**App Settings** > **Auth Keys**) and set it as the `ENCORE_AUTH_KEY` environment variable for the agent, for example from a secret store.
2. Run `encore auth whoami`. It should print `logged in as app <app-id>`. Every `encore` command logs in with the key automatically when nobody is logged in.

Limits of auth keys:

- **One app:** the key can clone, link, and deploy its own app.
- **No new apps:** `encore app create` and `encore app init` need a person's login. For a new app, ask the user to create it in the Cloud Dashboard, then clone it with `encore app clone <app-id>`.
- **Ignored when someone is logged in:** run `encore auth logout` first to use the key instead.
- **`warning: ENCORE_AUTH_KEY login failed: <error>`:** the key is wrong or was deleted. Ask for a new one.

### Log out

```bash
encore auth logout
```

This also stops the Encore daemon. It starts again with the next `encore` command.

## Guidelines

- Never ask the user to paste an auth key into the chat, and never pass one on the command line with `encore auth login --auth-key`: it ends up in shell history and process listings.
- Log in before `encore app create` if the app should deploy to Encore Cloud. Linking an app created logged out takes extra steps (see `encore-deploy`).
- Next: create an app (`encore-create-app`) or deploy one (`encore-deploy`).
- Docs: https://encore.dev/docs/cli/cli-reference
