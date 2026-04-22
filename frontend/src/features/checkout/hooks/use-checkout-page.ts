import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { getUserId } from "../../../shared/session/storage";
import { getCartApi } from "../../cart/api/cart.api";
import { createCheckoutOrderApi } from "../api/checkout.api";
import type { CheckoutFormValues } from "../types/checkout.types";

export const useCheckoutPage = () => {
  const navigate = useNavigate();
  const userId = getUserId();
  const [api, contextHolder] = message.useMessage();

  const cartQuery = useQuery({
    queryKey: ["cart-checkout", userId],
    queryFn: () => getCartApi(userId),
    enabled: Boolean(userId),
  });

  const orderMutation = useMutation({
    mutationFn: createCheckoutOrderApi,
    onSuccess: (data) => {
      api.success("Đặt hàng thành công!");
      navigate(`/checkout/success/${data.id}`);
    },
    onError: () => api.error("Đặt hàng thất bại"),
  });

  const submitOrder = (values: CheckoutFormValues) => {
    const items = (cartQuery.data?.items || []).map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    orderMutation.mutate({
      userId,
      ...values,
      items,
    });
  };

  return { userId, cartQuery, orderMutation, submitOrder, contextHolder };
};
