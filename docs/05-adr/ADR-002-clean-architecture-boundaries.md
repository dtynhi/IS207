# ADR-002: Simplified Clean Architecture Boundaries

## Status
Accepted

## Decision
Adopt simplified layers:

- domain
- application
- infrastructure
- interfaces

## Rationale

- Keeps clean boundaries without heavy enterprise complexity.
- Easier for newcomers to trace request lifecycle.

## Consequences

- Some cross-layer abstractions are intentionally omitted for simplicity.
- Revisit if complexity grows significantly.
