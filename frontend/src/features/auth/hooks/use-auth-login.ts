import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { loginUserApi } from "../api/auth.api";
import { setUserEmail, setUserId } from "../../../shared/session/storage";
import type { LoginFormValues } from "../types/auth.types";

export const useAuthLogin = () => {
  const navigate = useNavigate();
  const [api, contextHolder] = message.useMessage();

  const mutation = useMutation({
    mutationFn: (payload: LoginFormValues) => loginUserApi(payload),
    onSuccess: (data) => {
      setUserId(data.id);
      setUserEmail(data.email);
      api.success("Đăng nhập thành công!");
      navigate("/user/profile");
    },
    onError: () => api.error("Đăng nhập thất bại"),
  });

  return { mutation, contextHolder };
};
