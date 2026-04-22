import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Typography,
} from "antd";
import { useMemo, useState } from "react";
import { useAdminProducts } from "../hooks/use-admin-products";
import type { AdminProductFormValues, AdminProductRow } from "../types/admin.types";

const { Title } = Typography;

export const AdminProductsPage = () => {
  const { query, categoriesQuery, createMutation, updateMutation, deleteMutation, statusMutation, contextHolder } =
    useAdminProducts();
  const [editForm] = Form.useForm<AdminProductFormValues>();
  const [editingProduct, setEditingProduct] = useState<AdminProductRow | null>(null);

  const categoryOptions = useMemo(
    () => (categoriesQuery.data || []).map((item) => ({ value: item.id, label: item.title })),
    [categoriesQuery.data]
  );

  const openEditModal = (record: AdminProductRow) => {
    setEditingProduct(record);
    editForm.setFieldsValue({
      title: record.title,
      slug: record.slug,
      price: record.price,
      stock: record.stock,
      productCategoryId: record.productCategoryId,
    });
  };

  const submitEdit = async () => {
    if (!editingProduct) return;
    const values = await editForm.validateFields();
    updateMutation.mutate({ id: editingProduct.id, payload: values });
    setEditingProduct(null);
  };

  return (
    <Card>
      {contextHolder}
      <Title level={3}>Products Management</Title>

      <Form
        layout="inline"
        className="mb-4"
        onFinish={(values: AdminProductFormValues) => createMutation.mutate({ ...values, status: "active" })}
      >
        <Form.Item name="title" rules={[{ required: true }]}><Input placeholder="Title" /></Form.Item>
        <Form.Item name="slug" rules={[{ required: true }]}><Input placeholder="Slug" /></Form.Item>
        <Form.Item name="price" initialValue={10000}><InputNumber min={0} placeholder="Price" /></Form.Item>
        <Form.Item name="stock" initialValue={1}><InputNumber min={0} placeholder="Stock" /></Form.Item>
        <Form.Item name="productCategoryId"><Select className="w-[180px]" allowClear placeholder="Category" options={categoryOptions} /></Form.Item>
        <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Create</Button>
      </Form>

      <Table<AdminProductRow>
        loading={query.isPending}
        rowKey="id"
        dataSource={(query.data?.items || []) as AdminProductRow[]}
        columns={[
          { title: "Title", dataIndex: "title" },
          { title: "Slug", dataIndex: "slug" },
          { title: "Price", dataIndex: "price" },
          { title: "Stock", dataIndex: "stock" },
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
                <Popconfirm title="Delete product?" onConfirm={() => deleteMutation.mutate(record.id)}>
                  <Button danger loading={deleteMutation.isPending}>Delete</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title="Edit Product"
        open={Boolean(editingProduct)}
        onCancel={() => setEditingProduct(null)}
        onOk={submitEdit}
        okText="Save"
        confirmLoading={updateMutation.isPending}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}><InputNumber min={0} className="w-full" /></Form.Item>
          <Form.Item name="stock" label="Stock" rules={[{ required: true }]}><InputNumber min={0} className="w-full" /></Form.Item>
          <Form.Item name="productCategoryId" label="Category"><Select allowClear options={categoryOptions} /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
