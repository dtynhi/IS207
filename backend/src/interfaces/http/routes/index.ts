import { Router } from "express";
import healthRoute from "./health.route";
import domainRouter from "../../../domains";

const apiRouter = Router();

apiRouter.use("/v1", healthRoute);
apiRouter.use("/v1", domainRouter);

export default apiRouter;
