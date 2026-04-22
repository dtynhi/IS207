import { expect, test } from "@playwright/test";

test.describe("All migrated backend route groups", () => {
  test("client and admin routes are mounted", async ({ request }) => {
    const urls = [
      "/api/v1/products",
      "/api/v1/categories",
      "/api/v1/search",
      "/api/v1/admin/dashboard",
      "/api/v1/admin/products",
      "/api/v1/admin/categories",
      "/api/v1/admin/accounts",
      "/api/v1/admin/roles",
      "/api/v1/admin/settings/general",
    ];

    for (const url of urls) {
      const response = await request.get(url);
      expect(response.status(), `${url} should not be 404`).not.toBe(404);
    }
  });

  test("auth endpoints respond", async ({ request }) => {
    const clientLogin = await request.post("/api/v1/auth/login", {
      data: { email: "none@example.com", password: "wrongpass" },
    });

    const adminLogin = await request.post("/api/v1/admin/auth/login", {
      data: { email: "none@example.com", password: "wrongpass" },
    });

    expect([200, 401]).toContain(clientLogin.status());
    expect([200, 401]).toContain(adminLogin.status());
  });
});
