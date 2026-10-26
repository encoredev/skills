---
name: encore-link-app
description: Link a local Encore.ts or Encore.go app to Encore Cloud, so it can deploy, set secrets, and use the Encore Cloud MCP server. Covers checking whether an app is linked, registering local code as a new Encore Cloud app with `encore app init`, linking to an existing one with `encore app link`, and adding a missing `encore` git remote.
when_to_use: >-
  User wants to link, connect, or register an app with Encore Cloud, the app was created logged out or with `--platform=false`, `encore.app` has an empty `"id"`, there's no `encore` git remote, or a command fails because the app isn't linked. Also use when `encore app link` fails with "the app is already linked", "no app id given", or "that app does not exist, or you don't have access to it", or `encore app init` fails with "an encore.app file already exists". SKIP for logging in (`encore-login`) and for deploying an app that's already linked (`encore-deploy`). Trigger phrases: "link my app", "connect my app to Encore Cloud", "register the app", "encore app link", "encore app init", "app isn't linked", "no encore remote", "'encore' does not appear to be a git repository".
---

# Linking an App to Encore Cloud

A linked app has its Encore Cloud app ID in `encore.app`, and deploys from the `encore` git remote or from a GitHub repository linked in the Cloud Dashboard. The same steps work for Encore.ts and Encore.go.

## Instructions

Do the steps in order, from the app's root directory.

### 1. Log in

`encore auth whoami` must print `logged in as <email>`. If it doesn't, see `encore-login`. An auth key login (`logged in as app <app-id>`) can only link to that key's app (step 3), not register a new app (step 4).

### 2. Check whether the app is linked

```bash
grep '"id"' encore.app
git remote get-url encore
```

- **`"id"` has a value, and the remote prints `encore://<app-id>`:** linked. Nothing to do.
- **`"id"` has a value, but there's no `encore` remote:** go to step 5. Skip this if the app deploys from GitHub (the app's **Settings** > **GitHub** in the Cloud Dashboard). If you can't tell, ask the user.
- **`"id"` is empty, or there's no `encore.app` file:** not linked. If the user already has an app on Encore Cloud for this code, go to step 3. Otherwise go to step 4. If you can't tell, ask.

### 3. Link to an existing Encore Cloud app

Use this when the app already exists on Encore Cloud, for example one the user created in the Cloud Dashboard. Its ID is in the dashboard URL, `app.encore.dev/<app-id>`.

```bash
encore app link <app-id>
```

- **`Successfully linked app!`:** it wrote the ID to `encore.app`. It also adds the `encore` remote, but only when the repository has no remotes at all. Check with `git remote get-url encore`, and go to step 5 if it's missing.
- **`Error: that app does not exist, or you don't have access to it.`:** check the ID. If it's right, the user needs to be invited to the app, or, with an auth key, the key belongs to a different app.
- **`the app is already linked.`:** `encore.app` has a different app's ID. Only add `--force` if the user confirms the code should move to the other app.
- **`no app id given.`:** pass the ID as the argument.

Then go to step 6.

### 4. Register the code as a new Encore Cloud app

Use this for an app created logged out or with `--platform=false`, Encore code that has no `encore.app` file, or a copy of someone else's app that the user wants to deploy separately.

1. `encore app init` refuses to run while `encore.app` exists (`an encore.app file already exists`). If there is one, move it out of the repository, and note any settings other than `id` and `lang`, such as `global_cors` or `build`:

   ```bash
   mv encore.app /tmp/encore.app.bak
   ```

2. Register it. Always pass `--lang`, or the app is treated as Go. The name follows the same rules as `encore app create`: lowercase letters, digits, and single dashes.

   ```bash
   encore app init my-app --lang ts   # --lang go for Encore.go
   ```

   - **`Successfully initialized application on Encore Cloud!` with `- App ID: <app-id>`:** done. It wrote a new `encore.app` and added the `encore` remote, creating a git repository first if there wasn't one.
   - **`The app is not currently linked to the encore.dev platform.`:** nobody was logged in, so it only wrote a local `encore.app`. Log in (step 1), move the new `encore.app` away again, and rerun.
   - **`specify an app name`:** pass the name as the first argument.
   - **`--org=<id-or-slug>`:** add it to create the app in an org instead of the user's personal account.

3. Copy any other settings from `/tmp/encore.app.bak` into the new `encore.app`.

### 5. Add a missing `encore` remote

```bash
git remote add encore encore://<app-id>
```

### 6. Check and commit

```bash
grep '"id"' encore.app            # "id": "<app-id>"
git remote get-url encore         # encore://<app-id>
```

The app is linked. Its Cloud Dashboard is `https://app.encore.dev/<app-id>`. Commit the changed `encore.app` with the next commit. Linking doesn't deploy anything: to deploy, commit and push (see `encore-deploy`).

## Guidelines

- Don't run `encore app create` to link existing code. It creates a new app in a new directory.
- Don't use `encore app link --force` without the user's OK. It points the code at a different app.
- To get an app that's on Encore Cloud but not on this machine, clone it instead: `encore app clone <app-id>` (see `encore-create-app`).
- Docs: https://encore.dev/docs/platform/deploy/deploying
