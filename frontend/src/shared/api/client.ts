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

// Interceptor to normalize API errors so UI can show backend messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const backendMessage = error?.response?.data?.error;
    const message = typeof backendMessage === "string" ? backendMessage : error.message;
    return Promise.reject(new Error(message));
  },
);

