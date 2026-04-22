import { apiClient } from "../../../shared/api/client";
import type { ApiSuccessResponse } from "../../../shared/api/types";
import type { ForgotPasswordResult, LoginAdmin, LoginUser, VerifyOtpResult } from "../types/auth.types";

export const registerUserApi = async (payload: { fullName: string; email: string; password: string }) => {
  const response = await apiClient.post<ApiSuccessResponse<LoginUser>>("/auth/register", payload);
  return response.data.data;
};

export const loginUserApi = async (payload: { email: string; password: string }) => {
  const response = await apiClient.post<ApiSuccessResponse<LoginUser>>("/auth/login", payload);
  return response.data.data;
};

export const getAuthSessionApi = async () => {
  const response = await apiClient.get<ApiSuccessResponse<LoginUser | null>>("/auth/session");
  return response.data.data;
};

export const logoutUserApi = async () => {
  const response = await apiClient.post<ApiSuccessResponse<{ loggedOut: boolean }>>("/auth/logout");
  return response.data.data;
};

export const loginAdminApi = async (payload: { email: string; password: string }) => {
  const response = await apiClient.post<ApiSuccessResponse<LoginAdmin>>("/admin/auth/login", payload);
  return response.data.data;
};

export const forgotPasswordApi = async (payload: { email: string }) => {
  const response = await apiClient.post<ApiSuccessResponse<ForgotPasswordResult>>("/auth/password/forgot", payload);
  return response.data.data;
};

export const verifyOtpApi = async (payload: { email: string; otp: string }) => {
  const response = await apiClient.post<ApiSuccessResponse<VerifyOtpResult>>("/auth/password/otp", payload);
  return response.data.data;
};

export const resetPasswordApi = async (payload: { email: string; password: string }) => {
  const response = await apiClient.post<ApiSuccessResponse<{ updated: boolean }>>("/auth/password/reset", payload);
  return response.data.data;
};

export const changePasswordApi = async (payload: {
  userId: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const response = await apiClient.patch<ApiSuccessResponse<{ updated: boolean }>>("/auth/password/change", payload);
  return response.data.data;
};
