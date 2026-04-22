import { expect, test } from "@playwright/test";

const uid = () => `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

test.describe("Backend feature parity flows", () => {
  test("user auth + address + password flows", async ({ request }) => {
    const id = uid();
    const email = `user-${id}@example.com`;
    const password = "secret123";
    const nextPassword = "newsecret123";

    const register = await request.post("/api/v1/auth/register", {
      data: {
        fullName: `User ${id}`,
        email,
        password,
      },
    });
    expect(register.status()).toBe(201);
    const registeredBody = await register.json();
    expect(registeredBody.success).toBe(true);
    const userId = registeredBody.data.id as string;

    const login = await request.post("/api/v1/auth/login", {
      data: { email, password },
    });
    expect(login.status()).toBe(200);

    const createAddress = await request.post(`/api/v1/user/${userId}/address`, {
      data: { mainAddress: "123 Test Street" },
    });
    expect(createAddress.status()).toBe(201);

    const listAddress = await request.get(`/api/v1/user/${userId}/address`);
    expect(listAddress.status()).toBe(200);
    const addressesBody = await listAddress.json();
    expect(Array.isArray(addressesBody.data)).toBe(true);
    expect(addressesBody.data.length).toBeGreaterThan(0);

    const changePassword = await request.patch("/api/v1/auth/password/change", {
      data: {
        userId,
        oldPassword: password,
        newPassword: nextPassword,
        confirmPassword: nextPassword,
      },
    });
    expect(changePassword.status()).toBe(200);

    const loginWithNewPassword = await request.post("/api/v1/auth/login", {
      data: { email, password: nextPassword },
    });
    expect(loginWithNewPassword.status()).toBe(200);

    const forgot = await request.post("/api/v1/auth/password/forgot", {
      data: { email },
    });
    expect(forgot.status()).toBe(201);
    const forgotBody = await forgot.json();
    const otp = forgotBody.data.otp as string;

    const verifyOtp = await request.post("/api/v1/auth/password/otp", {
      data: {
        email,
        otp,
      },
    });
    expect(verifyOtp.status()).toBe(200);

    const resetPassword = "reset123456";
    const reset = await request.post("/api/v1/auth/password/reset", {
      data: {
        email,
        password: resetPassword,
      },
    });
    expect(reset.status()).toBe(200);

    const loginAfterReset = await request.post("/api/v1/auth/login", {
      data: {
        email,
        password: resetPassword,
      },
    });
    expect(loginAfterReset.status()).toBe(200);
  });

  test("admin product/category/account/role domain endpoints", async ({ request }) => {
    const id = uid();

    const createRole = await request.post("/api/v1/admin/roles", {
      data: {
        title: `Role ${id}`,
        description: "role for test",
      },
    });
    expect(createRole.status()).toBe(201);
    const roleBody = await createRole.json();
    const roleId = roleBody.data.id as string;

    const patchPermissions = await request.patch("/api/v1/admin/roles/permissions", {
      data: {
        permissions: [
          {
            id: roleId,
            permissions: ["products_view", "products_edit"],
          },
        ],
      },
    });
    expect(patchPermissions.status()).toBe(200);

    const createAccount = await request.post("/api/v1/admin/accounts", {
      data: {
        fullName: `Admin ${id}`,
        email: `admin-${id}@example.com`,
        password: "secret123",
        roleId,
      },
    });
    expect(createAccount.status()).toBe(201);
    const accountBody = await createAccount.json();
    const accountId = accountBody.data.id as string;

    const changeAccountStatus = await request.patch(`/api/v1/admin/accounts/change-status/inactive/${accountId}`);
    expect(changeAccountStatus.status()).toBe(200);

    const createCategory = await request.post("/api/v1/admin/categories", {
      data: {
        title: `Category ${id}`,
        slug: `category-${id}`,
      },
    });
    expect(createCategory.status()).toBe(201);
    const categoryBody = await createCategory.json();
    const categoryId = categoryBody.data.id as string;

    const createProduct = await request.post("/api/v1/admin/products", {
      data: {
        title: `Product ${id}`,
        slug: `product-${id}`,
        price: 100000,
        stock: 10,
        productCategoryId: categoryId,
      },
    });
    expect(createProduct.status()).toBe(201);
    const productBody = await createProduct.json();
    const productId = productBody.data.id as string;

    const changeProductStatus = await request.patch(`/api/v1/admin/products/change-status/inactive/${productId}`);
    expect(changeProductStatus.status()).toBe(200);

    const changeMulti = await request.patch("/api/v1/admin/products/change-multi", {
      data: {
        type: "active",
        ids: [productId],
      },
    });
    expect(changeMulti.status()).toBe(200);

    const listProducts = await request.get("/api/v1/admin/products?search=Product");
    expect(listProducts.status()).toBe(200);
    const productsBody = await listProducts.json();
    expect(productsBody.success).toBe(true);
  });
});
