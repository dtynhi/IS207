import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Typography,
} from "antd";
import { useState } from "react";
import { useAdminRoles } from "../hooks/use-admin-roles";
import type { AdminPermissionFormValues, AdminRoleFormValues, AdminRoleRow } from "../types/admin.types";

const { Title, Paragraph } = Typography;

export const AdminRolesPage = () => {
  const { query, createMutation, updateMutation, deleteMutation, permissionMutation, contextHolder } = useAdminRoles();
  const [editForm] = Form.useForm<AdminRoleFormValues>();
  const [permissionForm] = Form.useForm<AdminPermissionFormValues>();
  const [editingRole, setEditingRole] = useState<AdminRoleRow | null>(null);
  const [permissionsRole, setPermissionsRole] = useState<AdminRoleRow | null>(null);

  const rows = (query.data?.items || []) as AdminRoleRow[];

  const openEditModal = (role: AdminRoleRow) => {
    setEditingRole(role);
    editForm.setFieldsValue({ title: role.title, description: role.description });
  };

  const openPermissionsModal = (role: AdminRoleRow) => {
    setPermissionsRole(role);
    permissionForm.setFieldsValue({ permissionsJson: JSON.stringify(role.permissions || [], null, 2) });
  };

  const submitEdit = async () => {
    if (!editingRole) return;
    const values = await editForm.validateFields();
    updateMutation.mutate({ id: editingRole.id, payload: values });
    setEditingRole(null);
  };

  const submitPermissions = async () => {
    if (!permissionsRole) return;
    const values = await permissionForm.validateFields();

    try {
      const parsed = JSON.parse(values.permissionsJson);
      permissionMutation.mutate([{ id: permissionsRole.id, permissions: parsed }]);
      setPermissionsRole(null);
    } catch {
      // Error message handled in hook mutation in future extension.
    }
  };

  return (
    <Card>
      {contextHolder}
      <Title level={3}>Roles Management</Title>
      <Paragraph type="secondary">Manage role info and permissions with modal forms.</Paragraph>

      <Form
        layout="inline"
        className="mb-4"
        onFinish={(values: AdminRoleFormValues) => createMutation.mutate(values)}
      >
        <Form.Item name="title" rules={[{ required: true }]}><Input placeholder="Role title" /></Form.Item>
        <Form.Item name="description"><Input placeholder="Description" /></Form.Item>
        <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Create</Button>
      </Form>

      <Table<AdminRoleRow>
        loading={query.isPending}
        rowKey="id"
        dataSource={rows}
        columns={[
          { title: "Title", dataIndex: "title" },
          { title: "Description", dataIndex: "description" },
          { title: "Permissions", render: (_, record) => <span>{JSON.stringify(record.permissions || [])}</span> },
          {
            title: "Actions",
            render: (_, record) => (
              <Space>
                <Button onClick={() => openEditModal(record)}>Edit</Button>
                <Button onClick={() => openPermissionsModal(record)}>Permissions</Button>
                <Popconfirm title="Delete role?" onConfirm={() => deleteMutation.mutate(record.id)}>
                  <Button danger loading={deleteMutation.isPending}>Delete</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal title="Edit Role" open={Boolean(editingRole)} onCancel={() => setEditingRole(null)} onOk={submitEdit} okText="Save" confirmLoading={updateMutation.isPending}>
        <Form form={editForm} layout="vertical">
          <Form.Item name="title" label="Role title" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Update Permissions" open={Boolean(permissionsRole)} onCancel={() => setPermissionsRole(null)} onOk={submitPermissions} okText="Save" confirmLoading={permissionMutation.isPending}>
        <Form form={permissionForm} layout="vertical">
          <Form.Item name="permissionsJson" label="Permissions JSON" rules={[{ required: true, message: "Permissions JSON is required" }]}>
            <Input.TextArea rows={8} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
