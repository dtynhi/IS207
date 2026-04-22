import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../shared/api/client";
import type { ApiSuccessResponse } from "../../../shared/api/types";

export type HealthData = {
  service: string;
  status: string;
  timestamp: string;
};

export const useHealthQuery = () => {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await apiClient.get<ApiSuccessResponse<HealthData>>("/health");
      return response.data.data;
    },
  });
};
