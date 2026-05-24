import crypto from "crypto";
import { Router } from "express";
import { z } from "zod";
import { sendError, sendSuccess } from "../../../../shared/response/response";
import { AdminRequest, requireAdmin } from "../../../../shared/middleware/admin-auth.middleware";
import { getUserByToken } from "../../../auth/auth.service";
import {
  cancelOrderByCustomer,
  claimOrder,
  createOrder,
  getAdminOrderDetail,
  getOrderDetail,
  getOrderTotalAmount,
  getReturnDetail,
  listAdminOrders,
  listOrders,
  listPendingReturns,
  markOrderPaidByAdmin,
  markOrderUser,
  processReturn,
  releaseOrder,
  updateOrderPaymentStatus,
  updateOrderStatusByAdmin,
} from "../../order.service";
import { orderQuerySchema } from "../../order.query";

const router = Router();
const AUTH_COOKIE_NAME = "uni_auth_token";

const readCookie = (cookieHeader: string | undefined, key: string) => {
  if (!cookieHeader) return "";
  return (
    cookieHeader
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${key}=`))
      ?.slice(key.length + 1) || ""
  );
};

const formatDateYmdHis = (date: Date) => {
  const yyyy = date.getFullYear().toString();
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  const hh = date.getHours().toString().padStart(2, "0");
  const mi = date.getMinutes().toString().padStart(2, "0");
  const ss = date.getSeconds().toString().padStart(2, "0");
  return `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
};

const sortObject = (input: Record<string, string>) =>
  Object.keys(input)
    .sort()
    .reduce<Record<string, string>>((result, key) => {
      result[key] = input[key];
      return result;
    }, {});

const encodeVnpayValue = (value: string) => encodeURIComponent(value).replace(/%20/g, "+");

const buildSignedQuery = (params: Record<string, string>) =>
  Object.entries(sortObject(params))
    .map(([key, value]) => `${key}=${encodeVnpayValue(value)}`)
    .join("&");

const buildFrontendReturnUrl = (rawReturnUrl: string | undefined, fallbackFrontend: string, orderId: string) => {
  if (!rawReturnUrl) return `${fallbackFrontend}/checkout/success/${orderId}`;
  if (rawReturnUrl.includes("{orderId}")) return rawReturnUrl.replace("{orderId}", orderId);
  const trimmed = rawReturnUrl.endsWith("/") ? rawReturnUrl.slice(0, -1) : rawReturnUrl;
  if (trimmed.endsWith("/checkout/success")) return `${trimmed}/${orderId}`;
  return `${trimmed}/checkout/success/${orderId}`;
};

const appendQuery = (url: string, key: string, value: string) =>
  `${url}${url.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(value)}`;

const resolveClientIp = (headerForwardedFor: string | string[] | undefined, remoteAddress: string | undefined) => {
  const firstForwarded = typeof headerForwardedFor === "string" ? headerForwardedFor.split(",")[0]?.trim() : "";
  if (firstForwarded) return firstForwarded;
  if (remoteAddress) return remoteAddress;
  return "127.0.0.1";
};

const verifyVnpaySignature = (query: Record<string, string>, secret: string) => {
  const secureHash = query.vnp_SecureHash || "";
  const signSource = { ...query };
  delete signSource.vnp_SecureHash;
  delete signSource.vnp_SecureHashType;

  const signedData = buildSignedQuery(signSource);
  const expected = crypto.createHmac("sha512", secret).update(signedData).digest("hex");
  console.log("[vnpay-sig] signedData:", signedData);
  console.log("[vnpay-sig] expected:", expected);
  console.log("[vnpay-sig] received:", secureHash);
  return secureHash === expected;
};

// ─── Customer endpoints ───────────────────────────────────────────────────────

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

    const result = await createOrder(payload);
    if (!result.ok) {
      if (result.reason === "PRODUCT_NOT_FOUND") {
        return sendError(res, 404, "PRODUCT_NOT_FOUND", "Product not found", { productId: result.productId });
      }
      if (result.reason === "OUT_OF_STOCK") {
        return sendError(res, 400, "OUT_OF_STOCK", "Quantity exceeds stock", { productId: result.productId });
      }
      return sendError(res, 400, "ORDER_INVALID", "Order is invalid");
    }

    return sendSuccess(res, result.data, { statusCode: 201 });
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
        userId: z.string().optional(),
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

router.post("/orders/:id/cancel", async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const { userId } = z.object({ userId: z.string() }).parse(req.body);

    const result = await cancelOrderByCustomer(id, userId);

    if ("error" in result) {
      if (result.error === "NOT_FOUND") return sendError(res, 404, "NOT_FOUND", "Order not found");
      if (result.error === "FORBIDDEN") return sendError(res, 403, "FORBIDDEN", "This order does not belong to you");
      if (result.error === "CANNOT_CANCEL") {
        return sendError(res, 400, "CANNOT_CANCEL", "Order can only be cancelled while pending confirmation");
      }
      if (result.error === "ALREADY_PAID") {
        return sendError(res, 400, "ALREADY_PAID", "Cannot cancel a paid order. Please contact support for a refund.");
      }
    }

    return sendSuccess(res, { cancelled: true });
  } catch (error) {
    next(error);
  }
});

