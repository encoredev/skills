---
name: encore-mcp
description: Connect an AI coding tool to Encore's MCP servers. The local server (`encore mcp`) gives the agent the app on this machine. The Encore Cloud server (`https://api.encore.dev/mcp`) gives it deployed environments. Covers Claude Code, Cursor, VS Code, and other MCP hosts, with OAuth or an API key for Encore Cloud.
when_to_use: >-
  User wants to add, install, connect, or set up Encore's MCP server, give the agent access to the app's services, traces, or databases, or connect the agent to Encore Cloud to read deploys, build logs, production traces, metrics, or infrastructure. Also use when an Encore MCP server doesn't show up, doesn't connect, needs authentication, or lists no tools. Trigger phrases: "Encore MCP", "encore mcp", "local MCP", "Cloud MCP", "api.encore.dev/mcp", "encore-local", "encore-cloud", "connect Claude Code to Encore", "connect Cursor to Encore", "MCP server", "production traces from the agent", "Encore API key".
---

# Connecting Encore's MCP Servers

## Instructions

### Pick the servers

| Server | Gives the agent | Needs |
|--------|-----------------|-------|
| Local (`encore-local`) | The app on this machine: services and endpoints, calling endpoints, local traces, database schemas and queries, Pub/Sub, buckets, caches, cron jobs, and Encore docs | The Encore CLI (`encore-install`) and an Encore app |
| Encore Cloud (`encore-cloud`) | Deployed apps: environments, deploys and build logs, traces, metrics, database schemas and queries, infrastructure, secrets metadata, and the deployed source | An Encore Cloud account, and a person to approve access, or an API key |

Most agents benefit from both: local while building, Encore Cloud for deploys and production. Set up the ones the user asked for. If they didn't say, ask.

Most tools load MCP servers when they start. After adding one, ask the user to restart or reload their tool, then check that it's connected.

### Local server

1. From the app's root directory, get the app's ID:

   ```bash
   encore mcp start
   ```

   It prints `MCP stdio Command: encore mcp run --app=<app-id>` and an SSE URL. Use this ID, not the `id` in `encore.app`: apps that aren't on Encore Cloud have an empty `id` there and a local ID here.

2. Add the server to the user's tool:

   - **Claude Code:** run from the app's root directory:

     ```bash
     claude mcp add --transport stdio encore-local -- encore mcp run --app=<app-id>
     ```

     This adds it for this project, for this user. Add `--scope project` to share it with the team through `.mcp.json`.
   - **Cursor:** add to `.cursor/mcp.json`:

     ```json
     {
       "mcpServers": {
         "encore-local": {
           "command": "encore",
           "args": ["mcp", "run", "--app=<app-id>"]
         }
       }
     }
     ```

   - **VS Code:** add to `.vscode/mcp.json`. VS Code uses `servers`, not `mcpServers`:

     ```json
     {
       "servers": {
         "encore-local": {
           "command": "encore",
           "args": ["mcp", "run", "--app=<app-id>"]
         }
       }
     }
     ```

   - **Other tools:** a stdio server with the command `encore mcp run --app=<app-id>`, or an SSE server at `http://localhost:9900/sse?app=<app-id>`.

   If `encore` isn't on the tool's PATH, which is common for editors started from the dock or start menu, use the full path from `which encore` as the command. Write it out in full, such as `/Users/<user>/.encore/bin/encore`: config files don't expand `~`.

3. Check it: `claude mcp list` in Claude Code, or the tool's MCP settings, should show `encore-local` as connected. Then call its `get_services` tool.

The app doesn't need to be running. `call_endpoint` starts it, and the database tools start the local databases, which needs Docker. Traces exist only for requests the local app has served.

### Encore Cloud server

The server is at `https://api.encore.dev/mcp`, over HTTP. It isn't tied to one app: with OAuth, it sees every app the user can access.

1. Add the server to the user's tool:

   - **Claude Code:**

     ```bash
     claude mcp add --transport http --scope user encore-cloud https://api.encore.dev/mcp
     ```

     `--scope user` makes it available in every project. Leave it out to add it to this project only.
   - **Cursor:** add to `~/.cursor/mcp.json` for every project, or `.cursor/mcp.json` for one:

     ```json
     {
       "mcpServers": {
         "encore-cloud": {
           "url": "https://api.encore.dev/mcp"
         }
       }
     }
     ```

   - **VS Code:** add to `.vscode/mcp.json`:

     ```json
     {
       "servers": {
         "encore-cloud": {
           "type": "http",
           "url": "https://api.encore.dev/mcp"
         }
       }
     }
     ```

   - **Other tools:** an HTTP (streamable HTTP) server at `https://api.encore.dev/mcp`.

2. Ask the user to authenticate. The agent can't do this step, because a person approves access in a browser:

   - **Claude Code:** the user runs `/mcp`, selects `encore-cloud`, and chooses **Authenticate**.
   - **Cursor, VS Code, and other tools:** the user starts the sign-in for `encore-cloud` from the tool's MCP settings, or from the prompt the tool shows.

3. Check it: call the `app_list` tool. It lists the user's apps.

### Encore Cloud without a person: API key

For CI or when nobody can approve access in a browser, use an API key.

1. Ask the user to create one in the Cloud Dashboard: the app's **Settings** > **Access** > **API Keys**. API keys start with `enpk_`. They're different from the auth keys under **Auth Keys**, which log in the CLI (`encore-login`). A key belongs to one app, and the server only lists the tools its scopes allow, so pick scopes for the tools the agent needs.
2. Have the user put it in an environment variable, such as `ENCORE_API_KEY`, and add the server with an `Authorization` header:

   ```bash
   claude mcp add --transport http encore-cloud https://api.encore.dev/mcp \
     --header "Authorization: Bearer $ENCORE_API_KEY"
   ```

   In other tools, add `"headers": {"Authorization": "Bearer <api-key>"}` to the server's entry, in a config file that isn't committed, such as a user-level one.
3. Check it with a tool the key's scopes allow.

## Troubleshooting

- **The server doesn't appear:** the tool hasn't reloaded its MCP config. Ask the user to restart it.
- **`encore-local` fails to start:** run `encore mcp run --app=<app-id>` in a terminal to see the error. Usually `encore` isn't on the tool's PATH (use the full path), or the app ID is wrong (run `encore mcp start` again).
- **`encore-cloud` says authentication is required:** the user hasn't finished OAuth (step 2), or the API key is wrong, expired, or deleted.
- **`encore-cloud` lists few or no tools with an API key:** the key's scopes don't cover them. Ask the user to add scopes or create a new key.

## Guidelines

- Never ask the user to paste an API key into the chat, and never commit one. Keep it in an environment variable or a config file outside the repository.
- MCP tools can query databases and call endpoints. The user's tool asks before running them, depending on its approval settings.
- `encore llm-rules init --llm-rules=<tool>` sets up the local server together with Encore's coding rules for `cursor`, `claudecode`, `vscode`, or `zed`, for apps that are on Encore Cloud. Use it when the user also wants the rules files.
- Docs: https://encore.dev/docs/mcp and https://encore.dev/docs/platform/cloud-mcp
