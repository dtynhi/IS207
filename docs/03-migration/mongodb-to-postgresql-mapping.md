# MongoDB to PostgreSQL Mapping

## Collection -> Table Mapping

- `roles` -> `role`
- `accounts` -> `account`
- `users` -> `user`
- `products-category` -> `product_category`
- `products` -> `product`
- `cart` -> `cart`
- `orders` -> `order` + `order_item`
- `settings-general` -> `setting_general`
- `forgot-password` -> `forgot_password`

## Transform Rules

- Mongo `_id` becomes string `id` in v1 migration.
- Embedded order products become `order_item` rows.
- Category tree uses self-reference (`parent_id`).
- Preserve `status` and `deleted` flags from legacy logic.

## Validation Checklist

- Count parity per table.
- Unique fields preserve uniqueness (`email`, `slug`).
- Spot-check 20 random records per critical table.
