import { Button, Form, Input, Typography } from "antd";
import { Link } from "react-router-dom";
import { useAuthResetPassword } from "../hooks/use-auth-reset-password";
import type { ResetPasswordFormValues } from "../types/auth.types";

const { Title, Paragraph } = Typography;

export const ResetPasswordPage = () => {
  const { mutation, submitReset, contextHolder } = useAuthResetPassword();
  const email = localStorage.getItem("auth_reset_email") || "";

  return (
    <div className="um-auth-bg">
      {contextHolder}
      <div className="um-auth-card">
        <Title level={2} className="!mb-1">Đặt lại mật khẩu</Title>
        <Paragraph className="um-auth-subtitle">Tạo mật khẩu mới cho tài khoản</Paragraph>

        <Form layout="vertical" size="large" initialValues={{ email }} onFinish={(values: ResetPasswordFormValues) => submitReset(values)}>
          <Form.Item name="email" rules={[{ required: true }, { type: "email" }]}>
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "Nhập mật khẩu" }, { min: 6 }]}>
            <Input.Password placeholder="Mật khẩu mới" />
          </Form.Item>
          <Form.Item name="confirmPassword" rules={[{ required: true, message: "Xác nhận mật khẩu" }]}>
            <Input.Password placeholder="Xác nhận mật khẩu" />
          </Form.Item>
          <Button htmlType="submit" type="primary" loading={mutation.isPending} block className="h-[46px] rounded-[10px] font-semibold">
            Đặt lại mật khẩu
          </Button>
        </Form>

        <div className="um-auth-footer"><Link to="/auth/login">← Đăng nhập</Link></div>
      </div>
    </div>
  );
};
