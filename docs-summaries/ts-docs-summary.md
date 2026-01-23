# Encore.ts Documentation Summary

## Main

- https://encore.dev/docs/ts - Main overview for Encore.ts, a high-performance TypeScript API framework that helps developers build production-ready backend applications with built-in infrastructure management and observability tools.
- https://encore.dev/docs/ts/install - Installation instructions for the Encore CLI, covering system prerequisites (Node.js and Docker), installation methods for different operating systems, and how to update to the latest version.
- https://encore.dev/docs/ts/quick-start - Quick-start guide for building a backend application with Encore.ts in approximately 5 minutes, covering installation, app creation, local development, code changes, and cloud deployment.
- https://encore.dev/docs/ts/ai-integration - Explains how to integrate Encore with AI coding assistants like Cursor and Claude Code using MCP (Model Context Protocol), enabling AI to understand your application architecture and generate type-safe code.
- https://encore.dev/docs/ts/faq - Addresses common questions about Encore including open-source status, language support (Go and TypeScript), cloud provider compatibility (AWS, GCP), database options (PostgreSQL), IDE integrations, and troubleshooting tips.

## Concepts

- https://encore.dev/docs/ts/concepts/benefits - Outlines the key advantages of using Encore.ts for backend development, highlighting its integrated developer experience, high-performance Rust runtime, enhanced TypeScript type-safety, and simplified cloud deployment.
- https://encore.dev/docs/ts/concepts/application-model - Explains how Encore uses static analysis to create an "Encore Application Model" – a graph representation of your application's architecture, services, and infrastructure connections for automatic documentation and provisioning.
- https://encore.dev/docs/ts/concepts/hello-world - Introduces the fundamentals of Encore.ts by demonstrating how to build a production-ready API endpoint in less than 10 lines of code using a declarative approach.

## Tutorials

- https://encore.dev/docs/ts/tutorials/rest-api - Comprehensive tutorial guiding developers through building a URL shortener REST API using Encore.ts, including database integration with PostgreSQL, testing, and deployment options.
- https://encore.dev/docs/ts/tutorials/uptime - Tutorial demonstrating how to build a complete event-driven uptime monitoring system in 30 minutes, including website health checks, database storage, cron jobs, Pub/Sub messaging, and Slack notifications.
- https://encore.dev/docs/ts/tutorials/graphql - Tutorial teaching developers how to build a GraphQL API using Encore.ts and Apollo Server, creating a type-safe backend with automatic tracing capabilities.
- https://encore.dev/docs/ts/tutorials/slack-bot - Tutorial guiding developers through building a production-ready Slack bot implementing a `/cowsay` slash command with webhook verification and cloud deployment.

## Primitives

- https://encore.dev/docs/ts/primitives/app-structure - Explains how to structure Encore applications using a monorepo design, covering approaches from single-service to large multi-system architectures with `encore.service.ts` files.
- https://encore.dev/docs/ts/primitives/services - Explains how to create services in Encore.ts by creating an `encore.service.ts` file that exports a Service instance for defining microservices.
- https://encore.dev/docs/ts/primitives/defining-apis - Explains how to create type-safe API endpoints in Encore.ts using async functions with TypeScript interfaces, covering exposure levels, authentication, parameter handling, and special features.
- https://encore.dev/docs/ts/primitives/validation - Explains how Encore.ts handles request validation for API endpoints, covering supported data types, optional fields, value-based validation rules, and parsing data from various sources.
- https://encore.dev/docs/ts/primitives/api-calls - Explains how to make service-to-service API calls using the `~encore/clients` module, providing a monolith-like developer experience while maintaining service separation.
- https://encore.dev/docs/ts/primitives/raw-endpoints - Explains how to define raw HTTP endpoints using `api.raw` for direct access to HTTP request/response objects, similar to Express.js, for scenarios like webhooks.
- https://encore.dev/docs/ts/primitives/graphql - Explains how to build a GraphQL API using raw endpoints to integrate with libraries like Apollo, demonstrating distributed tracing and resolver wrappers.
- https://encore.dev/docs/ts/primitives/streaming-apis - Explains how to create type-safe streaming API endpoints enabling bidirectional data flow between clients and servers using WebSocket connections.
- https://encore.dev/docs/ts/primitives/errors - Documents Encore's standardized approach to API error handling using `APIError` exceptions with specific error codes that map to gRPC standards and HTTP status codes.
- https://encore.dev/docs/ts/primitives/static-assets - Explains how to serve static assets (images, HTML, CSS, JavaScript) using the `api.static()` function, including path configuration and fallback routes.
- https://encore.dev/docs/ts/primitives/cookies - Explains how to implement type-safe cookie handling in Encore.ts API endpoints, covering authentication handlers, response cookies, and configuration options.
- https://encore.dev/docs/ts/primitives/types - Explains how TypeScript types are used in Encore.ts API schemas and introduces the `Decimal` type for handling precise financial calculations.
- https://encore.dev/docs/ts/primitives/databases - Documents how to use PostgreSQL databases with Encore, covering database creation through `SQLDatabase`, schema management, querying, transactions, and troubleshooting.
- https://encore.dev/docs/ts/primitives/databases-extensions - Documents pre-installed PostgreSQL extensions available in Encore's development and cloud environments, including PostGIS, pgcrypto, and vector support.
- https://encore.dev/docs/ts/primitives/object-storage - Provides documentation on using Object Storage in Encore.ts, covering bucket creation, file upload/download, listing objects, and managing public access through a cloud-agnostic API.
- https://encore.dev/docs/ts/primitives/cron-jobs - Explains how to create and manage recurring tasks using the Cron Jobs API with periodic schedules and cron expressions.
- https://encore.dev/docs/ts/primitives/pubsub - Explains how to implement Publisher-Subscriber messaging, covering topic creation, publishing/subscribing, delivery guarantees, message attributes, and topic references.
- https://encore.dev/docs/ts/primitives/secrets - Explains how to securely store and manage API keys and secrets using Encore's built-in secrets manager with encryption and environment-specific configuration.

