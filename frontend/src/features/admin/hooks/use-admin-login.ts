import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { loginAdminApi } from "../../auth/api/auth.api";
import { setAdminId } from "../../../shared/session/storage";
import type { AdminLoginFormValues } from "../types/admin.types";

export const useAdminLogin = () => {
  const navigate = useNavigate();
  const [api, contextHolder] = message.useMessage();

  const mutation = useMutation({
    mutationFn: (payload: AdminLoginFormValues) => loginAdminApi(payload),
    onSuccess: (data) => {
      setAdminId(data.id);
      api.success("Đăng nhập Admin thành công!");
      navigate("/admin/dashboard");
    },
    onError: () => api.error("Đăng nhập thất bại"),
  });

  return { mutation, contextHolder };
};
