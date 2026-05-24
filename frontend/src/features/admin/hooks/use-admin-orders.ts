import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
  claimAdminOrderApi,
  getAdminOrderDetailApi,
  listAdminOrdersApi,
  releaseAdminOrderApi,
  updateAdminOrderStatusApi,
} from "../api/admin.api";

export const useAdminOrders = (filters: Record<string, unknown>) => {
  const [api, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-orders", filters],
    queryFn: () => listAdminOrdersApi(filters),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-orders"] });

  const detailMutation = useMutation({
    mutationFn: getAdminOrderDetailApi,
    onError: () => api.error("Load order failed"),
  });

  const claimMutation = useMutation({
    mutationFn: claimAdminOrderApi,
    onSuccess: () => {
      api.success("Order claimed");
      refresh();
    },
    onError: () => api.error("Claim failed"),
  });

  const releaseMutation = useMutation({
    mutationFn: releaseAdminOrderApi,
    onSuccess: () => {
      api.success("Order released");
      refresh();
    },
    onError: () => api.error("Release failed"),
  });

  type OrderStatus =
    | "pending_confirm"
    | "ready_to_pick"
    | "ready_to_ship"
    | "delivered"
    | "returned"
    | "cancelled";

  const statusMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { status: OrderStatus; reason?: string; lockVersion: number } }) =>
      updateAdminOrderStatusApi(id, payload),
    onSuccess: () => {
      api.success("Status updated");
      refresh();
    },
    onError: () => api.error("Status update failed"),
  });

  return {
    query,
    detailMutation,
    claimMutation,
    releaseMutation,
    statusMutation,
    contextHolder,
  };
};
