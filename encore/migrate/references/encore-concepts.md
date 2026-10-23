# How Encore differs, for migrations

Conventional frameworks configure a server at runtime: create an app, register routes and middleware, read env vars, call `listen`. Encore reads the application from its declarations at compile time and runs the server itself. Most migration work is turning runtime setup in the source into those declarations. Each section names the Encore construct to map to and the language skill that holds the details.

## The server and process

- Encore owns the HTTP server, startup, and graceful shutdown. Remove `listen` calls, server bootstrap code, and port configuration.
- Declare infrastructure (databases, topics, subscriptions, cron jobs, buckets, caches, secrets) at package level, never inside functions. Encore discovers resources by static analysis.
- Encore may run several instances of a service. State held in process memory (sessions, caches, rate-limit counters, job queues) diverges between instances. Move it to a database or `encore-cache`.
- Containers have ephemeral disks. Files written to local disk belong in a bucket (`encore-bucket`).

## Services and code organization

- A service is a directory with `encore.service.ts` (TS) or a Go package with APIs (Go). Services cannot nest. See `encore-service`.
- Cross-service calls go through `~encore/clients` (TS) or by calling the other service's API function (Go), never through direct imports of another service's internals.
- Dependency-injection containers and module systems have no Encore equivalent. Replace them with module-level instances (TS) or an `//encore:service` struct initialized in `initService` (Go).

## Endpoints

- **Private by default.** An endpoint without `expose: true` (TS) or `public` (Go) is reachable only from other services. Every route that clients call must set it. A missing flag is the most common cause of migrated routes returning 404.
- **Paths** use `:param`, `*wildcard`, and `!fallback`. Convert `{id}` and `<id>` styles. Encore rejects conflicting paths at compile time; `encore run` names them. Encore Go rejects a static segment beside a parameter at the same position (`/articles/feed` and `/articles/:slug`); serve both from the parameter endpoint and branch on its value, which gives the merged endpoint the looser auth requirement, so check the stricter one in the handler.
- **Trailing slashes.** Paths cannot end in `/`. A request with a trailing slash gets a redirect to the path without it: 301 for GET, 308 for other methods. A source route that exists only with a trailing slash, or that clients call with one, needs a deviation. The fallback route receives such requests unchanged.
- **Requests** are typed. Fields map to path parameters by name, and to query, header, and cookie values through `Query<>`, `Header<>`, and `Cookie<>` (TS) or `query:`, `header:`, and `cookie:` tags (Go). For GET, HEAD, and DELETE, plain fields become query parameters; for other methods they come from the JSON body.
- **Responses** are JSON objects built from the return type, and only the fields declared in that type are sent. Set a status other than 200 with an `HttpStatus` field (TS) or an `encore:"httpstatus"` field (Go). A 204 from a typed endpoint still carries `Content-Type: application/json`. A response that is a bare array, plain text, a file, a redirect, or HTML cannot come from a typed endpoint: either wrap it in an object (which changes the contract and needs a recorded decision) or use a raw endpoint.
- **Validation.** TS validates requests from their types; add constraints with `encore.dev/validate` (`MinLen`, `IsEmail`, and so on). Go calls a `Validate() error` method on the request type if it has one, so existing validation libraries keep working. Failures return 400 with code `invalid_argument`. In Go, a body that is not JSON at the top level (`{bad`) decodes as an empty request, while a wrong type inside it returns 400, so check required fields in `Validate` or the handler. Replace validation middleware and schema libraries (Joi, zod, class-validator, pydantic) with these.
- **Errors.** Throw `APIError` (TS) or return `*errs.Error` (Go). The error body has the form `{"code": "not_found", "message": "...", "details": null}` (TS adds `"internal_message": null`), and the code decides the status. Other thrown errors become 500 `internal`. When comparing error responses, compare `code` and `message` rather than the whole body. To keep a source's own error statuses and bodies (422 with `{"errors": ...}`, for example) on typed endpoints, see [Keeping custom error responses](#keeping-custom-error-responses).

See `encore-api` / `encore-go-api`.

## Raw endpoints

`api.raw` (TS) and `//encore:api raw` (Go) give the handler the plain HTTP request and response, as in Express or `net/http`. Use them when the typed model does not fit:

- Multipart file uploads. In TS, parse with `busboy` and set `bodyLimit` for large files.
- Webhooks that verify signatures over the raw body (`encore-webhook` / `encore-go-webhook`).
- Non-JSON responses, file downloads, redirects, server-sent events, or error bodies that must keep a custom format.
- The fallback route of an incremental migration.

Raw endpoints give up typed request parsing, validation, and typed responses, so use them only where needed.

## Keeping custom error responses

