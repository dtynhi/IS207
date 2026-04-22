import { expect, test } from "@playwright/test";

test.describe("API health", () => {
  test("returns healthy status", async ({ request }) => {
    const response = await request.get("/api/v1/health");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.service).toBe("unimarket-api");
    expect(body.data.status).toBe("ok");
    expect(typeof body.data.timestamp).toBe("string");
  });
});
