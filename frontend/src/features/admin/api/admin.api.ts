import { apiClient } from "../../../shared/api/client";
import type { ApiSuccessResponse } from "../../../shared/api/types";
import type { AdminListMeta } from "../types/admin.types";

const toList = <T>(payload: ApiSuccessResponse<T[]>) => ({ items: payload.data, meta: payload.meta as AdminListMeta });

export const getDashboardApi = async () => {
  const response = await apiClient.get<ApiSuccessResponse<Record<string, number>>>("/admin/dashboard");
  return response.data.data;
};

export const listAdminProductsApi = async (params: Record<string, unknown>) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown[]>>("/admin/products", { params });
  return toList(response.data);
};

export const createAdminProductApi = async (payload: Record<string, unknown>) => {
  const response = await apiClient.post<ApiSuccessResponse<unknown>>("/admin/products", payload);
  return response.data.data;
};

export const updateAdminProductApi = async (id: string, payload: Record<string, unknown>) => {
  const response = await apiClient.patch<ApiSuccessResponse<unknown>>(`/admin/products/${id}`, payload);
  return response.data.data;
};

export const deleteAdminProductApi = async (id: string) => {
  const response = await apiClient.delete<ApiSuccessResponse<{ deleted: boolean }>>(`/admin/products/${id}`);
  return response.data.data;
};

export const updateAdminProductStatusApi = async (id: string, status: "active" | "inactive") => {
  const response = await apiClient.patch<ApiSuccessResponse<unknown>>(`/admin/products/change-status/${status}/${id}`);
  return response.data.data;
};

export const listAdminCategoriesApi = async (params: Record<string, unknown>) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown[]>>("/admin/categories", { params });
  return toList(response.data);
};

export const createAdminCategoryApi = async (payload: Record<string, unknown>) => {
  const response = await apiClient.post<ApiSuccessResponse<unknown>>("/admin/categories", payload);
  return response.data.data;
};

export const updateAdminCategoryApi = async (id: string, payload: Record<string, unknown>) => {
  const response = await apiClient.patch<ApiSuccessResponse<unknown>>(`/admin/categories/${id}`, payload);
  return response.data.data;
};

export const deleteAdminCategoryApi = async (id: string) => {
  const response = await apiClient.delete<ApiSuccessResponse<{ deleted: boolean }>>(`/admin/categories/${id}`);
  return response.data.data;
};

export const updateAdminCategoryStatusApi = async (id: string, status: "active" | "inactive") => {
  const response = await apiClient.patch<ApiSuccessResponse<unknown>>(`/admin/categories/change-status/${status}/${id}`);
  return response.data.data;
};

export const listAdminRolesApi = async (params: Record<string, unknown>) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown[]>>("/admin/roles", { params });
  return toList(response.data);
};

export const createAdminRoleApi = async (payload: Record<string, unknown>) => {
  const response = await apiClient.post<ApiSuccessResponse<unknown>>("/admin/roles", payload);
  return response.data.data;
};

export const updateAdminRoleApi = async (id: string, payload: Record<string, unknown>) => {
  const response = await apiClient.patch<ApiSuccessResponse<unknown>>(`/admin/roles/${id}`, payload);
  return response.data.data;
};

export const deleteAdminRoleApi = async (id: string) => {
  const response = await apiClient.delete<ApiSuccessResponse<{ deleted: boolean }>>(`/admin/roles/${id}`);
  return response.data.data;
};

export const updateRolePermissionsApi = async (payload: Array<{ id: string; permissions: unknown }>) => {
  const response = await apiClient.patch<ApiSuccessResponse<{ affected: number }>>("/admin/roles/permissions", {
    permissions: payload,
  });
  return response.data.data;
};

export const listAdminAccountsApi = async (params: Record<string, unknown>) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown[]>>("/admin/accounts", { params });
  return toList(response.data);
};

export const createAdminAccountApi = async (payload: Record<string, unknown>) => {
  const response = await apiClient.post<ApiSuccessResponse<unknown>>("/admin/accounts", payload);
  return response.data.data;
};

export const updateAdminAccountApi = async (id: string, payload: Record<string, unknown>) => {
  const response = await apiClient.patch<ApiSuccessResponse<unknown>>(`/admin/accounts/${id}`, payload);
  return response.data.data;
};

export const updateAdminAccountStatusApi = async (id: string, status: "active" | "inactive") => {
  const response = await apiClient.patch<ApiSuccessResponse<unknown>>(`/admin/accounts/change-status/${status}/${id}`);
  return response.data.data;
};

export const deleteAdminAccountApi = async (id: string) => {
  const response = await apiClient.delete<ApiSuccessResponse<{ deleted: boolean }>>(`/admin/accounts/${id}`);
  return response.data.data;
};

export const getMyAdminAccountApi = async (id: string) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown>>(`/admin/my-account/${id}`);
  return response.data.data;
};

export const updateMyAdminAccountApi = async (id: string, payload: Record<string, unknown>) => {
  const response = await apiClient.patch<ApiSuccessResponse<unknown>>(`/admin/my-account/${id}`, payload);
  return response.data.data;
};

export const getAdminSettingsApi = async () => {
  const response = await apiClient.get<ApiSuccessResponse<unknown>>("/admin/settings/general");
  return response.data.data;
};

export const updateAdminSettingsApi = async (payload: Record<string, unknown>) => {
  const response = await apiClient.patch<ApiSuccessResponse<unknown>>("/admin/settings/general", payload);
  return response.data.data;
};

export const listAdminOrdersApi = async (params: Record<string, unknown>) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown[]>>("/admin/orders", { params });
  return toList(response.data);
};

export const getAdminOrderDetailApi = async (id: string) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown>>(`/admin/orders/${id}`);
  return response.data.data;
};

export const claimAdminOrderApi = async (id: string) => {
  const response = await apiClient.post<ApiSuccessResponse<unknown>>(`/admin/orders/${id}/claim`);
  return response.data.data;
};

export const releaseAdminOrderApi = async (id: string) => {
  const response = await apiClient.post<ApiSuccessResponse<unknown>>(`/admin/orders/${id}/release`);
  return response.data.data;
};

export const updateAdminOrderStatusApi = async (
  id: string,
  payload: {
    status: "pending_confirm" | "ready_to_pick" | "ready_to_ship" | "delivered" | "awaiting_return" | "returned" | "cancelled" | "completed";
    reason?: string;
    lockVersion: number;
  }
) => {
  const response = await apiClient.patch<ApiSuccessResponse<unknown>>(`/admin/orders/${id}/status`, payload);
  return response.data.data;
};

export const reviewReturnRequestApi = async (
  id: string,
  payload: { decision: "approved" | "rejected"; reviewReason?: string; lockVersion: number }
) => {
  const response = await apiClient.patch<ApiSuccessResponse<unknown>>(`/admin/return-requests/${id}/review`, payload);
  return response.data.data;
};

export const processReturnApi = async (
  orderId: string,
  payload: { result: "approved" | "rejected"; reason?: string }
) => {
  const response = await apiClient.patch<ApiSuccessResponse<unknown>>(`/admin/orders/${orderId}/return`, payload);
  return response.data.data;
};
