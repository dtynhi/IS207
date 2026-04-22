import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { getUserId } from "../../../shared/session/storage";
import { deleteCartItemApi, getCartApi, updateCartItemApi } from "../api/cart.api";
import type { UpdateCartQuantityInput } from "../types/cart.types";

export const useCartPage = () => {
  const userId = getUserId();
  const [api, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const cart = useQuery({
    queryKey: ["cart", userId],
    queryFn: () => getCartApi(userId),
    enabled: Boolean(userId),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["cart", userId] });

  const update = useMutation({
    mutationFn: ({ id, quantity }: UpdateCartQuantityInput) => updateCartItemApi(id, quantity),
    onSuccess: refresh,
    onError: () => api.error("Cập nhật thất bại"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCartItemApi(id),
    onSuccess: refresh,
    onError: () => api.error("Xoá thất bại"),
  });

  return { userId, cart, update, remove, contextHolder };
};
