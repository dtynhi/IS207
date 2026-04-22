import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
  createAdminRoleApi,
  deleteAdminRoleApi,
  listAdminRolesApi,
  updateAdminRoleApi,
  updateRolePermissionsApi,
} from "../api/admin.api";

export const useAdminRoles = () => {
  const [api, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const query = useQuery({ queryKey: ["admin-roles"], queryFn: () => listAdminRolesApi({ page: 1, limit: 100 }) });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-roles"] });

  const createMutation = useMutation({
    mutationFn: createAdminRoleApi,
    onSuccess: () => {
      api.success("Created role");
      refresh();
    },
    onError: () => api.error("Create failed"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => updateAdminRoleApi(id, payload),
    onSuccess: () => {
      api.success("Updated role");
      refresh();
    },
    onError: () => api.error("Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminRoleApi,
    onSuccess: () => {
      api.success("Deleted role");
      refresh();
    },
    onError: () => api.error("Delete failed"),
  });

  const permissionMutation = useMutation({
    mutationFn: updateRolePermissionsApi,
    onSuccess: () => {
      api.success("Permissions updated");
      refresh();
    },
    onError: () => api.error("Permissions update failed"),
  });

  return { query, createMutation, updateMutation, deleteMutation, permissionMutation, contextHolder };
};
