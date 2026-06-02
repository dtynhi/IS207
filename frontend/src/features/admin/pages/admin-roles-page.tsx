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
import { useAdminMyAccount } from "../hooks/use-admin-my-account";
import type { AdminPermissionFormValues, AdminRoleFormValues, AdminRoleRow } from "../types/admin.types";

const { Title, Paragraph } = Typography;

export const AdminRolesPage = () => {
  const { query, createMutation, updateMutation, deleteMutation, permissionMutation, contextHolder } = useAdminRoles();
  const [editForm] = Form.useForm<AdminRoleFormValues>();
  const [permissionForm] = Form.useForm<AdminPermissionFormValues>();
  const [editingRole, setEditingRole] = useState<AdminRoleRow | null>(null);
  const [permissionsRole, setPermissionsRole] = useState<AdminRoleRow | null>(null);

  // Check user permissions
  const { query: myAccountQuery } = useAdminMyAccount();
  const myData = myAccountQuery.data as any;
  const isSuperAdmin = myData?.role?.title === "Quản trị hệ thống";
  const myPermissions = myData?.role?.permissions || {};

  const canCreate = isSuperAdmin || (Array.isArray(myPermissions.roles) && myPermissions.roles.includes("create"));
  const canUpdate = isSuperAdmin || (Array.isArray(myPermissions.roles) && myPermissions.roles.includes("update"));
  const canDelete = isSuperAdmin || (Array.isArray(myPermissions.roles) && myPermissions.roles.includes("delete"));

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
      <Title level={3}>Quản lý vai trò</Title>
      <Paragraph type="secondary">Quản lý thông tin vai trò và phân quyền.</Paragraph>

      {canCreate && (
        <Form
          layout="inline"
          className="mb-4"
          onFinish={(values: AdminRoleFormValues) => createMutation.mutate(values)}
        >
          <Form.Item name="title" rules={[{ required: true, message: "Vui lòng nhập tên vai trò!" }]}><Input placeholder="Tên vai trò" /></Form.Item>
          <Form.Item name="description"><Input placeholder="Mô tả" /></Form.Item>
          <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Tạo</Button>
        </Form>
      )}

      <Table<AdminRoleRow>
        loading={query.isPending}
        rowKey="id"
        dataSource={rows}
        columns={[
          { title: "Tên vai trò", dataIndex: "title" },
          { title: "Mô tả", dataIndex: "description" },
          { title: "Quyền hạn", render: (_, record) => <span>{JSON.stringify(record.permissions || [])}</span> },
          {
            title: "Thao tác",
            render: (_, record) => {
              const hasActions = canUpdate || canDelete;
              if (!hasActions) return <span>Không có quyền thao tác</span>;

              return (
                <Space>
                  {canUpdate && <Button onClick={() => openEditModal(record)}>Sửa</Button>}
                  {canUpdate && <Button onClick={() => openPermissionsModal(record)}>Phân quyền</Button>}
                  {canDelete && (
                    <Popconfirm
                      title="Xóa vai trò này?"
                      okText="Xóa"
                      cancelText="Hủy"
                      onConfirm={() => deleteMutation.mutate(record.id)}
                    >
                      <Button danger loading={deleteMutation.isPending}>Xóa</Button>
                    </Popconfirm>
                  )}
                </Space>
              );
            },
          },
        ]}
      />

      <Modal
        title="Chỉnh sửa vai trò"
        open={Boolean(editingRole)}
        onCancel={() => setEditingRole(null)}
        onOk={submitEdit}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={updateMutation.isPending}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="title" label="Tên vai trò" rules={[{ required: true, message: "Vui lòng nhập tên vai trò!" }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input /></Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Cập nhật quyền hạn"
        open={Boolean(permissionsRole)}
        onCancel={() => setPermissionsRole(null)}
        onOk={submitPermissions}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={permissionMutation.isPending}
      >
        <Form form={permissionForm} layout="vertical">
          <Form.Item name="permissionsJson" label="Quyền hạn dạng JSON" rules={[{ required: true, message: "Vui lòng nhập quyền hạn dạng JSON!" }]}>
            <Input.TextArea rows={8} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
