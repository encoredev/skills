---
name: encore-go-api
description: Define typed API endpoints in Encore Go using `//encore:api` annotations. Covers typed request/response structs, path/query/header/cookie params, and error returns. For raw endpoints (`//encore:api raw`) and inbound webhooks, use `encore-go-webhook` instead.
when_to_use: >-
  User wants to define an endpoint, route, or REST handler in their own Go service — anything with a typed JSON request/response shape. Mentions of an endpoint, GET/POST/PUT/PATCH/DELETE, paths like `/orders` or `/users/:id`, request body, query parameters (`query:"name"` tag), path parameters, headers (`header:"Name"` tag), HTTP status codes, request validation, `errs.NotFound` / 4xx-5xx errors, or `//encore:api public`. Trigger phrases: "POST endpoint at /orders", "typed Go endpoint", "GET /users/:id", "request validation", "return 404", "JSON response shape".
---

# Encore Go API Endpoints

## Instructions

When creating API endpoints with Encore Go, follow these patterns:

### 1. Basic API Endpoint

Use the `//encore:api` annotation above your function:

```go
package user

import "context"

type GetUserParams struct {
    ID string
}

type User struct {
    ID    string `json:"id"`
    Email string `json:"email"`
    Name  string `json:"name"`
}

//encore:api public method=GET path=/users/:id
func GetUser(ctx context.Context, params *GetUserParams) (*User, error) {
    // Implementation
    return &User{ID: params.ID, Email: "user@example.com", Name: "John"}, nil
}
```

### 2. POST with Request Body

```go
type CreateUserParams struct {
    Email string `json:"email"`
    Name  string `json:"name"`
}

//encore:api public method=POST path=/users
func CreateUser(ctx context.Context, params *CreateUserParams) (*User, error) {
    // Implementation
    return &User{ID: "new-id", Email: params.Email, Name: params.Name}, nil
}
```

## API Annotation Options

| Option | Values | Description |
|--------|--------|-------------|
| `public` | - | Accessible from outside |
| `private` | - | Only callable from other services |
| `auth` | - | Requires authentication |
| `method` | GET, POST, PUT, PATCH, DELETE | HTTP method |
| `path` | string | URL path with `:param` for path params |
| `sensitive` | - | Redacts request/response payloads from traces |

### Examples

```go
//encore:api public method=GET path=/health
//encore:api private method=POST path=/internal/process
//encore:api auth method=GET path=/profile
//encore:api public sensitive method=POST path=/auth/login
```

## Sensitive Data

Mark sensitive fields to redact them from tracing logs:

```go
type LoginParams struct {
    Email    string `json:"email"`
    Password string `json:"password" encore:"sensitive"`
}
```

Or mark the entire endpoint as sensitive in the annotation:

```go
//encore:api public sensitive method=POST path=/auth/login
func Login(ctx context.Context, params *LoginParams) (*TokenResponse, error) {
    // Request and response will be redacted from traces
}
```

## Custom HTTP Status Codes

Return custom HTTP status codes using the `encore:"httpstatus"` tag:

```go
type CreateResponse struct {
    ID     string `json:"id"`
    Status int    `encore:"httpstatus"`
}

//encore:api public method=POST path=/items
func CreateItem(ctx context.Context, params *CreateParams) (*CreateResponse, error) {
    item := createItem(params)
    return &CreateResponse{
        ID:     item.ID,
        Status: 201,  // Returns HTTP 201 Created
    }, nil
}
```

## Request Parameter Sources

### Path Parameters

```go
// Path: /users/:id
type GetUserParams struct {
    ID string  // Automatically mapped from :id
}
```

### Query Parameters

```go
// Path: /users
type ListUsersParams struct {
    Limit  int `query:"limit"`
    Offset int `query:"offset"`
}

//encore:api public method=GET path=/users
func ListUsers(ctx context.Context, params *ListUsersParams) (*ListResponse, error) {
    // params.Limit and params.Offset come from query string
}
```

### Headers

```go
type WebhookParams struct {
    Signature string `header:"X-Webhook-Signature"`
    Payload   string `json:"payload"`
}
```

### Cookies

```go
import "net/http"

type AuthParams struct {
    SessionCookie *http.Cookie `cookie:"session"`
    CSRFToken     string       `header:"X-CSRF-Token"`
}

//encore:api auth method=POST path=/logout
func Logout(ctx context.Context, params *AuthParams) error {
    // Access params.SessionCookie.Value
    return nil
}
```

## Response Types

### Standard Response

```go
type Response struct {
    Message string `json:"message"`
}

//encore:api public method=GET path=/hello
func Hello(ctx context.Context) (*Response, error) {
    return &Response{Message: "Hello, World!"}, nil
}
```

### No Response Body

```go
//encore:api public method=DELETE path=/users/:id
func DeleteUser(ctx context.Context, params *DeleteParams) error {
    // Return only error (no response body on success)
    return nil
}
```

### No Request Parameters

```go
//encore:api public method=GET path=/health
func Health(ctx context.Context) (*HealthResponse, error) {
    return &HealthResponse{Status: "ok"}, nil
}
```

## Error Handling

Use `errs` package for proper HTTP error responses:

```go
import "encore.dev/beta/errs"

//encore:api public method=GET path=/users/:id
func GetUser(ctx context.Context, params *GetUserParams) (*User, error) {
    user, err := findUser(params.ID)
    if err != nil {
        return nil, err
    }
    if user == nil {
        return nil, &errs.Error{
            Code:    errs.NotFound,
            Message: "user not found",
        }
    }
    return user, nil
}
```

### Common Error Codes

| Code | HTTP Status | Usage |
|------|-------------|-------|
| `errs.NotFound` | 404 | Resource doesn't exist |
| `errs.InvalidArgument` | 400 | Bad input |
| `errs.Unauthenticated` | 401 | Missing/invalid auth |
| `errs.PermissionDenied` | 403 | Not allowed |
| `errs.AlreadyExists` | 409 | Duplicate resource |

## Guidelines

- Use `//encore:api` annotation above the function
- Request params must be a pointer to a struct or omitted
- Response must be a pointer to a struct (or omit for no body)
- Always return `error` as the last return value
- Use struct tags for JSON field names, query params, and headers
- Path parameters are automatically mapped to struct fields by name
