import { Router } from "express";
import { z } from "zod";
import { baseQueryParamsSchema } from "../../../../shared/query/base-query.params";
import { sendError, sendSuccess } from "../../../../shared/response/response";
import {
  createCategory,
  deleteCategory,
  getCategoryDetail,
  listAdminCategories,
  listClientCategories,
  updateCategory,
  updateCategoryStatus,
} from "../../category.service";

const router = Router();

router.get("/categories", async (_req, res, next) => {
  try {
    const items = await listClientCategories();
    return sendSuccess(res, items);
  } catch (error) {
    next(error);
  }
});

router.get("/admin/categories", async (req, res, next) => {
  try {
    const params = baseQueryParamsSchema.parse(req.query);
    const result = await listAdminCategories(params);
    return sendSuccess(res, result.items, { meta: result.meta });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/categories/:id", async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const item = await getCategoryDetail(id);
    if (!item) {
      return sendError(res, 404, "NOT_FOUND", "Category not found");
    }

    return sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.post("/admin/categories", async (req, res, next) => {
  try {
    const payload = z
      .object({
        title: z.string(),
        slug: z.string(),
        parentId: z.string().optional(),
        position: z.number().int().optional(),
        description: z.string().optional(),
        thumbnail: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
      })
      .parse(req.body);

    const item = await createCategory(payload);
    return sendSuccess(res, item, { statusCode: 201 });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/categories/:id", async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const item = await updateCategory(id, req.body as Record<string, unknown>);
    return sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/categories/change-status/:status/:id", async (req, res, next) => {
  try {
    const status = z.enum(["active", "inactive"]).parse(req.params.status);
    const id = z.string().parse(req.params.id);
    const item = await updateCategoryStatus(id, status);
    return sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.delete("/admin/categories/:id", async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    await deleteCategory(id);
    return sendSuccess(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

export default router;
