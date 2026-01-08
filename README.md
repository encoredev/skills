# Encore Skills

Agent skills for building backend applications with [Encore.ts](https://encore.dev).

## What These Skills Do

Encore.ts lets you write TypeScript and get cloud infrastructure automatically - databases, Pub/Sub, cron jobs, and more provisioned in your AWS/GCP account from your code.

These skills help AI agents use Encore's declarative patterns correctly:

- **Declarative infrastructure** - define resources in code, Encore provisions them
- **Flexible deployment** - self-host, or use Encore Cloud to provision in your AWS/GCP account
- **Type-safe APIs** - request/response validation from TypeScript types
- **Service-to-service calls** - automatic type safety across service boundaries
- **Built-in observability** - tracing, metrics, and logging out of the box

## Installation

### Claude Code (via Marketplace)

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

### Other Agents

Reference the `SKILL.md` files in `plugins/encore-skills/skills/` according to your agent's documentation, or copy the contents to your agent's skills location.

## Available Skills

| Skill | Description |
|-------|-------------|
| [api](plugins/encore-skills/skills/api/SKILL.md) | Create type-safe API endpoints with proper request/response handling |
| [auth](plugins/encore-skills/skills/auth/SKILL.md) | Implement authentication with auth handlers, gateways, and protected endpoints |
| [infrastructure](plugins/encore-skills/skills/infrastructure/SKILL.md) | Declare databases, Pub/Sub, cron jobs, storage, and secrets |
| [service](plugins/encore-skills/skills/service/SKILL.md) | Structure services and organize application architecture |
| [database](plugins/encore-skills/skills/database/SKILL.md) | Database queries, migrations, and ORM integration |
| [code-review](plugins/encore-skills/skills/code-review/SKILL.md) | Review code for Encore best practices and anti-patterns |
| [migrate](plugins/encore-skills/skills/migrate/SKILL.md) | Convert Express/Fastify/Node.js apps to Encore |

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
│           ├── api/
│           │   └── SKILL.md
│           ├── auth/
│           │   └── SKILL.md
│           ├── code-review/
│           │   └── SKILL.md
│           ├── database/
│           │   └── SKILL.md
│           ├── infrastructure/
│           │   └── SKILL.md
│           ├── migrate/
│           │   └── SKILL.md
│           └── service/
│               └── SKILL.md
├── AGENTS.md
├── LICENSE
└── README.md
```

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

