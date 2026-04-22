import { Router } from "express";
import { z } from "zod";
import { baseQueryParamsSchema } from "../../../../shared/query/base-query.params";
import { sendError, sendSuccess } from "../../../../shared/response/response";
import {
  createUserAddress,
  deleteUserAddress,
  getUserProfile,
  listUserAddresses,
  listUserPurchases,
  updateUserAddress,
  updateUserProfile,
} from "../../user.service";

const router = Router();

router.get("/user/profile/:id", async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const user = await getUserProfile(id);
    if (!user) return sendError(res, 404, "NOT_FOUND", "User not found");
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

router.patch("/user/profile/:id", async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const payload = z
      .object({
        fullName: z.string().min(1).optional(),
        phone: z.string().min(1).optional(),
        avatar: z.string().min(1).optional(),
      })
      .parse(req.body);

    const user = await updateUserProfile(id, payload);
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

router.get("/user/:id/address", async (req, res, next) => {
  try {
    const userId = z.string().parse(req.params.id);
    const addresses = await listUserAddresses(userId);

    if (!addresses) {
      return sendError(res, 404, "USER_NOT_FOUND", "User not found");
    }

    return sendSuccess(res, addresses);
  } catch (error) {
    next(error);
  }
});

router.post("/user/:id/address", async (req, res, next) => {
  try {
    const userId = z.string().parse(req.params.id);
    const payload = z.object({ mainAddress: z.string().min(1) }).parse(req.body);

    const address = await createUserAddress(userId, payload.mainAddress);
    if (!address) {
      return sendError(res, 404, "USER_NOT_FOUND", "User not found");
    }

    return sendSuccess(res, address, { statusCode: 201 });
  } catch (error) {
    next(error);
  }
});

router.patch("/user/:id/address/:addressId", async (req, res, next) => {
  try {
    const userId = z.string().parse(req.params.id);
    const addressId = z.string().parse(req.params.addressId);
    const payload = z
      .object({
        mainAddress: z.string().min(1).optional(),
        isDefault: z.boolean().optional(),
      })
      .parse(req.body);

    const result = await updateUserAddress(userId, addressId, payload);
    if (!result.ok && result.reason === "USER_NOT_FOUND") {
      return sendError(res, 404, "USER_NOT_FOUND", "User not found");
    }

    if (!result.ok && result.reason === "ADDRESS_NOT_FOUND") {
      return sendError(res, 404, "ADDRESS_NOT_FOUND", "Address not found");
    }

    return sendSuccess(res, result.data);
  } catch (error) {
    next(error);
  }
});

router.delete("/user/:id/address/:addressId", async (req, res, next) => {
  try {
    const userId = z.string().parse(req.params.id);
    const addressId = z.string().parse(req.params.addressId);
    const result = await deleteUserAddress(userId, addressId);

    if (!result.ok && result.reason === "USER_NOT_FOUND") {
      return sendError(res, 404, "USER_NOT_FOUND", "User not found");
    }

    if (!result.ok && result.reason === "ADDRESS_NOT_FOUND") {
      return sendError(res, 404, "ADDRESS_NOT_FOUND", "Address not found");
    }

    return sendSuccess(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

router.get("/user/:id/purchase", async (req, res, next) => {
  try {
    const userId = z.string().parse(req.params.id);
    const params = baseQueryParamsSchema.parse(req.query);
    const result = await listUserPurchases(userId, params);
    return sendSuccess(res, result.items, { meta: result.meta });
  } catch (error) {
    next(error);
  }
});

export default router;
