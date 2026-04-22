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
      <Title level={3}>My Account</Title>
      {!adminId ? <Alert type="warning" message="Login first" showIcon className="mb-4" /> : null}

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
        <Form.Item name="fullName" label="Full name" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}><Input /></Form.Item>
        <Form.Item name="phone" label="Phone"><Input /></Form.Item>
        <Form.Item name="avatar" label="Avatar URL"><Input /></Form.Item>
        <Form.Item name="password" label="New password (optional)"><Input.Password /></Form.Item>
        <Button type="primary" htmlType="submit" loading={mutation.isPending}>Save</Button>
      </Form>
    </Card>
  );
};
