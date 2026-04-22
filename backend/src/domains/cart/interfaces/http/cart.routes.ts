import { Request, Router } from "express";
import { z } from "zod";
import { sendError, sendSuccess } from "../../../../shared/response/response";
import { getUserByToken } from "../../../auth/auth.service";
import {
  addCartItem,
  deleteCartItem,
  deleteCartItemByProduct,
  getCartByUser,
  updateCartItem,
  updateCartItemByProduct,
} from "../../cart.service";

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

const resolveUserId = async (req: Request) => {
  const headerUserId = typeof req.headers["x-user-id"] === "string" ? req.headers["x-user-id"] : "";
  const queryUserId = typeof req.query.userId === "string" ? req.query.userId : "";
  if (headerUserId || queryUserId) return headerUserId || queryUserId;

  const cookieHeader = typeof req.headers.cookie === "string" ? req.headers.cookie : undefined;
  const token = readCookie(cookieHeader, AUTH_COOKIE_NAME);
  if (!token) return "";

  const user = await getUserByToken(token);
  return user?.id || "";
};

router.get("/cart", async (req, res, next) => {
  try {
    const userId = z.string().parse(await resolveUserId(req));
    const cart = await getCartByUser(userId);
    return sendSuccess(res, cart);
  } catch (error) {
    next(error);
  }
});

router.post("/cart/items", async (req, res, next) => {
  try {
    const payload = z
      .object({ userId: z.string().min(1).optional(), productId: z.string().min(1), quantity: z.number().int().min(1).default(1) })
      .parse(req.body);
    const fallbackUserId = await resolveUserId(req);
    const userId = payload.userId || fallbackUserId;
    if (!userId) {
      return sendError(res, 401, "USER_NOT_FOUND", "User not found or not authenticated");
    }

    const result = await addCartItem(userId, payload.productId, payload.quantity);

    if (!result.ok && result.reason === "USER_NOT_FOUND") {
      return sendError(res, 401, "USER_NOT_FOUND", "User not found or not authenticated");
    }

    if (!result.ok && result.reason === "PRODUCT_NOT_FOUND") {
      return sendError(res, 404, "PRODUCT_NOT_FOUND", "Product not found");
    }

    if (!result.ok && result.reason === "OUT_OF_STOCK") {
      return sendError(res, 400, "OUT_OF_STOCK", "Quantity exceeds stock");
    }

    return sendSuccess(res, result.data, { statusCode: 201 });
  } catch (error) {
    next(error);
  }
});

router.patch("/cart/items/:id", async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const body = z.object({ quantity: z.number().int().min(1) }).parse(req.body);
    const result = await updateCartItem(id, body.quantity);

    if (!result.ok && result.reason === "PRODUCT_NOT_FOUND") {
      return sendError(res, 404, "PRODUCT_NOT_FOUND", "Product not found");
    }

    if (!result.ok && result.reason === "OUT_OF_STOCK") {
      return sendError(res, 400, "OUT_OF_STOCK", "Quantity exceeds stock");
    }

    return sendSuccess(res, result.data);
  } catch (error) {
    next(error);
  }
});

router.delete("/cart/items/:id", async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    await deleteCartItem(id);
    return sendSuccess(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

// Legacy-compatible endpoints
router.post("/cart/add/:productId", async (req, res, next) => {
  try {
    const productId = z.string().parse(req.params.productId);
    const payload = z
      .object({
        userId: z.string().min(1).optional(),
        quantity: z.number().int().min(1).default(1),
      })
      .parse(req.body);
    const fallbackUserId = await resolveUserId(req);
    const userId = payload.userId || fallbackUserId;
    if (!userId) {
      return sendError(res, 401, "USER_NOT_FOUND", "User not found or not authenticated");
    }

    const result = await addCartItem(userId, productId, payload.quantity);

    if (!result.ok && result.reason === "USER_NOT_FOUND") {
      return sendError(res, 401, "USER_NOT_FOUND", "User not found or not authenticated");
    }

    if (!result.ok && result.reason === "PRODUCT_NOT_FOUND") {
      return sendError(res, 404, "PRODUCT_NOT_FOUND", "Product not found");
    }

    if (!result.ok && result.reason === "OUT_OF_STOCK") {
      return sendError(res, 400, "OUT_OF_STOCK", "Quantity exceeds stock");
    }

    return sendSuccess(res, result.data, { statusCode: 201 });
  } catch (error) {
    next(error);
  }
});

router.delete("/cart/delete/:productId", async (req, res, next) => {
  try {
    const productId = z.string().parse(req.params.productId);
    const userId = z.string().parse(await resolveUserId(req));

    const deleted = await deleteCartItemByProduct(userId, productId);
    if (!deleted) {
      return sendError(res, 404, "CART_ITEM_NOT_FOUND", "Cart item not found");
    }

    return sendSuccess(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

router.patch("/cart/update/:productId/:quantity", async (req, res, next) => {
  try {
    const productId = z.string().parse(req.params.productId);
    const quantity = z.coerce.number().int().min(1).parse(req.params.quantity);
    const userId = z.string().parse(await resolveUserId(req));

    const result = await updateCartItemByProduct(userId, productId, quantity);

    if (!result.ok && result.reason === "CART_ITEM_NOT_FOUND") {
      return sendError(res, 404, "CART_ITEM_NOT_FOUND", "Cart item not found");
    }

    if (!result.ok && result.reason === "PRODUCT_NOT_FOUND") {
      return sendError(res, 404, "PRODUCT_NOT_FOUND", "Product not found");
    }

    if (!result.ok && result.reason === "OUT_OF_STOCK") {
      return sendError(res, 400, "OUT_OF_STOCK", "Quantity exceeds stock");
    }

    return sendSuccess(res, result.data);
  } catch (error) {
    next(error);
  }
});

export default router;