In TS, a service middleware can turn the source's own error type into a response with any status and body:

```ts
import { HandlerResponse, middleware } from "encore.dev/api";

export const legacyErrors = middleware(async (req, next) => {
  try {
    return await next(req);
  } catch (err) {
    if (err instanceof HttpException) { // the source's error class
      const resp = new HandlerResponse(err.body);
      resp.status = err.status;
      return resp;
    }
    throw err;
  }
});
```

The body still passes through the endpoint's response type, so every endpoint that can return such an error must declare the error fields as optional fields of its response type (`errors?: Record<string, string[]>`). Without them the client receives `{}`. Endpoints with no response type cannot carry custom error bodies; give them a response type or accept Encore's format there.

In Go, return the error as a normal response: add the source's error fields and an `encore:"httpstatus"` field to the response struct, and return it with a nil error. Make the success payload a pointer with `omitempty` so that error responses omit it. API schemas cannot contain interfaces, so `map[string]any` must become a concrete type such as `map[string][]string`.

Some errors never reach middleware and always use Encore's format:

- Request decoding and validation failures (wrong JSON type, malformed body, a failed `encore.dev/validate` constraint) return 400 before any middleware runs. To keep a status such as 422 for invalid input, declare the affected request fields as optional or loosely typed and validate them in the handler, throwing the source's error type.
- Responses from the gateway, such as 401 on `auth: true` endpoints.

## Incremental migration with a fallback route

A path written `/!name` is a fallback route: it receives every request that no other endpoint matches. A raw endpoint on a fallback route keeps unmigrated routes working while units move to Encore endpoints one at a time.

**Forklift** (same language): mount the existing router inside the Encore app.

```ts
import { api, RawRequest, RawResponse } from "encore.dev/api";
import express, { request, response } from "express";

// Express re-parents req and res onto Node's http classes. Point its prototypes
// at Encore's raw request and response, or every request hangs.
Object.setPrototypeOf(request, RawRequest.prototype);
Object.setPrototypeOf(response, RawResponse.prototype);

const app = express(); // the existing app, with its routes and middleware

export const legacy = api.raw(
  { expose: true, method: "*", path: "/!fallback" },
  app,
);
```

Other Node.js routers need the same kind of adapting. Send one request through the fallback before moving on.

```go
//encore:service
type Service struct {
	oldRouter *gin.Engine // existing HTTP router
}

//encore:api public raw path=/!fallback
func (s *Service) Fallback(w http.ResponseWriter, req *http.Request) {
	s.oldRouter.ServeHTTP(w, req)
}
```

Get `encore run` working with only the fallback first, then replace routes unit by unit. Old and new code share state when the old data access connects to the Encore database: `db.connectionString` (TS) or `db.Stdlib()` (Go).

Moving Node.js code into an Encore.ts app:

- Encore.ts apps are ES modules. `import * as x from "pkg"` of a CommonJS package (`body-parser`, `bcryptjs`, `jsonwebtoken`) can yield an object without the expected functions; use default imports.
- Pin `encore.dev` in `package.json` to the CLI version shown by `encore version`.
- `encore run` uses the `node` on `PATH`. Old dependencies can break on new Node.js releases; check the runtime the source needs.
- After a startup crash, restart `encore run` if it keeps serving the old error.

Moving Go code into an Encore Go app:

- Encore owns `main`. Delete the `package main` files and build the old router in `initService` of a new `//encore:service` package.
- Run `go get encore.dev@latest`; the Go module's version can trail the CLI's. Afterwards check that `go mod tidy` did not upgrade dependencies the source pins.
- Hand an ORM Encore's connection pool, for GORM: `gorm.Open(postgres.New(postgres.Config{Conn: db.Stdlib()}), &gorm.Config{})`.
- Library packages cannot reach Encore resources under `encore test`, so source tests that open their own database stop working. Move them out in unit 0 and port the business-behavior ones with their unit.

**Rebuild** (any language): the fallback handler forwards the request over HTTP to the running source and copies the response back. Read the source URL from a secret.

### Behavior that lives in libraries

A rebuild across languages loses behavior that the source got from its libraries and runtime rather than its own code. Check each one that applies, and compute expected values with the source's own libraries when in doubt:

- Password hashing: the algorithm and salt layout, so that existing hashes still verify.
- Tokens: signing algorithm, claims, expiry, and the header prefix (`Token`, `Bearer`), so that tokens stay valid across the cutover.
- Generated values: slugs (including transliteration of non-Latin text), IDs, and default values.
- Serialization: date-time format and precision, decimals, and `null` versus missing fields.
- Ordering: queries without `ORDER BY` return rows in no defined order, so decide on an order and record it.

## Auth

