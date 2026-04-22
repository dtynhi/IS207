# Backend Architecture (Simple Clean Architecture)

## Runtime Stack

- TypeScript
- Express
- Prisma + PostgreSQL
- Zod for input validation

## Layering

1. `domain`
- Pure business rules and entities.
- No framework or DB imports.

2. `application`
- Use cases / services orchestrating business actions.
- Input/output DTOs.

3. `infrastructure`
- Prisma repositories.
- External adapters (mail/storage/payment).

4. `interfaces`
- Express routes/controllers/middlewares.
- Serialization and HTTP concerns only.

## Folder Convention (per feature)

- `src/domain/<feature>`
- `src/application/<feature>`
- `src/infrastructure/<feature>`
- `src/interfaces/http/<feature>`

## API Conventions

- Base path: `/api/v1`
- Standard response envelope for errors.
- Consistent pagination and filter query format.
