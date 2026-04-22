# API Contract Standards

## Versioning

- Prefix all endpoints with `/api/v1`.

## Response Format

- Success: raw domain payload or `{ data: ... }` per endpoint contract.
- Error:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

## Filtering and Pagination

- Pagination: `page`, `limit`
- Search keyword: `keyword`
- Filters: repeated query params for multi-select (example: `facet=a&facet=b`)

## Source of Truth

- OpenAPI spec maintained in backend and consumed by frontend.
