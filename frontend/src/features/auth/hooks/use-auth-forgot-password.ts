import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { forgotPasswordApi } from "../api/auth.api";
import type { ForgotPasswordFormValues } from "../types/auth.types";

export const useAuthForgotPassword = () => {
  const navigate = useNavigate();
  const [api, contextHolder] = message.useMessage();

  const mutation = useMutation({
    mutationFn: (payload: ForgotPasswordFormValues) => forgotPasswordApi(payload),
    onSuccess: (data) => {
      localStorage.setItem("auth_reset_email", data.email);
      localStorage.setItem("auth_reset_otp", data.otp);
      api.success("Đã tạo OTP!");
      navigate("/auth/otp");
    },
    onError: () => api.error("Thất bại"),
  });

  return { mutation, contextHolder };
};