## Develop

- https://encore.dev/docs/ts/develop/auth - Explains how to implement authentication in Encore APIs, covering authentication handler creation, data flow between endpoints, and testing approaches.
- https://encore.dev/docs/ts/develop/orms - Explains how to integrate ORM tools and migration frameworks with Encore.ts through the SQLDatabase class for tools like Prisma, Drizzle, Sequelize, and Knex.js.
- https://encore.dev/docs/ts/develop/orms/knex - Explains how to integrate Knex.js SQL query builder with Encore.ts, covering database connection setup and automatic migration handling.
- https://encore.dev/docs/ts/develop/orms/prisma - Explains how to integrate Prisma ORM with Encore.ts for database management, covering setup through deployment.
- https://encore.dev/docs/ts/develop/orms/drizzle - Provides a guide for integrating Drizzle ORM with Encore.ts, covering database connection, schema definition, and migration handling.
- https://encore.dev/docs/ts/develop/orms/sequelize - Explains how to integrate Sequelize ORM with Encore.ts, covering database setup and automatic migration application.
- https://encore.dev/docs/ts/develop/metadata - Documents the Metadata API for getting information about the app and environment through functions like `appMeta()` and `currentRequest()`.
- https://encore.dev/docs/ts/develop/testing - Explains how to set up automated testing using Vitest as the recommended test runner, covering configuration, IDE integration, and integration testing best practices.
- https://encore.dev/docs/ts/develop/debug - Explains how to debug TypeScript applications using IDE debuggers with `encore run --debug=break` and instructions for VS Code and WebStorm.
- https://encore.dev/docs/ts/develop/middleware - Explains how to implement middleware for reusable cross-cutting concerns like logging and authentication, covering function creation, ordering, and targeting.
- https://encore.dev/docs/ts/develop/multithreading - Explains how Encore.ts achieves true multithreading through a Rust runtime and Worker Pooling to distribute CPU-intensive workloads across multiple Node.js event loops.
- https://encore.dev/docs/ts/develop/running-scripts - Explains how to use `encore exec` to run scripts and custom commands within an initialized infrastructure environment for tasks like database seeding.
- https://encore.dev/docs/ts/develop/env-vars - Documents environment variables that configure Encore's development environment, covering daemon settings, logging, and debugging options.

## CLI

- https://encore.dev/docs/ts/cli/cli-reference - Comprehensive reference guide for the Encore CLI, detailing all available commands for running applications, authentication, databases, code generation, and deployment.
- https://encore.dev/docs/ts/cli/client-generation - Explains how Encore automatically generates type-safe API clients for multiple languages using `encore gen client`, covering configuration and usage with authentication.
- https://encore.dev/docs/ts/cli/infra-namespaces - Documents infrastructure namespaces for creating and switching between multiple independent infrastructure namespaces with isolated data.
- https://encore.dev/docs/ts/cli/config-reference - Explains how to customize CLI behavior through configuration files, covering global and application-specific settings.
- https://encore.dev/docs/ts/cli/telemetry - Explains Encore's telemetry system including what data is collected, what is not collected, and how to disable or debug telemetry.
- https://encore.dev/docs/ts/cli/mcp - Documents Encore's Model Context Protocol (MCP) server implementation for connecting AI tools like Claude Desktop and Cursor with comprehensive tools for database, API, and tracing capabilities.

