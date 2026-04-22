import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getUserId } from "../../../shared/session/storage";
import { getCheckoutSuccessApi } from "../api/checkout.api";

export const useCheckoutSuccess = () => {
  const { orderId = "" } = useParams();
  const userId = getUserId();

  const query = useQuery({
    queryKey: ["checkout-success", orderId, userId],
    queryFn: () => getCheckoutSuccessApi(orderId, userId),
    enabled: Boolean(orderId),
  });

  return { orderId, userId, query };
};
