# Testing Strategy

## Parity-first Testing

Before replacing any legacy feature, capture current behavior and turn it into testable acceptance criteria.

## Backend

- Unit tests: use case logic.
- Integration tests: repository + route behavior.
- Contract tests: stable API responses.

## Frontend

- Component tests for critical UI logic.
- E2E tests for P0 journeys:
  - auth
  - search/filter
  - cart/checkout
  - admin management

## Data

- ETL validation checks:
  - row counts
  - foreign key integrity
  - sampled business-rule assertions
