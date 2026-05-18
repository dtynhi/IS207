import axios from "axios";
import { getAdminId } from "../session/storage";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  timeout: 10000,
  withCredentials: true,
});

// Interceptor to add admin ID header for admin requests
apiClient.interceptors.request.use((config) => {
  const adminId = getAdminId();
  if (adminId) {
    config.headers["x-admin-id"] = adminId;
  }
  return config;
});

