import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRef } from "react";
import { message } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom"; // THÊM useSearchParams
import { getUserId } from "../../../shared/session/storage";
import { getCartApi } from "../../cart/api/cart.api";
import { createCheckoutOrderApi } from "../api/checkout.api";
import type { CheckoutFormValues } from "../types/checkout.types";
import type { ApiErrorResponse } from "../../../shared/api/types";

export const useCheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // THÊM DÒNG NÀY ĐỂ LẤY URL PARAMS
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
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
          return;
        }
        navigate(`/checkout/sandbox/${data.id}`);
      } else {
        navigate(`/checkout/success/${data.id}`);
      }
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const payload = error.response?.data as ApiErrorResponse | undefined;
        const code = payload?.error?.code;
        if (code === "OUT_OF_STOCK") {
          api.error("Sản phẩm đã hết hàng.");
          return;
        }
        if (code === "PRODUCT_NOT_FOUND") {
          api.error("Sản phẩm không còn tồn tại.");
          return;
        }
      }
      api.error("Đặt hàng thất bại");
    },
  });

  const submitOrder = (values: CheckoutFormValues) => {
    // 1. Lấy danh sách ID giỏ hàng được chọn từ URL (truyền sang từ trang Giỏ hàng)
    const selectedItemIds = searchParams.get("items")?.split(",") || [];

    // 2. CHỈ LỌC lấy những sản phẩm nằm trong danh sách được chọn để gửi cho Backend
    const items = (cartQuery.data?.items || [])
      .filter((item) => selectedItemIds.includes(item.id))
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

    if (items.length === 0) {
      api.error("Không có sản phẩm nào để thanh toán!");
      return;
    }

    lastPaymentMethodRef.current = values.paymentMethod;

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
      returnUrl: `${window.location.origin}/checkout/sandbox-return`,
      items, // Danh sách items đã được lọc chuẩn xác!
    };

    orderMutation.mutate(payload);
  };

  return { cartQuery, orderMutation, submitOrder, contextHolder };
};