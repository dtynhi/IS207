# Uni Market

Uni Market is a Node.js + Express + Pug marketplace project with:
- Client storefront pages
- Admin dashboard and role-based management
- MongoDB (Mongoose) data layer

## Requirements
- Node.js 18+ (recommended)
- MongoDB local instance **or** MongoDB Atlas connection string

## Installation
```bash
npm install
```

## Environment Variables
Create a `.env` file in the project root:

```env
PORT=3000
MONGO_URL=mongodb://127.0.0.1:27017/unimarket

# Cloudinary (required for image upload features)
CLOUD_NAME=your_cloud_name
CLOUD_KEY=your_cloud_api_key
CLOUD_SECRET=your_cloud_api_secret

# Gmail/Nodemailer (required for forgot-password email flow)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

Minimum required to boot app: `PORT`, `MONGO_URL`.

## Run
```bash
npm start
```

App base URL: `http://localhost:3000`

## Route Map (Detailed)

### Public / Client Routes
| Method | URL | Description | Auth |
|---|---|---|---|
| GET | `/` | Home page | No |
| GET | `/products` | Product listing page | No |
| GET | `/products/:slugCategory` | Products by category slug | No |
| GET | `/products/detail/:slugProduct` | Product detail by slug | No |
| GET | `/search` | Search page (`?keyword=...`) | No |
| GET | `/cart` | View cart | No |
| POST | `/cart/add/:productId` | Add product to cart | No |
| GET | `/cart/delete/:productId` | Remove item from cart | No |
| GET | `/cart/update/:productId/:quantity` | Update quantity | No |
| GET | `/checkout` | Checkout page | No |
| POST | `/checkout/order` | Create order | No |
| GET | `/checkout/success/:orderId` | Order success page | No |
| GET | `/user/register` | Register page | No |
| POST | `/user/register` | Register action | No |
| GET | `/user/login` | Login page | No |
| POST | `/user/login` | Login action | No |
| GET | `/user/logout` | Logout action | No |
| GET | `/user/password/forgot` | Forgot password page | No |
| POST | `/user/password/forgot` | Send OTP email | No |
| GET | `/user/password/otp` | OTP verification page | No |
| POST | `/user/password/otp` | OTP verification action | No |
| GET | `/user/password/reset` | Reset password page | No |
| POST | `/user/password/reset` | Reset password action | No |
| GET | `/user/info` | User profile page | Yes (user middleware) |
| PATCH | `/user/:id/update` | Update profile (+avatar upload) | Route has no middleware |
| GET | `/user/address` | Address list page | Route has no middleware |
| GET | `/user/address/create` | Create address page | Route has no middleware |
| PATCH | `/user/:id/address/create` | Create address action | Route has no middleware |
| PATCH | `/user/:id/:idAdd/address/update` | Update address action | Route has no middleware |
| GET | `/user/changepassword` | Change password page | Route has no middleware |
| PATCH | `/user/:id/changepass` | Change password action | Route has no middleware |
| GET | `/user/purchase` | Purchase history page | Route has no middleware |

Note: several `/user/*` routes depend on cookies/user IDs in controller logic but are not protected by route-level middleware.

### Admin Routes (`/admin`)
> `prefixAdmin` is configured as `/admin` in `config/system.js`.

| Method | URL | Description | Auth |
|---|---|---|---|
| GET | `/admin/auth/login` | Admin login page | No |
| POST | `/admin/auth/login` | Admin login action | No |
| GET | `/admin/auth/logout` | Admin logout action | No |
| GET | `/admin/dashboard` | Dashboard | Yes (admin) |
| GET | `/admin/products` | Product list | Yes (admin) |
| GET | `/admin/products/create` | Create product page | Yes (admin) |
| POST | `/admin/products/create` | Create product action | Yes (admin) |
| GET | `/admin/products/edit/:id` | Edit product page | Yes (admin) |
| PATCH | `/admin/products/edit/:id` | Edit product action | Yes (admin) |
| GET | `/admin/products/detail/:id` | Product detail page | Yes (admin) |
| PATCH | `/admin/products/change-status/:status/:id` | Change product status | Yes (admin) |
| PATCH | `/admin/products/change-multi` | Bulk update products | Yes (admin) |
| DELETE | `/admin/products/delete/:id` | Delete product | Yes (admin) |
| GET | `/admin/products-category` | Category list | Yes (admin) |
| GET | `/admin/products-category/create` | Create category page | Yes (admin) |
| POST | `/admin/products-category/create` | Create category action | Yes (admin) |
| GET | `/admin/products-category/edit/:id` | Edit category page | Yes (admin) |
| PATCH | `/admin/products-category/edit/:id` | Edit category action | Yes (admin) |
| GET | `/admin/products-category/detail/:id` | Category detail page | Yes (admin) |
| PATCH | `/admin/products-category/change-status/:status/:id` | Change category status | Yes (admin) |
| DELETE | `/admin/products-category/delete/:id` | Delete category | Yes (admin) |
| GET | `/admin/roles` | Role list | Yes (admin) |
| GET | `/admin/roles/create` | Create role page | Yes (admin) |
| POST | `/admin/roles/create` | Create role action | Yes (admin) |
| GET | `/admin/roles/edit/:id` | Edit role page | Yes (admin) |
| PATCH | `/admin/roles/edit/:id` | Edit role action | Yes (admin) |
| GET | `/admin/roles/permissions` | Permissions matrix page | Yes (admin) |
| PATCH | `/admin/roles/permissions` | Update permissions matrix | Yes (admin) |
| GET | `/admin/accounts` | Admin account list | Yes (admin) |
| GET | `/admin/accounts/create` | Create account page | Yes (admin) |
| POST | `/admin/accounts/create` | Create account action | Yes (admin) |
| GET | `/admin/accounts/edit/:id` | Edit account page | Yes (admin) |
| PATCH | `/admin/accounts/edit/:id` | Edit account action | Yes (admin) |
| GET | `/admin/accounts/detail/:id` | Account detail page | Yes (admin) |
| PATCH | `/admin/accounts/change-status/:status/:id` | Change account status | Yes (admin) |
| DELETE | `/admin/accounts/delete/:id` | Delete account | Yes (admin) |
| GET | `/admin/my-account` | My account page | Yes (admin) |
| GET | `/admin/my-account/edit` | My account edit page | Yes (admin) |
| PATCH | `/admin/my-account/edit` | My account edit action | Yes (admin) |
| GET | `/admin/settings/general` | General settings page | Yes (admin) |
| PATCH | `/admin/settings/general` | Update general settings (logo, etc.) | Yes (admin) |

### Fallback
| Method | URL | Description |
|---|---|---|
| GET | `*` | Renders client 404 page |

## HTTP Method Override
This project uses `method-override` with `_method`.
For HTML forms, send as `POST` and append query:
- `?_method=PATCH`
- `?_method=DELETE`

## Seed Data (Optional)
Prebuilt import files are available in `data/`:
- `roles.json`
- `accounts.json`
- `settings-general.json`
- `products-category.json`
- `products.json`
- `users.json`

Example import:
```bash
mongoimport --uri "<YOUR_URI>" --db unimarket --collection roles --file "D:\\Unimarket-main\\data\\roles.json" --jsonArray
```
