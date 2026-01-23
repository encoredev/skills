# Encore Go Documentation Summary

This file contains summaries of Encore Go documentation pages for LLM context.

## Getting Started

- https://encore.dev/docs/go - Encore.go is a backend framework for distributed systems offering a declarative approach for working with essential backend primitives like APIs, microservices, databases, queues, caches, cron jobs, and storage buckets, with built-in developer tools and optional DevOps automation.

- https://encore.dev/docs/go/install - Instructions for installing the Encore CLI tool across different operating systems (macOS, Windows, Linux) and setting up the local development environment, including optional LLM integration setup and version management.

- https://encore.dev/docs/go/quick-start - Step-by-step tutorial for building a first Encore.go application in approximately 5 minutes, covering CLI installation, creating a "Hello World" app, exploring the local development dashboard, making code changes with hot-reload, and deploying.

- https://encore.dev/docs/go/ai-integration - How to integrate Encore with AI coding assistants like Cursor and Claude Code, enabling them to understand application architecture and generate type-safe code through MCP server configuration.

- https://encore.dev/docs/go/faq - FAQ addressing common questions about Encore including language support (Go and TypeScript), cloud provider compatibility (AWS, GCP), database options (PostgreSQL), IDE plugins, and troubleshooting.

## Concepts

- https://encore.dev/docs/go/concepts/benefits - Key advantages of using Encore.go for backend development, including local development with instant infrastructure and cloud-agnostic capabilities that reduce DevOps complexity.

- https://encore.dev/docs/go/concepts/application-model - How Encore uses static analysis to parse and analyze application code, creating an "Encore Application Model" that represents the system architecture as a graph of services and infrastructure for automatic tooling.

## Tutorials

- https://encore.dev/docs/go/tutorials/rest-api - Comprehensive tutorial for building a URL shortener REST API using Encore, covering endpoints, PostgreSQL database integration, tests, and deployment.

- https://encore.dev/docs/go/tutorials/uptime - 30-minute tutorial for building an event-driven uptime monitoring system using Encore.go, covering service creation, database setup, cron jobs, Pub/Sub messaging, and Slack integration.

- https://encore.dev/docs/go/tutorials/graphql - Tutorial on building a GraphQL API using Encore.go with gqlgen for type-safe GraphQL development, schema definition, resolver implementation, and deployment.

- https://encore.dev/docs/go/tutorials/slack-bot - Guide for building a production-ready Slack bot using Encore, covering webhook endpoints that respond to slash commands with HMAC signature verification.

- https://encore.dev/docs/go/tutorials/meeting-notes - Tutorial demonstrating how to build a markdown meeting notes web application backend in Go using Encore, covering database storage, third-party API integration, and cloud deployment.

- https://encore.dev/docs/go/tutorials/booking-system - Comprehensive tutorial for building a complete appointment booking system in Go with Encore, covering public and authenticated API endpoints through deployment with email integration via SendGrid.

- https://encore.dev/docs/go/tutorials/incident-management-tool - Tutorial for building a PagerDuty-like incident management tool using Go and Encore, covering user management, scheduling, incident tracking, Slack integration, and automated cron jobs.

## Primitives

- https://encore.dev/docs/go/primitives/app-structure - How to structure an Encore backend application using a monorepo design, covering service creation as Go packages, organizing with sub-packages, and dividing large applications into logical systems.

- https://encore.dev/docs/go/primitives/services - How to define services in Encore.go by creating Go packages with APIs, covering basic microservices structure and automatic service initialization.

- https://encore.dev/docs/go/primitives/defining-apis - How to define type-safe APIs in Encore.go using the `//encore:api` annotation, covering access controls, request/response schemas, parameter handling, and sensitive data redaction.

- https://encore.dev/docs/go/primitives/api-calls - How to make API calls between services in Encore.go by importing service packages and calling endpoints as regular Go functions, with automatic boilerplate generation.

- https://encore.dev/docs/go/primitives/raw-endpoints - How to create raw endpoints in Encore.go that provide lower-level access to HTTP requests for webhooks and other scenarios requiring direct HTTP handler interface access.

- https://encore.dev/docs/go/primitives/service-structs - How to use service structs in Encore.go to represent running services, covering struct definition with `//encore:service` annotation, initialization, API methods, and graceful shutdown.

- https://encore.dev/docs/go/primitives/api-errors - How to return structured error information from Encore APIs using the `encore.dev/beta/errs` package with error types, wrapping functions, and standardized error codes.

- https://encore.dev/docs/go/primitives/databases - How to use PostgreSQL databases with Encore, covering database creation, schema migrations, data operations, environment provisioning, and connection methods.

- https://encore.dev/docs/go/primitives/change-db-schema - How to manage SQL database schema changes in Encore using migration files with sequential numbering.

- https://encore.dev/docs/go/primitives/connect-existing-db - How to connect an Encore application to an existing external database using a dedicated package with lazy connection pool instantiation and secrets management.

