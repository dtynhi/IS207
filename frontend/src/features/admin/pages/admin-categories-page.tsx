import {
  Alert,
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

const STARTER_CATEGORIES = [
  "Điện thoại",
  "Laptop",
  "Thời trang",
  "Sách vở",
  "Phụ kiện",
  "Đồ ăn",
  "Mỹ phẩm",
  "Gia dụng",
  "Thể thao",
  "Xe cộ",
];

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
  const [isSeeding, setIsSeeding] = useState(false);

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

  const seedStarterCategories = async () => {
    const existing = new Set(((query.data?.items || []) as AdminCategoryRow[]).map((item) => item.title.trim().toLowerCase()));
    const toCreate = STARTER_CATEGORIES.filter((title) => !existing.has(title.toLowerCase()));
    if (toCreate.length === 0) return;

    setIsSeeding(true);
    try {
      for (let index = 0; index < toCreate.length; index += 1) {
        const title = toCreate[index];
        await createMutation.mutateAsync({
          title,
          slug: toSlug(title),
          position: index + 1,
          status: "active",
        });
      }
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card>
      {contextHolder}
      <Title level={3}>Categories Management</Title>
      <Alert
        type="info"
        showIcon
        className="mb-4"
        message="Danh mục ở trang client lấy trực tiếp từ đây. Bạn có thể tạo mới hoặc bấm 'Add Starter Categories' để thêm bộ danh mục mẫu."
      />
      <Form
        form={createForm}
        layout="inline"
        className="mb-4"
        onFinish={(values: AdminCategoryFormValues) => createMutation.mutate({ ...values, status: "active" })}
      >
        <Form.Item
          name="title"
          rules={[{ required: true }]}
        >
          <Input
            placeholder="Title"
            onChange={(event) => {
              const title = event.target.value || "";
              createForm.setFieldValue("slug", toSlug(title));
            }}
          />
        </Form.Item>
        <Form.Item name="slug" rules={[{ required: true }]}><Input placeholder="Slug" /></Form.Item>
        <Form.Item name="position" initialValue={0}><InputNumber placeholder="Position" /></Form.Item>
        <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Create</Button>
        <Button onClick={seedStarterCategories} loading={isSeeding}>Add Starter Categories</Button>
      </Form>

      <Table<AdminCategoryRow>
        loading={query.isPending}
        rowKey="id"
        dataSource={(query.data?.items || []) as AdminCategoryRow[]}
        columns={[
          { title: "Title", dataIndex: "title" },
          { title: "Slug", dataIndex: "slug" },
          { title: "Position", dataIndex: "position" },
          {
            title: "Status",
            render: (_, record) => (
              <Switch
                checked={record.status === "active"}
                loading={statusMutation.isPending}
                onChange={(checked) => statusMutation.mutate({ id: record.id, status: checked ? "active" : "inactive" })}
              />
            ),
          },
          {
            title: "Actions",
            render: (_, record) => (
              <Space>
                <Button onClick={() => openEditModal(record)}>Edit</Button>
                <Popconfirm title="Delete category?" onConfirm={() => deleteMutation.mutate(record.id)}>
                  <Button danger loading={deleteMutation.isPending}>Delete</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title="Edit Category"
        open={Boolean(editingCategory)}
        onCancel={() => setEditingCategory(null)}
        onOk={submitEdit}
        okText="Save"
        confirmLoading={updateMutation.isPending}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="position" label="Position" rules={[{ required: true }]}><InputNumber className="w-full" /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
