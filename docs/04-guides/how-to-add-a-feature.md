# How to Add a Feature (Migration Version)

## Step 1: Pick feature scope

- Choose one row from `feature-parity-checklist.md`.
- Define parity acceptance criteria.

## Step 2: Backend slice

- Add domain rules.
- Add application use case/service.
- Add repository methods.
- Add route/controller in `/api/v1`.
- Add tests.

## Step 3: Frontend slice

- Add feature folder in `src/features/<feature>`.
- Add query/mutation hooks using TanStack Query.
- Add page/components with AntD + Tailwind.

## Step 4: Validate

- Compare behavior with legacy flow.
- Check loading/error/empty states.

## Step 5: Document

- Update parity checklist status.
- Update migration and architecture docs if needed.
