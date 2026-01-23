# Encore Platform Documentation Summary

This file contains summaries of Encore Cloud Platform documentation pages for LLM context.

## Overview

- https://encore.dev/docs/platform - Landing hub for Encore Cloud documentation, highlighting that the platform automates DevOps and infrastructure management on AWS and GCP to accelerate development.

- https://encore.dev/docs/platform/introduction - Introduction to Encore Cloud, an end-to-end development platform that simplifies building cloud-based backend applications by automating infrastructure management, deployment, and DevOps tasks across environments on AWS and GCP.

## Deployment

- https://encore.dev/docs/platform/deploy/deploying - Guide to deploying applications on Encore Cloud, covering account creation, optional GitHub integration, cloud account connection, and pushing code to trigger automated deployment.

- https://encore.dev/docs/platform/deploy/own-cloud - How to connect Encore Cloud to your own cloud account for deployment, with step-by-step instructions for GCP and AWS configuration including troubleshooting guidance.

- https://encore.dev/docs/platform/deploy/environments - How Encore automatically creates and manages different application environments (local, preview, development, production), each fully isolated with appropriate infrastructure, including deployment triggers and configuration.

- https://encore.dev/docs/platform/deploy/preview-environments - Encore Cloud's Preview Environments feature that automatically creates temporary, isolated development environments for each pull request, including Neon database branching for test data.

- https://encore.dev/docs/platform/deploy/security - How Encore Cloud implements security by default, covering built-in features like zero-config security, automated IAM management, TLSv1.3 encryption, and secure database access with certificate validation.

## Infrastructure

- https://encore.dev/docs/platform/infrastructure/infra - How Encore Cloud automatically provisions cloud infrastructure across different environment types without code changes, detailing specific services used on AWS and GCP with infrastructure declared as type-safe code.

- https://encore.dev/docs/platform/infrastructure/configuration - How to configure infrastructure when using Encore Cloud, covering initial environment setup and ongoing configuration through dashboard or cloud provider console with PATCH-style updates.

- https://encore.dev/docs/platform/infrastructure/gcp - How Encore Cloud automatically provisions and manages GCP infrastructure including networking, container management, compute options (Cloud Run or GKE), and managed services.

- https://encore.dev/docs/platform/infrastructure/gcp/import-cloud-sql - How to connect an existing Cloud SQL database instance to an Encore deployment, covering import process, permissions, database mapping, and migration handling.

- https://encore.dev/docs/platform/infrastructure/gcp/import-project - How to deploy an Encore application to an existing GCP project rather than provisioning a new one, including IAM permission setup.

- https://encore.dev/docs/platform/infrastructure/configure-network - How to configure custom IP ranges for Encore Cloud environments to enable network peering while avoiding IP conflicts, with AWS and GCP instructions.

- https://encore.dev/docs/platform/infrastructure/aws - How Encore Cloud automatically provisions and manages AWS infrastructure including multi-AZ VPCs, compute options (Fargate and EKS), and managed services.

- https://encore.dev/docs/platform/infrastructure/aws/import-rds - How to connect an Encore application to an existing AWS RDS database instance, covering import process, database mapping, and migration management.

- https://encore.dev/docs/platform/infrastructure/kubernetes - How to deploy Encore applications to Kubernetes clusters, either automatically provisioned or existing, with details on Encore's management of K8s components.

- https://encore.dev/docs/platform/infrastructure/import-kubernetes-cluster - How to deploy Encore applications to an existing Kubernetes cluster rather than provisioning a new one, currently supporting GCP.

- https://encore.dev/docs/platform/infrastructure/configure-kubectl - How to configure kubectl to access and authenticate with Encore-managed Kubernetes clusters for manual cluster inspection.

- https://encore.dev/docs/platform/infrastructure/neon - How to configure Encore Cloud to use Neon serverless Postgres, including setup, environment creation, and automatic role hierarchy for secure database access.

- https://encore.dev/docs/platform/infrastructure/cloudflare - How Encore Cloud simplifies Cloudflare R2 object storage integration by automatically provisioning and managing buckets, public access, and security controls.

