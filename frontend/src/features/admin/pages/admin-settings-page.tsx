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
      <Title level={3}>Settings</Title>
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
        <Form.Item name="websiteName" label="Website name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="logo" label="Logo URL"><Input /></Form.Item>
        <Form.Item name="phone" label="Phone"><Input /></Form.Item>
        <Form.Item name="email" label="Email"><Input /></Form.Item>
        <Form.Item name="address" label="Address"><Input /></Form.Item>
        <Form.Item name="copyright" label="Copyright"><Input /></Form.Item>
        <Button type="primary" htmlType="submit" loading={mutation.isPending}>Save</Button>
      </Form>
    </Card>
  );
};
