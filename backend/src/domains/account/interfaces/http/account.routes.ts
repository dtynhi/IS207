import { Router } from "express";
import { z } from "zod";
import { baseQueryParamsSchema } from "../../../../shared/query/base-query.params";
import { sendError, sendSuccess } from "../../../../shared/response/response";
import {
  createAccount,
  deleteAccount,
  findAccountByEmail,
  getAccountDetail,
  getMyAccount,
  listAccounts,
  updateAccount,
  updateAccountStatus,
} from "../../account.service";

const router = Router();

router.get("/admin/accounts", async (req, res, next) => {
  try {
    const params = baseQueryParamsSchema.parse(req.query);
    const result = await listAccounts(params);
    return sendSuccess(res, result.items, { meta: result.meta });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/accounts/:id", async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const item = await getAccountDetail(id);
    if (!item) {
      return sendError(res, 404, "NOT_FOUND", "Account not found");
    }

    return sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.post("/admin/accounts", async (req, res, next) => {
  try {
    const payload = z
      .object({
        fullName: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
        roleId: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
      })
      .parse(req.body);

    const existing = await findAccountByEmail(payload.email);
    if (existing) {
      return sendError(res, 409, "EMAIL_EXISTS", "Email already exists");
    }

    const item = await createAccount(payload);
    return sendSuccess(res, item, { statusCode: 201 });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/accounts/:id", async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const payload = z
      .object({
        fullName: z.string().min(1).optional(),
        email: z.string().email().optional(),
        password: z.string().min(6).optional(),
        phone: z.string().optional(),
        avatar: z.string().optional(),
        roleId: z.string().nullable().optional(),
        status: z.enum(["active", "inactive"]).optional(),
      })
      .parse(req.body);

    if (payload.email) {
      const existing = await findAccountByEmail(payload.email, id);
      if (existing) {
        return sendError(res, 409, "EMAIL_EXISTS", "Email already exists");
      }
    }

    const item = await updateAccount(id, payload);
    return sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/accounts/change-status/:status/:id", async (req, res, next) => {
  try {
    const status = z.enum(["active", "inactive"]).parse(req.params.status);
    const id = z.string().parse(req.params.id);
    const item = await updateAccountStatus(id, status);
    return sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.delete("/admin/accounts/:id", async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    await deleteAccount(id);
    return sendSuccess(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/my-account/:id", async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const account = await getMyAccount(id);
    if (!account) {
      return sendError(res, 404, "NOT_FOUND", "Account not found");
    }

    return sendSuccess(res, account);
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/my-account/:id", async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const payload = z
      .object({
        fullName: z.string().min(1).optional(),
        email: z.string().email().optional(),
        password: z.string().min(6).optional(),
        phone: z.string().optional(),
        avatar: z.string().optional(),
      })
      .parse(req.body);

    if (payload.email) {
      const existing = await findAccountByEmail(payload.email, id);
      if (existing) {
        return sendError(res, 409, "EMAIL_EXISTS", "Email already exists");
      }
    }

    const account = await updateAccount(id, payload);
    return sendSuccess(res, account);
  } catch (error) {
    next(error);
  }
});

export default router;
