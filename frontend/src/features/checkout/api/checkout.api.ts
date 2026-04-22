import { apiClient } from "../../../shared/api/client";
import type { ApiSuccessResponse } from "../../../shared/api/types";
import type { CreateCheckoutOrderPayload } from "../types/checkout.types";

export const createCheckoutOrderApi = async (payload: CreateCheckoutOrderPayload) => {
  const response = await apiClient.post<ApiSuccessResponse<{ id: string }>>("/checkout/order", payload);
  return response.data.data;
};

export const getCheckoutSuccessApi = async (orderId: string, userId?: string) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown>>(`/checkout/success/${orderId}`, {
    params: { userId },
  });
  return response.data.data;
};
