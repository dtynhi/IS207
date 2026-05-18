import { useMutation, useQuery } from "@tanstack/react-query";
import { useRef } from "react";
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
  const lastPaymentMethodRef = useRef<string | undefined>(undefined);

  const cartQuery = useQuery({
    queryKey: ["cart-checkout", userId],
    queryFn: () => getCartApi(userId),
    enabled: Boolean(userId),
  });

  const orderMutation = useMutation({
    mutationFn: createCheckoutOrderApi,
    onSuccess: (data) => {
      api.success("Đặt hàng thành công!");
      if (lastPaymentMethodRef.current === "bank") {
        // If backend returned a paymentUrl, redirect browser to it (gateway)
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
          return;
        }
        // fallback to internal sandbox page
        navigate(`/checkout/pay/sandbox/${data.id}`);
      } else {
        navigate(`/checkout/success/${data.id}`);
      }
    },
    onError: () => api.error("Đặt hàng thất bại"),
  });

  const submitOrder = (values: CheckoutFormValues) => {
    const items = (cartQuery.data?.items || []).map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    // remember payment method for post-success navigation
    lastPaymentMethodRef.current = values.paymentMethod;

    // Build a formatted address string so backend keeps using the existing `address` field
    const addressParts = [
      values.addressLine,
      values.ward,
      values.province,
    ].filter(Boolean);

    const payload = {
      userId,
      fullName: values.fullName,
      phone: values.phone,
      address: addressParts.join(", "),
      paymentMethod: values.paymentMethod,
      returnUrl: `${window.location.origin}/checkout/success/{orderId}`,
      items,
    };

    orderMutation.mutate(payload);
  };

  return { userId, cartQuery, orderMutation, submitOrder, contextHolder };
};
