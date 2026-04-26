import { apiClient } from "../api/client";
import type { ApiSuccessResponse } from "../api/types";

export type GeneralSetting = {
  websiteName?: string;
  logo?: string;
  phone?: string;
  email?: string;
  address?: string;
  copyright?: string;
};

export const getGeneralSettingsApi = async () => {
  const response = await apiClient.get<ApiSuccessResponse<GeneralSetting | null>>("/admin/settings/general");
  return response.data.data;
};
