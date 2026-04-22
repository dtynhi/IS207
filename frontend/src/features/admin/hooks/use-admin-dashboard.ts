import { useQuery } from "@tanstack/react-query";
import { getDashboardApi } from "../api/admin.api";

export const useAdminDashboard = () => {
  return useQuery({ queryKey: ["admin-dashboard"], queryFn: getDashboardApi });
};
