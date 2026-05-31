import { useQuery } from "@tanstack/react-query";

// ⚠️ CHÚ Ý Ở ĐÂY: Trỏ đường dẫn này về file API tổng hợp của bạn
import { getRevenueStatsApi } from "../api/admin.api"; 

export const useRevenueStatistic = () => {
  return useQuery({
    
    queryKey: ["admin-revenue-stats"],
    queryFn: getRevenueStatsApi,
  });
};