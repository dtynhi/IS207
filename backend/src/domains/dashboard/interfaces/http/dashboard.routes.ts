import { Router } from "express";
import { sendSuccess } from "../../../../shared/response/response";
import { getDashboardSummary } from "../../dashboard.service";
import { requireAdmin, checkPermission } from "../../../../shared/middleware/admin-auth.middleware";

const router = Router();

router.get("/admin/dashboard", requireAdmin, checkPermission("dashboard", "read"), async (_req, res, next) => {
  try {
    const summary = await getDashboardSummary();
    return sendSuccess(res, summary);
  } catch (error) {
    next(error);
  }
});

export default router;
