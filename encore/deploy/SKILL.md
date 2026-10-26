---
name: encore-deploy
description: Deploy an Encore.ts or Encore.go app to Encore Cloud by pushing to the Encore git remote or a linked GitHub repository, deploy changes again, and fix deploys that fail or never start. Covers which environments a push deploys to and secrets per environment. For linking an app first, see `encore-link-app`.
when_to_use: >-
  User wants to deploy an Encore app, ship a change, push to Encore Cloud, deploy to staging or production, deploy again, redeploy, check whether a deploy started, or fix a failed deploy. Also use when `git push encore` fails, there is no `encore` git remote, the app is linked to GitHub, the app was created logged out or with `--platform=false`, the app was created in the Cloud Dashboard and needs to be cloned, or a deploy fails with "secret key(s) not defined" or failing tests. SKIP for self-hosting with `encore build docker`. Trigger phrases: "deploy", "deploy my app", "git push encore", "push to Encore Cloud", "deploy to staging", "deploy to production", "deploy again", "redeploy", "deploy failed", "build failed", "no encore remote", "encore app clone".
---

# Deploying to Encore Cloud

Deploying is a commit and a push to the git repository the app deploys from. Encore Cloud builds, tests, provisions infrastructure, and deploys to every environment that deploys from the pushed branch. The same steps work for Encore.ts and Encore.go.

## Instructions

### Find the repository the app deploys from

```bash
git remote -v
```

- **Encore-managed git (the default):** the app deploys from the `encore` remote. Push there.
- **Linked GitHub repository:** if the app is linked to GitHub in the Cloud Dashboard (**Settings** > **GitHub**), pushes to that repository deploy instead. Push to it, usually `origin`.
- **Neither:** the app isn't linked to Encore Cloud yet. See [Link an app](#link-an-app).

If you can't tell which one the app deploys from, ask the user.

### Check which environments a push deploys to

Each environment deploys from its own branch (the environment's **Settings** > **Branch Push**), or only manually. A new app has one environment, `staging` (type `development`), which deploys the app's main branch.

One push can deploy several environments. If a production environment deploys from the branch you're about to push, the push deploys to production, so check the branch before pushing.

### Deploy

```bash
git add -A
git commit -m "Describe the change"
git push encore              # Encore-managed git
git push origin <branch>     # linked GitHub repository
```

**Pushing to `encore`:** a successful push prints one line per environment that's deploying:

```
remote: <branch>: triggered deploy https://app.encore.dev/<app-id>/envs/<env>/deploys/<id>
```

If no such line appears, nothing was deployed:

- **`Everything up-to-date`:** nothing new was committed. Commit, then push again.
- **No `triggered deploy` line:** no environment deploys from the pushed branch.

**Pushing to GitHub:** git prints nothing from Encore. Check **Deployments** in the Cloud Dashboard.

Either way, the push returns as soon as the deploy starts. Follow progress in the Cloud Dashboard, or through the Encore Cloud MCP server (`https://api.encore.dev/mcp`, set up with `encore-mcp`), which lists environments, deploys, builds, and their logs. Each environment's API is served at `https://<env>-<app-id>.encr.app`, unless it has a custom domain. `encore logs --env=<env>` streams its logs.

### Deploy again

Every new commit pushed to an environment's branch deploys it again. To redeploy without a code change, for example after setting a missing secret, push an empty commit:

```bash
git commit --allow-empty -m "Redeploy"
git push encore              # Encore-managed git
git push origin <branch>     # linked GitHub repository
```

You can also redeploy from the Cloud Dashboard: **Deployments** > **New Deploy** > **Branch**.

### Before pushing

- **Tests:** the deploy runs the app's tests, and failing tests block it. Run them first. For Encore.ts, use `CI=true encore test`: a `vitest` script runs in watch mode without a terminal and never exits. For Encore.go, use `encore test ./...`.
- **Secrets:** every secret the app declares needs a value in each environment it deploys to, or the deploy fails with `secret key(s) not defined`. Set values per environment type, or for a single environment:

  ```bash
  printf '%s' "$VALUE" | encore secret set --type dev,local MySecret   # development environments, such as staging
  printf '%s' "$VALUE" | encore secret set --type prod MySecret        # production environments
  printf '%s' "$VALUE" | encore secret set --env <env> MySecret        # one environment
  ```

### Link an app

If `encore.app` has an empty `"id"`, or there's no `encore` remote and the app doesn't deploy from GitHub, the app isn't linked to Encore Cloud. Link it first (see `encore-link-app`), then come back here. For an app that's on Encore Cloud but not on this machine, clone it with `encore app clone <app-id>`, or `git clone` its GitHub repository if it's linked to GitHub.

### When a push to `encore` fails

- **`could not get Encore auth token: not logged in`:** log in (see `encore-login`).
- **`'encore' does not appear to be a git repository`:** the remote is missing. See [Link an app](#link-an-app).
- **The push hangs:** `git push encore` uses SSH to `git.encore.dev` on port 22, which some networks block.

## Guidelines

- Always commit before pushing. A push with nothing new deploys nothing.
- Know which environments deploy from the branch you push, especially production.
- After pushing to `encore`, check for the `triggered deploy` lines instead of assuming the deploy started.
- Don't run `encore app create` to deploy an existing app. It creates a new, separate app.
- Docs: https://encore.dev/docs/platform/deploy/deploying and https://encore.dev/docs/platform/deploy/troubleshooting
