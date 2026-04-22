import { useQuery } from "@tanstack/react-query";
import { getCartApi } from "../api/cart.api";

export const useCartIndicator = (userId: string | null) => {
  const cartQuery = useQuery({
    queryKey: ["cart", userId],
    queryFn: () => getCartApi(userId as string),
    enabled: Boolean(userId),
  });

  const cartCount = (cartQuery.data?.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0);

  return { cartCount, isLoading: cartQuery.isLoading };
};
