# Current vs Target Architecture

## Current (Legacy)

- Single Node.js app at project root.
- Server-rendered views (Pug) + static JS/CSS.
- MongoDB via Mongoose models.
- Mixed responsibilities in controllers/helpers.
- Client and admin features are in one runtime.

## Target

- Monorepo with separate deployable applications:
  - `backend`: TypeScript Express REST API
  - `frontend`: React SPA
  - `packages/shared`: shared types and contracts
- PostgreSQL as primary database.
- Clean-but-simple modular architecture for readability.

## Design Principles

- Preserve business behavior first (parity-first).
- Avoid over-engineering for newcomer maintainability.
- Migrate in vertical slices with rollback safety.
- Keep docs updated as part of done criteria.
