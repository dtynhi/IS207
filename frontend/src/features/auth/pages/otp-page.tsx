import { Alert, Button, Form, Input, Typography } from "antd";
import { Link } from "react-router-dom";
import { useAuthOtp } from "../hooks/use-auth-otp";
import type { OtpFormValues } from "../types/auth.types";

const { Title, Paragraph } = Typography;

export const OtpPage = () => {
  const { mutation, contextHolder } = useAuthOtp();
  const email = localStorage.getItem("auth_reset_email") || "";
  const otp = localStorage.getItem("auth_reset_otp") || "";

  return (
    <div className="um-auth-bg">
      {contextHolder}
      <div className="um-auth-card">
        <Title level={2} className="!mb-1">Xác thực OTP</Title>
        <Paragraph className="um-auth-subtitle">Nhập mã OTP đã gửi qua email</Paragraph>

        {otp && <Alert type="info" showIcon message={`Dev OTP: ${otp}`} className="mb-4" />}

        <Form layout="vertical" onFinish={(values: OtpFormValues) => mutation.mutate(values)} initialValues={{ email }} size="large">
          <Form.Item name="email" rules={[{ required: true }, { type: "email" }]}>
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="otp" rules={[{ required: true, message: "Nhập OTP" }, { len: 6, message: "OTP 6 ký tự" }]}>
            <Input placeholder="Nhập mã OTP" maxLength={6} className="text-center text-lg font-bold tracking-[0.5rem]" />
          </Form.Item>
          <Button htmlType="submit" type="primary" loading={mutation.isPending} block className="h-[46px] rounded-[10px] font-semibold">
            Xác thực
          </Button>
        </Form>

        <div className="um-auth-footer"><Link to="/auth/forgot">← Gửi lại OTP</Link></div>
      </div>
    </div>
  );
};
