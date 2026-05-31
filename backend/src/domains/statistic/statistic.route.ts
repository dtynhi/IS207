import { Router } from "express";
import { getStatistics } from "./statistic.controller";

const statisticRouter = Router();

// Đường dẫn sẽ là: /statistics/revenue
statisticRouter.get("/revenue", getStatistics);

export default statisticRouter;