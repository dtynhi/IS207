# Migration Master Plan

## Goal

Modernize stack while keeping old business behavior stable.

## Phases

1. Discovery + parity baseline
2. Monorepo and runtime scaffolding
3. PostgreSQL schema + ETL plan
4. Backend vertical-slice migration
5. Frontend vertical-slice migration
6. Progressive cutover
7. Legacy decommission

## Governance

- No new business features until parity baseline is complete.
- Every migrated slice needs:
  - tests
  - docs update
  - parity checklist sign-off

## Rollback

- Feature-flag rollback for each migrated slice.
- DB backup checkpoint before each cutover wave.
