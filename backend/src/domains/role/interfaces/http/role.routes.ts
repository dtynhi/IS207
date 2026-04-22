import { Router } from "express";
import { z } from "zod";
import { baseQueryParamsSchema } from "../../../../shared/query/base-query.params";
import { sendError, sendSuccess } from "../../../../shared/response/response";
import {
  createRole,
  deleteRole,
  getRoleDetail,
  listRoles,
  updateRole,
  updateRolePermissions,
} from "../../role.service";

const router = Router();

router.get("/admin/roles", async (req, res, next) => {
  try {
    const params = baseQueryParamsSchema.parse(req.query);
    const result = await listRoles(params);
    return sendSuccess(res, result.items, { meta: result.meta });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/roles/permissions/list", async (req, res, next) => {
  try {
    const params = baseQueryParamsSchema.parse(req.query);
    const result = await listRoles(params);
    return sendSuccess(res, result.items, { meta: result.meta });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/roles", async (req, res, next) => {
  try {
    const payload = z
      .object({
        title: z.string(),
        description: z.string().optional(),
        permissions: z.unknown().optional(),
      })
      .parse(req.body);

    const item = await createRole(payload);
    return sendSuccess(res, item, { statusCode: 201 });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/roles/permissions", async (req, res, next) => {
  try {
    const payload = z
      .object({
        permissions: z.array(
          z.object({
            id: z.string(),
            permissions: z.unknown(),
          })
        ),
      })
      .parse(req.body);

    const result = await updateRolePermissions(payload.permissions);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/roles/:id", async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const item = await updateRole(id, req.body as Record<string, unknown>);
    return sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.get("/admin/roles/:id", async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const role = await getRoleDetail(id);

    if (!role) {
      return sendError(res, 404, "NOT_FOUND", "Role not found");
    }

    return sendSuccess(res, role);
  } catch (error) {
    next(error);
  }
});

router.delete("/admin/roles/:id", async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    await deleteRole(id);
    return sendSuccess(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

export default router;
