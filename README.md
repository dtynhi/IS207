# Uni Market

Uni Market is a monorepo with:
- Backend API: TypeScript + Express + Prisma + PostgreSQL (`backend/`)
- Frontend app: React + Vite + Tailwind + Ant Design (`frontend/`)

## Requirements

- Node.js 18+
- npm 9+
- PostgreSQL 14+

## Project Structure

- `backend/`: API server, Prisma schema, seed scripts
- `frontend/`: web client
- `test/`: Playwright E2E tests
- `docs/`: technical docs

## 1) Install Dependencies

From repo root:

```bash
npm install
```

## 2) Configure Environment

### Backend env

Create `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Default values:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/unimarket_backend
JWT_SECRET=change_me_here
CORS_ORIGIN=http://localhost:5173
```

Update `DATABASE_URL` to your local PostgreSQL account if needed.

### Frontend env

Create `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

Default value:

```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

## 3) Setup Database

Run these commands from repo root:

```bash
npm run prisma:generate
npm run db:push
```

Optional: force seed data (overwrite bootstrap data):

```bash
npm run seed
```

Note: backend also auto-seeds default data on startup (idempotent).

## 4) Run the App

Open 2 terminals.

Terminal 1 (backend):

```bash
npm run dev:backend
```

Terminal 2 (frontend):

```bash
npm run dev:frontend
```

Open frontend at `http://localhost:5173`.

Backend health check:

```bash
curl http://localhost:4000/api/v1/health
```

## Default Accounts

- `admin@unimarket.vn` / `123456`
- `vanhanh@unimarket.vn` / `123456`
- `hotro@unimarket.vn` / `123456`

## Build

```bash
npm run build:backend
npm run build:frontend
```

## Run E2E Tests

```bash
npm run test:e2e
```

## Useful Commands

```bash
npm run test:backend
npm run test:frontend
npm run lint:backend
npm run lint:frontend
```

## Auth Notes

- Login token is stored in cookies (not localStorage).
- Backend auth cookie lifetime is 30 days.
