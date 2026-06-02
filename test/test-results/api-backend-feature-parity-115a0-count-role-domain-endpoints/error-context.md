# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\backend-feature-parity.spec.ts >> Backend feature parity flows >> admin product/category/account/role domain endpoints
- Location: tests\api\backend-feature-parity.spec.ts:94:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 401
```

# Test source

```ts
  3   | const uid = () => `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  4   | 
  5   | test.describe("Backend feature parity flows", () => {
  6   |   test("user auth + address + password flows", async ({ request }) => {
  7   |     const id = uid();
  8   |     const email = `user-${id}@example.com`;
  9   |     const password = "secret123";
  10  |     const nextPassword = "newsecret123";
  11  | 
  12  |     const register = await request.post("/api/v1/auth/register", {
  13  |       data: {
  14  |         fullName: `User ${id}`,
  15  |         email,
  16  |         password,
  17  |       },
  18  |     });
  19  |     expect(register.status()).toBe(201);
  20  |     const registeredBody = await register.json();
  21  |     expect(registeredBody.success).toBe(true);
  22  |     const userId = registeredBody.data.id as string;
  23  | 
  24  |     const login = await request.post("/api/v1/auth/login", {
  25  |       data: { email, password },
  26  |     });
  27  |     expect(login.status()).toBe(200);
  28  | 
  29  |     const createAddress = await request.post(`/api/v1/user/${userId}/address`, {
  30  |       data: {
  31  |         fullName: `User ${id}`,
  32  |         phone: "0912345678",
  33  |         province: "TP.HCM",
  34  |         ward: "Quận 1",
  35  |         addressLine: "123 Test Street",
  36  |       },
  37  |     });
  38  |     expect(createAddress.status()).toBe(201);
  39  | 
  40  |     const listAddress = await request.get(`/api/v1/user/${userId}/address`);
  41  |     expect(listAddress.status()).toBe(200);
  42  |     const addressesBody = await listAddress.json();
  43  |     expect(Array.isArray(addressesBody.data)).toBe(true);
  44  |     expect(addressesBody.data.length).toBeGreaterThan(0);
  45  | 
  46  |     const changePassword = await request.patch("/api/v1/auth/password/change", {
  47  |       data: {
  48  |         userId,
  49  |         oldPassword: password,
  50  |         newPassword: nextPassword,
  51  |         confirmPassword: nextPassword,
  52  |       },
  53  |     });
  54  |     expect(changePassword.status()).toBe(200);
  55  | 
  56  |     const loginWithNewPassword = await request.post("/api/v1/auth/login", {
  57  |       data: { email, password: nextPassword },
  58  |     });
  59  |     expect(loginWithNewPassword.status()).toBe(200);
  60  | 
  61  |     const forgot = await request.post("/api/v1/auth/password/forgot", {
  62  |       data: { email },
  63  |     });
  64  |     expect(forgot.status()).toBe(201);
  65  |     const forgotBody = await forgot.json();
  66  |     const otp = forgotBody.data.otp as string;
  67  | 
  68  |     const verifyOtp = await request.post("/api/v1/auth/password/otp", {
  69  |       data: {
  70  |         email,
  71  |         otp,
  72  |       },
  73  |     });
  74  |     expect(verifyOtp.status()).toBe(200);
  75  | 
  76  |     const resetPassword = "reset123456";
  77  |     const reset = await request.post("/api/v1/auth/password/reset", {
  78  |       data: {
  79  |         email,
  80  |         password: resetPassword,
  81  |       },
  82  |     });
  83  |     expect(reset.status()).toBe(200);
  84  | 
  85  |     const loginAfterReset = await request.post("/api/v1/auth/login", {
  86  |       data: {
  87  |         email,
  88  |         password: resetPassword,
  89  |       },
  90  |     });
  91  |     expect(loginAfterReset.status()).toBe(200);
  92  |   });
  93  | 
  94  |   test("admin product/category/account/role domain endpoints", async ({ request }) => {
  95  |     const id = uid();
  96  | 
  97  |     const createRole = await request.post("/api/v1/admin/roles", {
  98  |       data: {
  99  |         title: `Role ${id}`,
  100 |         description: "role for test",
  101 |       },
  102 |     });
> 103 |     expect(createRole.status()).toBe(201);
      |                                 ^ Error: expect(received).toBe(expected) // Object.is equality
  104 |     const roleBody = await createRole.json();
  105 |     const roleId = roleBody.data.id as string;
  106 | 
  107 |     const patchPermissions = await request.patch("/api/v1/admin/roles/permissions", {
  108 |       data: {
  109 |         permissions: [
  110 |           {
  111 |             id: roleId,
  112 |             permissions: ["products_view", "products_edit"],
  113 |           },
  114 |         ],
  115 |       },
  116 |     });
  117 |     expect(patchPermissions.status()).toBe(200);
  118 | 
  119 |     const createAccount = await request.post("/api/v1/admin/accounts", {
  120 |       data: {
  121 |         fullName: `Admin ${id}`,
  122 |         email: `admin-${id}@example.com`,
  123 |         password: "secret123",
  124 |         roleId,
  125 |       },
  126 |     });
  127 |     expect(createAccount.status()).toBe(201);
  128 |     const accountBody = await createAccount.json();
  129 |     const accountId = accountBody.data.id as string;
  130 | 
  131 |     const changeAccountStatus = await request.patch(`/api/v1/admin/accounts/change-status/inactive/${accountId}`);
  132 |     expect(changeAccountStatus.status()).toBe(200);
  133 | 
  134 |     const createCategory = await request.post("/api/v1/admin/categories", {
  135 |       data: {
  136 |         title: `Category ${id}`,
  137 |         slug: `category-${id}`,
  138 |       },
  139 |     });
  140 |     expect(createCategory.status()).toBe(201);
  141 |     const categoryBody = await createCategory.json();
  142 |     const categoryId = categoryBody.data.id as string;
  143 | 
  144 |     const createProduct = await request.post("/api/v1/admin/products", {
  145 |       data: {
  146 |         title: `Product ${id}`,
  147 |         slug: `product-${id}`,
  148 |         price: 100000,
  149 |         stock: 10,
  150 |         productCategoryId: categoryId,
  151 |       },
  152 |     });
  153 |     expect(createProduct.status()).toBe(201);
  154 |     const productBody = await createProduct.json();
  155 |     const productId = productBody.data.id as string;
  156 | 
  157 |     const changeProductStatus = await request.patch(`/api/v1/admin/products/change-status/inactive/${productId}`);
  158 |     expect(changeProductStatus.status()).toBe(200);
  159 | 
  160 |     const changeMulti = await request.patch("/api/v1/admin/products/change-multi", {
  161 |       data: {
  162 |         type: "active",
  163 |         ids: [productId],
  164 |       },
  165 |     });
  166 |     expect(changeMulti.status()).toBe(200);
  167 | 
  168 |     const listProducts = await request.get("/api/v1/admin/products?search=Product");
  169 |     expect(listProducts.status()).toBe(200);
  170 |     const productsBody = await listProducts.json();
  171 |     expect(productsBody.success).toBe(true);
  172 |   });
  173 | });
  174 | 
```