// ─── Admin endpoints ──────────────────────────────────────────────────────────

router.get("/admin/orders", requireAdmin, async (req, res, next) => {
  try {
    const params = orderQuerySchema.parse(req.query);
    const result = await listAdminOrders(params);
    return sendSuccess(res, result.items, { meta: result.meta });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/orders/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const order = await getAdminOrderDetail(id);
    if (!order) return sendError(res, 404, "NOT_FOUND", "Order not found");
    return sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
});

router.post("/admin/orders/:id/claim", requireAdmin, async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const adminId = (req as AdminRequest).adminId;
    if (!adminId) return sendError(res, 401, "ADMIN_NOT_FOUND", "Admin authentication required");

    const result = await claimOrder(id, adminId);
    if (!result.order) return sendError(res, 404, "NOT_FOUND", "Order not found");
    if (!result.claimed) return sendError(res, 409, "ORDER_ALREADY_ASSIGNED", "Order is already assigned");

    return sendSuccess(res, result.order);
  } catch (error) {
    next(error);
  }
});

router.post("/admin/orders/:id/release", requireAdmin, async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const adminId = (req as AdminRequest).adminId;
    if (!adminId) return sendError(res, 401, "ADMIN_NOT_FOUND", "Admin authentication required");

    const result = await releaseOrder(id, adminId);
    if (!result.order) return sendError(res, 404, "NOT_FOUND", "Order not found");
    if (!result.released) return sendError(res, 409, "ORDER_NOT_ASSIGNED", "Order is assigned to another admin");

    return sendSuccess(res, result.order);
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/orders/:id/status", requireAdmin, async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const adminId = (req as AdminRequest).adminId;
    if (!adminId) return sendError(res, 401, "ADMIN_NOT_FOUND", "Admin authentication required");

    const payload = z
      .object({
        status: z.enum(["pending_confirm", "ready_to_pick", "ready_to_ship", "delivered", "returned", "cancelled"]),
        reason: z.string().trim().optional(),
        lockVersion: z.coerce.number().int().min(0),
      })
      .parse(req.body);

    const result = await updateOrderStatusByAdmin({
      orderId: id,
      status: payload.status,
      adminId,
      lockVersion: payload.lockVersion,
      reason: payload.reason,
    });

    if ("error" in result) {
      if (result.error === "NOT_FOUND") return sendError(res, 404, "NOT_FOUND", "Order not found");
      if (result.error === "NOT_ASSIGNED") return sendError(res, 403, "ORDER_NOT_ASSIGNED", "Order must be assigned to you");
      if (result.error === "INVALID_TRANSITION") return sendError(res, 400, "INVALID_STATUS", "Invalid status transition");
      if (result.error === "CONFLICT") {
        return sendError(res, 409, "ORDER_CONFLICT", "Order was updated by another admin", {
          currentVersion: result.currentVersion,
        });
      }
    }

    return sendSuccess(res, result.order);
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/orders/:id/payment", requireAdmin, async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const adminId = (req as AdminRequest).adminId;
    if (!adminId) return sendError(res, 401, "ADMIN_NOT_FOUND", "Admin authentication required");

    const result = await markOrderPaidByAdmin(id, adminId);

    if ("error" in result) {
      if (result.error === "NOT_FOUND") return sendError(res, 404, "NOT_FOUND", "Order not found");
      if (result.error === "ALREADY_PAID") return sendError(res, 409, "ALREADY_PAID", "Order is already paid");
      if (result.error === "NOT_COD") return sendError(res, 400, "NOT_COD", "Payment status for bank transfer orders is managed by VNPay");
    }

    return sendSuccess(res, result.order);
  } catch (error) {
    next(error);
  }
});

// ─── Return processing endpoints ──────────────────────────────────────────────

