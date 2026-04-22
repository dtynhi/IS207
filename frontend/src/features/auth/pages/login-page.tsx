import { Button, Form, Input, Typography } from "antd";
import { Link } from "react-router-dom";
import { useAuthLogin } from "../hooks/use-auth-login";
import type { LoginFormValues } from "../types/auth.types";

const { Title, Paragraph, Text } = Typography;

export const LoginPage = () => {
  const { mutation, contextHolder } = useAuthLogin();

  return (
    <div className="um-auth-bg">
      {contextHolder}
      <div className="um-auth-card">
        <Title level={2} className="!mb-1">Đăng nhập</Title>
        <Paragraph className="um-auth-subtitle">Chào mừng bạn quay lại Uni Market</Paragraph>

        <Form layout="vertical" onFinish={(values: LoginFormValues) => mutation.mutate(values)} size="large">
          <Form.Item name="email" rules={[{ required: true, message: "Nhập email" }, { type: "email", message: "Email không hợp lệ" }]}>
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "Nhập mật khẩu" }]}>
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>
          <Button htmlType="submit" type="primary" loading={mutation.isPending} block className="h-[46px] rounded-[10px] font-semibold">
            Đăng nhập
          </Button>
        </Form>

        <div className="um-auth-footer">
          <Link to="/auth/forgot" className="mr-4 text-[var(--text-muted)]">Quên mật khẩu?</Link>
          <Text type="secondary">Chưa có tài khoản?</Text> <Link to="/auth/register">Đăng ký</Link>
        </div>
      </div>
    </div>
  );
};
