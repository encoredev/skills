---
name: encore-auth
description: Implement authentication with auth handlers and gateways in Encore.ts.
---

# Encore Authentication

## Instructions

Encore.ts provides a built-in authentication system for identifying API callers and protecting endpoints.

### 1. Create an Auth Handler

```typescript
// auth.ts
import { Header, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";

// Define what the auth handler receives
interface AuthParams {
  authorization: Header<"Authorization">;
}

// Define what authenticated requests will have access to
interface AuthData {
  userID: string;
  email: string;
  role: "admin" | "user";
}

export const auth = authHandler<AuthParams, AuthData>(
  async (params) => {
    // Validate the token (example with JWT)
    const token = params.authorization.replace("Bearer ", "");
    
    const payload = await verifyToken(token);
    if (!payload) {
      throw APIError.unauthenticated("invalid token");
    }
    
    return {
      userID: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
);

// Register the auth handler with a Gateway
export const gateway = new Gateway({
  authHandler: auth,
});
```

### 2. Protect Endpoints

```typescript
import { api } from "encore.dev/api";

// Protected endpoint - requires authentication
export const getProfile = api(
  { method: "GET", path: "/profile", expose: true, auth: true },
  async (): Promise<Profile> => {
    // Only authenticated users reach here
  }
);

// Public endpoint - no authentication required
export const healthCheck = api(
  { method: "GET", path: "/health", expose: true },
  async () => ({ status: "ok" })
);
```

### 3. Access Auth Data in Endpoints

```typescript
import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";

export const getProfile = api(
  { method: "GET", path: "/profile", expose: true, auth: true },
  async (): Promise<Profile> => {
    const auth = getAuthData()!;  // Non-null when auth: true
    
    return {
      userID: auth.userID,
      email: auth.email,
      role: auth.role,
    };
  }
);
```

## Auth Handler Behavior

| Scenario | Handler Returns | Result |
|----------|----------------|--------|
| Valid credentials | `AuthData` object | Request authenticated |
| Invalid credentials | Throws `APIError.unauthenticated()` | Treated as no auth |
| Other error | Throws other error | Request aborted |

## Auth with Endpoints

| Endpoint Config | Request Has Auth | Result |
|-----------------|------------------|--------|
| `auth: true` | Yes | Proceeds with auth data |
| `auth: true` | No | 401 Unauthenticated |
| `auth: false` or omitted | Yes | Proceeds (auth data available) |
| `auth: false` or omitted | No | Proceeds (no auth data) |

## Service-to-Service Auth Propagation

Auth data automatically propagates to internal service calls:

```typescript
import { user } from "~encore/clients";
import { getAuthData } from "~encore/auth";

export const getOrderWithUser = api(
  { method: "GET", path: "/orders/:id", expose: true, auth: true },
  async ({ id }): Promise<OrderWithUser> => {
    const auth = getAuthData()!;

    // Auth is automatically propagated to this call
    const orderUser = await user.getProfile();

    return { order: await getOrder(id), user: orderUser };
  }
);
```

### Overriding Auth Data

You can explicitly override auth data when making service-to-service calls:

```typescript
import { user } from "~encore/clients";

// Override auth data for this specific call
const adminUser = await user.getProfile(
  {},
  { authData: { userID: "admin-123", email: "admin@example.com", role: "admin" } }
);
```

## Common Auth Patterns

### JWT Token Validation

```typescript
import { jwtVerify } from "jose";
import { secret } from "encore.dev/config";

const jwtSecret = secret("JWTSecret");

async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(jwtSecret())
    );
    return payload;
  } catch {
    return null;
  }
}
```

### API Key Authentication

```typescript
export const auth = authHandler<AuthParams, AuthData>(
  async (params) => {
    const apiKey = params.authorization;
    
    const user = await db.queryRow<User>`
      SELECT id, email, role FROM users WHERE api_key = ${apiKey}
    `;
    
    if (!user) {
      throw APIError.unauthenticated("invalid API key");
    }
    
    return {
      userID: user.id,
      email: user.email,
      role: user.role,
    };
  }
);
```

### Cookie-Based Auth

```typescript
interface AuthParams {
  cookie: Header<"Cookie">;
}

export const auth = authHandler<AuthParams, AuthData>(
  async (params) => {
    const sessionId = parseCookie(params.cookie, "session");
    
    if (!sessionId) {
      throw APIError.unauthenticated("no session");
    }
    
    const session = await getSession(sessionId);
    if (!session || session.expiresAt < new Date()) {
      throw APIError.unauthenticated("session expired");
    }
    
    return {
      userID: session.userID,
      email: session.email,
      role: session.role,
    };
  }
);
```

## Testing with Auth

Mock authentication in tests using Vitest:

```typescript
import { describe, it, expect, vi } from "vitest";
import * as auth from "~encore/auth";
import { getProfile } from "./api";

describe("authenticated endpoints", () => {
  it("returns profile for authenticated user", async () => {
    // Mock getAuthData to return test user
    const spy = vi.spyOn(auth, "getAuthData");
    spy.mockImplementation(() => ({
      userID: "test-user-123",
      email: "test@example.com",
      role: "user",
    }));

    const profile = await getProfile();
    expect(profile.email).toBe("test@example.com");

    spy.mockRestore();
  });
});
```

## Guidelines

- Auth handlers must be registered with a Gateway
- Use `getAuthData()` from `~encore/auth` to access auth data
- `getAuthData()` returns `null` in unauthenticated requests
- Auth data propagates automatically in service-to-service calls
- Throw `APIError.unauthenticated()` for invalid credentials
- Keep auth handlers fast - they run on every authenticated request
