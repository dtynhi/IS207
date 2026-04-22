import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { getUserId } from "../../../shared/session/storage";
import { getUserProfileApi, updateUserProfileApi } from "../api/user.api";
import type { UserProfileFormValues } from "../types/user.types";

export const useUserProfile = () => {
  const userId = getUserId();
  const [api, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const profile = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => getUserProfileApi(userId),
    enabled: Boolean(userId),
  });

  const save = useMutation({
    mutationFn: (payload: UserProfileFormValues) => updateUserProfileApi(userId, payload),
    onSuccess: () => {
      api.success("Đã lưu!");
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
    },
    onError: () => api.error("Lỗi"),
  });

  return { userId, profile, save, contextHolder };
};
