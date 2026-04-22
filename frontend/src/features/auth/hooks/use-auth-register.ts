import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { registerUserApi } from "../api/auth.api";
import type { RegisterFormValues } from "../types/auth.types";

export const useAuthRegister = () => {
  const navigate = useNavigate();
  const [api, contextHolder] = message.useMessage();

  const mutation = useMutation({
    mutationFn: (payload: RegisterFormValues) => registerUserApi(payload),
    onSuccess: () => {
      api.success("Đăng ký thành công!");
      navigate("/auth/login");
    },
    onError: () => api.error("Đăng ký thất bại"),
  });

  return { mutation, contextHolder };
};