- https://encore.dev/docs/go/primitives/insert-test-data-db - Two approaches for populating databases with test data: using Go's `go:embed` feature for local seeding and Encore Cloud webhooks for preview environments.

- https://encore.dev/docs/go/primitives/share-db-between-services - How to share a single SQL database across multiple services using `sqldb.Named("dbname")` to allow services other than the owner to access it.

- https://encore.dev/docs/go/primitives/databases/extensions - List of PostgreSQL extensions pre-installed in Encore's Docker image for local development and Encore Cloud databases, including PostGIS, pgcrypto, and vector extension.

- https://encore.dev/docs/go/primitives/databases/troubleshooting - Troubleshooting guidance for SQL database issues in local Encore.go applications, covering common error messages and solutions related to Docker and file system configuration.

- https://encore.dev/docs/go/primitives/object-storage - Encore.go's cloud-agnostic API for managing files through buckets, covering upload, download, list, delete operations plus public buckets, references, and signed URLs.

- https://encore.dev/docs/go/primitives/cron-jobs - How to create and manage recurring scheduled tasks using the Cron Jobs API with periodic intervals or cron expressions, including monitoring and idempotency considerations.

- https://encore.dev/docs/go/primitives/pubsub - How to implement Pub/Sub messaging in Encore, covering topic creation, event publishing/subscribing, delivery guarantees, ordered topics, and benefits over API-based communication.

- https://encore.dev/docs/go/primitives/caching - How to implement high-performance caching using Redis in Encore microservices, covering cache cluster setup, keyspace definitions for type-safe operations, and rate limiting examples.

- https://encore.dev/docs/go/primitives/secrets - How to securely store API keys and secrets in Encore applications using struct fields, the CLI or dashboard, with encryption via Google Cloud Platform's Key Management Service.

- https://encore.dev/docs/go/primitives/code-snippets - Ready-to-use code snippets for building with Encore's backend framework, covering APIs, databases, cron jobs, Pub/Sub, caching, and secrets management.

## Development

- https://encore.dev/docs/go/develop/auth - How to implement authentication in Encore APIs using auth handler functions that validate tokens and return user IDs with optional custom user data.

- https://encore.dev/docs/go/develop/config - How to use Encore's configuration system with CUE files to define default behavior and override for specific environments, including runtime values and dynamic configuration.

- https://encore.dev/docs/go/develop/cors - How to configure Cross-Origin Resource Sharing (CORS) for Encore applications using the `global_cors` configuration in the `encore.app` file.

- https://encore.dev/docs/go/develop/metadata - How to use Encore's Metadata API to access application and environment metadata, current request tracking, and environment-specific service selection.

- https://encore.dev/docs/go/develop/middleware - How to implement middleware in Encore for cross-cutting concerns like validation and caching using the `//encore:middleware` directive with ordering and API targeting.

- https://encore.dev/docs/go/develop/testing - How to write and run automated tests in Encore Go applications using `encore test`, with built-in test tracing, integration testing with automatic database setup, and IDE support.

- https://encore.dev/docs/go/develop/testing/mocking - Encore's built-in mocking capabilities for testing, covering endpoint mocking with `et.MockEndpoint`, service mocking with `et.MockService`, and mock generation tools.

- https://encore.dev/docs/go/develop/validation - Encore's built-in request validation middleware using the `Validate() error` method on request types for automatic payload validation with HTTP 400 responses.

- https://encore.dev/docs/go/develop/env-vars - Reference guide for Encore's environment variables for configuring the development daemon, dashboard services, and advanced runtime paths.

## CLI

- https://encore.dev/docs/go/cli/cli-reference - Comprehensive reference guide for the Encore CLI with all available commands organized by category including running applications, app management, authentication, database operations, and deployment.

- https://encore.dev/docs/go/cli/client-generation - How to automatically generate type-safe API clients using `encore gen client` in multiple languages (Go, TypeScript, JavaScript, OpenAPI).

- https://encore.dev/docs/go/cli/infra-namespaces - Encore's infrastructure namespaces feature for creating and switching between isolated development environments with preserved database state and configuration.

- https://encore.dev/docs/go/cli/config-reference - How to configure the Encore CLI through global or per-application configuration options, including browser settings for the Local Development Dashboard.

- https://encore.dev/docs/go/cli/telemetry - Encore's telemetry collection practices, what data is gathered and excluded, and how to disable or debug telemetry through CLI or environment variables.

- https://encore.dev/docs/go/cli/mcp - Encore's Model Context Protocol (MCP) server enabling LLMs to access contextual information about applications, with setup instructions and tool references for AI integration.

## Observability

- https://encore.dev/docs/go/observability/dev-dash - Encore's built-in Local Development Dashboard with Service Catalog, API Explorer, distributed tracing, and architecture visualization for real-time development and debugging.

- https://encore.dev/docs/go/observability/tracing - How Encore's distributed tracing system automatically captures traces across applications with stack traces, structured logging, HTTP requests, network info, API calls, and database queries.

