# Backend Developer Guide

## Request flow

`route -> controller -> application service -> repository -> database`

## Rules

- Business logic stays in `application` and `domain`.
- Controllers should not directly call Prisma.
- Repositories hide SQL/ORM implementation details.
