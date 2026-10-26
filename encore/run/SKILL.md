---
name: encore-run
description: Run an Encore.ts or Encore.go app locally. Covers `encore check` to start the app, call endpoints, and stop it in one command, running `encore run` in the background so it doesn't block the shell, the local development dashboard, and fixing startup errors.
when_to_use: >-
  User wants to run, start, or serve the app locally, try an endpoint, check that the app starts or that a change works, or open the local development dashboard. Also use when `encore run` blocks the shell, fails to start, says the port is already in use, says the Docker daemon isn't running, or warns that secrets aren't defined. SKIP for writing or running automated tests (`encore-testing`, `encore-go-testing`) and for deploying (`encore-deploy`). Trigger phrases: "run the app", "start the server", "encore run", "localhost:4000", "does it work", "call the endpoint", "local dashboard", "localhost:9400", "encore check", "port is already in use", "docker daemon is not running".
---

# Running an Encore App Locally

## Instructions

Run these commands from the app's root directory (the one with `encore.app`) or any directory below it. Pick one:

- **To check that the app starts, or that a change works:** use `encore check` (step 1). It always exits.
- **To keep the app running,** for the user to try or for many requests: use `encore run` in the background (step 2).

Never run `encore run` in the foreground. It doesn't exit, so the command blocks until it times out.

### 1. Check with `encore check`

```bash
encore check                       # start the app and stop it
encore check 'curl /hello/world'   # start it, call an endpoint, stop it
```

For several requests or JSON bodies, pass the requests on stdin, one per line:

```bash
encore check <<'EOF'
curl /hello/world
curl /url -X POST -H 'Content-Type: application/json' -d '{"url": "https://encore.dev"}'
curl /admin --no-fail -i
EOF
```

- **Exit code 0:** the app started, and every request returned a status below 400.
- **Exit code 1:** stdout has each request's result, between `=== [i/N] curl ... ===` and `--- exit: N ---`. stderr has build errors and app logs. Fix the problem and run it again.
- **Request arguments:** anything after the path goes to curl. Add `-i` to see the status and headers, and `--no-fail` to a request that should return an error status.

### 2. Run in the background

1. Start it, with its output in a log file. If your tool has its own way to run background commands, use that instead.

   ```bash
   encore run --browser=never > /tmp/encore-run.log 2>&1 &
   echo $! > /tmp/encore-run.pid
   ```

2. Wait until the log has `Encore development server running!`. If the process exits first, the log has the error (see [Errors](#errors)).
3. Call the API at `http://localhost:4000`. The local development dashboard is at `http://localhost:9400`, with an API explorer and a trace of every request.
4. After each code change, the app rebuilds and restarts. Check the log for build errors.
5. When you're done, stop it:

   ```bash
   kill "$(cat /tmp/encore-run.pid)"
   ```

Flags: `--port=<n>` changes the API port (default 4000). `--listen=0.0.0.0:4000` accepts connections from other machines. `--watch=false` turns off rebuilding on changes.

## Errors

- **`no encore.app found in directory (or any of the parent directories)`:** `cd` into the app. If there's no app yet, see `encore-create-app`.
- **`The docker daemon is not running. Start it first.`:** start Docker (macOS: `open -a Docker`), wait until `docker info` succeeds, and run again.
- **`docker not found: is it installed and in your PATH?`:** the app has a SQL database, which needs Docker. See `encore-install`.
- **`Failed to run on 127.0.0.1:4000 - port is already in use`:** an earlier `encore run` usually holds the port. Stop it, or use the free port from the next line of output: `Note: port <n> is available; specify --port=<n> to use it`.
- **`secrets not defined: <names>`:** a warning. The app runs with those secrets empty. Set local values with `encore secret set --type local <name>`, or in a gitignored `.secrets.local.cue` file for an app that isn't on Encore Cloud (see `encore-secret` or `encore-go-secret`).
- **Build errors:** fix the file and line shown, then run again. A background `encore run` rebuilds on save.

## Guidelines

- Prefer `encore check` to confirm a change works. It can't leave a process running.
- Stop background runs you started.
- Agents can list services and endpoints, call endpoints, read traces, and query databases through the local Encore MCP server: `encore mcp run --app=<app-id>`.
- For automated tests, use `encore-testing` or `encore-go-testing`.
- Docs: https://encore.dev/docs/cli/cli-reference and https://encore.dev/docs/dev-dash
