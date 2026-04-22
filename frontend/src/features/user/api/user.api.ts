import { apiClient } from "../../../shared/api/client";
import type { ApiSuccessResponse } from "../../../shared/api/types";
import type { UserAddress, UserProfile, UserPurchase } from "../types/user.types";

export const getUserProfileApi = async (userId: string) => {
  const response = await apiClient.get<ApiSuccessResponse<UserProfile>>(`/user/profile/${userId}`);
  return response.data.data;
};

export const updateUserProfileApi = async (
  userId: string,
  payload: { fullName?: string; phone?: string; avatar?: string }
) => {
  const response = await apiClient.patch<ApiSuccessResponse<UserProfile>>(`/user/profile/${userId}`, payload);
  return response.data.data;
};

export const getUserAddressApi = async (userId: string) => {
  const response = await apiClient.get<ApiSuccessResponse<UserAddress[]>>(`/user/${userId}/address`);
  return response.data.data;
};

export const createUserAddressApi = async (userId: string, payload: { mainAddress: string }) => {
  const response = await apiClient.post<ApiSuccessResponse<UserAddress>>(`/user/${userId}/address`, payload);
  return response.data.data;
};

export const updateUserAddressApi = async (
  userId: string,
  addressId: string,
  payload: { mainAddress?: string; isDefault?: boolean }
) => {
  const response = await apiClient.patch<ApiSuccessResponse<UserAddress>>(
    `/user/${userId}/address/${addressId}`,
    payload
  );
  return response.data.data;
};

export const deleteUserAddressApi = async (userId: string, addressId: string) => {
  const response = await apiClient.delete<ApiSuccessResponse<{ deleted: boolean }>>(
    `/user/${userId}/address/${addressId}`
  );
  return response.data.data;
};

export const getUserPurchaseApi = async (userId: string, page = 1, limit = 10) => {
  const response = await apiClient.get<ApiSuccessResponse<UserPurchase[]>>(`/user/${userId}/purchase`, {
    params: { page, limit },
  });
  return {
    items: response.data.data,
    meta: response.data.meta,
  };
};
