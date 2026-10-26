---
name: encore-getting-started
description: Walk through a first Encore.ts app from zero, from installing the CLI to a running endpoint, with pointers to the skills for each step. Not for architecture or feature questions.
when_to_use: >-
  User has no Encore project yet and wants to get started with Encore.ts end to end: install, create a hello-world app, and run their very first `encore run`. For a single step, use `encore-install`, `encore-login`, `encore-create-app`, or `encore-run`. SKIP if the user already has an Encore project and is asking about architecture, services, endpoints, or specific features — those go to `encore-service`, `encore-api`, `encore-pubsub`, etc. Trigger phrases: "completely new to Encore", "first time", "get started with Encore", "hello world", "just starting out".
---

# Getting Started with Encore.ts

## Instructions

### Set Up

Each step has its own skill with the details and error fixes:

1. **Install the CLI** (`encore-install`): check with `encore version`. Install with `brew install encoredev/tap/encore` on macOS, or `curl -L https://encore.dev/install.sh | bash` on Linux and WSL.
2. **Log in** (`encore-login`): `encore auth login`, so the app is created on Encore Cloud with an `encore` git remote for deploying. A person approves the login in a browser.
3. **Create the app** (`encore-create-app`):

   ```bash
   encore app create my-app --example=ts/hello-world
   ```

   Always pass `--example`. Without a terminal, `encore app create my-app` creates an empty Go app.
4. **Run it** (`encore-run`): `encore check 'curl /hello/world'` starts the app, calls the endpoint, and stops. `encore run` keeps it running.

### Project Structure

A minimal Encore.ts app:

```
my-app/
├── encore.app           # App configuration
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── encore.service.ts    # Service definition
└── api.ts               # API endpoints
```

### The encore.app File

```cue
// encore.app
{
    "id": "my-app"
}
```

This file marks the root of your Encore app. The `id` is your app's unique identifier.

### Define a Service

Create `encore.service.ts` to define a service:

```typescript
// encore.service.ts
import { Service } from "encore.dev/service";

export default new Service("my-service");
```

### Create Your First API

```typescript
// api.ts
import { api } from "encore.dev/api";

interface HelloResponse {
  message: string;
}

export const hello = api(
  { method: "GET", path: "/hello", expose: true },
  async (): Promise<HelloResponse> => {
    return { message: "Hello, World!" };
  }
);
```

### Run Your App

```bash
# Start the development server
encore run

# Your API is now available at http://localhost:4000
```

### Open the Local Dashboard

```bash
# Opens the local development dashboard
encore run
# Then visit http://localhost:9400
```

The dashboard shows:
- All your services and endpoints
- Request/response logs
- Database queries
- Traces and spans

### Common CLI Commands

| Command | Description |
|---------|-------------|
| `encore run` | Start the local development server |
| `encore test` | Run tests |
| `encore db shell <db>` | Open a psql shell to a database |
| `encore gen client` | Generate API client code |
| `git push encore` | Deploy committed changes (apps using Encore's git) |
| `encore app link` | Link to an existing Encore Cloud app |

### Add a Database

```typescript
// db.ts
import { SQLDatabase } from "encore.dev/storage/sqldb";

const db = new SQLDatabase("mydb", {
  migrations: "./migrations",
});
```

Create a migration:

```sql
-- migrations/1_create_table.up.sql
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);
```

### Next Steps

- Add more endpoints (see `encore-api` skill)
- Add authentication (see `encore-auth` skill)
- Add Pub/Sub topics (`encore-pubsub`), cron jobs (`encore-cron`), buckets (`encore-bucket`), secrets (`encore-secret`), or caching (`encore-cache`)
- Deploy to Encore Cloud: commit, then `git push encore`, or push to the linked GitHub repository (see `encore-deploy` skill)
