# Uni Market Migration Docs

This folder is the source of truth for migrating Uni Market from legacy Express + Pug + MongoDB to:

- Backend: TypeScript + Express + PostgreSQL (Prisma)
- Frontend: React + Tailwind + Ant Design + TanStack Query

## Read Order

1. `00-overview/current-vs-target-architecture.md`
2. `01-architecture/backend-clean-architecture.md`
3. `01-architecture/frontend-architecture.md`
4. `01-architecture/data-architecture-postgresql.md`
5. `03-migration/migration-master-plan.md`
6. `03-migration/feature-parity-checklist.md`
7. `03-migration/mongodb-to-postgresql-mapping.md`
8. `04-guides/local-setup-for-beginners.md`

## Current Status

- Legacy app remains active at project root.
- New scaffolds exist at `backend` and `frontend`.
- Migration is parity-first with progressive cutover.
