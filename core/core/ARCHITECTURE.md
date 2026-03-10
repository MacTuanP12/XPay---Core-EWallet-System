# XPay - Core EWallet System Architecture

## 1. Architectural Style: Modular Monolith
The XPay system is built on a **Modular Monolith** architecture. Instead of organizing code by technical layers (e.g., grouping all controllers together or all services together), the system is organized by **Business Features / Domains** (Package by Feature).

This approach applies Domain-Driven Design (DDD) principles, offering several enterprise-grade benefits:
* **High Cohesion:** All components related to a specific business rule (e.g., Transactions) are physically located together.
* **Low Coupling:** Modules interact with each other through well-defined service interfaces, minimizing unintended side effects.
* **Scalability:** If the system grows, extracting a specific module (like `transaction`) into a standalone Microservice is straightforward.

## 2. Directory Structure Breakdown

The project resides within the root package `com.xpay.core` and is divided into two main categories: **Cross-Cutting Concerns** and **Business Modules**.

### 2.1. Cross-Cutting Concerns (Global Scope)
These packages handle system-wide operations and utilities:
* **`config/`**: Contains system configurations such as Spring Security (JWT filters), Database Dialects (MySQL), and OpenAPI/Swagger documentation setups.
* **`exception/`**: Implements global exception handling using `@ControllerAdvice`. It catches domain-specific exceptions (e.g., `InsufficientBalanceException`) and maps them to standardized, secure JSON API responses to prevent server stack trace leakage.
* **`common/`**: Houses shared resources utilized across multiple modules, including:
    * `BaseEntity`: An abstract JPA superclass providing audit fields (`id`, `created_at`, `updated_at`).
    * `ApiResponse`: A generic wrapper for standardizing RESTful payload responses.
    * Utility classes (e.g., `SecurityUtils` for extracting the authenticated user).

### 2.2. Business Modules (`modules/`)
The core functionalities are encapsulated within three primary domains:
1. **`identity/`**: Handles Identity and Access Management (IAM), including User Registration, JWT-based Authentication, and Role-Based Access Control (RBAC).
2. **`wallet/`**: Manages user digital wallets, balances, and states. Implements Optimistic Locking mechanism to ensure data consistency during concurrent updates.
3. **`transaction/`**: The core ledger engine. Handles peer-to-peer (P2P) money transfers with strict adherence to ACID properties using Spring's `@Transactional` and Idempotency keys to prevent double-spending.

## 3. Layered Data Flow (Inside each Module)
To strictly enforce the Separation of Concerns (SoC), data flows sequentially through the following layers within a module:

`Client Request -> Controller -> DTO -> Service -> Entity -> Repository -> MySQL Database`

1. **`controller/` (Presentation Layer):** Exposes RESTful endpoints. Responsible ONLY for handling HTTP requests/responses and input validation. No business logic resides here.
2. **`dto/` (Data Transfer Object):** Separated into `request/` and `response/`. Acts as a secure boundary, ensuring sensitive database fields (like password hashes or internal statuses) are never directly exposed to the client.
3. **`service/` (Business Logic Layer):** The "brain" of the module. Validates business rules, manages transaction boundaries, and orchestrates data transformations between DTOs and Entities.
4. **`entity/` (Domain Model):** Plain Old Java Objects (POJOs) mapped to MySQL database tables using JPA/Hibernate.
5. **`repository/` (Data Access Layer):** Spring Data JPA interfaces for database interactions, isolating SQL queries from the business logic.