router.get("/admin/returns", requireAdmin, async (req, res, next) => {
  try {
    const params = z
      .object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
      })
      .parse(req.query);

    const result = await listPendingReturns(params);
    return sendSuccess(res, result.items, { meta: result.meta });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/returns/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const order = await getReturnDetail(id);
    if (!order) return sendError(res, 404, "NOT_FOUND", "Return order not found");
    return sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/orders/:id/return", requireAdmin, async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const adminId = (req as AdminRequest).adminId;
    if (!adminId) return sendError(res, 401, "ADMIN_NOT_FOUND", "Admin authentication required");

    const { result, reason } = z
      .object({
        result: z.enum(["approved", "rejected"]),
        reason: z.string().trim().optional(),
      })
      .parse(req.body);

    const outcome = await processReturn({ orderId: id, adminId, result, reason });

    if ("error" in outcome) {
      if (outcome.error === "NOT_FOUND") return sendError(res, 404, "NOT_FOUND", "Order not found");
      if (outcome.error === "NOT_RETURNED") return sendError(res, 400, "NOT_RETURNED", "Order is not in returned status");
      if (outcome.error === "ALREADY_PROCESSED") return sendError(res, 409, "ALREADY_PROCESSED", "Return has already been processed");
    }

    return sendSuccess(res, outcome.returnLog);
  } catch (error) {
    next(error);
  }
});

// ─── Checkout endpoints ───────────────────────────────────────────────────────

router.post("/checkout/order", async (req, res, next) => {
  try {
    const payload = z
      .object({
        userId: z.string().optional(),
        fullName: z.string().min(1),
        phone: z.string().min(1),
        address: z.string().min(1),
        paymentMethod: z.enum(["cod", "bank"]).optional(),
        returnUrl: z.string().optional(),
        items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1) })).min(1),
      })
      .parse(req.body);

    const result = await createOrder({
      ...payload,
      paymentMethod: payload.paymentMethod === "bank" ? "BANK_TRANSFER" : "COD",
    });

    if (!result.ok) {
      if (result.reason === "PRODUCT_NOT_FOUND") {
        return sendError(res, 404, "PRODUCT_NOT_FOUND", "Product not found", { productId: result.productId });
      }
      if (result.reason === "OUT_OF_STOCK") {
        return sendError(res, 400, "OUT_OF_STOCK", "Quantity exceeds stock", { productId: result.productId });
      }
      return sendError(res, 400, "ORDER_INVALID", "Order is invalid");
    }

    const order = result.data;

    if (payload.paymentMethod === "bank") {
      const vnpTmnCode = process.env.VNPAY_TMN_CODE || "";
      const vnpHashSecret = process.env.VNPAY_HASH_SECRET || "";
      const vnpBaseUrl = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

      if (!vnpTmnCode || !vnpHashSecret) {
        return sendError(res, 500, "VNPAY_NOT_CONFIGURED", "VNPay sandbox is not configured");
      }

      const host = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
      const frontendOrigin =
        process.env.FRONTEND_URL ||
        (typeof req.headers.origin === "string" ? req.headers.origin : "") ||
        `${req.protocol}://${req.get("host")}`;

      const frontendReturnUrl = buildFrontendReturnUrl(payload.returnUrl, frontendOrigin, order.id);
      const returnControllerUrl = `${host}${req.baseUrl || "/api/v1"}/checkout/vnpay-return`;
      const vnpReturnUrl = appendQuery(returnControllerUrl, "frontendReturnUrl", frontendReturnUrl);

      const amount = await getOrderTotalAmount(order.id);
      if (amount <= 0) return sendError(res, 400, "INVALID_AMOUNT", "Order amount is invalid");

      const now = new Date();
      const expireAt = new Date(now.getTime() + 15 * 60 * 1000);

      const params: Record<string, string> = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: vnpTmnCode,
        vnp_Amount: String(amount * 100),
        vnp_CurrCode: "VND",
        vnp_TxnRef: order.id,
        vnp_OrderInfo: `Thanh toan don hang ${order.id}`,
        vnp_OrderType: "other",
        vnp_Locale: "vn",
        vnp_ReturnUrl: vnpReturnUrl,
        vnp_IpAddr: resolveClientIp(req.headers["x-forwarded-for"], req.socket.remoteAddress),
        vnp_CreateDate: formatDateYmdHis(now),
        vnp_ExpireDate: formatDateYmdHis(expireAt),
      };

      const signedQuery = buildSignedQuery(params);
      const secureHash = crypto.createHmac("sha512", vnpHashSecret).update(signedQuery).digest("hex");
      const paymentUrl = `${vnpBaseUrl}?${signedQuery}&vnp_SecureHash=${secureHash}`;

      return sendSuccess(res, { id: order.id, paymentUrl }, { statusCode: 201 });
    }

    return sendSuccess(res, order, { statusCode: 201 });
  } catch (error) {
    next(error);
  }
});

