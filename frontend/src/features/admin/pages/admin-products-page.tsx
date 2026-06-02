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
  Upload,
  Image,
} from "antd";
import { useMemo, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { useAdminProducts } from "../hooks/use-admin-products";
import type { AdminProductFormValues, AdminProductRow } from "../types/admin.types";

const { Title } = Typography;

export const AdminProductsPage = () => {
  const { query, categoriesQuery, createMutation, updateMutation, deleteMutation, statusMutation, contextHolder } =
    useAdminProducts();
  const [createForm] = Form.useForm<AdminProductFormValues>();
  const [editForm] = Form.useForm<AdminProductFormValues>();
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductRow | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [createPreviewImage, setCreatePreviewImage] = useState<string>("");

  const categoryOptions = useMemo(
    () => (categoriesQuery.data || []).map((item) => ({ value: item.id, label: item.title })),
    [categoriesQuery.data]
  );

  const handleImageChange = (info: any) => {
    if (info.file.status === "removed") {
      editForm.setFieldsValue({ thumbnail: "" });
      setPreviewImage("");
      return;
    }
    const file = info.file.originFileObj || info.file;
    if (file && file instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        editForm.setFieldsValue({ thumbnail: base64String });
        setPreviewImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateImageChange = (info: any) => {
    if (info.file.status === "removed") {
      createForm.setFieldsValue({ thumbnail: "" });
      setCreatePreviewImage("");
      return;
    }
    const file = info.file.originFileObj || info.file;
    if (file && file instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        createForm.setFieldsValue({ thumbnail: base64String });
        setCreatePreviewImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const openCreateModal = () => {
    setIsCreating(true);
    createForm.resetFields();
    setCreatePreviewImage("");
  };

  const submitCreate = async () => {
    const values = await createForm.validateFields();
    createMutation.mutate({ ...values, status: "active" });
    setIsCreating(false);
  };

  const openEditModal = (record: AdminProductRow) => {
    setEditingProduct(record);
    editForm.setFieldsValue({
      title: record.title,
      slug: record.slug,
      price: record.price,
      stock: record.stock,
      productCategoryId: record.productCategoryId,
      thumbnail: record.thumbnail,
      brand: record.brand,
      description: record.description,
      featured: record.featured,
    });
    setPreviewImage(record.thumbnail || "");
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
      <div className="mb-4 flex items-center justify-between">
        <Title level={3} className="!m-0">Quản lý sản phẩm</Title>
        <Button type="primary" onClick={openCreateModal} icon={<PlusOutlined />}>Thêm sản phẩm</Button>
      </div>

      <Table<AdminProductRow>
        loading={query.isPending}
        rowKey="id"
        dataSource={(query.data?.items || []) as AdminProductRow[]}
        columns={[
          { title: "Tên sản phẩm", dataIndex: "title" },
          { title: "Đường dẫn (Slug)", dataIndex: "slug" },
          { title: "Giá", dataIndex: "price", render: (val: number) => `${val?.toLocaleString()} ₫` },
          { title: "Kho hàng", dataIndex: "stock" },
          {
            title: "Nổi bật",
            dataIndex: "featured",
            render: (featured: boolean) => (
              <span className={featured ? "text-green-600 font-bold" : "text-gray-400"}>
                {featured ? "Có" : "Không"}
              </span>
            ),
          },
          {
            title: "Ảnh đại diện",
            render: (_, record) => (
              record.thumbnail ? (
                <Image src={record.thumbnail} width={50} alt="thumb" preview={false} />
              ) : (
                <span className="text-gray-400">Không có ảnh</span>
              )
            ),
          },
          {
            title: "Trạng thái",
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
            title: "Thao tác",
            render: (_, record) => (
              <Space>
                <Button onClick={() => openEditModal(record)}>Sửa</Button>
                <Popconfirm
                  title="Xóa sản phẩm này?"
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
        title="Thêm sản phẩm"
        open={isCreating}
        onCancel={() => {
          setIsCreating(false);
          setCreatePreviewImage("");
        }}
        onOk={submitCreate}
        okText="Thêm"
        cancelText="Hủy"
        confirmLoading={createMutation.isPending}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item name="title" label="Tên sản phẩm" rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}><Input /></Form.Item>
          <Form.Item name="slug" label="Đường dẫn (Slug)" rules={[{ required: true, message: "Vui lòng nhập đường dẫn!" }]}><Input /></Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true, message: "Vui lòng nhập giá sản phẩm!" }]}><InputNumber min={0} className="w-full" /></Form.Item>
          <Form.Item name="stock" label="Kho hàng" rules={[{ required: true, message: "Vui lòng nhập số lượng kho!" }]}><InputNumber min={0} className="w-full" /></Form.Item>
          <Form.Item name="brand" label="Thương hiệu"><Input placeholder="VD: Loreal, Olay, v.v." /></Form.Item>
          <Form.Item name="description" label="Mô tả sản phẩm"><Input.TextArea rows={4} placeholder="Mô tả chi tiết sản phẩm..." /></Form.Item>
          <Form.Item name="productCategoryId" label="Danh mục"><Select allowClear options={categoryOptions} placeholder="Chọn danh mục" /></Form.Item>
          <Form.Item name="featured" label="Sản phẩm nổi bật" valuePropName="checked"><Switch /></Form.Item>
          
          <Form.Item label="Ảnh đại diện">
            <Upload
              accept="image/*"
              maxCount={1}
              beforeUpload={() => false}
              onChange={handleCreateImageChange}
              onRemove={() => {
                createForm.setFieldsValue({ thumbnail: "" });
                setCreatePreviewImage("");
              }}
            >
              <Button icon={<PlusOutlined />}>Tải ảnh lên</Button>
            </Upload>
            {createPreviewImage && (
              <div className="mt-4">
                <Image src={createPreviewImage} width={100} alt="preview" />
              </div>
            )}
          </Form.Item>
          <Form.Item name="thumbnail" hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chỉnh sửa sản phẩm"
        open={Boolean(editingProduct)}
        onCancel={() => {
          setEditingProduct(null);
          setPreviewImage("");
        }}
        onOk={submitEdit}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={updateMutation.isPending}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="title" label="Tên sản phẩm" rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}><Input /></Form.Item>
          <Form.Item name="slug" label="Đường dẫn (Slug)" rules={[{ required: true, message: "Vui lòng nhập đường dẫn!" }]}><Input /></Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true, message: "Vui lòng nhập giá sản phẩm!" }]}><InputNumber min={0} className="w-full" /></Form.Item>
          <Form.Item name="stock" label="Kho hàng" rules={[{ required: true, message: "Vui lòng nhập số lượng kho!" }]}><InputNumber min={0} className="w-full" /></Form.Item>
          <Form.Item name="brand" label="Thương hiệu"><Input placeholder="VD: Loreal, Olay, v.v." /></Form.Item>
          <Form.Item name="description" label="Mô tả sản phẩm"><Input.TextArea rows={4} placeholder="Mô tả chi tiết sản phẩm..." /></Form.Item>
          <Form.Item name="productCategoryId" label="Danh mục"><Select allowClear options={categoryOptions} placeholder="Chọn danh mục" /></Form.Item>
          <Form.Item name="featured" label="Sản phẩm nổi bật" valuePropName="checked"><Switch /></Form.Item>
          
          <Form.Item label="Ảnh đại diện">
            <Upload
              accept="image/*"
              maxCount={1}
              beforeUpload={() => false}
              onChange={handleImageChange}
              onRemove={() => {
                editForm.setFieldsValue({ thumbnail: "" });
                setPreviewImage("");
              }}
            >
              <Button icon={<PlusOutlined />}>Tải ảnh lên</Button>
            </Upload>
            {previewImage && (
              <div className="mt-4">
                <Image src={previewImage} width={100} alt="preview" />
              </div>
            )}
          </Form.Item>
          <Form.Item name="thumbnail" hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
