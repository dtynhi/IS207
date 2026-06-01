import { useQuery } from "@tanstack/react-query";
import { getRevenueStatsApi } from "../api/admin.api"; 

export const useRevenueStatistic = (filters?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ["admin-revenue-stats", filters], // Thêm filters vào key để gọi lại API khi đổi ngày
    queryFn: () => getRevenueStatsApi(filters),
  });
};