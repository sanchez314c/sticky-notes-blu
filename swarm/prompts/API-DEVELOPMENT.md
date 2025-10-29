# 📊 SWARMV5 API DEVELOPMENT KICK-OFF PROMPT
## Complete Autonomous API Development & Documentation Framework

> **CRITICAL**: This is the master execution prompt for launching complete autonomous API development workflows. Execute ALL phases systematically with parallel optimization while ensuring scalability and documentation.

---

## 📝 API DEVELOPMENT TARGET INPUT SECTION
**Describe your API development needs between the brackets below:**

[ Build comprehensive RESTful API with authentication, real-time features, and GraphQL endpoint for e-commerce platform with order management, user accounts, and payment processing ]

*Example: Create microservices API architecture with OAuth2 authentication, Redis caching, WebSocket support, and comprehensive OpenAPI documentation*

---

## 🎯 PRIMARY MISSION

**DEVELOP ROBUST, SCALABLE, WELL-DOCUMENTED API INFRASTRUCTURE**

You are the **SWARM API MASTER** - an autonomous AI API development system capable of:
- 🧠 **Complete API Architecture** - RESTful, GraphQL, and real-time API design
- ⚡ **Autonomous Implementation** - Full-stack API development with best practices
- 🔄 **Auto-Documentation** - Comprehensive API docs, testing, and client SDKs
- 🚀 **Production-Ready Deployment** - Security, monitoring, and scalability integration
- 🎯 **API Ecosystem Creation** - Complete developer experience with tools and testing

---

## 🔍 PHASE 1: API ANALYSIS & ARCHITECTURE PLANNING
### Execute ALL analysis tasks in PARALLEL

```bash
# PHASE 0: API REQUIREMENTS ANALYSIS - 8 PARALLEL SWARMS
opencode run -m "anthropic/claude-sonnet-4-20250514" "API REQUIREMENTS ANALYSIS: Analyze the API requirements for [APP_IDEA]. Identify endpoints, data models, authentication needs, rate limiting, and integration requirements." > outputs/session_outputs/analysis_api_requirements.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "API ARCHITECTURE ANALYSIS: Design comprehensive API architecture for [APP_IDEA]. Consider microservices vs monolithic, database design, caching strategy, and scalability patterns." > outputs/session_outputs/analysis_api_architecture.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "API SECURITY ANALYSIS: Plan comprehensive security strategy for [APP_IDEA]. Consider authentication, authorization, OWASP compliance, rate limiting, and data protection." > outputs/session_outputs/analysis_api_security.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "API PERFORMANCE ANALYSIS: Design performance optimization strategy for [APP_IDEA]. Consider caching, database optimization, CDN integration, and response time optimization." > outputs/session_outputs/analysis_api_performance.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "API DOCUMENTATION ANALYSIS: Plan comprehensive documentation strategy for [APP_IDEA]. Consider OpenAPI specs, interactive docs, SDK generation, and developer experience." > outputs/session_outputs/analysis_api_documentation.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "API TESTING ANALYSIS: Design comprehensive testing strategy for [APP_IDEA]. Consider unit tests, integration tests, load testing, and automated API testing." > outputs/session_outputs/analysis_api_testing.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "API MONITORING ANALYSIS: Plan monitoring and analytics strategy for [APP_IDEA]. Consider APM, error tracking, usage analytics, and performance monitoring." > outputs/session_outputs/analysis_api_monitoring.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "API DEPLOYMENT ANALYSIS: Design deployment and DevOps strategy for [APP_IDEA]. Consider containerization, CI/CD, cloud deployment, and scaling strategies." > outputs/session_outputs/analysis_api_deployment.txt &
wait
```

---

## 🏗️ PHASE 2: API FOUNDATION IMPLEMENTATION
### Parallel Infrastructure Development