- One auth handler per app (`authHandler` + `Gateway` in TS, `//encore:authhandler` in Go). It runs at the gateway and reads credentials from headers, query, or cookies, which covers bearer tokens, API keys, and session cookies.
- Endpoints opt in with `auth: true` (TS) or `auth` (Go). Replace per-route auth middleware, guards, and decorators with that flag.
- When the auth handler throws any other error, the gateway rejects the request with that error's status, on every endpoint. When it throws `Unauthenticated`, an endpoint without `auth: true` runs as anonymous. Frameworks often return 401 for invalid credentials on routes where auth is optional. To keep that, add middleware on those endpoints that rejects requests carrying credentials when `getAuthData()` is null.
- Authorization (roles, record ownership) stays in the handlers, or in middleware that targets authenticated endpoints.

See `encore-auth` / `encore-go-auth`.

## Middleware

Encore already provides request logging, tracing, request IDs, body parsing, CORS, and auth. Drop source middleware that does those things instead of porting it. For the rest:

- TS: `middleware()` from `encore.dev/api`, listed in the service's `middlewares` option and run in that order. `target` selects endpoints by `tags`, `auth`, `expose`, `isRaw`, or `isStream`.
- Go: `//encore:middleware target=...`, with `global` to apply across all services. Global middleware runs first.

Middleware applies per service (or globally in Go), not per route group. Map route-group middleware to tags.

## CORS

Configure CORS once in `encore.app` under `global_cors`. By default, Encore allows requests without credentials from any origin and rejects credentialed requests from other origins (all origins are allowed locally). Copy the source's allowlist into `allow_origins_with_credentials` when browsers send cookies or auth headers. Raw endpoints that read or set custom headers need those headers in `allow_headers` or `expose_headers`.

## Configuration and environment variables

- Sensitive values become secrets (`encore-secret` / `encore-go-secret`), set per environment with `encore secret set`.
- Non-sensitive per-environment values: secrets work in both languages; Go also has `config.Load` with CUE files.
- `.env` files and `process.env` / `os.Getenv` reads are invisible to Encore and are not set in deployed environments. Replace each env var from the inventory.

## Infrastructure

| Source has | Encore | Notes |
|---|---|---|
| SQL database | `SQLDatabase` / `sqldb.NewDatabase` | PostgreSQL only. Transactions: `await using tx = await db.begin()` (TS), `db.Begin(ctx)` (Go). ORMs (Prisma, Drizzle, GORM, ...) keep working through the connection string. Encore.ts applies Prisma and Drizzle migration folders as they are (`migrations: { path, source: "prisma" }`); convert other migrations into Encore's numbered `migrations/` files. See `encore-database`. |
| Job queue or message broker | Pub/Sub topic and subscription | Handlers must be idempotent; delivery is at least once. See `encore-pubsub`. |
| Scheduler | `CronJob` calling an endpoint | Cron jobs do not run under `encore run`; test by calling the endpoint. Schedules are UTC. See `encore-cron`. |
| Redis cache | `encore-cache` | Typed keyspaces, not arbitrary Redis commands. |
| Object storage or local uploads | Bucket | See `encore-bucket`. |
| Other stores (MongoDB, Elasticsearch, ...) | External service | Connect with a client library; keep the connection string in a secret. |

### Changing the database engine

A source on MySQL or SQLite moves to PostgreSQL in both strategies. Check each of these:

- **Schema.** Write Encore migration files. If the source's ORM creates the schema at startup, run that against a scratch PostgreSQL and dump it with `pg_dump --schema-only`.
- **Driver.** Switch the ORM's driver or dialect to PostgreSQL and give it the Encore database's connection.
- **Ordering.** Rows come back in a different order. Add `ORDER BY` wherever the source relied on insertion order.
- **Constraints.** PostgreSQL enforces foreign keys and types that SQLite ignores, so writes the source accepted can fail.
- **Error text.** Database error messages that reach clients (`UNIQUE constraint failed: ...`) change. Map them back, or record a deviation.

## Static files and real-time

- Static files and SPAs: `api.static` in TS (`/!path` serves an SPA at the root without conflicting with endpoints). Go has no static primitive; serve files from a raw endpoint with `http.FileServer`.
- WebSockets: TS has streaming endpoints (`api.streamIn`, `api.streamOut`, `api.streamInOut`) with typed messages over a WebSocket. Go uses a raw endpoint with a WebSocket library.

## Logging and testing

- Replace logger setup (winston, pino, zap, logrus) with `log` from `encore.dev/log` (TS) or `rlog` (Go). See `encore-logging`.
- `encore test` provisions databases and other infrastructure for tests. Run tests through it rather than the bare test runner. See `encore-testing`.
