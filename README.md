# 5N Store — Unimarket

Dự án thương mại điện tử monorepo gồm:

- **Backend**: TypeScript + Express + Prisma + PostgreSQL (port `4000`)
- **Frontend**: React + Vite + Tailwind CSS + Ant Design (port `5173`)
- **Test**: Playwright E2E
- **Shared**: Thư viện dùng chung

---

## Mục lục

1. [Yêu cầu hệ thống](#1-yêu-cầu-hệ-thống)
2. [Cấu trúc dự án](#2-cấu-trúc-dự-án)
3. [Cài đặt dependencies](#3-cài-đặt-dependencies)
4. [Cấu hình môi trường](#4-cấu-hình-môi-trường)
5. [Cài đặt cơ sở dữ liệu](#5-cài-đặt-cơ-sở-dữ-liệu)
6. [Quy trình làm việc với DB — bắt buộc cả team](#6-quy-trình-làm-việc-với-db--bắt-buộc-cả-team)
7. [Chạy ứng dụng](#7-chạy-ứng-dụng)
8. [Tài khoản mặc định](#8-tài-khoản-mặc-định)
9. [Build production](#9-build-production)
10. [Chạy E2E Tests](#10-chạy-e2e-tests)
11. [Các lệnh hữu ích](#11-các-lệnh-hữu-ích)
12. [Ghi chú quan trọng](#12-ghi-chú-quan-trọng)

---

## 1. Yêu cầu hệ thống

Cài đặt các phần mềm sau trước khi bắt đầu:

| Phần mềm | Phiên bản tối thiểu | Link tải |
|----------|---------------------|----------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | Đi kèm Node.js |
| PostgreSQL | 14+ | https://www.postgresql.org/download |
| Git | Bất kỳ | https://git-scm.com |

> **Kiểm tra phiên bản đã cài:**
> ```bash
> node -v
> npm -v
> psql --version
> ```

---

## 2. Cấu trúc dự án

```
Unimarket-main/
├── backend/                  # API server (Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── migrations/       # Lịch sử migration
│   │   └── seed.ts           # Script seed dữ liệu mẫu
│   ├── src/
│   │   ├── domains/          # Logic nghiệp vụ (auth, product, order, ...)
│   │   ├── infrastructure/   # Kết nối DB, dịch vụ ngoài
│   │   ├── interfaces/       # HTTP routes, middleware
│   │   └── shared/           # Utilities, validators, error handling
│   └── .env                  # Biến môi trường backend (tự tạo)
├── frontend/                 # Web client (React + Vite)
│   ├── src/
│   │   ├── features/         # Các module tính năng
│   │   └── shared/           # Component/util dùng chung
│   └── .env                  # Biến môi trường frontend (tự tạo)
├── packages/
│   └── shared/               # Thư viện dùng chung giữa FE/BE
├── test/                     # E2E tests (Playwright)
├── docs/                     # Tài liệu kỹ thuật
├── data/                     # Dữ liệu tĩnh
└── package.json              # Root workspace config
```

---

## 3. Cài đặt dependencies

Chạy lệnh sau tại thư mục gốc của dự án. Lệnh này sẽ cài đặt tất cả packages cho cả `backend`, `frontend`, `test` và `packages/shared`:

```bash
npm install
```

---

## 4. Cấu hình môi trường

### 4.1. Backend

Tạo file `backend/.env` từ file mẫu:

```bash
cp backend/.env.example backend/.env
```

Nội dung file `backend/.env` (chỉnh sửa cho phù hợp máy local):

```env
NODE_ENV=development
PORT=4000

# Thay username/password/database cho đúng với PostgreSQL local của bạn
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/unimarket_backend

JWT_SECRET=change_me_to_a_strong_secret

CORS_ORIGIN=http://localhost:5173
BASE_URL=http://localhost:4000
FRONTEND_URL=http://localhost:5173

# VNPay sandbox (dùng cho môi trường dev, không thay đổi)
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_TMN_CODE=99396OHE
VNPAY_HASH_SECRET=HLCNIZIU8HKECRFFRBNXRCQZYXE5HF1U
```

> **Lưu ý `DATABASE_URL`:** Đổi `your_password` thành mật khẩu PostgreSQL của bạn và đảm bảo database `unimarket_backend` đã được tạo (xem bước 5).

### 4.2. Frontend

Tạo file `frontend/.env` từ file mẫu:

```bash
cp frontend/.env.example frontend/.env
```

Nội dung file `frontend/.env` (mặc định đã đúng, không cần chỉnh):

```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

---

## 5. Cài đặt cơ sở dữ liệu

### Bước 5.1 — Tạo database trong PostgreSQL

Kết nối vào PostgreSQL và tạo database:

```bash
psql -U postgres
```

```sql
CREATE DATABASE unimarket_backend;
\q
```

### Bước 5.2 — Generate Prisma Client

```bash
npm run prisma:generate
```

### Bước 5.3 — Apply migrations

Áp dụng toàn bộ migrations đã có vào database (an toàn, không mất dữ liệu):

```bash
npx prisma migrate deploy --schema backend/prisma/schema.prisma
```

### Bước 5.4 — Seed dữ liệu mẫu

Nạp dữ liệu mẫu vào database (sản phẩm, tài khoản mặc định, ...):

```bash
npm run seed
```

> Backend cũng tự động seed dữ liệu mặc định khi khởi động lần đầu (idempotent — không tạo trùng).

---

## 6. Quy trình làm việc với DB — bắt buộc cả team

### 6.1. Lần đầu tiên — Reset sạch về baseline chung (chạy MỘT LẦN)

Mỗi thành viên chạy block lệnh này **một lần duy nhất** để đưa DB local về cùng trạng thái với toàn team:

```bash
# Vào thư mục backend trước (bắt buộc — Prisma đọc .env từ đây)
cd backend

# Xóa DB local, tạo lại từ đầu và apply toàn bộ migration history
npx prisma migrate reset --force

# Quay lại thư mục gốc
cd ..

# Generate lại Prisma Client
npm run prisma:generate

# Nạp dữ liệu mẫu
npm run seed
```

> **Tại sao phải `cd backend` trước?** Prisma tìm file `.env` trong thư mục chứa `schema.prisma` (`backend/prisma/`) hoặc thư mục bạn đang đứng. File `.env` nằm ở `backend/.env` nên phải đứng trong `backend/` thì Prisma mới đọc được. Nếu chạy từ thư mục gốc sẽ báo lỗi `DATABASE_URL not found`.
>
> `migrate reset` thực hiện 3 việc liên tiếp: **drop DB → re-create → apply toàn bộ migration**. Flag `--force` bỏ qua confirm prompt. Sau khi chạy xong, DB local của bạn đồng bộ hoàn toàn với team.

---

### 6.2. Sau mỗi lần `git pull` — Bắt buộc, không bỏ qua

```bash
# 1. Pull code về
git pull

# 2. Vào backend và apply các migration mới (LUÔN LUÔN chạy bước này)
cd backend
npx prisma migrate deploy
cd ..

# 3. Generate lại Prisma Client (nếu schema.prisma có thay đổi)
npm run prisma:generate

# 4. Cài thêm package nếu package.json thay đổi
npm install
```

> Dùng `migrate deploy` — lệnh này chỉ **apply** các file migration đã có, không tự sinh migration mới. An toàn cho môi trường team. **Không dùng `db:push` thay thế.**

---

### 6.3. Khi nào cần tạo file migration?

Tạo migration mỗi khi bạn **thay đổi bất kỳ thứ gì trong `backend/prisma/schema.prisma`**:

| Thay đổi schema | Cần tạo migration? |
|---|---|
| Thêm model mới | Có |
| Thêm / xóa / đổi tên field | Có |
| Thêm index, unique, relation | Có |
| Đổi kiểu dữ liệu của field | Có |
| Chỉ sửa logic TypeScript | Không |
| Chỉ sửa file seed | Không |

**Cách tạo migration:**

```bash
cd backend
npx prisma migrate dev --name mo-ta-ngan-gon-bang-tieng-anh
```

Ví dụ tên migration hợp lệ:
```
--name add-order-status-field
--name add-wallet-table
--name remove-deprecated-cart-column
```

Sau khi chạy, Prisma tạo file mới trong `backend/prisma/migrations/`. **Commit file đó vào git** — đây là lịch sử thay đổi schema của cả team, người khác cần nó để `migrate deploy` thành công.

**Quy ước đặt tên migration:**
```
YYYYMMDD_<động-từ>_<đối-tượng>

Ví dụ:
  20250531_add_order_status_enum
  20250601_remove_legacy_cart_field
  20250602_add_wallet_table
```

---

### 6.4. Bảng quy tắc — không thương lượng

| Tình huống | Lệnh đúng | Lệnh SAI — không dùng |
|---|---|---|
| Sau mỗi git pull | `migrate deploy` | ~~`db:push`~~ |
| Thay đổi `schema.prisma` | `migrate dev --name ...` | ~~`db:push`~~ |
| Cần data mẫu | `npm run seed` | ~~Insert thủ công vào DB~~ |
| Reset hoàn toàn local DB | `migrate reset --force` | ~~Xóa DB tay rồi `db:push`~~ |

**Xem trạng thái DB trực tiếp qua giao diện web:**

```bash
cd backend
npx prisma studio
```

---

## 7. Chạy ứng dụng

Mở **2 terminal riêng biệt**:

**Terminal 1 — Backend:**

```bash
npm run dev:backend
```

Kết quả: API server chạy tại `http://localhost:4000`

**Terminal 2 — Frontend:**

```bash
npm run dev:frontend
```

Kết quả: Web app chạy tại `http://localhost:5173`

**Kiểm tra backend hoạt động:**

```bash
curl http://localhost:4000/api/v1/health
```

Hoặc mở trình duyệt tại `http://localhost:4000/api/v1/health`, kết quả trả về `{ "status": "ok" }` là thành công.

---

## 8. Tài khoản mặc định

Sau khi seed dữ liệu, các tài khoản sau được tạo sẵn:

| Email | Mật khẩu | Vai trò |
|-------|----------|---------|
| `admin@unimarket.vn` | `123456` | Admin |
| `vanhanh@unimarket.vn` | `123456` | Vận hành |
| `hotro@unimarket.vn` | `123456` | Hỗ trợ |

> Đổi mật khẩu sau khi deploy lên môi trường thật.

---

## 9. Build production

```bash
# Build backend
npm run build:backend

# Build frontend
npm run build:frontend
```

---

## 10. Chạy E2E Tests

Đảm bảo cả backend lẫn frontend đang chạy, sau đó:

```bash
npm run test:e2e
```

---

## 11. Các lệnh hữu ích

```bash
# Kiểm tra type cho shared package
npm run typecheck:shared

# Seed lại dữ liệu, ghi đè dữ liệu cũ
npm run seed -- --force
```

---

## 12. Ghi chú quan trọng

- **Cookie auth**: Token đăng nhập lưu trong httpOnly cookie, không phải localStorage. Thời hạn cookie là 30 ngày.
- **Prisma & .env**: Prisma đọc `.env` từ cùng thư mục với `schema.prisma`. Khi chạy lệnh `prisma` từ thư mục gốc, phải thêm `--schema backend/prisma/schema.prisma`. Khi `cd backend` rồi chạy thì không cần thêm flag này.
- **Migration drift**: Nếu Prisma báo drift khi chạy `migrate dev`, hãy thảo luận với team trước khi reset DB vì thao tác này xóa toàn bộ dữ liệu.
- **VNPay**: Credentials trong file `.env.example` là của môi trường sandbox, chỉ dùng cho dev/test. Không dùng credentials thật trên máy local.
- **Vite Proxy**: Frontend tự động proxy mọi request `/api/*` đến `http://localhost:4000`, không cần cấu hình thêm.
- **Branch**: Phát triển tính năng trên branch riêng (`feature/...`), không commit thẳng lên `main`.
