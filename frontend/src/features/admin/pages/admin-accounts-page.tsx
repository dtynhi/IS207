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
import { useAdminMyAccount } from "../hooks/use-admin-my-account";
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

  // Check user permissions
  const { query: myAccountQuery } = useAdminMyAccount();
  const myData = myAccountQuery.data as any;
  const isSuperAdmin = myData?.role?.title === "Quản trị hệ thống";
  const myPermissions = myData?.role?.permissions || {};

  const canCreate = isSuperAdmin || (Array.isArray(myPermissions.accounts) && myPermissions.accounts.includes("create"));
  const canUpdate = isSuperAdmin || (Array.isArray(myPermissions.accounts) && myPermissions.accounts.includes("update"));
  const canDelete = isSuperAdmin || (Array.isArray(myPermissions.accounts) && myPermissions.accounts.includes("delete"));

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
      <Title level={3}>Quản lý tài khoản</Title>
      
      {canCreate && (
        <Form
          layout="inline"
          className="mb-4"
          onFinish={(values: AdminCreateAccountFormValues) => createMutation.mutate(values)}
        >
          <Form.Item name="fullName" rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}><Input placeholder="Họ và tên" /></Form.Item>
          <Form.Item name="email" rules={[{ required: true, message: "Vui lòng nhập email!" }, { type: "email", message: "Email không hợp lệ!" }]}><Input placeholder="Email" /></Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }, { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" }]}><Input.Password placeholder="Mật khẩu" /></Form.Item>
          <Form.Item name="roleId"><Select className="w-[200px]" allowClear placeholder="Vai trò" options={roleOptions} /></Form.Item>
          <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Tạo</Button>
        </Form>
      )}

      <Table<AdminAccountRow>
        loading={query.isPending}
        rowKey="id"
        dataSource={(query.data?.items || []) as AdminAccountRow[]}
        columns={[
          { title: "Họ và tên", dataIndex: "fullName" },
          { title: "Email", dataIndex: "email" },
          { title: "Vai trò", render: (_, record) => record.role?.title || "-" },
          {
            title: "Trạng thái",
            render: (_, record) => (
              <Switch
                checked={record.status === "active"}
                disabled={!canUpdate}
                loading={statusMutation.isPending}
                onChange={(checked) =>
                  statusMutation.mutate({ id: record.id, status: checked ? "active" : "inactive" })
                }
              />
            ),
          },
          {
            title: "Thao tác",
            render: (_, record) => {
              const hasActions = canUpdate || canDelete;
              if (!hasActions) return <span>Không có quyền thao tác</span>;

              return (
                <Space>
                  {canUpdate && <Button onClick={() => openEditModal(record)}>Sửa</Button>}
                  {canDelete && (
                    <Popconfirm
                      title="Xóa tài khoản này?"
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
        title="Chỉnh sửa tài khoản"
        open={Boolean(editingAccount)}
        onCancel={() => setEditingAccount(null)}
        onOk={submitEdit}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={updateMutation.isPending}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}><Input /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Vui lòng nhập email!" }, { type: "email", message: "Email không hợp lệ!" }]}><Input /></Form.Item>
          <Form.Item name="phone" label="Số điện thoại"><Input /></Form.Item>
          <Form.Item name="roleId" label="Vai trò"><Select allowClear options={roleOptions} placeholder="Chọn vai trò" /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
