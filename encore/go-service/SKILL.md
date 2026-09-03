---
name: encore-go-service
description: Implement Encore Go services and lay out an application using service packages, internal subpackages, systems, and typed service calls. For service boundaries and architecture decisions, use `encore-architecture`.
when_to_use: >-
  User wants to create or modify an Encore Go service package, implement an already-chosen service layout, organize packages and directories, group services into system folders, or call another service. Trigger phrases: "create a Go service", "service package", "lay out these services", "Go package layout", "internal package", "call another service".
---

# Encore Go Service Structure

## Instructions

In Encore Go, **each package with an API endpoint is automatically a service**. No special configuration needed.

### Creating a Service

Simply create a package with at least one `//encore:api` endpoint:

```go
// user/user.go
package user

import "context"

type User struct {
    ID    string `json:"id"`
    Email string `json:"email"`
    Name  string `json:"name"`
}

//encore:api public method=GET path=/users/:id
func GetUser(ctx context.Context, params *GetUserParams) (*User, error) {
    // This makes "user" a service
}
```

### Minimal Service Structure

```
user/
├── user.go          # API endpoints
├── db.go            # Database (if needed)
└── migrations/      # SQL migrations
    └── 1_create_users.up.sql
```

## Application Patterns

### Single Service

An application can define its APIs in one root service package:

```
my-app/
├── encore.app
├── go.mod
├── api.go           # All endpoints
├── db.go            # Database
└── migrations/
    └── 1_initial.up.sql
```

### Multi-Service

Each service lives in its own package:

```
my-app/
├── encore.app
├── go.mod
├── user/
│   ├── user.go
│   ├── db.go
│   └── migrations/
├── order/
│   ├── order.go
│   ├── db.go
│   └── migrations/
└── notification/
    └── notification.go
```

### Large Application (System-based)

Group related services into systems:

```
my-app/
├── encore.app
├── go.mod
├── commerce/
│   ├── order/
│   │   └── order.go
│   ├── cart/
│   │   └── cart.go
│   └── payment/
│       └── payment.go
├── identity/
│   ├── user/
│   │   └── user.go
│   └── auth/
│       └── auth.go
└── comms/
    ├── email/
    │   └── email.go
    └── push/
        └── push.go
```

## Service-to-Service Calls

Just import and call the function directly - Encore handles the RPC:

```go
package order

import (
    "context"
    "encore.app/user"  // Import the user service
)

//encore:api auth method=GET path=/orders/:id
func GetOrderWithUser(ctx context.Context, params *GetOrderParams) (*OrderWithUser, error) {
    order, err := getOrder(ctx, params.ID)
    if err != nil {
        return nil, err
    }
    
    // This becomes an RPC call - Encore handles it
    orderUser, err := user.GetUser(ctx, &user.GetUserParams{ID: order.UserID})
    if err != nil {
        return nil, err
    }
    
    return &OrderWithUser{Order: order, User: orderUser}, nil
}
```

## Internal Helpers (Non-Service Packages)

Create packages without `//encore:api` endpoints for shared code:

```
my-app/
├── user/
│   └── user.go       # Service (has API)
├── order/
│   └── order.go      # Service (has API)
└── internal/
    ├── util/
    │   └── util.go   # Not a service (no API)
    └── validation/
        └── validate.go
```

## Guidelines

- A package becomes a service when it has `//encore:api` endpoints
- Services cannot be nested within other services
- Cross-service calls look like regular function calls
- Each service can have its own database
- Package names should be lowercase, descriptive
- Don't create services just for code organization - use sub-packages instead
- Use `encore-architecture` when the service boundaries have not been decided
