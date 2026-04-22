import { useQuery } from "@tanstack/react-query";
import { getUserId } from "../../../shared/session/storage";
import { getUserPurchaseApi } from "../api/user.api";

export const useUserPurchase = () => {
  const userId = getUserId();

  const purchases = useQuery({
    queryKey: ["user-purchase", userId],
    queryFn: () => getUserPurchaseApi(userId, 1, 20),
    enabled: Boolean(userId),
  });

  return { userId, purchases };
};
