# Frontend Architecture

## Runtime Stack

- React + Vite
- Ant Design for component system
- Tailwind for layout/utilities
- TanStack Query for server state
- React Router for routing

## Structure

- `src/app`: app shell, providers, router
- `src/features/<feature>`: feature pages/components/hooks
- `src/shared`: API client, shared UI helpers, constants
- `src/styles`: global CSS + Tailwind entry

## UI Rules

- Ant Design component first.
- Tailwind for spacing/layout wrappers.
- Avoid duplicated styling systems for same concern.

## Data Fetching Rules

- One query key strategy per feature.
- Mutations invalidate only related keys.
- Handle loading/error/empty states on every server-driven screen.
