import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { getUserId } from "../../../shared/session/storage";
import {
  createUserAddressApi,
  deleteUserAddressApi,
  getUserAddressApi,
  updateUserAddressApi,
} from "../api/user.api";
import type { UserAddressCreateFormValues, UserAddressUpdatePayload } from "../types/user.types";

export const useUserAddress = () => {
  const userId = getUserId();
  const [api, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const queryKey = ["user-address", userId] as const;

  const addresses = useQuery({
    queryKey,
    queryFn: () => getUserAddressApi(userId),
    enabled: Boolean(userId),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey });

  const create = useMutation({
    mutationFn: (payload: UserAddressCreateFormValues) => createUserAddressApi(userId, payload),
    onSuccess: () => {
      api.success("Đã thêm");
      refresh();
    },
    onError: () => api.error("Thêm thất bại"),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UserAddressUpdatePayload }) =>
      updateUserAddressApi(userId, id, payload),
    onSuccess: refresh,
    onError: () => api.error("Cập nhật thất bại"),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteUserAddressApi(userId, id),
    onSuccess: refresh,
    onError: () => api.error("Xoá thất bại"),
  });

  return { userId, addresses, create, update, del, contextHolder };
};
