---
name: encore-deploy
description: Deploy an Encore.ts or Encore.go app to Encore Cloud with `git push encore`, deploy changes again, and fix deploys that fail or never start. Covers the `encore` git remote, linking an app created logged out or in the Cloud Dashboard, secrets per environment, and redeploying without a commit.
when_to_use: >-
  User wants to deploy an Encore app, ship a change, push to Encore Cloud or staging, deploy again, redeploy, check whether a deploy started, or fix a failed deploy. Also use when `git push encore` fails, there is no `encore` git remote, the app was created logged out or with `--platform=false`, the app was created in the Cloud Dashboard and needs to be cloned, or a deploy fails with "secret key(s) not defined" or failing tests. SKIP for self-hosting with `encore build docker`. Trigger phrases: "deploy", "deploy my app", "git push encore", "push to Encore Cloud", "deploy to staging", "deploy again", "redeploy", "deploy failed", "build failed", "no encore remote", "link my app", "encore app clone".
---

# Deploying to Encore Cloud

Deploying is a commit and a push to the `encore` git remote. Every push to the app's main branch deploys to `staging`, a free Encore Cloud environment of type `development`. The same steps work for Encore.ts and Encore.go.

## Instructions

### Check the app is linked

```bash
git remote -v
```

If an `encore` remote is listed, skip ahead to [Deploy](#deploy). If not, the app isn't linked to Encore Cloud yet. See [Link an app](#link-an-app).

### Deploy

```bash
git add -A
git commit -m "Describe the change"
git push encore
```

A successful push prints:

```
remote: main: triggered deploy https://app.encore.dev/<app-id>/envs/staging/deploys/<id>
```

If that line is missing, nothing was deployed:

- **`Everything up-to-date`:** nothing new was committed. Commit, then push again.
- **No `triggered deploy` line:** the pushed branch isn't deployed by any environment. Push the app's main branch.

The push returns as soon as the deploy starts. Follow it at the printed URL, or read its status through the Encore Cloud MCP server (`https://api.encore.dev/mcp`). Once it's done, the API is served at `https://staging-<app-id>.encr.app`, and `encore logs --env=staging` streams its logs.

### Deploy again

Every new commit pushed to the main branch deploys the same way. To deploy again without a new commit, for example after setting a missing secret, deploy the already-pushed branch:

```bash
encore alpha deploy --env=staging --branch=main
```

### Before pushing

- **Tests:** the deploy runs the app's tests, and failing tests block it. Run them first. For Encore.ts, use `CI=true encore test`: a `vitest` script runs in watch mode without a terminal and never exits. For Encore.go, use `encore test ./...`.
- **Secrets:** every secret the app declares needs a value in the target environment, or the deploy fails with `secret key(s) not defined`. `staging` is a `development` environment, so `dev` covers it:

  ```bash
  printf '%s' "$VALUE" | encore secret set --type dev,local MySecret
  ```

  Add `prod` for production environments.

### Link an app

**Logged out:** log in first. Without a browser, use an auth key from the Cloud Dashboard (**App Settings** > **Auth Keys**):

```bash
encore auth login                      # opens a browser
encore auth login --auth-key=<key>     # or set ENCORE_AUTH_KEY
```

**App created in the Cloud Dashboard:** clone it. The app ID is in the dashboard URL, `app.encore.dev/<app-id>`. The clone has the `encore` remote.

```bash
encore app clone <app-id>
cd <app-id>
```

**Local app created logged out or with `--platform=false`:** register it. Copy any settings in `encore.app` other than `id` and `lang` first, and add them back afterwards.

```bash
rm encore.app
encore app init my-app --lang ts       # --lang go for Encore.go. Adds the encore remote
git add -A && git commit -m "Link to Encore Cloud"
git push encore
```

`encore app link <app-id>` only links to an app that already exists on Encore Cloud, and only adds the `encore` remote when the repository has no remotes. If the remote is still missing, add it:

```bash
git remote add encore encore://<app-id>
```

### When a push fails

- **`could not get Encore auth token: not logged in`:** run `encore auth login`.
- **`'encore' does not appear to be a git repository`:** the remote is missing. See [Link an app](#link-an-app).
- **The push hangs:** `git push encore` uses SSH to `git.encore.dev` on port 22, which some networks block.

## Guidelines

- Always commit before pushing. A push with nothing new deploys nothing.
- Check for the `triggered deploy` line instead of assuming the deploy started.
- Don't run `encore app create` to deploy an existing app. It creates a new, separate app.
- Docs: https://encore.dev/docs/platform/deploy/deploying and https://encore.dev/docs/platform/deploy/troubleshooting
