import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserId } from "../../../shared/session/storage";
import { cancelOrderApi, createReturnRequestApi, getUserPurchaseApi } from "../api/user.api";

export const useUserPurchase = () => {
  const userId = getUserId();
  const queryClient = useQueryClient();

  const purchases = useQuery({
    queryKey: ["user-purchase", userId],
    queryFn: () => getUserPurchaseApi(userId, 1, 20),
    enabled: Boolean(userId),
  });

  const cancelOrder = useMutation({
    mutationFn: (orderId: string) => cancelOrderApi(orderId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-purchase", userId] });
    },
  });

  const requestReturn = useMutation({
    mutationFn: (payload: { orderId: string; reason: string; description?: string; mediaUrls?: string[] }) =>
      createReturnRequestApi(payload.orderId, {
        userId,
        reason: payload.reason,
        description: payload.description,
        mediaUrls: payload.mediaUrls,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-purchase", userId] });
    },
  });

  return { userId, purchases, cancelOrder, requestReturn };
};
