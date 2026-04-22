# Feature Parity Checklist

Status legend: `Not Started`, `In Progress`, `Done`.

## Client Features

| Feature | Legacy Routes | New API/Frontend Scope | Status |
|---|---|---|---|
| Home | `GET /` | Home feed/query endpoints + React page | Not Started |
| Product list | `GET /products`, `GET /products/:slugCategory` | Product listing/filter/pagination | Not Started |
| Product detail | `GET /products/detail/:slugProduct` | Product detail endpoint + page | Not Started |
| Search | `GET /search` | Keyword + multi-filter search | Not Started |
| Cart | `/cart/*` routes | Cart CRUD endpoints + React cart page | Not Started |
| Checkout | `/checkout/*` routes | Checkout flow + order submit | Not Started |
| Auth | `/user/register`, `/user/login`, `/user/logout` | Auth APIs + frontend forms | Not Started |
| User profile | `/user/info`, `/user/*` | Profile/address/password/purchase features | Not Started |

## Admin Features

| Feature | Legacy Routes | New API/Frontend Scope | Status |
|---|---|---|---|
| Admin auth | `/admin/auth/*` | Admin login/logout API + UI | Not Started |
| Dashboard | `/admin/dashboard` | Summary metrics endpoint + page | Not Started |
| Products management | `/admin/products/*` | Product admin CRUD + status/bulk actions | Not Started |
| Categories management | `/admin/products-category/*` | Category CRUD + tree selection | Not Started |
| Roles/permissions | `/admin/roles/*` | Role CRUD + permissions matrix | Not Started |
| Accounts management | `/admin/accounts/*` | Admin account CRUD/status | Not Started |
| My account | `/admin/my-account/*` | Profile edit APIs + UI | Not Started |
| Settings | `/admin/settings/general` | General setting update flow | Not Started |

## Completion Criteria

A feature moves to `Done` when:

1. API endpoints implemented and tested.
2. Frontend screens implemented and behavior-matched.
3. Data dependencies migrated and validated.
4. Docs updated.
