# XPay – Core E-Wallet System

> Hệ thống ví điện tử nội bộ mô phỏng các nghiệp vụ FinTech cốt lõi: quản lý định danh, quản lý ví, chuyển tiền P2P và giám sát giao dịch.

---

## 📋 Mục lục

1. [Tổng quan](#-tổng-quan)
2. [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
3. [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
4. [Yêu cầu chức năng](#-yêu-cầu-chức-năng)
5. [Yêu cầu phi chức năng](#-yêu-cầu-phi-chức-năng)
6. [Cấu trúc dự án](#-cấu-trúc-dự-án)
7. [Cài đặt & Chạy](#-cài-đặt--chạy)
8. [API Overview](#-api-overview)
9. [Tài khoản mặc định](#-tài-khoản-mặc-định)

---

## 🚀 Tổng quan

**XPay Core E-Wallet System** là một dự án full-stack mô phỏng hệ thống ví điện tử cốt lõi, bao gồm:

- **Backend (Spring Boot):** REST API xử lý nghiệp vụ tài chính với bảo đảm ACID, chống lặp giao dịch (Idempotency) và xử lý đồng thời an toàn (Optimistic Locking).
- **Frontend (React + TypeScript):** Giao diện người dùng SPA với hai luồng riêng biệt – **User App** (xanh dương, tập trung số dư & chuyển tiền) và **Admin Dashboard** (sidebar, bảng biểu thống kê).

---

## 🏗 Kiến trúc hệ thống

```
┌──────────────────────────────────────────────┐
│              Browser (React SPA)             │
│  ┌────────────────┐  ┌──────────────────────┐│
│  │   User App     │  │   Admin Dashboard    ││
│  │ (Header xanh)  │  │  (Sidebar + bảng)    ││
│  └───────┬────────┘  └──────────┬───────────┘│
└──────────┼───────────────────────┼────────────┘
           │  HTTP/REST (Axios + JWT Bearer)
           ▼
┌──────────────────────────────────────────────┐
│         Spring Boot REST API (:8080)         │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Identity │ │  Wallet  │ │ Transaction  │ │
│  │  Module  │ │  Module  │ │   Module     │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
│  ┌───────────────────────────────────────┐   │
│  │         Spring Security + JWT         │   │
│  └───────────────────────────────────────┘   │
└──────────────────────────┬───────────────────┘
                           │ JPA / Hibernate
                           ▼
                ┌─────────────────┐
                │   MySQL Database│
                └─────────────────┘
```

**Luồng xác thực:**
1. Client gửi `POST /auth/login` → nhận `accessToken` (JWT).
2. Mọi request sau đó đính kèm header `Authorization: Bearer <token>`.
3. Spring Security filter xác thực token, trích xuất `username` + `role`.
4. `@PreAuthorize` / `hasRole("ADMIN")` bảo vệ các endpoint admin.

---

## 🛠 Công nghệ sử dụng

### Backend

| Công nghệ | Phiên bản | Vai trò               |
|---|---|-----------------------|
| Java | 21 | Ngôn ngữ chính        |
| Spring Boot | 4.x | Framework ứng dụng    |
| Spring Security | 4.x | Xác thực & phân quyền |
| Spring Data JPA | 4.x | ORM / truy cập CSDL   |
| Hibernate | 6.x | JPA Implementation    |
| MySQL | 8.x | Cơ sở dữ liệu quan hệ |
| JJWT | 0.13 | Tạo & xác thực JWT    |
| Lombok | Latest | Giảm boilerplate      |
| BCrypt | (Spring) | Mã hóa mật khẩu       |
| Maven | 3.x | Build tool            |

### Frontend

| Công nghệ | Phiên bản | Vai trò |
|---|---|---|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type-safe JavaScript |
| Vite | 6.x | Build tool / dev server |
| Tailwind CSS | 4.x | Utility-first CSS |
| React Router | 6.x | Client-side routing |
| Axios | 1.x | HTTP client + interceptors |
| Lucide React | Latest | Icon set |
| clsx | Latest | Conditional class names |

---

## ✅ Yêu cầu chức năng (FR)

### 1. Quản lý định danh (Identity)

| # | Chức năng | Mô tả |
|---|---|---|
| FR-01 | Đăng ký | Tạo tài khoản mới với `username`, `email`, `password`; ví được khởi tạo tự động |
| FR-02 | Đăng nhập | Xác thực bằng username/password, trả về JWT (`accessToken`) |
| FR-03 | Phân quyền | Role-based: `USER` và `ADMIN`; bảo vệ API bằng `@PreAuthorize` |
| FR-04 | Trạng thái KYC | 3 trạng thái: `UNVERIFIED` → `VERIFIED` / `REJECTED`; admin phê duyệt |
| FR-05 | Đổi mật khẩu | User tự đổi mật khẩu sau khi xác thực `currentPassword` |
| FR-06 | Quên mật khẩu | Gửi token reset, đặt lại mật khẩu qua token |

### 2. Quản lý Ví (Wallet)

| # | Chức năng | Mô tả |
|---|---|---|
| FR-07 | Khởi tạo ví tự động | Ví được tạo ngay khi đăng ký thành công |
| FR-08 | Xem số dư | Xem số dư và thông tin ví hiện tại |
| FR-09 | Nạp tiền | Nạp tiền vào ví với ghi chú tham chiếu |
| FR-10 | Khóa / mở khóa ví | Admin có thể khóa ví user vi phạm |

### 3. Xử lý giao dịch (Transaction)

| # | Chức năng | Mô tả |
|---|---|---|
| FR-11 | Chuyển tiền P2P | Chuyển tiền nội bộ giữa các user theo `username` |
| FR-12 | Chống lặp giao dịch | Idempotency key ngăn trừ tiền 2 lần khi mạng lag |
| FR-13 | Lịch sử giao dịch | Xem sao kê phân trang: Nạp tiền / Nhận tiền / Chuyển tiền |
| FR-14 | Hiển thị dấu +/− | Người nhận thấy `+`, người gửi thấy `−` |

### 4. Admin Dashboard

| # | Chức năng | Mô tả |
|---|---|---|
| FR-15 | Thống kê tổng quan | Tổng user, tổng số dư hệ thống, số GD trong ngày |
| FR-16 | Quản lý người dùng | Xem danh sách, khóa/mở khóa ví |
| FR-17 | Phê duyệt KYC | Approve / Reject KYC của từng user |
| FR-18 | Tra soát giao dịch | Xem toàn bộ dòng tiền hệ thống để xử lý khiếu nại |

---

## 🔒 Yêu cầu phi chức năng (NFR)

### NFR-01 – Tính toàn vẹn (ACID)

- Mọi nghiệp vụ chuyển tiền (trừ tiền người gửi + cộng tiền người nhận) được bọc trong một **transaction duy nhất** (`@Transactional`).
- Nếu bất kỳ bước nào thất bại (ví bị khóa, số dư không đủ, lỗi DB), toàn bộ transaction sẽ **rollback** – không mất tiền.

### NFR-02 – Tính rành mạch (Idempotency)

- Mỗi yêu cầu giao dịch mang một **Idempotency Key** duy nhất.
- Hệ thống kiểm tra key trước khi xử lý: nếu đã tồn tại → trả về kết quả cũ, không xử lý lại.
- Ngăn chặn lỗi **trừ tiền nhiều lần** do client retry khi mạng không ổn định.

### NFR-03 – Xử lý đồng thời (Concurrency)

- Sử dụng **Optimistic Locking** (`@Version`) trên entity `Wallet`.
- Khi 2 luồng cùng đọc số dư và cùng cố ghi → luồng sau nhận `OptimisticLockException` → retry an toàn.
- Ngăn chặn lỗi **lost update** (thất thoát số dư khi 2 request rút tiền đồng thời).

### NFR-04 – Bảo mật

- **Bcrypt** băm mật khẩu trước khi lưu vào DB (không lưu plaintext).
- **JWT Stateless**: Server không lưu session; token tự chứa thông tin xác thực.
- **HTTPS** được khuyến nghị trên môi trường production.
- **CORS** được cấu hình chỉ cho phép origin của frontend.
- **Role-based Authorization**: Endpoint `/admin/**` chỉ cho phép `ROLE_ADMIN`.

---

## 📁 Cấu trúc dự án

```
core/
├── core/                          # Spring Boot Backend
│   ├── src/main/java/com/xpay/core/
│   │   ├── modules/
│   │   │   ├── identity/          # Đăng ký, đăng nhập, user profile
│   │   │   ├── wallet/            # Ví, nạp tiền, chuyển tiền
│   │   │   ├── transaction/       # Lịch sử giao dịch
│   │   │   └── admin/             # API quản trị
│   │   ├── config/                # Security, CORS, JWT config
│   │   ├── common/                # Base response, utilities
│   │   └── exception/             # Global exception handler
│   └── src/main/resources/
│       ├── application.yaml       # Cấu hình chung
│       └── application-local.yaml # Cấu hình local (DB, port)
│
└── xpay-ui/                       # React Frontend
    └── src/
        ├── api/                   # Axios instance + service layer
        ├── components/            # Shared components (Layout, Modal...)
        ├── context/               # AuthContext (JWT storage)
        ├── hooks/                 # Custom hooks (useToast...)
        ├── pages/                 # Các màn hình chính
        │   ├── LoginPage.tsx
        │   ├── DashboardPage.tsx
        │   ├── DepositPage.tsx
        │   ├── TransferPage.tsx
        │   ├── TransactionHistoryPage.tsx
        │   └── admin/             # Admin screens
        └── types/                 # TypeScript interfaces
```

---

## ⚙️ Cài đặt & Chạy

### Yêu cầu

- Java 21+
- Maven 3.8+
- Node.js 18+
- MySQL 8+

### 1. Chuẩn bị Database

```sql
CREATE DATABASE xpay_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Cấu hình Backend

Chỉnh sửa `core/src/main/resources/application-local.yaml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/xpay_db
    username: root
    password: your_password
```

### 3. Chạy Backend

```bash
cd core
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
# API chạy tại: http://localhost:8080
```

### 4. Chạy Frontend

```bash
cd core/xpay-ui
npm install
npm run dev
# UI chạy tại: http://localhost:5173
```

---

## 📡 API Overview

| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| POST | `/auth/register` | Đăng ký tài khoản | Public |
| POST | `/auth/login` | Đăng nhập, nhận JWT | Public |
| GET | `/users/me` | Xem thông tin cá nhân | USER |
| POST | `/users/change-password` | Đổi mật khẩu | USER |
| GET | `/wallets/my-wallet` | Xem số dư ví | USER |
| POST | `/wallets/deposit` | Nạp tiền | USER |
| POST | `/wallets/transfer` | Chuyển tiền P2P | USER |
| GET | `/transactions/my-history` | Lịch sử giao dịch | USER |
| GET | `/admin/stats` | Thống kê tổng quan | ADMIN |
| GET | `/admin/users` | Danh sách người dùng | ADMIN |
| PATCH | `/admin/users/{id}/kyc/approve` | Phê duyệt KYC | ADMIN |
| PATCH | `/admin/users/{id}/kyc/reject` | Từ chối KYC | ADMIN |
| PATCH | `/admin/users/{id}/wallet/toggle-lock` | Khóa/mở ví | ADMIN |
| GET | `/admin/transactions` | Toàn bộ giao dịch | ADMIN |

---

## 👤 Tài khoản mặc định

Hệ thống tự động tạo tài khoản admin khi khởi động lần đầu (`DataInitializer`):

| Trường | Giá trị |
|---|---|
| Username | `admin` |
| Password | `admin123` |
| Email | `admin@xpay.vn` |
| Role | `ADMIN` |
| KYC | `VERIFIED` |

---

## 📝 Ghi chú kỹ thuật

- **`balanceAfter`** trong entity Transaction được lưu để phục vụ audit log nội bộ, nhưng giao diện người dùng chỉ hiển thị **số dư hiện tại** (fetch từ `/wallets/my-wallet`) để tránh phức tạp trong hiển thị.
- **`displayType`** được tính toán ở BE: `DEPOSIT` (nạp), `RECEIVED` (nhận từ người khác), `TRANSFER` (chuyển đi) – giúp FE render đúng màu sắc và dấu +/−.
- **Password field** trong Entity được map `@Column(name = "password_hash")` và Spring Security nhận `SimpleGrantedAuthority("ROLE_" + role.name())`.
