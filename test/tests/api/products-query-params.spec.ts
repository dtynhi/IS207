import { expect, test } from "@playwright/test";

test.describe("Product query params", () => {
  test("parses common + specific query params via reusable schema", async ({
    request,
  }) => {
    const response = await request.get(
      "/api/v1/products?page=2&limit=10&keyword=math&sortBy=price&sortOrder=asc&school=HCMUT&school=HCMUS&facet=f1&facet=f2&minPrice=100&maxPrice=200"
    );

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.meta.page).toBe(2);
    expect(body.meta.limit).toBe(10);
    expect(Array.isArray(body.data)).toBeTruthy();
  });
});
