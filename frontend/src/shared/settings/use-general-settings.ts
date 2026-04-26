import { useQuery } from "@tanstack/react-query";
import { getGeneralSettingsApi } from "./settings.api";

export const useGeneralSettings = () => {
  return useQuery({
    queryKey: ["public-settings"],
    queryFn: getGeneralSettingsApi,
    staleTime: 5 * 60 * 1000,
  });
};
