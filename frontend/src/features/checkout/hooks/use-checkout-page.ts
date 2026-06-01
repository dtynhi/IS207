import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { message } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getUserId } from "../../../shared/session/storage";
import { getCartApi } from "../../cart/api/cart.api";
import { couponAPI } from "../../coupons/api/coupon.api";
import { createCheckoutOrderApi } from "../api/checkout.api";
import type { CheckoutFormValues } from "../types/checkout.types";
import type { ApiErrorResponse } from "../../../shared/api/types";

export const useCheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = getUserId();
  const [api, contextHolder] = message.useMessage();
  const [couponApplying, setCouponApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    couponCode: string;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    discountLabel?: string;
  } | null>(null);
  const lastPaymentMethodRef = useRef<string | undefined>(undefined);

  const cartQuery = useQuery({
    queryKey: ["cart-checkout", userId],
    queryFn: () => getCartApi(userId),
    enabled: Boolean(userId),
  });

  const selectedItemIds = searchParams.get("items")?.split(",") || [];
  const selectedItems = (cartQuery.data?.items || []).filter((item) => selectedItemIds.includes(item.id));
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);

  useEffect(() => {
    setAppliedCoupon(null);
  }, [selectedItemIds.join(","), selectedSubtotal]);

  const orderMutation = useMutation({
    mutationFn: createCheckoutOrderApi,
    onSuccess: (data) => {
      api.success("Đặt hàng thành công!");
      console.log("[checkout] create VNPay order response:", data);

      if (lastPaymentMethodRef.current === "bank") {
        if (data.paymentUrl) {
          console.log("[checkout] redirecting to VNPay paymentUrl:", data.paymentUrl);
          window.location.href = data.paymentUrl;
          return;
        }

        const sandboxPath = `/checkout/pay/sandbox/${data.id}`;
        console.log("[checkout] no paymentUrl returned, navigating to sandbox page:", sandboxPath);
        navigate(sandboxPath);
      } else {
        const successPath = `/checkout/success/${data.id}`;
        console.log("[checkout] navigating to success page:", successPath);
        navigate(successPath);
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
        if (code === "INVALID_COUPON") {
          api.error(payload?.error?.message || "Mã coupon không hợp lệ.");
          return;
        }
      }
      api.error("Đặt hàng thất bại");
    },
  });

  const applyCoupon = async (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setAppliedCoupon(null);
      api.warning("Vui lòng nhập mã coupon");
      return;
    }

    const productIds = selectedItems.map((item) => item.productId);
    if (productIds.length === 0) {
      api.error("Không có sản phẩm nào để áp dụng coupon");
      return;
    }

    setCouponApplying(true);
    try {
      const response = await couponAPI.validate(
        trimmed,
        selectedSubtotal,
        productIds,
        userId || undefined,
      );
      const discountAmount = Number(response.discount || 0);
      const couponType = response.coupon?.type as string | undefined;
      const couponValue = Number(response.coupon?.value ?? 0);
      const discountLabel = couponType === "percent" ? `-${couponValue}%` : undefined;

      setAppliedCoupon({
        couponCode: trimmed,
        originalAmount: selectedSubtotal,
        discountAmount,
        finalAmount: Math.max(
          Number(response.finalPrice != null ? response.finalPrice : selectedSubtotal),
          0,
        ),
        discountLabel,
      });
      api.success("Áp dụng coupon thành công!");
    } catch (error) {
      setAppliedCoupon(null);
      if (axios.isAxiosError(error)) {
        const payload = error.response?.data as { error?: string } | undefined;
        api.error(payload?.error || "Mã coupon không hợp lệ hoặc không áp dụng được");
        return;
      }
      api.error("Không thể áp dụng coupon");
    } finally {
      setCouponApplying(false);
    }
  };

  const submitOrder = (values: CheckoutFormValues) => {
    const items = selectedItems.map((item) => ({
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
      couponCode: appliedCoupon?.couponCode,
      paymentMethod: values.paymentMethod,
      returnUrl: `${window.location.origin}/checkout/success/{orderId}`,
      items,
    };

    orderMutation.mutate(payload);
  };

  return {
    cartQuery,
    orderMutation,
    submitOrder,
    contextHolder,
    applyCoupon,
    couponApplying,
    appliedCoupon,
    selectedSubtotal,
    selectedItems,
    finalTotal: appliedCoupon?.finalAmount ?? selectedSubtotal,
  };
};