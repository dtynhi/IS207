# ADR-001: Target Stack Selection

## Status
Accepted

## Decision
Use:

- Backend: TypeScript + Express + PostgreSQL + Prisma
- Frontend: React + Vite + Tailwind + Ant Design + TanStack Query
- Repo model: monorepo with `apps/*` and `packages/*`

## Rationale

- Strong TypeScript ergonomics.
- Faster onboarding for new contributors.
- Clear separation between API and UI runtimes.
- Practical maintainability over architectural complexity.

## Consequences

- Temporary dual-stack period during migration.
- Additional migration tooling for Mongo -> Postgres required.
