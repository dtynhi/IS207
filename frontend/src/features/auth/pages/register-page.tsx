import { Button, Form, Input, Typography } from "antd";
import { Link } from "react-router-dom";
import { useAuthRegister } from "../hooks/use-auth-register";
import type { RegisterFormValues } from "../types/auth.types";

const { Title, Paragraph, Text } = Typography;

export const RegisterPage = () => {
  const { mutation, contextHolder } = useAuthRegister();

  return (
    <div className="um-auth-bg">
      {contextHolder}
      <div className="um-auth-card">
        <Title level={2} className="!mb-1">Đăng ký</Title>
        <Paragraph className="um-auth-subtitle">Tạo tài khoản Uni Market miễn phí</Paragraph>

        <Form layout="vertical" onFinish={(values: RegisterFormValues) => mutation.mutate(values)} size="large">
          <Form.Item name="fullName" rules={[{ required: true, message: "Nhập họ tên" }]}>
            <Input placeholder="Họ và tên" />
          </Form.Item>
          <Form.Item name="email" rules={[{ required: true, message: "Nhập email" }, { type: "email", message: "Email không hợp lệ" }]}>
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "Nhập mật khẩu" }, { min: 6, message: "Tối thiểu 6 ký tự" }]}>
            <Input.Password placeholder="Mật khẩu (tối thiểu 6 ký tự)" />
          </Form.Item>
          <Button htmlType="submit" type="primary" loading={mutation.isPending} block className="h-[46px] rounded-[10px] font-semibold">
            Đăng ký
          </Button>
        </Form>

        <div className="um-auth-footer">
          <Text type="secondary">Đã có tài khoản?</Text> <Link to="/auth/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};