```bash
# PHASE 1: API FOUNDATION - 6 PARALLEL SWARMS
opencode run -m "anthropic/claude-sonnet-4-20250514" "API PROJECT SETUP: Initialize complete API project structure for [APP_IDEA]. Set up development environment, dependencies, configuration, and build tools." > outputs/session_outputs/setup_api_project.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "DATABASE DESIGN IMPLEMENTATION: Implement database schema and models for [APP_IDEA]. Create migrations, seed data, relationships, and data validation." > outputs/session_outputs/setup_api_database.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "AUTHENTICATION SYSTEM: Implement comprehensive authentication and authorization for [APP_IDEA]. Include JWT tokens, OAuth2, role-based access, and session management." > outputs/session_outputs/setup_api_auth.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "API MIDDLEWARE IMPLEMENTATION: Develop middleware stack for [APP_IDEA]. Include CORS, rate limiting, logging, error handling, and request validation." > outputs/session_outputs/setup_api_middleware.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "API ROUTING FRAMEWORK: Implement routing and controller structure for [APP_IDEA]. Create base controllers, route definitions, and request handling patterns." > outputs/session_outputs/setup_api_routing.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "API VALIDATION SYSTEM: Implement comprehensive input validation and sanitization for [APP_IDEA]. Include schema validation, data transformation, and error responses." > outputs/session_outputs/setup_api_validation.txt &
wait
```

---

## 🚀 PHASE 3: CORE API DEVELOPMENT
### Comprehensive Endpoint Implementation

```bash
# PHASE 2: CORE API DEVELOPMENT - 8 PARALLEL SWARMS
opencode run -m "anthropic/claude-sonnet-4-20250514" "REST API ENDPOINTS: Implement all RESTful endpoints for [APP_IDEA]. Create CRUD operations, advanced queries, filtering, pagination, and sorting." > outputs/session_outputs/implement_rest_endpoints.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "GRAPHQL API IMPLEMENTATION: Develop GraphQL schema and resolvers for [APP_IDEA]. Create type definitions, query optimization, and subscription support." > outputs/session_outputs/implement_graphql_api.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "REAL-TIME FEATURES: Implement WebSocket and real-time functionality for [APP_IDEA]. Create event systems, live updates, notifications, and real-time synchronization." > outputs/session_outputs/implement_realtime_features.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "FILE HANDLING SYSTEM: Implement file upload, processing, and management for [APP_IDEA]. Create file validation, storage optimization, and media handling." > outputs/session_outputs/implement_file_handling.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "SEARCH FUNCTIONALITY: Implement search and filtering capabilities for [APP_IDEA]. Create full-text search, advanced filters, autocomplete, and search optimization." > outputs/session_outputs/implement_search_features.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "PAYMENT INTEGRATION: Implement payment processing and financial operations for [APP_IDEA]. Create payment gateways, transaction handling, and financial security." > outputs/session_outputs/implement_payment_system.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "NOTIFICATION SYSTEM: Implement comprehensive notification system for [APP_IDEA]. Create email, SMS, push notifications, and notification preferences." > outputs/session_outputs/implement_notification_system.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "THIRD-PARTY INTEGRATIONS: Implement external API integrations for [APP_IDEA]. Create service connectors, webhook handling, and integration management." > outputs/session_outputs/implement_integrations.txt &
wait
```

---

## 📚 PHASE 4: DOCUMENTATION & SDK GENERATION
### Comprehensive Developer Experience

```bash
# PHASE 3: DOCUMENTATION & SDK - 6 PARALLEL SWARMS
opencode run -m "anthropic/claude-sonnet-4-20250514" "OPENAPI DOCUMENTATION: Generate comprehensive OpenAPI/Swagger documentation for [APP_IDEA]. Create detailed schemas, examples, and interactive documentation." > outputs/session_outputs/generate_openapi_docs.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "INTERACTIVE API DOCUMENTATION: Create interactive API documentation portal for [APP_IDEA]. Include testing interface, code examples, and developer guides." > outputs/session_outputs/generate_interactive_docs.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "SDK GENERATION: Generate client SDKs for multiple languages for [APP_IDEA]. Create JavaScript, Python, PHP, and other language SDKs with full functionality." > outputs/session_outputs/generate_client_sdks.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "API TESTING SUITE: Create comprehensive testing suite for [APP_IDEA]. Include unit tests, integration tests, contract tests, and load testing scenarios." > outputs/session_outputs/generate_api_tests.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "DEVELOPER GUIDES: Create comprehensive developer documentation for [APP_IDEA]. Include getting started guides, tutorials, best practices, and troubleshooting." > outputs/session_outputs/generate_developer_guides.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "POSTMAN COLLECTIONS: Generate Postman collections and environments for [APP_IDEA]. Create comprehensive testing collections with automated workflows." > outputs/session_outputs/generate_postman_collections.txt &
wait
```

---

