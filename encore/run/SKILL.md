---
name: encore-run
description: Run an Encore.ts or Encore.go app locally. Covers `encore check` to start the app, call endpoints, and stop it in one command, running `encore run` in the background so it doesn't block the shell, the local development dashboard, and fixing startup errors.
when_to_use: >-
  User wants to run, start, or serve the app locally, try an endpoint, check that the app starts or that a change works, or open the local development dashboard. Also use when `encore run` blocks the shell, fails to start, says the port is already in use, says the Docker daemon isn't running, or warns that secrets aren't defined. SKIP for writing or running automated tests (`encore-testing`, `encore-go-testing`) and for deploying (`encore-deploy`). Trigger phrases: "run the app", "start the server", "encore run", "localhost:4000", "does it work", "call the endpoint", "local dashboard", "localhost:9400", "encore check", "port is already in use", "docker daemon is not running".
---

# Running an Encore App Locally

`encore run` compiles the app, starts the infrastructure it declares, and serves its API at `http://localhost:4000`. SQL databases run in Docker. The command keeps running and rebuilds the app when files change. Run it, or `encore check`, from the app's root directory (the one with `encore.app`) or any directory below it. The same steps work for Encore.ts and Encore.go.

## Instructions

### Check that it starts and responds

`encore check` builds the app, starts it with its infrastructure, runs requests against it, prints the results, and shuts it down. It exits 0 when the app starts and every request succeeds, and 1 otherwise. Use it to check a change without a long-running process:

```bash
encore check                       # does the app start?
encore check 'curl /hello/world'   # start it and call an endpoint
```

For several requests, or requests with JSON bodies, pass a spec on stdin, one request per line:

```bash
encore check <<'EOF'
curl /hello/world
curl /url -X POST -H 'Content-Type: application/json' -d '{"url": "https://encore.dev"}'
curl /admin --no-fail -i
EOF
```

- Each request is `curl <path>` with any curl arguments. Quote arguments as in a shell.
- A request fails when curl fails or the response status is 400 or above. Add `--no-fail` when you expect an error status, and `-i` to see the status and headers.
- Results go to stdout, each between a `=== [i/N] curl ... ===` line and a `--- exit: N ---` line. Build errors and app logs go to stderr.
- `--timeout` sets how long to wait for the app to start (default `1m0s`).

### Run it in the background

To keep the app running while you work, for example to call it several times or let the user try it, start `encore run` in the background. Use your tool's background mode if it has one. Otherwise:

```bash
encore run --browser=never > /tmp/encore-run.log 2>&1 &
echo $! > /tmp/encore-run.pid
```

The app is ready when the log shows:

```
  Encore development server running!

  Your API is running at:     http://127.0.0.1:4000
  Development Dashboard URL:  http://127.0.0.1:9400/<app-id>
```

Wait for that line before sending requests, then call the API with `curl http://localhost:4000/<path>`. When files change, the app rebuilds and restarts, so check the log for build errors after each edit. To stop it:

```bash
kill "$(cat /tmp/encore-run.pid)"
```

Flags:

| Flag | Description | Default |
|------|-------------|---------|
| `--port`, `-p` | Port for the API | `4000` |
| `--browser` | Open the local development dashboard on startup (`auto`, `never`, `always`) | `auto` |
| `--watch`, `-w` | Rebuild and restart when files change | `true` |
| `--listen` | Address to listen on, such as `0.0.0.0:4000` to accept connections from other machines | `127.0.0.1` |
| `--level`, `-l` | Minimum log level (`trace`, `debug`, `info`, `warn`, `error`) | |
| `--json` | Print logs as JSON | `false` |

### The local development dashboard

While the app runs, the dashboard at `http://localhost:9400` has an API explorer, a trace of every request with its database queries, calls, and logs, a service catalog, and a database explorer. Point the user to it when they want to see what a request did. Agents can read the same data through the local Encore MCP server: `encore run` prints its `MCP SSE URL`, and `encore mcp run --app=<app-id>` serves it over stdio.

### Errors

- **`no encore.app found in directory (or any of the parent directories)`:** run the command from inside the app. If there's no app yet, see `encore-create-app`.
- **`The docker daemon is not running. Start it first.`:** start Docker (on macOS, `open -a Docker`), wait until `docker info` succeeds, and run again.
- **`docker not found: is it installed and in your PATH?`:** the app has a SQL database, which needs Docker. See `encore-install`.
- **`Failed to run on 127.0.0.1:4000 - port is already in use`:** another process, often an earlier `encore run`, has the port. The next line suggests a free one (`Note: port 4001 is available; specify --port=4001 to use it`). Stop the earlier run, or pass `--port`.
- **`secrets not defined: <names>`:** the app starts anyway, with those secrets empty. Set local values with `encore secret set --type local <name>`, or in a gitignored `.secrets.local.cue` file for an app that isn't on Encore Cloud (see `encore-secret` or `encore-go-secret`).
- **Build errors:** the log shows the file and line. Fix the code. With `--watch`, the app rebuilds when you save.

## Guidelines

- Prefer `encore check` to confirm a change works. It always exits, so it can't leave a process running.
- Never run `encore run` in the foreground of an agent's shell. It doesn't exit, so the command blocks until it times out.
- Stop background runs you started when you're done with them.
- Don't use the local dashboard or `encore run` in place of tests. Write tests with `encore-testing` or `encore-go-testing`.
- Docs: https://encore.dev/docs/cli/cli-reference and https://encore.dev/docs/dev-dash
