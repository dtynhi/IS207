# Naming Conventions

## General

- Files: `kebab-case` for docs/config, `camelCase` or `PascalCase` for TS by responsibility.
- Keep names explicit over short abbreviations.

## Backend

- Routes: plural resources (`/products`, `/orders`)
- Use-case classes: `VerbNounUseCase` (example: `CreateOrderUseCase`)
- Repositories: `<Feature>Repository`

## Frontend

- Feature folders: `src/features/<feature-name>`
- React components: `PascalCase.tsx`
- Hooks: `use<Feature><Action>.ts`

## Database

- Tables/columns: `snake_case`
- Migration files: timestamp + action
