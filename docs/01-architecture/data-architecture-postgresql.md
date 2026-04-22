# Data Architecture (PostgreSQL)

## Source

Legacy Mongoose models under `models/`:

- account
- role
- user
- product
- product-category
- cart
- order
- settings-general
- forgot-password

## Target

Prisma schema in `backend/prisma/schema.prisma` with normalized relations and explicit enums.

## Key Decisions

- Keep soft delete flags where legacy behavior depends on them.
- Convert embedded arrays/documents to either relation tables or JSONB depending on access pattern.
- Add foreign key constraints for referential safety.
- Use indexes for lookup-heavy fields:
  - `email`
  - `slug`
  - `status`
  - `product_category_id`

## Migration Safety

- Dry-run ETL in staging first.
- Reconciliation report required before production cutover.
