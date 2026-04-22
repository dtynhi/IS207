import { ShopOutlined } from "@ant-design/icons";
import { Button, Form, Input, Typography } from "antd";
import { Link } from "react-router-dom";
import { useAdminLogin } from "../hooks/use-admin-login";
import type { AdminLoginFormValues } from "../types/admin.types";

const { Title, Paragraph } = Typography;

export const AdminLoginPage = () => {
  const { mutation, contextHolder } = useAdminLogin();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#1E293B_0%,#334155_50%,#1E293B_100%)] p-4">
      {contextHolder}
      <div className="um-auth-card w-full max-w-[400px]">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-[28px] text-white"><ShopOutlined /></div>
          <Title level={2} className="!m-0">Admin Panel</Title>
          <Paragraph className="um-auth-subtitle !mb-0">Đăng nhập trang quản trị</Paragraph>
        </div>

        <Form layout="vertical" onFinish={(values: AdminLoginFormValues) => mutation.mutate(values)} size="large">
          <Form.Item name="email" rules={[{ required: true }, { type: "email" }]}>
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>
          <Button htmlType="submit" type="primary" loading={mutation.isPending} block className="h-[46px] rounded-[10px] font-semibold">
            Đăng nhập
          </Button>
        </Form>

        <div className="um-auth-footer"><Link to="/">← Trang khách hàng</Link></div>
      </div>
    </div>
  );
};
