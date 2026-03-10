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


 # XPay Database Schema Specification



**RDBMS:** MySQL 8+
**Collation:** `utf8mb4_unicode_ci` (Hỗ trợ lưu trữ đa ngôn ngữ)
**Engine:** InnoDB 

---

## 1. Table: `users`
Lưu trữ thông tin định danh và phục vụ xác thực (Authentication/Authorization).

| Column Name | Data Type (MySQL) | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK** | Khóa chính dạng UUID. |
| `username` | `VARCHAR(50)` | `NOT NULL`, **UNIQUE** | Tên đăng nhập. |
| `email` | `VARCHAR(100)`| `NOT NULL`, **UNIQUE** | Email liên hệ & khôi phục. |
| `password_hash`| `VARCHAR(255)`| `NOT NULL` | Mật khẩu đã băm (Bcrypt). |
| `role` | `VARCHAR(20)` | `NOT NULL` | Phân quyền: `ROLE_USER`, `ROLE_ADMIN`. |
| `kyc_status` | `VARCHAR(20)` | `NOT NULL` | Trạng thái định danh: `UNVERIFIED`, `VERIFIED`, `REJECTED`. |
| `created_at` | `DATETIME(6)` | `NOT NULL` | Thời gian tạo tài khoản. |
| `updated_at` | `DATETIME(6)` | `NULL` | Thời gian cập nhật gần nhất. |

---

## 2. Table: `wallets`
Quản lý trạng thái và số dư ví điện tử của người dùng.

| Column Name | Data Type (MySQL) | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK** | Khóa chính dạng UUID. |
| `user_id` | `VARCHAR(36)` | **FK**, **UNIQUE**, `NOT NULL` | Liên kết 1-1 với bảng `users`. |
| `balance` | `DECIMAL(19,4)`| `NOT NULL` | Số dư khả dụng. Không dùng FLOAT/DOUBLE. |
| `currency` | `VARCHAR(3)` | `NOT NULL` | Loại tiền tệ (VD: `VND`, `USD`). |
| `status` | `VARCHAR(20)` | `NOT NULL` | Trạng thái ví: `ACTIVE`, `LOCKED`, `CLOSED`. |
| `version` | `BIGINT` | `NULL` | Dùng cho cơ chế Optimistic Locking. |
| `created_at` | `DATETIME(6)` | `NOT NULL` | Thời gian mở ví. |
| `updated_at` | `DATETIME(6)` | `NULL` | Thời gian biến động số dư gần nhất. |

---

## 3. Table: `transactions`
Sổ cái (Ledger) ghi nhận mọi luồng di chuyển của dòng tiền. Bảng này tuân thủ nguyên tắc **Append-Only** (Chỉ thêm mới, không cập nhật/xóa sau khi thành công).

| Column Name | Data Type (MySQL) | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK** | Khóa chính dạng UUID. |
| `source_wallet_id`| `VARCHAR(36)` | **FK**, `NULL` | Ví chuyển tiền (Có thể NULL nếu là nạp tiền). |
| `destination_wallet_id`| `VARCHAR(36)` | **FK**, `NOT NULL` | Ví nhận tiền. |
| `amount` | `DECIMAL(19,4)`| `NOT NULL` | Số tiền giao dịch (> 0). |
| `transaction_type`| `VARCHAR(20)` | `NOT NULL` | Loại: `DEPOSIT`, `WITHDRAW`, `TRANSFER`. |
| `status` | `VARCHAR(20)` | `NOT NULL` | Trạng thái: `PENDING`, `SUCCESS`, `FAILED`. |
| `idempotency_key` | `VARCHAR(100)`| **UNIQUE**, `NULL` | Khóa chống Duplicate (Double-spending). |
| `reference_note` | `VARCHAR(255)`| `NULL` | Nội dung/Lời nhắn chuyển tiền. |
| `created_at` | `DATETIME(6)` | `NOT NULL` | Thời điểm khởi tạo giao dịch. |
| `updated_at` | `DATETIME(6)` | `NULL` | Thời điểm cập nhật trạng thái cuối cùng. |