## Frontend

- https://encore.dev/docs/ts/frontend/hosting - Explains how to integrate a frontend with Encore backend, describing approaches using template engines or static asset endpoints while recommending dedicated hosting services.
- https://encore.dev/docs/ts/frontend/cors - Explains how to configure Cross-Origin Resource Sharing (CORS) in the `encore.app` file with guidance on security best practices.
- https://encore.dev/docs/ts/frontend/request-client - Explains how to generate and use type-safe frontend request clients, covering integration with state management libraries and testing approaches.
- https://encore.dev/docs/ts/frontend/template-engine - Guide for integrating template engines like EJS and Handlebars into Encore.ts applications for server-rendered HTML views.
- https://encore.dev/docs/ts/frontend/mono-vs-multi-repo - Explains how to structure a full-stack application with two architectural approaches: separated folders within a monorepo or frontend inside the Encore app directory.

## Observability

- https://encore.dev/docs/ts/observability/dev-dash - Documents the Local Development Dashboard providing Service Catalog, API Explorer, Distributed Tracing, and Encore Flow visualization in real-time.
- https://encore.dev/docs/ts/observability/logging - Explains Encore's built-in structured logging combining free-form messages with type-safe key-value pairs using `log.info()`, `log.error()`, and `log.with()`.
- https://encore.dev/docs/ts/observability/tracing - Explains how distributed tracing helps understand application behavior by automatically capturing traces across services with sensitive data redaction.
- https://encore.dev/docs/ts/observability/flow - Describes Encore Flow, a visual tool for microservices architecture providing always up-to-date system views with interactive diagrams and real-time updates.
- https://encore.dev/docs/ts/observability/service-catalog - Explains how Encore automatically generates and maintains up-to-date API documentation through its Service Catalog feature.
- https://encore.dev/docs/ts/observability/metrics - Explains how to define and use custom metrics including counters and gauges with labels and function references.

## Self-Host

- https://encore.dev/docs/ts/self-host/ci-cd - Explains how to integrate Encore with CI/CD pipelines by automating Docker image creation with GitHub Actions workflow examples.
- https://encore.dev/docs/ts/self-host/build - Explains how to build Docker images for Encore applications using `encore build docker` for self-hosting on custom infrastructure.
- https://encore.dev/docs/ts/self-host/configure-infra - Provides comprehensive guidance on configuring infrastructure resources when self-hosting, including databases, Pub/Sub, object storage, and secrets.
- https://encore.dev/docs/ts/self-host/deploy-digitalocean - Step-by-step instructions for deploying an Encore TypeScript application to DigitalOcean's App Platform using Docker.
- https://encore.dev/docs/ts/self-host/deploy-railway - Comprehensive guide for deploying an Encore TypeScript application to Railway using Docker and GitHub Actions with database integration.

## How-To

- https://encore.dev/docs/ts/how-to/file-uploads - Guide for handling file uploads in Encore.ts, covering single and multiple file uploads stored in PostgreSQL and retrieving files through GET endpoints.
- https://encore.dev/docs/ts/how-to/nestjs - Guide for integrating NestJS with Encore, using Encore's infrastructure primitives alongside NestJS's architectural framework.

## Migration

- https://encore.dev/docs/ts/migration/migrate-away - Explains Encore's approach to minimizing vendor lock-in and how developers can migrate away through code changes, self-hosting, and Docker deployment.
- https://encore.dev/docs/ts/migration/express-migration - Comprehensive guide for migrating applications from Express.js to Encore.ts with two main strategies and feature-by-feature comparisons.

## Community

- https://encore.dev/docs/ts/community/get-involved - Describes how to engage with Encore's open-source community through GitHub, Discord, and Twitter for contributions and feedback.
- https://encore.dev/docs/ts/community/contribute - Outlines pathways for contributing including pull requests, bug reports, documentation improvements, and community organizing.
- https://encore.dev/docs/ts/community/open-source - Explains that Encore is open source software licensed under Mozilla Public License 2.0 allowing code modifications with proprietary combinations.
- https://encore.dev/docs/ts/community/principles - Outlines the community's commitment to inclusivity following the Contributor Covenant 2.0 Code of Conduct.
- https://encore.dev/docs/ts/community/submit-template - Instructions for contributing templates to Encore's open-source examples repository as either Starters or Bits.
