# Coding Standards

## General

- Prefer explicit names over abbreviations.
- Keep functions small and focused.
- Fail fast with clear error messages.

## Backend

- Validate external inputs with Zod.
- Keep side effects in infrastructure layer.
- Return typed DTOs from application layer.

## Frontend

- Keep feature boundaries clear.
- Handle loading/error/empty states for API-driven views.
- Avoid deep prop chains; compose with feature hooks.

## Documentation

- Every architectural decision that affects structure gets an ADR.
- Every migrated feature updates parity checklist status.
