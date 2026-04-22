import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
  createAdminCategoryApi,
  deleteAdminCategoryApi,
  listAdminCategoriesApi,
  updateAdminCategoryApi,
  updateAdminCategoryStatusApi,
} from "../api/admin.api";

export const useAdminCategories = () => {
  const [api, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listAdminCategoriesApi({ page: 1, limit: 100 }),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-categories"] });

  const createMutation = useMutation({
    mutationFn: createAdminCategoryApi,
    onSuccess: () => {
      api.success("Created category");
      refresh();
    },
    onError: () => api.error("Create failed"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => updateAdminCategoryApi(id, payload),
    onSuccess: () => {
      api.success("Updated category");
      refresh();
    },
    onError: () => api.error("Update failed"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "inactive" }) =>
      updateAdminCategoryStatusApi(id, status),
    onSuccess: () => {
      api.success("Status updated");
      refresh();
    },
    onError: () => api.error("Status update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminCategoryApi,
    onSuccess: () => {
      api.success("Deleted category");
      refresh();
    },
    onError: () => api.error("Delete failed"),
  });

  return { query, createMutation, updateMutation, statusMutation, deleteMutation, contextHolder };
};
