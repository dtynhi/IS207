import { useQuery } from "@tanstack/react-query";
import { getUserId } from "../../../shared/session/storage";
import { getUserWalletApi } from "../api/user.api";

export const useUserWallet = () => {
  const userId = getUserId();

  const wallet = useQuery({
    queryKey: ["user-wallet", userId],
    queryFn: () => getUserWalletApi(userId),
    enabled: Boolean(userId),
  });

  return { userId, wallet };
};
