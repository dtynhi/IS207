import { useQuery } from "@tanstack/react-query";
import { Button, Card, Empty, Form, Input, Modal, Typography, Row, Col, Select } from "antd";
import { useState } from "react";
import { UserAddressRow } from "../components/user-address-row";
import { UserSidebar } from "../components/user-sidebar";
import { useUserAddress } from "../hooks/use-user-address";
import type { UserAddress, UserAddressCreateFormValues, UserAddressUpdatePayload } from "../types/user.types";

const { Text } = Typography;
const VN_ADDRESS_API = "https://provinces.open-api.vn/api";

type Province = { code: number; name: string };
type ProvinceDetail = {
  districts: Array<{
    wards: Array<{ code: number; name: string }>;
  }>;
};

export const UserAddressPage = () => {
  const { addresses, create, update, del, contextHolder } = useUserAddress();
  const [form] = Form.useForm<UserAddressCreateFormValues>();
  const [editForm] = Form.useForm<UserAddressCreateFormValues>();
  const [editing, setEditing] = useState<UserAddress | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Load provinces
  const provincesQuery = useQuery({
    queryKey: ["vn-address-provinces"],
    queryFn: async (): Promise<Province[]> => {
      const response = await fetch(`${VN_ADDRESS_API}/?depth=1`);
      if (!response.ok) {
        throw new Error("Không tải được danh sách tỉnh/thành");
      }
      return response.json();
    },
  });

  const selectedProvinceNameCreate = Form.useWatch("province", form);
  const selectedProvinceNameEdit = Form.useWatch("province", editForm);

  const selectedProvinceCreate = provincesQuery.data?.find((province) => province.name === selectedProvinceNameCreate);
  const selectedProvinceEdit = provincesQuery.data?.find((province) => province.name === selectedProvinceNameEdit);

  // Load wards for create form
  const wardsQueryCreate = useQuery({
    queryKey: ["vn-address-wards", selectedProvinceCreate?.code],
    queryFn: async (): Promise<ProvinceDetail> => {
      const response = await fetch(`${VN_ADDRESS_API}/p/${selectedProvinceCreate?.code}?depth=3`);
      if (!response.ok) {
        throw new Error("Không tải được danh sách phường/xã");
      }
      return response.json();
    },
    enabled: Boolean(selectedProvinceCreate?.code),
  });

  // Load wards for edit form
  const wardsQueryEdit = useQuery({
    queryKey: ["vn-address-wards-edit", selectedProvinceEdit?.code],
    queryFn: async (): Promise<ProvinceDetail> => {
      const response = await fetch(`${VN_ADDRESS_API}/p/${selectedProvinceEdit?.code}?depth=3`);
      if (!response.ok) {
        throw new Error("Không tải được danh sách phường/xã");
      }
      return response.json();
    },
    enabled: Boolean(selectedProvinceEdit?.code),
  });

  const provinceOptions = (provincesQuery.data || []).map((province) => ({
    value: province.name,
    label: province.name,
  }));

  const wardOptionsCreate = (wardsQueryCreate.data?.districts || [])
    .flatMap((district) => district.wards || [])
    .map((ward) => ({
      value: ward.name,
      label: ward.name,
    }));

  const wardOptionsEdit = (wardsQueryEdit.data?.districts || [])
    .flatMap((district) => district.wards || [])
    .map((ward) => ({
      value: ward.name,
      label: ward.name,
    }));

  const openEdit = (address: UserAddress) => {
    setEditing(address);
    editForm.setFieldsValue({
      fullName: address.fullName,
      phone: address.phone,
      province: address.province,
      ward: address.ward,
      addressLine: address.addressLine,
    });
  };

  const submitEdit = async () => {
    if (!editing) return;
    const values = await editForm.validateFields();
    const payload: UserAddressUpdatePayload = {
      fullName: values.fullName,
      phone: values.phone,
      province: values.province,
      ward: values.ward,
      addressLine: values.addressLine,
    };
    update.mutate({ id: editing.idAddress, payload });
    setEditing(null);
  };

  const handleAddressSubmit = async (values: UserAddressCreateFormValues) => {
    create.mutate(values);
    form.resetFields();
    setIsModalVisible(false);
  };

  return (
    <div className="animate-in flex items-start gap-5 pt-6 pb-6">
      {contextHolder}
      <UserSidebar />

      <Card className="flex-1" title="Địa chỉ của tôi" extra={<Text type="secondary" className="text-[13px]">Quản lý địa chỉ nhận hàng</Text>}>
        <Button type="primary" className="mb-4" onClick={() => setIsModalVisible(true)}>Thêm địa chỉ mới</Button>

        {(addresses.data || []).map((address) => (
          <UserAddressRow
            key={address.idAddress}
            address={address}
            onEdit={openEdit}
            onToggleDefault={(id, value) => update.mutate({ id, payload: { isDefault: value } })}
            onDelete={(id) => del.mutate(id)}
          />
        ))}

        {(addresses.data || []).length === 0 && <Empty description="Chưa có địa chỉ" />}
      </Card>

      {/* Add new address modal */}
      <Modal 
        title="Thêm địa chỉ mới" 
        open={isModalVisible} 
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }} 
        onOk={() => form.submit()}
        confirmLoading={create.isPending}
        okText="Thêm"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddressSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: "Nhập họ tên" }]}>
                <Input placeholder="Họ tên người nhận" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="phone" label="SĐT" rules={[{ required: true, message: "Nhập SĐT" }]}>
                <Input placeholder="Số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="province" label="Tỉnh / Thành" rules={[{ required: true, message: "Chọn tỉnh/thành" }]}>
                <Select
                  placeholder="Chọn tỉnh/thành"
                  options={provinceOptions}
                  loading={provincesQuery.isLoading}
                  onChange={() => form.setFieldValue("ward", undefined)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="ward" label="Phường / Xã" rules={[{ required: true, message: "Chọn phường/xã" }]}>
                <Select
                  placeholder={selectedProvinceNameCreate ? "Chọn phường/xã" : "Chọn tỉnh/thành trước"}
                  options={wardOptionsCreate}
                  loading={wardsQueryCreate.isLoading}
                  disabled={!selectedProvinceNameCreate}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="addressLine" label="Tên đường, Tòa nhà, Số nhà" rules={[{ required: true, message: "Nhập địa chỉ chi tiết" }]}>
            <Input placeholder="Ví dụ: Số 10, Tòa A, Nguyễn Trãi" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit address modal */}
      <Modal 
        title="Sửa địa chỉ" 
        open={Boolean(editing)} 
        onCancel={() => setEditing(null)} 
        onOk={submitEdit} 
        confirmLoading={update.isPending} 
        okText="Lưu"
      >
        <Form form={editForm} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: "Nhập họ tên" }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="phone" label="SĐT" rules={[{ required: true, message: "Nhập SĐT" }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="province" label="Tỉnh / Thành" rules={[{ required: true, message: "Chọn tỉnh/thành" }]}>
                <Select
                  placeholder="Chọn tỉnh/thành"
                  options={provinceOptions}
                  loading={provincesQuery.isLoading}
                  onChange={() => editForm.setFieldValue("ward", undefined)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="ward" label="Phường / Xã" rules={[{ required: true, message: "Chọn phường/xã" }]}>
                <Select
                  placeholder={selectedProvinceNameEdit ? "Chọn phường/xã" : "Chọn tỉnh/thành trước"}
                  options={wardOptionsEdit}
                  loading={wardsQueryEdit.isLoading}
                  disabled={!selectedProvinceNameEdit}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="addressLine" label="Tên đường, Tòa nhà, Số nhà" rules={[{ required: true, message: "Nhập địa chỉ chi tiết" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
