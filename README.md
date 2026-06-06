# 5N Store — Unimarket

**Unimarket** is an e-commerce platform built for students, connecting buyers and sellers within the university community. This project was developed as part of the IS207 course.

---

## Overview

Unimarket enables students to shop for a wide range of products with a smooth experience — including online payments and a transparent order tracking system. The admin side provides a full suite of tools to operate and monitor business activity.

---

## Key Features

### For Shoppers

- **Browse & Search** — Explore products by category, filter by attributes, and search instantly
- **Cart & Checkout** — Add items to cart, place orders, and track order status in real time
- **Online Payment** — Integrated with VNPay, supporting bank cards and e-wallets
- **Discount Coupons** — Apply coupon codes at checkout for instant savings
- **Flash Sales** — Time-limited deals with special pricing
- **Campaigns & Promotions** — Seasonal banners and promotional events
- **Account Management** — View order history and update personal information

### For Administrators

- **Dashboard** — Real-time overview of revenue, orders, and user activity
- **Product Management** — Create, edit, and remove products and categories
- **Order Management** — View and update order processing status
- **User Management** — Browse user accounts and manage permissions
- **Coupon Management** — Create and manage discount codes
- **Flash Sale & Campaign Management** — Schedule and control promotional programs
- **Role-Based Access** — Three staff roles with distinct permissions

---

## User Roles

| Role | Access Level |
|------|--------------|
| **Admin** | Full system administration |
| **Operations** | Manage products, orders, and promotions |
| **Support** | Handle user requests and customer support |
| **Customer** | Shop, place orders, and manage personal account |

---

## Architecture

Unimarket is structured as an **npm workspace monorepo** with three main workspaces:

```
unimarket/
├── backend/        # REST API server
├── frontend/       # Web client
├── packages/
│   └── shared/     # Shared types and utilities
└── test/           # End-to-end tests (Playwright)
```

### Backend

Built with **Node.js + Express + TypeScript**, following a layered architecture:

```
backend/src/
├── interfaces/       # HTTP layer — routes, controllers, middleware
├── application/      # Use cases and application logic
├── domains/          # Core business logic (auth, product, order, cart, coupon, ...)
├── infrastructure/   # Database connection (Prisma + PostgreSQL)
└── shared/           # Utilities, validators, error handling
```

| Concern | Technology |
|---------|------------|
| Runtime | Node.js 18+ |
| Framework | Express |
| Language | TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT via httpOnly cookie |
| Validation | Zod |
| Scheduler | node-cron |

### Frontend

Built with **React + Vite + TypeScript**, organized by feature modules:

```
frontend/src/
├── features/         # Self-contained feature modules (products, cart, orders, admin, ...)
└── shared/           # Reusable components, hooks, and utilities
```

| Concern | Technology |
|---------|------------|
| Framework | React 18 |
| Build tool | Vite |
| UI library | Ant Design |
| Styling | Tailwind CSS |
| Data fetching | TanStack Query (React Query) |
| HTTP client | Axios |
| Routing | React Router v6 |
| Charts | Recharts |

### Data Flow

```
Browser
  └── React (Vite)
        └── Axios + React Query
              └── Express REST API
                    └── Prisma ORM
                          └── PostgreSQL
```

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL | 14+ |
| Git | Any |

### 1. Clone the repository

```bash
git clone <repository-url>
cd unimarket
```

### 2. Install dependencies

```bash
npm install
```

This installs packages for all workspaces — backend, frontend, shared, and test.

### 3. Configure environment variables

**Backend** — create `backend/.env`:

```env
NODE_ENV=development
PORT=4000

DATABASE_URL=postgresql://postgres:your_password@localhost:5432/unimarket_backend

JWT_SECRET=change_me_to_a_strong_secret

CORS_ORIGIN=http://localhost:5173
BASE_URL=http://localhost:4000
FRONTEND_URL=http://localhost:5173

VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_TMN_CODE=99396OHE
VNPAY_HASH_SECRET=HLCNIZIU8HKECRFFRBNXRCQZYXE5HF1U
```

**Frontend** — create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

### 4. Set up the database

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE unimarket_backend;"

# Apply all migrations
cd backend && npx prisma migrate deploy && cd ..

# Generate Prisma Client
npm run prisma:generate

# Seed sample data
npm run seed
```

### 5. Run the application

Open two terminal windows:

```bash
# Terminal 1 — API server (http://localhost:4000)
npm run dev:backend

# Terminal 2 — Web client (http://localhost:5173)
npm run dev:frontend
```

Verify the API is running:

```bash
curl http://localhost:4000/api/v1/health
# Expected: { "status": "ok" }
```

### Default accounts

| Email | Password | Role |
|-------|----------|------|
| `admin@unimarket.vn` | `123456` | Admin |
| `vanhanh@unimarket.vn` | `123456` | Operations |
| `hotro@unimarket.vn` | `123456` | Support |

> Change all default passwords before deploying to production.

---

## Database Workflow

### After every `git pull`

```bash
git pull
cd backend && npx prisma migrate deploy && cd ..
npm run prisma:generate
npm install
```

### After modifying `schema.prisma`

```bash
cd backend
npx prisma migrate dev --name describe-your-change
```

Always commit the generated migration file — teammates need it to stay in sync.

### Reset local database

```bash
cd backend && npx prisma migrate reset --force && cd ..
npm run prisma:generate
npm run seed
```

---

## Build for Production

```bash
npm run build:backend
npm run build:frontend
```

---

## About

IS207 Project — University of Information Technology, UIT.
