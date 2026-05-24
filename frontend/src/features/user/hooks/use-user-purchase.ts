import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserId } from "../../../shared/session/storage";
import { cancelOrderApi, getUserPurchaseApi } from "../api/user.api";

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

  return { userId, purchases, cancelOrder };
};
