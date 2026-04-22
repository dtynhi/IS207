import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import apiRouter from "./interfaces/http/routes";
import {
  errorHandler,
  notFoundHandler,
} from "./interfaces/http/middlewares/error-handler";

dotenv.config({
  path: process.env.ENV_FILE || path.resolve(process.cwd(), "backend/.env"),
});
dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