- https://encore.dev/docs/go/observability/encore-flow - Encore Flow, a visual architecture diagram tool that automatically generates real-time representations of microservices systems showing service dependencies and Pub/Sub interactions.

- https://encore.dev/docs/go/observability/service-catalog - How Encore automatically generates a comprehensive Service Catalog and API documentation using the Application Model, accessible locally and via Encore Cloud.

- https://encore.dev/docs/go/observability/logging - How to use Encore's structured logging feature combining free-form messages with type-safe key-value pairs using the `encore.dev/rlog` package.

- https://encore.dev/docs/go/observability/metrics - How to define and use custom metrics in Encore Go applications with counters, gauges, and label attachments for tracking specific dimensions.

## Self-Hosting

- https://encore.dev/docs/go/self-host/ci-cd - How to integrate Encore with CI/CD pipelines by automating Docker image creation through `encore build`, including GitHub Actions examples.

- https://encore.dev/docs/go/self-host/docker-build - How to build Docker images for Encore applications using `encore build docker` with customizable services, gateways, and port configuration.

- https://encore.dev/docs/go/self-host/configure-infra - How to configure infrastructure resources for self-hosted Encore applications via JSON configuration for databases, Pub/Sub, metrics, secrets, and object storage.

## How-To Guides

- https://encore.dev/docs/go/how-to/break-up-monolith - How to decompose a monolithic backend into separate microservices using Encore, including moving API endpoints into dedicated service packages and database sharing considerations.

- https://encore.dev/docs/go/how-to/integrate-frontend - How to integrate a frontend application with an Encore backend, covering client generation, state management with TanStack Query, testing, monorepo strategies, and CORS configuration.

- https://encore.dev/docs/go/how-to/temporal - How to integrate Temporal workflow orchestration system into an Encore application, covering local and cloud cluster setup, workflows, activities, and cloud deployment configuration.

- https://encore.dev/docs/go/how-to/cgo - How to enable CGO support in Encore Go applications via configuration settings, noting that Encore uses static linking requiring CGO libraries to support static compilation.

- https://encore.dev/docs/go/how-to/debug - How to debug Go applications built with Encore using Delve debugger with `encore run --debug` options and setup for terminal, VS Code, and GoLand.

- https://encore.dev/docs/go/how-to/http-requests - How to define raw endpoints in Encore for lower-level HTTP request handling using `//encore:api` annotation with standard Go HTTP handlers for webhooks and WebSockets.

- https://encore.dev/docs/go/how-to/atlas-gorm - How to integrate Atlas and GORM together for managing database migrations in Encore applications with external schema support and automated migration generation.

- https://encore.dev/docs/go/how-to/entgo-orm - How to integrate the ent ORM with Encore's database system using Atlas for automatic schema migration generation from ent schema definitions.

- https://encore.dev/docs/go/how-to/grpc-connect - How to set up a Connect protocol service (HTTP/2-based RPC) within Encore using Protocol Buffers, including service definition, implementation, and testing.

- https://encore.dev/docs/go/how-to/pubsub-outbox - How to implement a transactional outbox pattern with Encore's Pub/Sub system to ensure consistency between database writes and message publishing.

- https://encore.dev/docs/go/how-to/dependency-injection - How to implement dependency injection in Encore's Go microservices using service structs with `//encore:service` directive and interface-based mocking for testing.

- https://encore.dev/docs/go/how-to/auth0-auth - How to integrate Auth0 authentication into an Encore backend with auth handler setup, credential configuration, and React frontend implementation.

- https://encore.dev/docs/go/how-to/clerk-auth - How to integrate Clerk authentication into an Encore backend with auth handler setup, secrets configuration, and React SDK frontend implementation.

- https://encore.dev/docs/go/how-to/firebase-auth - How to integrate Firebase Authentication into an Encore backend with auth handler setup, Firebase SDK initialization, and token validation configuration.

- https://encore.dev/docs/go/how-to/logto-auth - How to integrate Logto authentication with an Encore backend using JWT token validation, plus React frontend configuration for access tokens.

## Migration

- https://encore.dev/docs/go/migration/migrate-away - How to migrate away from Encore, emphasizing minimal lock-in with only ~1% framework-specific code and practical migration tools like `encore build docker`.

## Community

- https://encore.dev/docs/go/community/get-involved - Ways developers can engage with the Encore open-source community including contributing code on GitHub, connecting on Discord, and providing roadmap feedback.

- https://encore.dev/docs/go/community/contribute - Various ways to contribute to the Encore open source project including pull requests, bug reports, documentation improvements, and community organizing.

- https://encore.dev/docs/go/community/open-source - Encore's open source licensing under Mozilla Public License 2.0 and invitation to contribute on GitHub.

- https://encore.dev/docs/go/community/principles - Encore community's commitment to inclusivity requiring all members to follow the Contributor Covenant 2.0 Code of Conduct.

- https://encore.dev/docs/go/community/submit-template - How to contribute templates to Encore's open-source examples repository including Starters (complete applications) and Bits (reusable code samples).
