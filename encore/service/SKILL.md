---
name: encore-service
description: Implement Encore.ts services and lay out an application using `encore.service.ts`, service directories, systems, and `~encore/clients`. For service boundaries and architecture decisions, use `encore-architecture`.
when_to_use: >-
  User wants to create or modify an Encore.ts service definition, implement an already-chosen service layout, organize service files and directories, group services into system folders, or call another service. Trigger phrases: "create a service", "encore.service.ts", "lay out these services", "service directory", "systems folder", "~encore/clients".
---

# Encore Service Structure

## Instructions

### Creating a Service

Every Encore service needs an `encore.service.ts` file:

```typescript
// encore.service.ts
import { Service } from "encore.dev/service";

export default new Service("my-service");
```

### Minimal Service Structure

```
my-service/
├── encore.service.ts    # Service definition (required)
├── api.ts               # API endpoints
└── db.ts                # Database (if needed)
```

## Application Patterns

### Single Service

A service can be defined at the application root:

```
my-app/
├── package.json
├── encore.app
├── encore.service.ts
├── api.ts
├── db.ts
└── migrations/
    └── 001_initial.up.sql
```

### Multi-Service

Each service lives in its own directory:

```
my-app/
├── encore.app
├── package.json
├── user/
│   ├── encore.service.ts
│   ├── api.ts
│   └── db.ts
├── order/
│   ├── encore.service.ts
│   ├── api.ts
│   └── db.ts
└── notification/
    ├── encore.service.ts
    └── api.ts
```

### Large Application (System-based)

Group related services into systems:

```
my-app/
├── encore.app
├── commerce/
│   ├── order/
│   │   └── encore.service.ts
│   ├── cart/
│   │   └── encore.service.ts
│   └── payment/
│       └── encore.service.ts
├── identity/
│   ├── user/
│   │   └── encore.service.ts
│   └── auth/
│       └── encore.service.ts
└── comms/
    ├── email/
    │   └── encore.service.ts
    └── push/
        └── encore.service.ts
```

## Service-to-Service Calls

Import other services from `~encore/clients`:

```typescript
import { user } from "~encore/clients";

export const getOrderWithUser = api(
  { method: "GET", path: "/orders/:id", expose: true },
  async ({ id }): Promise<OrderWithUser> => {
    const order = await getOrder(id);
    const orderUser = await user.get({ id: order.userId });
    return { ...order, user: orderUser };
  }
);
```

## Guidelines

- Services cannot be nested within other services
- Use `~encore/clients` for cross-service calls (never direct imports)
- Each service can have its own database
- Service names should be lowercase, descriptive
- Don't create services just for code organization - use folders instead
- Use `encore-architecture` when the service boundaries have not been decided
