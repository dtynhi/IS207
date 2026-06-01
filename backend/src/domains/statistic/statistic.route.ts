import { Router } from "express";
import { getStatistics } from "./statistic.controller";
import { requireAdmin, checkPermission } from "../../shared/middleware/admin-auth.middleware";

const statisticRouter = Router();

// Đường dẫn sẽ là: /statistics/revenue
statisticRouter.get("/revenue", requireAdmin, checkPermission("dashboard", "read"), getStatistics);

export default statisticRouter;