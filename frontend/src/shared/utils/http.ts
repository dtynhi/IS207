import type { ApiSuccessResponse } from "../api/types";

export const unwrapData = <T>(payload: ApiSuccessResponse<T>) => payload.data;

export const unwrapList = <T>(payload: ApiSuccessResponse<T[]>) => ({
  items: payload.data,
  meta: payload.meta,
});
