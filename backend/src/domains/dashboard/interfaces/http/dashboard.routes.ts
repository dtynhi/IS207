import { Router } from "express";
import { sendSuccess } from "../../../../shared/response/response";
import { getDashboardSummary } from "../../dashboard.service";

const router = Router();

router.get("/admin/dashboard", async (_req, res, next) => {
  try {
    const summary = await getDashboardSummary();
    return sendSuccess(res, summary);
  } catch (error) {
    next(error);
  }
});

export default router;
