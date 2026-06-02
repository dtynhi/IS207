import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { useAdminMyAccount } from "../hooks/use-admin-my-account";
import type { AdminMyAccountFormValues } from "../types/admin.types";

const { Title } = Typography;

export const AdminMyAccountPage = () => {
  const { adminId, query, mutation, contextHolder } = useAdminMyAccount();
  const data = (query.data || {}) as Record<string, unknown>;

  return (
    <Card>
      {contextHolder}
      <Title level={3}>Tài khoản của tôi</Title>
      {!adminId ? <Alert type="warning" message="Vui lòng đăng nhập trước" showIcon className="mb-4" /> : null}

      <Form
        layout="vertical"
        initialValues={{
          fullName: String(data.fullName || ""),
          email: String(data.email || ""),
          phone: String(data.phone || ""),
          avatar: String(data.avatar || ""),
          password: "",
        }}
        key={String(data.id || "my-account-form")}
        onFinish={(values: AdminMyAccountFormValues) => mutation.mutate(values)}
      >
        <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}><Input /></Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, message: "Vui lòng nhập email!" }, { type: "email", message: "Email không hợp lệ!" }]}><Input /></Form.Item>
        <Form.Item name="phone" label="Số điện thoại"><Input /></Form.Item>
        <Form.Item name="avatar" label="Đường dẫn ảnh đại diện (Avatar URL)"><Input /></Form.Item>
        <Form.Item name="password" label="Mật khẩu mới (tùy chọn)"><Input.Password /></Form.Item>
        <Button type="primary" htmlType="submit" loading={mutation.isPending}>Lưu</Button>
      </Form>
    </Card>
  );
};
