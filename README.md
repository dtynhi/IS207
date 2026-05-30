# 5N Store

5N Store is a monorepo with:

- Backend API: TypeScript + Express + Prisma + PostgreSQL (`backend/`)
- Frontend app: React + Vite + Tailwind + Ant Design (`frontend/`)

## Requirements

- Node.js 18+
- npm 9+
- PostgreSQL 14+

## Project Structure

- `backend/`: API server, Prisma schema, seed scripts
- `frontend/`: web client
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

Follow these steps to prepare the database. Prisma reads the `.env` file located next to the `schema.prisma` file, so either run the commands from `backend/` or reference the schema path explicitly.

1. Create backend env

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and set DATABASE_URL to your local Postgres
# e.g. DATABASE_URL=postgresql://postgres:postgres@localhost:5432/unimarket_backend
```

2. Generate Prisma client

From repo root (recommended):

```bash
npm run prisma:generate
# or (explicit schema):
# npx prisma generate --schema backend/prisma/schema.prisma
```

3. Apply existing migrations (safe for CI / production)

This applies all migration files that have not yet been applied to the database. Run from repo root:

```bash
npx prisma migrate deploy --schema backend/prisma/schema.prisma
```

4. Development: create new migration and apply locally

If you're developing and need to create a migration from schema changes, run from the backend folder so Prisma reads backend/.env automatically:

```bash
cd backend
npx prisma migrate dev --name add-descriptive-name
# If drift is detected, prisma may prompt to reset the database (destructive). Answer carefully.
```

5. Reset local database (destructive)

To wipe and reapply all migrations on a local dev DB (use with caution):

```bash
cd backend
npx prisma migrate reset --schema prisma/schema.prisma --force
# This drops all data, re-applies migrations and runs the seed script.
```

6. Seed data

```bash
# Runs the repo-level seed script defined for backend
npm run seed
```

Troubleshooting & notes

- If Prisma cannot find your `.env`, `cd backend` before running migrate/generate or pass the `--schema backend/prisma/schema.prisma` flag so Prisma loads backend/.env.
- `npx prisma migrate deploy` only applies migrations that are not yet applied — it will not re-run already-applied migrations.
- If you see a drift warning, consider running `npx prisma migrate dev` in dev to reconcile or discuss with the team; resetting the DB will remove data.

Optional CI example

- In CI/CD pipelines use:

```bash
npx prisma generate --schema backend/prisma/schema.prisma
npx prisma migrate deploy --schema backend/prisma/schema.prisma
npm run seed # optional
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
