import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Typography,
} from "antd";
import { useMemo, useState } from "react";
import { useAdminAccounts } from "../hooks/use-admin-accounts";
import type {
  AdminAccountFormValues,
  AdminAccountRow,
  AdminCreateAccountFormValues,
} from "../types/admin.types";

const { Title } = Typography;

export const AdminAccountsPage = () => {
  const { query, rolesQuery, createMutation, updateMutation, statusMutation, deleteMutation, contextHolder } =
    useAdminAccounts();

  const [editForm] = Form.useForm<AdminAccountFormValues>();
  const [editingAccount, setEditingAccount] = useState<AdminAccountRow | null>(null);

  const roleOptions = useMemo(
    () => (rolesQuery.data || []).map((role) => ({ value: role.id, label: role.title })),
    [rolesQuery.data]
  );

  const openEditModal = (record: AdminAccountRow) => {
    setEditingAccount(record);
    editForm.setFieldsValue({
      fullName: record.fullName,
      email: record.email,
      phone: record.phone,
      roleId: record.roleId,
    });
  };

  const submitEdit = async () => {
    if (!editingAccount) return;
    const values = await editForm.validateFields();
    updateMutation.mutate({ id: editingAccount.id, payload: values });
    setEditingAccount(null);
  };

  return (
    <Card>
      {contextHolder}
      <Title level={3}>Accounts Management</Title>
      <Form
        layout="inline"
        className="mb-4"
        onFinish={(values: AdminCreateAccountFormValues) => createMutation.mutate(values)}
      >
        <Form.Item name="fullName" rules={[{ required: true }]}><Input placeholder="Full name" /></Form.Item>
        <Form.Item name="email" rules={[{ required: true, type: "email" }]}><Input placeholder="Email" /></Form.Item>
        <Form.Item name="password" rules={[{ required: true, min: 6 }]}><Input.Password placeholder="Password" /></Form.Item>
        <Form.Item name="roleId"><Select className="w-[200px]" allowClear placeholder="Role" options={roleOptions} /></Form.Item>
        <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Create</Button>
      </Form>

      <Table<AdminAccountRow>
        loading={query.isPending}
        rowKey="id"
        dataSource={(query.data?.items || []) as AdminAccountRow[]}
        columns={[
          { title: "Name", dataIndex: "fullName" },
          { title: "Email", dataIndex: "email" },
          { title: "Role", render: (_, record) => record.role?.title || "-" },
          {
            title: "Status",
            render: (_, record) => (
              <Switch
                checked={record.status === "active"}
                loading={statusMutation.isPending}
                onChange={(checked) =>
                  statusMutation.mutate({ id: record.id, status: checked ? "active" : "inactive" })
                }
              />
            ),
          },
          {
            title: "Actions",
            render: (_, record) => (
              <Space>
                <Button onClick={() => openEditModal(record)}>Edit</Button>
                <Popconfirm title="Delete account?" onConfirm={() => deleteMutation.mutate(record.id)}>
                  <Button danger loading={deleteMutation.isPending}>Delete</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal title="Edit Account" open={Boolean(editingAccount)} onCancel={() => setEditingAccount(null)} onOk={submitEdit} okText="Save" confirmLoading={updateMutation.isPending}>
        <Form form={editForm} layout="vertical">
          <Form.Item name="fullName" label="Full name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}><Input /></Form.Item>
          <Form.Item name="phone" label="Phone"><Input /></Form.Item>
          <Form.Item name="roleId" label="Role"><Select allowClear options={roleOptions} /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
