# ADR-003: Frontend Server State Strategy

## Status
Accepted

## Decision
Use TanStack Query for server state and caching; avoid adding extra global state library in v1.

## Rationale

- Standardized async state handling.
- Built-in cache invalidation patterns.
- Reduces boilerplate for API-heavy pages.

## Consequences

- Query key conventions must be documented and followed.
- Mutations must explicitly invalidate related keys.
