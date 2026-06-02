import { Button, Card, Form, Input, Typography } from "antd";
import { useAdminSettings } from "../hooks/use-admin-settings";
import type { AdminSettingsFormValues } from "../types/admin.types";

const { Title } = Typography;

export const AdminSettingsPage = () => {
  const { query, mutation, contextHolder } = useAdminSettings();
  const initial = (query.data || {}) as Record<string, unknown>;

  return (
    <Card>
      {contextHolder}
      <Title level={3}>Cài đặt hệ thống</Title>
      <Form
        layout="vertical"
        initialValues={{
          websiteName: String(initial.websiteName || "Uni Market"),
          logo: String(initial.logo || ""),
          phone: String(initial.phone || ""),
          email: String(initial.email || ""),
          address: String(initial.address || ""),
          copyright: String(initial.copyright || ""),
        }}
        key={String(initial.id || "settings-form")}
        onFinish={(values: AdminSettingsFormValues) => mutation.mutate(values)}
      >
        <Form.Item name="websiteName" label="Tên trang web" rules={[{ required: true, message: "Vui lòng nhập tên trang web!" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="logo" label="Đường dẫn Logo (Logo URL)"><Input /></Form.Item>
        <Form.Item name="phone" label="Số điện thoại"><Input /></Form.Item>
        <Form.Item name="email" label="Email" rules={[{ type: "email", message: "Email không hợp lệ!" }]}><Input /></Form.Item>
        <Form.Item name="address" label="Địa chỉ"><Input /></Form.Item>
        <Form.Item name="copyright" label="Bản quyền (Copyright)"><Input /></Form.Item>
        <Button type="primary" htmlType="submit" loading={mutation.isPending}>Lưu</Button>
      </Form>
    </Card>
  );
};
