import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { getAdminId } from "../../../shared/session/storage";
import { getMyAdminAccountApi, updateMyAdminAccountApi } from "../api/admin.api";

export const useAdminMyAccount = () => {
  const adminId = getAdminId();
  const [api, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-my-account", adminId],
    queryFn: () => getMyAdminAccountApi(adminId),
    enabled: Boolean(adminId),
  });

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => updateMyAdminAccountApi(adminId, payload),
    onSuccess: () => {
      api.success("Updated");
      queryClient.invalidateQueries({ queryKey: ["admin-my-account", adminId] });
    },
    onError: () => api.error("Update failed"),
  });

  return { adminId, query, mutation, contextHolder };
};