- https://encore.dev/docs/platform/infrastructure/manage-db-users - How to access and view database user credentials for Encore Cloud-provisioned databases through the dashboard's Infrastructure section.

## Observability

- https://encore.dev/docs/platform/observability/metrics - How to monitor backend applications using Encore's metrics system with custom metrics in the Cloud Dashboard and integration with third-party services like Grafana Cloud and Datadog.

- https://encore.dev/docs/platform/observability/tracing - Encore's distributed tracing capabilities that automatically capture detailed insights across applications without manual instrumentation, including sensitive data redaction.

- https://encore.dev/docs/platform/observability/encore-flow - Encore Flow, an automatic visualization tool for microservices architecture providing real-time interactive diagrams of service dependencies and Pub/Sub topics.

- https://encore.dev/docs/platform/observability/service-catalog - How Encore automatically generates and maintains a Service Catalog with complete API documentation synchronized with the codebase.

## Integrations

- https://encore.dev/docs/platform/integrations/github - How to integrate an Encore backend with GitHub for source code hosting, continuous deployment, and automatic preview environment provisioning for pull requests.

- https://encore.dev/docs/platform/integrations/custom-domains - How to configure custom domains for Encore Cloud environments including DNS setup, domain provisioning, and built-in Cloudflare WAF protection.

- https://encore.dev/docs/platform/integrations/webhooks - How to set up and use webhooks in Encore Cloud to receive HTTP notifications for specific events, including signature verification and replay attack prevention.

- https://encore.dev/docs/platform/integrations/oauth-clients - How to set up and use OAuth clients for delegated, scoped access to the Encore Cloud API including credential creation, role management, and token generation.

- https://encore.dev/docs/platform/integrations/auth-keys - How to generate and use authentication keys with Encore's CLI for automated CI/CD authentication, covering reusable and ephemeral key types.

- https://encore.dev/docs/platform/integrations/api-reference - Comprehensive reference for the Encore Cloud API covering authentication, triggering rollouts, and managing application members through invitations and permissions.

- https://encore.dev/docs/platform/integrations/terraform - How to integrate Encore-provisioned cloud resources with existing infrastructure using Terraform, including provider configuration and read-only data sources.

## Migration

- https://encore.dev/docs/platform/migration/migrate-to-encore - Two strategies for migrating existing systems to Encore: service-by-service approach (recommended) running alongside legacy systems, or forklift migration moving entire applications at once.

- https://encore.dev/docs/platform/migration/migrate-away - How to migrate away from Encore with minimal lock-in, noting less than 1% Encore-specific code and tools like `encore build docker` for self-hosted transitions.

## Management

- https://encore.dev/docs/platform/management/compliance - Encore's security and compliance practices implementing SOC 2 trust service criteria across security, availability, confidentiality, processing integrity, and privacy.

- https://encore.dev/docs/platform/management/billing - Encore's pricing structure and billing details including free plan, Pro plan at $49 per member/month, DevOps automation costs, and payment FAQs.

- https://encore.dev/docs/platform/management/telemetry - Encore's telemetry collection practices detailing what data is gathered, what's excluded, and how to disable or debug telemetry through CLI or environment variables.

- https://encore.dev/docs/platform/management/permissions - Encore's three-tier role-based access control system with Admin, Member, and Viewer permissions, plus custom roles on Pro plan.

- https://encore.dev/docs/platform/management/usage - Encore Cloud's usage limits and fair use policies including 100,000 requests/day and 1GB database storage on the free development cloud.

## Comparisons

- https://encore.dev/docs/platform/other/vs-heroku - Comparison of Encore with Heroku PaaS, highlighting Encore's similar ease-of-use with push-to-deploy while avoiding vendor lock-in by deploying to user's own AWS/GCP accounts.

- https://encore.dev/docs/platform/other/vs-supabase - Comparison of Encore with Supabase and Firebase BaaS providers, highlighting Encore's deployment to user's own cloud accounts with microservices, event-driven systems, and type-safe infrastructure.

- https://encore.dev/docs/platform/other/vs-terraform - Comparison of Encore's infrastructure-from-code approach to traditional IaC tools like Terraform, explaining benefits of type-safe infrastructure objects within application code.
