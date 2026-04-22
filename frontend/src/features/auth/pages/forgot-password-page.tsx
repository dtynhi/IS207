import { Alert, Button, Form, Input, Typography } from "antd";
import { Link } from "react-router-dom";
import { useAuthForgotPassword } from "../hooks/use-auth-forgot-password";
import type { ForgotPasswordFormValues } from "../types/auth.types";

const { Title, Paragraph } = Typography;

export const ForgotPasswordPage = () => {
  const { mutation, contextHolder } = useAuthForgotPassword();

  return (
    <div className="um-auth-bg">
      {contextHolder}
      <div className="um-auth-card">
        <Title level={2} className="!mb-1">Quên mật khẩu</Title>
        <Paragraph className="um-auth-subtitle">Nhập email để nhận mã OTP xác thực</Paragraph>

        {mutation.data && <Alert type="info" showIcon message={`Mã OTP: ${mutation.data.otp}`} className="mb-4" />}

        <Form layout="vertical" onFinish={(values: ForgotPasswordFormValues) => mutation.mutate(values)} size="large">
          <Form.Item name="email" rules={[{ required: true, message: "Nhập email" }, { type: "email" }]}>
            <Input placeholder="Email" />
          </Form.Item>
          <Button htmlType="submit" type="primary" loading={mutation.isPending} block className="h-[46px] rounded-[10px] font-semibold">
            Gửi mã OTP
          </Button>
        </Form>

        <div className="um-auth-footer"><Link to="/auth/login">← Quay lại đăng nhập</Link></div>
      </div>
    </div>
  );
};
