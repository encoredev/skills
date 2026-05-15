---
name: encore-go-getting-started
description: Bootstrap a brand-new Encore Go project from zero. Only for first-time CLI install and `encore app create` — not for architecture or feature questions.
when_to_use: >-
  User has no Encore project yet and is asking how to install the Encore CLI, run `encore app create` for a Go app, scaffold a hello-world Go service, or run their very first `encore run`. SKIP if the user already has an Encore Go project and is asking about architecture, services, endpoints, or specific features — those go to `encore-go-service`, `encore-go-api`, `encore-go-pubsub`, etc. Trigger phrases: "completely new to Encore", "first time", "install the CLI", "brew install encoredev", "encore app create", "hello world Go", "just starting out".
---

# Getting Started with Encore Go

## Instructions

### Install Encore CLI

```bash
# macOS
brew install encoredev/tap/encore

# Linux/WSL
curl -L https://encore.dev/install.sh | bash

# Windows (PowerShell)
iwr https://encore.dev/install.ps1 | iex
```

### Create a New App

```bash
# Interactive - choose from templates
encore app create my-app

# Or start with a blank Go app
encore app create my-app --example=hello-world
```

### Project Structure

A minimal Encore Go app:

```
my-app/
├── encore.app           # App configuration
├── go.mod               # Go module
└── hello/               # A service (package with API)
    └── hello.go         # API endpoints
```

### The encore.app File

```cue
// encore.app
{
    "id": "my-app"
}
```

This file marks the root of your Encore app. The `id` is your app's unique identifier.

### Create Your First API

In Encore Go, any package with an `//encore:api` endpoint becomes a service:

```go
// hello/hello.go
package hello

import "context"

type Response struct {
    Message string `json:"message"`
}

//encore:api public method=GET path=/hello
func Hello(ctx context.Context) (*Response, error) {
    return &Response{Message: "Hello, World!"}, nil
}
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
| `encore test` | Run tests (uses `go test` under the hood) |
| `encore db shell <db>` | Open a psql shell to a database |
| `encore gen client` | Generate API client code |
| `encore app link` | Link to an existing Encore Cloud app |

### Add Path Parameters

```go
type GetUserParams struct {
    ID string
}

type User struct {
    ID   string `json:"id"`
    Name string `json:"name"`
}

//encore:api public method=GET path=/users/:id
func GetUser(ctx context.Context, params *GetUserParams) (*User, error) {
    return &User{ID: params.ID, Name: "John"}, nil
}
```

### Add a Database

```go
// db.go
package hello

import "encore.dev/storage/sqldb"

var db = sqldb.NewDatabase("mydb", sqldb.DatabaseConfig{
    Migrations: "./migrations",
})
```

Create a migration:

```sql
-- hello/migrations/1_create_table.up.sql
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);
```

### Query the Database

```go
import "encore.dev/storage/sqldb"

type Item struct {
    ID   int
    Name string
}

func getItem(ctx context.Context, id int) (*Item, error) {
    item, err := sqldb.QueryRow[Item](ctx, db, `
        SELECT id, name FROM items WHERE id = $1
    `, id)
    if err != nil {
        return nil, err
    }
    return item, nil
}
```

### Next Steps

- Add more endpoints (see `encore-go-api` skill)
- Add authentication (see `encore-go-auth` skill)
- Add Pub/Sub topics (`encore-go-pubsub`), cron jobs (`encore-go-cron`), buckets (`encore-go-bucket`), secrets (`encore-go-secret`), or caching (`encore-go-cache`)
- Deploy to Encore Cloud: `encore app link` then `git push encore`
