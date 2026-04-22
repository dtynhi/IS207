import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { getUserId } from "../../../shared/session/storage";
import { changePasswordApi } from "../../auth/api/auth.api";
import type { ChangePasswordFormValues } from "../types/user.types";

export const useUserChangePassword = () => {
  const userId = getUserId();
  const [api, contextHolder] = message.useMessage();

  const change = useMutation({
    mutationFn: (payload: ChangePasswordFormValues) => changePasswordApi({ userId, ...payload }),
    onSuccess: () => api.success("Đã đổi mật khẩu!"),
    onError: () => api.error("Thất bại"),
  });

  return { userId, change, contextHolder };
};
