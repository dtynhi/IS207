import { Button, Card, Empty, Form, Input, Modal, Typography } from "antd";
import { useState } from "react";
import { UserAddressRow } from "../components/user-address-row";
import { UserSidebar } from "../components/user-sidebar";
import { useUserAddress } from "../hooks/use-user-address";
import type { UserAddress, UserAddressCreateFormValues, UserAddressUpdatePayload } from "../types/user.types";

const { Text } = Typography;

export const UserAddressPage = () => {
  const { addresses, create, update, del, contextHolder } = useUserAddress();
  const [editForm] = Form.useForm<{ mainAddress: string }>();
  const [editing, setEditing] = useState<UserAddress | null>(null);

  const openEdit = (address: UserAddress) => {
    setEditing(address);
    editForm.setFieldsValue({ mainAddress: address.mainAddress });
  };

  const submitEdit = async () => {
    if (!editing) return;
    const values = await editForm.validateFields();
    const payload: UserAddressUpdatePayload = { mainAddress: values.mainAddress };
    update.mutate({ id: editing.idAddress, payload });
    setEditing(null);
  };

  return (
    <div className="animate-in flex items-start gap-5 pt-6 pb-6">
      {contextHolder}
      <UserSidebar />

      <Card className="flex-1" title="Địa chỉ của tôi" extra={<Text type="secondary" className="text-[13px]">Quản lý địa chỉ nhận hàng</Text>}>
        <Form layout="inline" onFinish={(values: UserAddressCreateFormValues) => create.mutate(values)} className="mb-5 gap-2">
          <Form.Item name="mainAddress" rules={[{ required: true, message: "Nhập địa chỉ" }]} className="flex-1">
            <Input placeholder="Nhập địa chỉ mới..." />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={create.isPending}>Thêm</Button>
        </Form>

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

      <Modal title="Sửa địa chỉ" open={Boolean(editing)} onCancel={() => setEditing(null)} onOk={submitEdit} confirmLoading={update.isPending} okText="Lưu">
        <Form form={editForm} layout="vertical">
          <Form.Item name="mainAddress" label="Địa chỉ" rules={[{ required: true, message: "Nhập địa chỉ" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
