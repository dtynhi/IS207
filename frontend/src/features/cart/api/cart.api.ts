import { apiClient } from "../../../shared/api/client";
import type { ApiSuccessResponse } from "../../../shared/api/types";
import type { CartData, CartItem } from "../types/cart.types";

export const getCartApi = async (userId: string) => {
  const response = await apiClient.get<ApiSuccessResponse<CartData>>("/cart", {
    params: { userId },
  });
  return response.data.data;
};

export const addCartItemApi = async (payload: { userId: string; productId: string; quantity: number }) => {
  const response = await apiClient.post<ApiSuccessResponse<CartItem>>("/cart/items", payload);
  return response.data.data;
};

export const updateCartItemApi = async (id: string, quantity: number) => {
  const response = await apiClient.patch<ApiSuccessResponse<CartItem>>(`/cart/items/${id}`, { quantity });
  return response.data.data;
};

export const deleteCartItemApi = async (id: string) => {
  const response = await apiClient.delete<ApiSuccessResponse<{ deleted: boolean }>>(`/cart/items/${id}`);
  return response.data.data;
};
