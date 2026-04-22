import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { verifyOtpApi } from "../api/auth.api";
import type { OtpFormValues } from "../types/auth.types";

export const useAuthOtp = () => {
  const navigate = useNavigate();
  const [api, contextHolder] = message.useMessage();

  const mutation = useMutation({
    mutationFn: (payload: OtpFormValues) => verifyOtpApi(payload),
    onSuccess: () => {
      api.success("Xác thực thành công!");
      navigate("/auth/reset");
    },
    onError: () => api.error("OTP không đúng"),
  });

  return { mutation, contextHolder };
};
