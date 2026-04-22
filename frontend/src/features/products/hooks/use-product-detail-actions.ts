import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { addCartItemApi } from "../../cart/api/cart.api";

export const useProductDetailActions = (params: {
  userId: string;
  productId?: string;
  quantity: number;
}) => {
  const queryClient = useQueryClient();
  const [api, contextHolder] = message.useMessage();

  const addCart = useMutation({
    mutationFn: () =>
      addCartItemApi({
        userId: params.userId,
        productId: params.productId || "",
        quantity: params.quantity,
      }),
    onSuccess: () => {
      api.success("Đã thêm vào giỏ hàng!");
      queryClient.invalidateQueries({ queryKey: ["cart", params.userId] });
    },
    onError: () => api.error("Thêm thất bại"),
  });

  return { addCart, contextHolder, api };
};
