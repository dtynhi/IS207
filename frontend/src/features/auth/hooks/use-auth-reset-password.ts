import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { resetPasswordApi } from "../api/auth.api";
import type { ResetPasswordFormValues } from "../types/auth.types";

export const useAuthResetPassword = () => {
  const navigate = useNavigate();
  const [api, contextHolder] = message.useMessage();

  const mutation = useMutation({
    mutationFn: (payload: { email: string; password: string }) => resetPasswordApi(payload),
    onSuccess: () => {
      api.success("Đặt lại mật khẩu thành công!");
      navigate("/auth/login");
    },
    onError: () => api.error("Thất bại"),
  });

  const submitReset = (values: ResetPasswordFormValues) => {
    if (values.password !== values.confirmPassword) {
      api.error("Mật khẩu không khớp");
      return;
    }

    mutation.mutate({ email: values.email, password: values.password });
  };

  return { mutation, submitReset, contextHolder };
};
