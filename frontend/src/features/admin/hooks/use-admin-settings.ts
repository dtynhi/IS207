import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { getAdminSettingsApi, updateAdminSettingsApi } from "../api/admin.api";

export const useAdminSettings = () => {
  const [api, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const query = useQuery({ queryKey: ["admin-settings"], queryFn: getAdminSettingsApi });
  const mutation = useMutation({
    mutationFn: updateAdminSettingsApi,
    onSuccess: () => {
      api.success("Settings updated");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["public-settings"] });
    },
    onError: () => api.error("Update settings failed"),
  });

  return { query, mutation, contextHolder };
};
