import { Router } from "express";
import { z } from "zod";
import { sendError, sendSuccess } from "../../../../shared/response/response";
import {
  changeMultiProducts,
  createProduct,
  deleteProduct,
  getAdminProductDetail,
  getProductDetail,
  listProducts,
  updateProduct,
  updateProductStatus,
} from "../../product.service";
import { productQuerySchema } from "../../product.query";

const router = Router();

router.get("/products", async (req, res, next) => {
  try {
    const params = productQuerySchema.parse(req.query);
    const result = await listProducts(params, "client");
    return sendSuccess(res, result.items, { meta: result.meta });
  } catch (error) {
    next(error);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const params = productQuerySchema.parse(req.query);
    const result = await listProducts(params, "client");
    return sendSuccess(res, result.items, { meta: result.meta });
  } catch (error) {
    next(error);
  }
});

router.get("/products/detail/:slug", async (req, res, next) => {
  try {
    const slug = z.string().parse(req.params.slug);
    const product = await getProductDetail(slug);
    if (!product) {
      return sendError(res, 404, "NOT_FOUND", "Product not found");
    }
    return sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
});

router.get("/admin/products", async (req, res, next) => {
  try {
    const params = productQuerySchema.parse(req.query);
    const result = await listProducts(params, "admin");
    return sendSuccess(res, result.items, { meta: result.meta });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/products/:id", async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const item = await getAdminProductDetail(id);
    if (!item) {
      return sendError(res, 404, "NOT_FOUND", "Product not found");
    }

    return sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.post("/admin/products", async (req, res, next) => {
  try {
    const payload = z
      .object({
        title: z.string().min(1),
        price: z.number().int().min(0),
        slug: z.string().min(1),
        description: z.string().optional(),
        discountPercentage: z.number().int().min(0).max(100).optional(),
        stock: z.number().int().min(0).optional(),
        productCategoryId: z.string().optional(),
        school: z.string().optional(),
        position: z.number().int().optional(),
        status: z.enum(["active", "inactive"]).optional(),
        createdById: z.string().optional(),
      })
      .parse(req.body);

    const item = await createProduct(payload);
    return sendSuccess(res, item, { statusCode: 201 });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/products/change-status/:status/:id", async (req, res, next) => {
  try {
    const status = z.enum(["active", "inactive"]).parse(req.params.status);
    const id = z.string().parse(req.params.id);
    const item = await updateProductStatus(id, status);
    return sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/products/change-multi", async (req, res, next) => {
  try {
    const payload = z
      .object({
        type: z.enum(["active", "inactive", "delete-all", "change-position"]),
        ids: z.union([z.string(), z.array(z.string())]),
      })
      .parse(req.body);

    const ids = Array.isArray(payload.ids)
      ? payload.ids
      : payload.ids
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean);

    const result = await changeMultiProducts({
      type: payload.type,
      ids,
    });

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/products/:id", async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const item = await updateProduct(id, req.body as Record<string, unknown>);
    return sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.delete("/admin/products/:id", async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const deletedById = z.string().optional().parse(req.headers["x-account-id"] || req.query.deletedById);
    await deleteProduct(id, deletedById);
    return sendSuccess(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

export default router;
