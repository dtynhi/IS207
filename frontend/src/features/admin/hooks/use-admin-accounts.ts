import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
  createAdminAccountApi,
  deleteAdminAccountApi,
  listAdminAccountsApi,
  listAdminRolesApi,
  updateAdminAccountApi,
  updateAdminAccountStatusApi,
} from "../api/admin.api";
import type { AdminRoleOption } from "../types/admin.types";

export const useAdminAccounts = () => {
  const [api, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-accounts"],
    queryFn: () => listAdminAccountsApi({ page: 1, limit: 100 }),
  });

  const rolesQuery = useQuery({
    queryKey: ["admin-roles-options"],
    queryFn: async () => {
      const result = await listAdminRolesApi({ page: 1, limit: 100 });
      return result.items as AdminRoleOption[];
    },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });

  const createMutation = useMutation({
    mutationFn: createAdminAccountApi,
    onSuccess: () => {
      api.success("Created account");
      refresh();
    },
    onError: () => api.error("Create failed"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => updateAdminAccountApi(id, payload),
    onSuccess: () => {
      api.success("Updated account");
      refresh();
    },
    onError: () => api.error("Update failed"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "inactive" }) =>
      updateAdminAccountStatusApi(id, status),
    onSuccess: () => {
      api.success("Status updated");
      refresh();
    },
    onError: () => api.error("Status update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminAccountApi,
    onSuccess: () => {
      api.success("Deleted account");
      refresh();
    },
    onError: () => api.error("Delete failed"),
  });

  return { query, rolesQuery, createMutation, updateMutation, statusMutation, deleteMutation, contextHolder };
};
