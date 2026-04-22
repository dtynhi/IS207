import type { Response } from "express";

export type SuccessEnvelope<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ErrorEnvelope = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export const sendSuccess = <T>(
  res: Response,
  data: T,
  options?: { statusCode?: number; meta?: Record<string, unknown> }
) => {
  const statusCode = options?.statusCode ?? 200;
  const payload: SuccessEnvelope<T> = {
    success: true,
    data,
  };

  if (options?.meta) {
    payload.meta = options.meta;
  }

  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
) => {
  const payload: ErrorEnvelope = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };

  return res.status(statusCode).json(payload);
};
