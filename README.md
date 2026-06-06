<p align="center">
  <h1 align="center">🛒 5N Store</h1>
  <p align="center">
    A full-stack e-commerce platform built for the university community.
    <br />
    Fast, modern, and production-ready.
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" />
    <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
    <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white" />
    <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" />
  </p>
</p>

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Database Workflow](#database-workflow)
- [Default Accounts](#default-accounts)
- [Build for Production](#build-for-production)
- [Project Structure](#project-structure)
- [Team](#team)

---
s
## About the Project

*5N Store** is a multi-role e-commerce web application designed to connect students within a university ecosystem. It provides a seamless storefront for shoppers and a full-featured back-office for operators — all in a single monorepo.

The project follows **Clean Architecture** principles on the backend and a **feature-driven** module structure on the frontend, ensuring the codebase remains maintainable as it grows.

> Built as a capstone project for **IS207 — University of Information Technology (UIT)**.

---

## Features

### Storefront

| Feature | Description |
|---------|-------------|
| Product Catalog | Browse by category, search, and filter with instant results |
| Shopping Cart | Persistent cart with real-time quantity and price updates |
| Checkout | Multi-step checkout with address and payment selection |
| VNPay Integration | Online payment via domestic bank cards and e-wallets |
| Order Tracking | Real-time order status updates from confirmation to delivery |
| Return & Refund | Submit return requests and track refund status |
| Coupon Codes | Apply percentage or fixed-amount discount codes at checkout |
| Flash Sales | Time-limited promotions with countdown timers |
| Campaigns | Curated landing pages for seasonal and promotional events |
| Wallet | In-app wallet balance for refunds and store credit |
| Account Dashboard | Order history, profile settings, and address management |

### Back Office (Admin Panel)

| Feature | Description |
|---------|-------------|
| Analytics Dashboard | Revenue, orders, and user metrics with Recharts visualizations |
| Product Management | Full CRUD for products and categories with image uploads |
| Order Management | View, filter, and progress orders through the fulfillment pipeline |
| Return Management | Review and approve/reject customer return requests |
| User Management | Browse accounts, manage roles, and toggle account status |
| Coupon Management | Create fixed or percentage coupons with usage limits and expiry |
| Flash Sale Scheduler | Schedule daily flash sales with product slots and stock limits |
| Campaign Builder | Create and publish promotional campaigns with banners |
| Role-Based Access | Granular permissions across Admin, Operations, and Support roles |
| Export | Export order and product data to Excel |

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────┐
│                     Browser                          │
│          React SPA (Vite · port 5173)                │
│   Ant Design · Tailwind · React Query · Axios        │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP / REST
                      │ /api/v1
┌─────────────────────▼───────────────────────────────┐
│                 Express API Server                    │
│              TypeScript (port 4000)                   │
│                                                       │
│  ┌───────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │ interfaces│  │ application │  │    domain     │  │
│  │ (routes,  │→ │ (use cases, │→ │ (entities,    │  │
│  │  controllers│  DTOs)      │  │  business rules│  │
│  └───────────┘  └─────────────┘  └───────────────┘  │
│                        │                              │
│               ┌────────▼────────┐                    │
│               │ infrastructure  │                    │
│               │ (Prisma repos,  │                    │
│               │  VNPay adapter) │                    │
│               └────────┬────────┘                    │
└────────────────────────┼────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│                   PostgreSQL 14+                      │
│        22 models · Prisma Migrate · Seeded data       │
└─────────────────────────────────────────────────────┘
```

### Backend — Clean Architecture Layers

```
interfaces      →  HTTP concerns only (routes, controllers, middleware, serialization)
application     →  Use cases and orchestration logic, input/output DTOs
domain          →  Pure business rules and entities — zero framework imports
infrastructure  →  Prisma repositories, external adapters (VNPay, file storage)
```

Dependencies only point **inward**. The domain layer has no knowledge of Express, Prisma, or any external library.

### Frontend — Feature-Driven Modules

Each feature under `frontend/src/features/` is self-contained:

```
features/
├── products/       # Catalog, search, product detail
├── cart/           # Cart state and checkout flow
├── orders/         # Order tracking and history
├── flash-sale/     # Flash sale storefront
├── campaigns/      # Promotional landing pages
├── coupons/        # Coupon application logic
├── auth/           # Login, register, password reset
├── user/           # Account and profile management
└── admin/          # Full back-office panel
    ├── dashboard/
    ├── products/
    ├── orders/
    ├── users/
    └── ...
```

---

## Tech Stack

### Backend

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Language | TypeScript 5.6 |
| ORM | Prisma 5 |
| Database | PostgreSQL 14+ |
| Validation | Zod |
| Auth | JWT · httpOnly cookie · 30-day session |
| Payment | VNPay sandbox / production |
| Scheduler | node-cron |
| File Export | xlsx |

### Frontend

| Layer | Technology |
|-------|------------|
| Framework | React 18 |
| Build tool | Vite 5 |
| Language | TypeScript 5.6 |
| UI Library | Ant Design 5 |
| Styling | Tailwind CSS 3 |
| State & Fetching | TanStack Query (React Query) v5 |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Charts | Recharts |
| Export | xlsx |

### Workspace

| Concern | Technology |
|---------|------------|
| Monorepo | npm workspaces |
| Shared types | `@unimarket/shared` package |
| E2E Testing | Playwright |

---

## Getting Started

### Prerequisites

Ensure the following are installed before proceeding:

| Tool | Minimum version |
|------|----------------|
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL | 14+ |
| Git | Any |

```bash
node -v && npm -v && psql --version
```

### Step 1 — Clone the repository

```bash
git clone <repository-url>
cd unimarket
```

### Step 2 — Install dependencies

```bash
npm install
```

Installs packages for all workspaces: `backend`, `frontend`, `packages/shared`, and `test`.

### Step 3 — Configure environment variables

**Backend** — create `backend/.env`:

```env
NODE_ENV=development
PORT=4000

# Replace with your local PostgreSQL credentials
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/unimarket_backend

JWT_SECRET=change_me_to_a_strong_secret

CORS_ORIGIN=http://localhost:5173
BASE_URL=http://localhost:4000
FRONTEND_URL=http://localhost:5173

# VNPay sandbox — safe to use as-is in development
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_TMN_CODE=99396OHE
VNPAY_HASH_SECRET=HLCNIZIU8HKECRFFRBNXRCQZYXE5HF1U
```

**Frontend** — create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

### Step 4 — Initialize the database

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE unimarket_backend;"

# Apply all migrations
cd backend && npx prisma migrate deploy && cd ..

# Generate Prisma Client
npm run prisma:generate

# Seed sample data (products, accounts, categories)
npm run seed
```

### Step 5 — Start the development servers

```bash
# Terminal 1 — API server → http://localhost:4000
npm run dev:backend

# Terminal 2 — Web client → http://localhost:5173
npm run dev:frontend
```

**Verify the API is healthy:**

```bash
curl http://localhost:4000/api/v1/health
# → { "status": "ok" }
```

Open [http://localhost:5173](http://localhost:5173) in your browser to access the storefront.

---

## Database Workflow

### After every `git pull`

Always run these steps after pulling — migrations and packages may have changed:

```bash
git pull
cd backend && npx prisma migrate deploy && cd ..
npm run prisma:generate
npm install
```

### When you modify `schema.prisma`

```bash
cd backend
npx prisma migrate dev --name <short-description-in-english>

# Example:
# npx prisma migrate dev --name add-return-reason-field
```

> Always commit the generated migration file. Teammates need it to stay in sync via `migrate deploy`.

### Reset local database from scratch

```bash
cd backend && npx prisma migrate reset --force && cd ..
npm run prisma:generate
npm run seed
```

> `migrate reset` drops the database, recreates it, and replays the full migration history.

### Inspect data visually

```bash
cd backend && npx prisma studio
```

---

## Default Accounts

Seeded automatically. Use these to log in during development:

| Email | Password | Role |
|-------|----------|------|
| `admin@unimarket.vn` | `123456` | Admin |
| `vanhanh@unimarket.vn` | `123456` | Operations |
| `hotro@unimarket.vn` | `123456` | Support |

> **Security:** Change all default credentials before deploying to any public environment.

---

## Build for Production

```bash
# Compile backend TypeScript to dist/
npm run build:backend

# Bundle frontend to frontend/dist/
npm run build:frontend
```

---

## Project Structure

```
unimarket/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # 22 models, full DB schema
│   │   ├── migrations/           # Migration history (committed)
│   │   └── seed.ts               # Idempotent seed script
│   └── src/
│       ├── interfaces/http/      # Routes, controllers, middleware
│       ├── application/          # Use cases, DTOs
│       ├── domains/              # Business logic (auth, product, order, ...)
│       ├── infrastructure/db/    # Prisma repositories
│       └── shared/               # Error handling, validators, utils
│
├── frontend/
│   └── src/
│       ├── features/             # Feature modules (self-contained)
│       └── shared/               # Global components, hooks, utilities
│
├── packages/
│   └── shared/                   # Shared TypeScript types (FE ↔ BE)
│
├── test/                         # Playwright E2E test suites
└── docs/                         # Architecture decision records (ADRs)
```

---

## Team

Developed by the **5N team** for IS207 — University of Information Technology (UIT).
