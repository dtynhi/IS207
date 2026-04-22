import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { getAdminSettingsApi, updateAdminSettingsApi } from "../api/admin.api";

export const useAdminSettings = () => {
  const [api, contextHolder] = message.useMessage();

  const query = useQuery({ queryKey: ["admin-settings"], queryFn: getAdminSettingsApi });
  const mutation = useMutation({
    mutationFn: updateAdminSettingsApi,
    onSuccess: () => api.success("Settings updated"),
    onError: () => api.error("Update settings failed"),
  });

  return { query, mutation, contextHolder };
};
