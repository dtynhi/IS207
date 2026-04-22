# Uni Market Backend

TypeScript + Express + PostgreSQL API (domain-based modules).

## Run backend

```bash
npm install
npm run prisma:generate --workspace backend
npm run prisma:db:push --workspace backend
npm run dev --workspace backend
```

Khi backend khởi động, hệ thống sẽ tự động seed dữ liệu mẫu tiếng Việt vào PostgreSQL (idempotent, không xóa dữ liệu đang có).
Luồng mới:
- Nếu DB trống: tự seed dữ liệu mặc định.
- Nếu DB đã có dữ liệu: tự động skip seed.

## Seed manual (optional)

```bash
npm run prisma:seed --workspace backend
```

## Overwrite dữ liệu init

```bash
npm run seed --workspace backend
```

## Tài khoản mặc định

- `admin@unimarket.vn` / `123456`
- `vanhanh@unimarket.vn` / `123456`
- `hotro@unimarket.vn` / `123456`

## Health endpoint

- `GET /api/v1/health`

## Current status

- Domain-based API modules: auth, product, category, cart, order, user, account, role, setting, dashboard
- Shared base query params and normalized response envelope are implemented
- Backend startup now auto-seeds realistic Vietnamese default data for first-time projects
