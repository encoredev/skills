# Encore Skills

Agent skills for building backend applications with [Encore](https://encore.dev), the backend framework for Go and TypeScript.

## Installation

```bash
npx add-skill encoredev/skills
```

This works with Cursor, Claude Code, Codex, OpenCode, and 10+ other agents.

### Options

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
