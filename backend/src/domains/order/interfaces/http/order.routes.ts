import { Router } from "express";
import { z } from "zod";
import { sendError, sendSuccess } from "../../../../shared/response/response";
import { getUserByToken } from "../../../auth/auth.service";
import { createOrder, getOrderDetail, listOrders, markOrderUser } from "../../order.service";

const router = Router();
const AUTH_COOKIE_NAME = "uni_auth_token";

const readCookie = (cookieHeader: string | undefined, key: string) => {
  if (!cookieHeader) return "";
  return cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${key}=`))
    ?.slice(key.length + 1) || "";
};

router.post("/orders", async (req, res, next) => {
  try {
    const payload = z
      .object({
        userId: z.string().optional(),
        fullName: z.string().min(1),
        phone: z.string().min(1),
        address: z.string().min(1),
        items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1) })).min(1),
      })
      .parse(req.body);

    const order = await createOrder(payload);
    return sendSuccess(res, order, { statusCode: 201 });
  } catch (error) {
    next(error);
  }
});

router.get("/orders", async (req, res, next) => {
  try {
    const params = z
      .object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
      })
      .parse(req.query);

    const result = await listOrders(params);
    return sendSuccess(res, result.items, { meta: result.meta });
  } catch (error) {
    next(error);
  }
});

router.get("/orders/:id", async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const order = await getOrderDetail(id);
    if (!order) return sendError(res, 404, "NOT_FOUND", "Order not found");
    return sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
});

// Legacy-compatible checkout endpoints
router.post("/checkout/order", async (req, res, next) => {
  try {
    const payload = z
      .object({
        userId: z.string().optional(),
        fullName: z.string().min(1),
        phone: z.string().min(1),
        address: z.string().min(1),
        items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1) })).min(1),
      })
      .parse(req.body);

    const order = await createOrder(payload);
    return sendSuccess(res, order, { statusCode: 201 });
  } catch (error) {
    next(error);
  }
});

router.get("/checkout/success/:orderId", async (req, res, next) => {
  try {
    const orderId = z.string().parse(req.params.orderId);
    const queryUserId = z.string().optional().parse(req.headers["x-user-id"] || req.query.userId);
    const token = readCookie(typeof req.headers.cookie === "string" ? req.headers.cookie : undefined, AUTH_COOKIE_NAME);
    const userFromToken = token ? await getUserByToken(token) : null;
    const userId = queryUserId || userFromToken?.id;

    if (userId) {
      await markOrderUser(orderId, userId);
    }

    const order = await getOrderDetail(orderId);
    if (!order) {
      return sendError(res, 404, "NOT_FOUND", "Order not found");
    }

    return sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
});

export default router;
