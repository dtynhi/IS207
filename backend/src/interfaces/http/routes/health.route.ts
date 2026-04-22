import { Router } from "express";
import { getHealthStatus } from "../../../application/health.service";
import { sendSuccess } from "../../../shared/response/response";

const healthRoute = Router();

healthRoute.get("/health", (_req, res) => {
  return sendSuccess(res, getHealthStatus());
});

export default healthRoute;