// Browser return URL — fallback cập nhật paymentStatus nếu IPN chưa kịp fire (e.g. local dev)
router.get("/checkout/vnpay-return", async (req, res) => {
  const query = Object.entries(req.query).reduce<Record<string, string>>((result, [key, value]) => {
    if (typeof value === "string") result[key] = value;
    return result;
  }, {});

  const frontendReturnUrl = query.frontendReturnUrl || "";
  delete query.frontendReturnUrl;

  const hashSecret = process.env.VNPAY_HASH_SECRET || "";
  const isValidSignature = hashSecret ? verifyVnpaySignature(query, hashSecret) : false;
  const orderId = query.vnp_TxnRef || "";
  const responseCode = query.vnp_ResponseCode || "";

  console.log("[vnpay-return] isValidSignature:", isValidSignature);
  console.log("[vnpay-return] orderId:", orderId);
  console.log("[vnpay-return] responseCode:", responseCode);
  console.log("[vnpay-return] allParams:", JSON.stringify(Object.keys(query)));

  try {
    if (isValidSignature && orderId) {
      const order = await getOrderDetail(orderId);
      console.log("[vnpay-return] order.paymentStatus:", order?.paymentStatus);
      if (order && order.paymentStatus === "unpaid") {
        if (responseCode === "00") {
          await updateOrderPaymentStatus(orderId, "paid");
          console.log("[vnpay-return] paymentStatus updated to paid");
        }
      }
    }
  } catch (error) {
    console.error("[vnpay-return] fallback update failed:", error);
  }

  const fallbackFrontend = process.env.FRONTEND_URL || "";
  const fallbackReturn = orderId && fallbackFrontend ? `${fallbackFrontend}/checkout/success/${orderId}` : "/";
  const baseRedirect = frontendReturnUrl || fallbackReturn;
  const redirectStatus = !isValidSignature ? "invalid" : responseCode === "00" ? "success" : "failed";
  const redirectWithStatus = appendQuery(baseRedirect, "paymentStatus", redirectStatus);
  const finalRedirect = appendQuery(redirectWithStatus, "vnpResponseCode", responseCode || "NA");
  return res.redirect(finalRedirect);
});

// IPN server-to-server — nguồn duy nhất đáng tin để cập nhật paymentStatus
router.get("/checkout/vnpay-ipn", async (req, res) => {
  const query = Object.entries(req.query).reduce<Record<string, string>>((result, [key, value]) => {
    if (typeof value === "string") result[key] = value;
    return result;
  }, {});

  const hashSecret = process.env.VNPAY_HASH_SECRET || "";
  if (!hashSecret || !verifyVnpaySignature(query, hashSecret)) {
    return res.status(200).json({ RspCode: "97", Message: "Invalid signature" });
  }

  const orderId = query.vnp_TxnRef || "";
  const responseCode = query.vnp_ResponseCode || "";
  if (!orderId) {
    return res.status(200).json({ RspCode: "01", Message: "Order not found" });
  }

  try {
    const order = await getOrderDetail(orderId);
    if (!order) {
      return res.status(200).json({ RspCode: "01", Message: "Order not found" });
    }

    // Idempotency: nếu đã paid rồi thì bỏ qua, trả về success
    if (order.paymentStatus === "paid") {
      return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
    }

    if (responseCode === "00") {
      await updateOrderPaymentStatus(orderId, "paid");
    }

    return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
  } catch (error) {
    console.error("VNPay IPN failed:", error);
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
});

router.get("/checkout/success/:orderId", async (req, res, next) => {
  try {
    const orderId = z.string().parse(req.params.orderId);
    const queryUserId = z.string().optional().parse(req.headers["x-user-id"] || req.query.userId);
    const token = readCookie(typeof req.headers.cookie === "string" ? req.headers.cookie : undefined, AUTH_COOKIE_NAME);
    const userFromToken = token ? await getUserByToken(token) : null;
    const userId = queryUserId || userFromToken?.id;

    if (userId) await markOrderUser(orderId, userId);

    const order = await getOrderDetail(orderId);
    if (!order) return sendError(res, 404, "NOT_FOUND", "Order not found");

    return sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
});

export default router;
