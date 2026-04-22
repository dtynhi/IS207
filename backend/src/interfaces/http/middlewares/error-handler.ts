import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { HttpError } from "../../../shared/http-error";
import { sendError } from "../../../shared/response/response";

export const notFoundHandler = (_req: Request, res: Response) => {
  return sendError(res, 404, "NOT_FOUND", "Route not found");
};

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof ZodError) {
    return sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "Request validation failed",
      error.flatten()
    );
  }

  if (error instanceof HttpError) {
    return sendError(res, error.statusCode, "HTTP_ERROR", error.message);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2003") {
      return sendError(res, 400, "FOREIGN_KEY_CONFLICT", "Invalid related resource");
    }

    if (error.code === "P2002") {
      return sendError(res, 409, "UNIQUE_CONFLICT", "Duplicated resource");
    }

    if (error.code === "P2025") {
      return sendError(res, 404, "RESOURCE_NOT_FOUND", "Resource not found");
    }
  }

  return sendError(res, 500, "INTERNAL_ERROR", "Internal server error");
};