## 🔧 PHASE 5: OPTIMIZATION & DEPLOYMENT
### Production-Ready Implementation

```bash
# PHASE 4: OPTIMIZATION & DEPLOYMENT - 8 PARALLEL SWARMS
opencode run -m "anthropic/claude-sonnet-4-20250514" "PERFORMANCE OPTIMIZATION: Implement comprehensive performance optimizations for [APP_IDEA]. Optimize database queries, caching, response times, and resource usage." > outputs/session_outputs/optimize_api_performance.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "CACHING IMPLEMENTATION: Implement multi-layer caching strategy for [APP_IDEA]. Create Redis caching, response caching, database query caching, and cache invalidation." > outputs/session_outputs/implement_api_caching.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "MONITORING SETUP: Implement comprehensive monitoring and analytics for [APP_IDEA]. Create APM integration, error tracking, usage analytics, and performance dashboards." > outputs/session_outputs/setup_api_monitoring.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "SECURITY HARDENING: Implement advanced security measures for [APP_IDEA]. Create rate limiting, DDoS protection, security headers, and vulnerability scanning." > outputs/session_outputs/implement_api_security.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "CONTAINERIZATION: Create Docker containers and orchestration for [APP_IDEA]. Implement containerization, multi-stage builds, and container optimization." > outputs/session_outputs/containerize_api.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "CI/CD PIPELINE: Implement continuous integration and deployment for [APP_IDEA]. Create automated testing, deployment pipelines, and rollback strategies." > outputs/session_outputs/setup_api_cicd.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "CLOUD DEPLOYMENT: Deploy API to production cloud environment for [APP_IDEA]. Implement auto-scaling, load balancing, and high availability." > outputs/session_outputs/deploy_api_production.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "API VERSIONING: Implement API versioning and backwards compatibility for [APP_IDEA]. Create version management, deprecation strategies, and migration guides." > outputs/session_outputs/implement_api_versioning.txt &
wait
```

---

## 🎯 COMPLETION VALIDATION
### Comprehensive API Quality Assurance

```bash
# FINAL VALIDATION - 4 PARALLEL SWARMS
opencode run -m "anthropic/claude-sonnet-4-20250514" "API FUNCTIONALITY VALIDATION: Validate all API endpoints and functionality for [APP_IDEA]. Test CRUD operations, edge cases, error handling, and performance." > outputs/session_outputs/validate_api_functionality.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "SECURITY VALIDATION: Perform comprehensive security testing for [APP_IDEA]. Test authentication, authorization, input validation, and vulnerability scanning." > outputs/session_outputs/validate_api_security.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "PERFORMANCE VALIDATION: Conduct load testing and performance validation for [APP_IDEA]. Test throughput, response times, concurrent users, and scalability." > outputs/session_outputs/validate_api_performance.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "DOCUMENTATION VALIDATION: Validate API documentation accuracy and completeness for [APP_IDEA]. Test code examples, SDK functionality, and developer experience." > outputs/session_outputs/validate_api_documentation.txt &
wait
```

---

## ⏱️ TIMELINE ESTIMATION

**API Development Scope Selection:**

### 🚀 Core API Types:
- REST API development (CRUD operations, authentication, validation)
- GraphQL API (Schema design, resolvers, subscriptions, optimization)
- Real-time API (WebSocket connections, live updates, event streaming)
- Microservices API (Service architecture, inter-service communication, orchestration)
- Public API (Rate limiting, developer portal, SDK generation, monetization)
- Internal API (Service integration, data aggregation, business logic, automation)

**Choose your API development approach:**
- `rapid-api` - 1-2 weeks, essential API with core functionality and basic documentation
- `comprehensive-api` - 3-6 weeks, complete API ecosystem with full documentation and SDKs
- `enterprise-api` - 6-12 weeks, enterprise-grade with advanced security and monitoring
- `public-api` - 4-8 weeks, developer-focused with comprehensive portal and tools

**Describe your API requirements, target users, and integration needs. I'll autonomously analyze, architect, and implement comprehensive API infrastructure with full documentation and tooling.**

---

> 🎯 **FINAL DIRECTIVE**: Execute this prompt by describing your API requirements and use cases. I will autonomously orchestrate the complete API development lifecycle from architecture to deployment using the SWARMV5 framework's intelligent API development capabilities.

**The framework is initialized and ready. What API ecosystem shall we build?**