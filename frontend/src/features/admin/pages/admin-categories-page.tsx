import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Typography,
} from "antd";
import { useState } from "react";
import { useAdminCategories } from "../hooks/use-admin-categories";
import type { AdminCategoryFormValues, AdminCategoryRow } from "../types/admin.types";

const { Title } = Typography;

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

export const AdminCategoriesPage = () => {
  const { query, createMutation, updateMutation, statusMutation, deleteMutation, contextHolder } = useAdminCategories();
  const [createForm] = Form.useForm<AdminCategoryFormValues>();
  const [editForm] = Form.useForm<AdminCategoryFormValues>();
  const [editingCategory, setEditingCategory] = useState<AdminCategoryRow | null>(null);

  const openEditModal = (record: AdminCategoryRow) => {
    setEditingCategory(record);
    editForm.setFieldsValue({ title: record.title, slug: record.slug, position: record.position });
  };

  const submitEdit = async () => {
    if (!editingCategory) return;
    const values = await editForm.validateFields();
    updateMutation.mutate({ id: editingCategory.id, payload: values });
    setEditingCategory(null);
  };

  const getNextPosition = () => {
    const items = (query.data?.items || []) as AdminCategoryRow[];
    if (items.length === 0) return 1;
    return Math.max(...items.map((item) => item.position ?? 0)) + 1;
  };

  return (
    <Card>
      {contextHolder}
      <Title level={3}>Quản lý danh mục</Title>
      <Form
        form={createForm}
        layout="inline"
        className="mb-4"
        onFinish={(values: AdminCategoryFormValues) =>
          createMutation.mutate({ ...values, position: getNextPosition(), status: "active" })
        }
      >
        <Form.Item
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
        >
          <Input
            placeholder="Tên danh mục"
            onChange={(event) => {
              const title = event.target.value || "";
              createForm.setFieldValue("slug", toSlug(title));
            }}
          />
        </Form.Item>
        <Form.Item name="slug" rules={[{ required: true, message: "Vui lòng nhập đường dẫn!" }]}><Input placeholder="Đường dẫn (Slug)" /></Form.Item>
        <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Tạo</Button>
      </Form>

      <Table<AdminCategoryRow>
        loading={query.isPending}
        rowKey="id"
        dataSource={(query.data?.items || []) as AdminCategoryRow[]}
        columns={[
          { title: "Tên danh mục", dataIndex: "title" },
          { title: "Đường dẫn (Slug)", dataIndex: "slug" },
          { title: "Vị trí", dataIndex: "position" },
          {
            title: "Trạng thái",
            render: (_, record) => (
              <Switch
                checked={record.status === "active"}
                loading={statusMutation.isPending}
                onChange={(checked) => statusMutation.mutate({ id: record.id, status: checked ? "active" : "inactive" })}
              />
            ),
          },
          {
            title: "Thao tác",
            render: (_, record) => (
              <Space>
                <Button onClick={() => openEditModal(record)}>Sửa</Button>
                <Popconfirm
                  title="Xóa danh mục này?"
                  okText="Xóa"
                  cancelText="Hủy"
                  onConfirm={() => deleteMutation.mutate(record.id)}
                >
                  <Button danger loading={deleteMutation.isPending}>Xóa</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title="Chỉnh sửa danh mục"
        open={Boolean(editingCategory)}
        onCancel={() => setEditingCategory(null)}
        onOk={submitEdit}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={updateMutation.isPending}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="title" label="Tên danh mục" rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}><Input /></Form.Item>
          <Form.Item name="slug" label="Đường dẫn (Slug)" rules={[{ required: true, message: "Vui lòng nhập đường dẫn!" }]}><Input /></Form.Item>
          <Form.Item name="position" label="Vị trí" rules={[{ required: true, message: "Vui lòng nhập vị trí!" }]}><InputNumber className="w-full" /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
