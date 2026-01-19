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

### Claude Code

```bash
# Add the marketplace
claude plugin marketplace add encoredev/skills

# Install the plugin
claude plugin install encore-skills@encore-skills
```

### Claude Code (Local)

```bash
# Clone the repository
git clone git@github.com:encoredev/skills.git ~/encore-skills

# Install the plugin
claude plugin install ~/encore-skills
```

After installation, restart Claude Code. Skills are automatically invoked when relevant.

### npx add-skill (All Agents)

Install skills using the `add-skill` CLI tool, which supports Cursor, Claude Code, Codex, OpenCode, and 10+ other agents:

```bash
# Install all skills
npx add-skill encoredev/skills

# List available skills
npx add-skill encoredev/skills --list

# Install specific skills
npx add-skill encoredev/skills --skill encore-getting-started --skill encore-api

# Install to specific agents
npx add-skill encoredev/skills -a cursor -a claude-code

# Global installation (all projects)
npx add-skill encoredev/skills -g
```

The tool automatically detects which agents you have installed and installs to the appropriate locations.

### Other Agents (Manual)

Reference the `SKILL.md` files in `plugins/encore-skills/skills/` according to your agent's documentation, or copy the contents to your agent's skills location.

## Available Skills

### TypeScript Skills

| Skill | Description |
|-------|-------------|
| [getting-started](plugins/encore-skills/skills/getting-started/SKILL.md) | Create new projects, project structure, first steps |
| [api](plugins/encore-skills/skills/api/SKILL.md) | Create type-safe API endpoints with proper request/response handling |
| [auth](plugins/encore-skills/skills/auth/SKILL.md) | Implement authentication with auth handlers, gateways, and protected endpoints |
| [infrastructure](plugins/encore-skills/skills/infrastructure/SKILL.md) | Declare databases, Pub/Sub, cron jobs, storage, and secrets |
| [service](plugins/encore-skills/skills/service/SKILL.md) | Structure services and organize application architecture |
| [database](plugins/encore-skills/skills/database/SKILL.md) | Database queries, migrations, and ORM integration |
| [testing](plugins/encore-skills/skills/testing/SKILL.md) | Test APIs and services with Vitest |
| [frontend](plugins/encore-skills/skills/frontend/SKILL.md) | Connect React/Next.js apps, generate clients, configure CORS |
| [code-review](plugins/encore-skills/skills/code-review/SKILL.md) | Review code for Encore best practices and anti-patterns |
| [migrate](plugins/encore-skills/skills/migrate/SKILL.md) | Convert Express/Fastify/Node.js apps to Encore |

### Go Skills

| Skill | Description |
|-------|-------------|
| [go-getting-started](plugins/encore-skills/skills/go-getting-started/SKILL.md) | Create new projects, project structure, first steps |
| [go-api](plugins/encore-skills/skills/go-api/SKILL.md) | Create API endpoints using `//encore:api` annotations |
| [go-auth](plugins/encore-skills/skills/go-auth/SKILL.md) | Implement authentication with `//encore:authhandler` |
| [go-infrastructure](plugins/encore-skills/skills/go-infrastructure/SKILL.md) | Declare databases, Pub/Sub, cron jobs, storage, and secrets |
| [go-service](plugins/encore-skills/skills/go-service/SKILL.md) | Structure services and organize application architecture |
| [go-database](plugins/encore-skills/skills/go-database/SKILL.md) | Database queries, migrations, and transactions |
| [go-testing](plugins/encore-skills/skills/go-testing/SKILL.md) | Test APIs and services with Go testing |
| [go-code-review](plugins/encore-skills/skills/go-code-review/SKILL.md) | Review code for Encore best practices and anti-patterns |
| [frontend](plugins/encore-skills/skills/frontend/SKILL.md) | Connect React/Next.js apps, generate clients, configure CORS |

## Repository Structure

```
encore-skills/
├── .claude-plugin/
│   └── marketplace.json       # Marketplace manifest
├── plugins/
│   └── encore-skills/
│       ├── .claude-plugin/
│       │   └── plugin.json    # Plugin manifest
│       └── skills/
│           ├── api/                 # TypeScript
│           ├── auth/
│           ├── code-review/
│           ├── database/
│           ├── infrastructure/
│           ├── migrate/
│           ├── service/
│           ├── go-api/              # Go
│           ├── go-auth/
│           ├── go-code-review/
│           ├── go-database/
│           ├── go-infrastructure/
│           └── go-service/
├── skills/                    # Symlinks for add-skill compatibility
├── AGENTS.md
├── LICENSE
└── README.md
```

The `skills/` directory contains symlinks to the actual skills in `plugins/encore-skills/skills/` for compatibility with `npx add-skill`. The tool's recursive search will also find skills in the `plugins/` directory.

## Creating New Skills

Skills follow the [Agent Skills specification](https://github.com/anthropics/agent-skills). Each skill needs a `SKILL.md` with YAML frontmatter:

```markdown
---
name: my-skill
description: Clear description with keywords for agent matching.
---

# Skill Title

## Instructions

Step-by-step guidance.

## Examples

Concrete code examples.

## Guidelines

- Specific rules
- Edge cases
```

### Naming Conventions

- **name**: lowercase alphanumeric with hyphens (1-64 chars)
- **description**: up to 1024 chars, include trigger keywords
- Keep `SKILL.md` under 500 lines

## References

- [Encore.ts Documentation](https://encore.dev/docs)
- [Encore GitHub](https://github.com/encoredev/encore)
- [Agent Skills Specification](https://github.com/anthropics/agent-skills)

## License

Apache-2.0
