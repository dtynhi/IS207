import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
  createAdminProductApi,
  deleteAdminProductApi,
  listAdminProductsApi,
  updateAdminProductApi,
  updateAdminProductStatusApi,
} from "../api/admin.api";
import { getCategories } from "../../products/api/product.api";

export const useAdminProducts = () => {
  const [api, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => listAdminProductsApi({ page: 1, limit: 100 }),
  });

  const categoriesQuery = useQuery({ queryKey: ["admin-categories-options"], queryFn: getCategories });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-products"] });

  const createMutation = useMutation({
    mutationFn: createAdminProductApi,
    onSuccess: () => {
      api.success("Created product");
      refresh();
    },
    onError: () => api.error("Create failed"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => updateAdminProductApi(id, payload),
    onSuccess: () => {
      api.success("Updated product");
      refresh();
    },
    onError: () => api.error("Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminProductApi,
    onSuccess: () => {
      api.success("Deleted product");
      refresh();
    },
    onError: () => api.error("Delete failed"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "inactive" }) =>
      updateAdminProductStatusApi(id, status),
    onSuccess: () => {
      api.success("Status updated");
      refresh();
    },
    onError: () => api.error("Status update failed"),
  });

  return {
    query,
    categoriesQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    statusMutation,
    contextHolder,
  };
};
