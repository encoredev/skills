# Encore Skills

Agent skills for building backend applications with [Encore](https://encore.dev), the backend framework for Go and TypeScript.

## What These Skills Do

Encore is a backend framework with built-in infrastructure. You declare what you need (databases, Pub/Sub, cron jobs, etc.) in code, and Encore understands how to run it.

These skills help AI agents use Encore's declarative patterns correctly:

- **Declarative infrastructure** - define resources in code
- **Type-safe APIs** - request/response validation built-in
- **Service-to-service calls** - automatic type safety across service boundaries
- **Built-in observability** - tracing, metrics, and logging out of the box

### How Infrastructure Works

- **Local development** (`encore run`) - Encore provisions Docker containers automatically (Postgres, Redis, etc.)
- **Production deployment** - Either use [Encore Cloud](https://encore.dev/cloud) to provision in your AWS/GCP account, or self-host using the generated infrastructure configuration

## Installation

```bash
npx add-skill encoredev/skills
```

Works with Cursor, Claude Code, Codex, OpenCode, and 10+ other agents.

```bash
# List available skills
npx add-skill encoredev/skills --list

# Install specific skills
npx add-skill encoredev/skills --skill encore-getting-started --skill encore-api

# Install to specific agents
npx add-skill encoredev/skills -a cursor -a claude-code

# Global installation
npx add-skill encoredev/skills -g
```

### Claude Code Marketplace

If you prefer to use Claude Code directly:

```bash
claude plugin marketplace add encoredev/skills
claude plugin install encore-skills@encore-skills
```

### Manual Installation

Copy the `SKILL.md` files from `encore/` to your agent's skills directory.

## Available Skills

### TypeScript

| Skill | Description |
|-------|-------------|
| `encore-getting-started` | Get started with Encore.ts |
| `encore-api` | Create type-safe API endpoints |
| `encore-auth` | Implement authentication |
| `encore-infrastructure` | Declare databases, Pub/Sub, cron jobs, secrets |
| `encore-service` | Structure and organize services |
| `encore-database` | Database queries, migrations, ORM integration |
| `encore-testing` | Test APIs with Vitest |
| `encore-frontend` | Connect React/Next.js apps |
| `encore-code-review` | Review code for best practices |
| `encore-migrate` | Migrate Express/Fastify apps |

### Go

| Skill | Description |
|-------|-------------|
| `encore-go-getting-started` | Get started with Encore Go |
| `encore-go-api` | Create API endpoints |
| `encore-go-auth` | Implement authentication |
| `encore-go-infrastructure` | Declare infrastructure |
| `encore-go-service` | Structure services |
| `encore-go-database` | Database queries and migrations |
| `encore-go-testing` | Test APIs and services |
| `encore-go-code-review` | Review code for best practices |

## References

- [Encore.ts Documentation](https://encore.dev/docs)
- [Encore GitHub](https://github.com/encoredev/encore)

## License

Apache-2.0
