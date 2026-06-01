import { Router } from "express";
import { z } from "zod";
import { sendError, sendSuccess } from "../../../../shared/response/response";
import { requireAdmin } from "../../../../shared/middleware/admin-auth.middleware";
import {
  changeMultiProducts,
  createProduct,
  deleteProduct,
  getAdminProductDetail,
  getProductDetail,
  listProducts,
  updateProduct,
  updateProductStatus,
  createCampaign,
  getActiveCampaign,
  deactivateActiveCampaign,
  getAllCampaigns,
  getCampaignById,
  deleteCampaign,
  getActiveFlashSale,
  getFlashSaleSessions,
  getAllFlashSaleAdmin,
  createFlashSaleSession,
  updateFlashSaleStatus,
  deleteFlashSaleSession,
  removeProductFromFlashSale
} from "../../product.service";
import { productQuerySchema } from "../../product.query";

const router = Router();

// ─── PRODUCT routes (giữ nguyên) ──────────────────────────────────────────────

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
    if (!product) return sendError(res, 404, "NOT_FOUND", "Product not found");
    return sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
});

router.get("/admin/products", requireAdmin, async (req, res, next) => {
  try {
    const params = productQuerySchema.parse(req.query);
    const result = await listProducts(params, "admin");
    return sendSuccess(res, result.items, { meta: result.meta });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/products/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const item = await getAdminProductDetail(id);
    if (!item) return sendError(res, 404, "NOT_FOUND", "Product not found");
    return sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.post("/admin/products", requireAdmin, async (req, res, next) => {
  try {
    const payload = z.object({
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
      thumbnail: z.string().optional(),
      brand: z.string().optional(),
      featured: z.boolean().optional(),
    }).parse(req.body);

    const item = await createProduct(payload);
    return sendSuccess(res, item, { statusCode: 201 });
  } catch (error) {
    next(error);
  }
});


router.patch("/admin/products/change-status/:status/:id", requireAdmin, async (req, res, next) => {
  try {
    const status = z.enum(["active", "inactive"]).parse(req.params.status);
    const id = z.string().parse(req.params.id);
    const item = await updateProductStatus(id, status);
    return sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/products/change-multi", requireAdmin, async (req, res, next) => {
  try {
    const payload = z.object({
      type: z.enum(["active", "inactive", "delete-all", "change-position"]),
      ids: z.union([z.string(), z.array(z.string())]),
    }).parse(req.body);

    const ids = Array.isArray(payload.ids)
      ? payload.ids
      : payload.ids.split(",").map((id) => id.trim()).filter(Boolean);

    const result = await changeMultiProducts({ type: payload.type, ids });
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/products/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const item = await updateProduct(id, req.body as Record<string, unknown>);
    return sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.delete("/admin/products/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const deletedById = z.string().optional().parse(req.headers["x-account-id"] || req.query.deletedById);
    await deleteProduct(id, deletedById);
    return sendSuccess(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});


router.post("/admin/campaigns/:id/deactivate", requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id; // Bắt lấy cái ID từ Frontend gửi lên
    const result = await deactivateActiveCampaign(id); // Truyền ID vào hàm
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

router.get("/admin/campaigns", requireAdmin, async (req, res, next) => {
  try {
    const campaigns = await getAllCampaigns();
    return sendSuccess(res, campaigns);
  } catch (error) {
    next(error);
  }
});

router.get("/campaigns/active", async (req, res, next) => {
  try {
    const campaign = await getActiveCampaign();
    return sendSuccess(res, campaign);
  } catch (error) {
    next(error);
  }
});

router.get("/campaigns/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const campaign = await getCampaignById(id);
    return sendSuccess(res, campaign);
  } catch (error) {
    next(error);
  }
});

router.post("/admin/campaigns", requireAdmin, async (req, res, next) => {
  try {
    const result = await createCampaign(req.body); 
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

router.delete("/admin/campaigns/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id; 
    await deleteCampaign(id); 
    return sendSuccess(res, { message: "Xóa thành công" });
  } catch (error) {
    next(error);
  }
});

router.get("/flash-sale/active", async (req, res, next) => {
  try {
    const session = await getActiveFlashSale();
    return sendSuccess(res, session);
  } catch (error) {
    next(error);
  }
});

router.get("/flash-sale/sessions", async (req, res, next) => {
  try {
    const sessions = await getFlashSaleSessions();
    return sendSuccess(res, sessions);
  } catch (error) {
    next(error);
  }
});

router.get("/admin/flash-sale", requireAdmin, async (req, res, next) => {
  try {
    const sessions = await getAllFlashSaleAdmin();
    return sendSuccess(res, sessions);
  } catch (error) {
    next(error);
  }
});

router.post("/admin/flash-sale", requireAdmin, async (req, res, next) => {
  try {
    const payload = z.object({
      startTime: z.string().min(1),
      endTime: z.string().min(1),
      productIds: z.array(z.string()).min(1, "Chọn ít nhất 1 sản phẩm!"),
    }).parse(req.body);

    const session = await createFlashSaleSession(payload);
    return sendSuccess(res, session, { statusCode: 201 });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/flash-sale/:id/status", requireAdmin, async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const { status } = z.object({
      status: z.enum(["UPCOMING", "ONGOING", "ENDED"]),
    }).parse(req.body);

    const session = await updateFlashSaleStatus(id, status);
    return sendSuccess(res, session);
  } catch (error) {
    next(error);
  }
});

router.delete("/admin/flash-sale/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    await deleteFlashSaleSession(id);
    return sendSuccess(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

router.delete("/admin/flash-sale/:sessionId/products/:productId", requireAdmin, async (req, res, next) => {
  try {
    const { sessionId, productId } = req.params;
    await removeProductFromFlashSale(sessionId, productId);
    return res.status(200).json({ success: true, message: "Đã gỡ sản phẩm khỏi ca Flash Sale" });
  } catch (error) {
    next(error);
  }
});

export default router;