import { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, DatePicker, Button, Table, Popconfirm, message } from "antd";
import { couponAPI } from "../api/coupon.api";

export const AssignmentModal = ({ visible, couponId, onClose }: { visible: boolean; couponId: string | null; onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && couponId) loadAssignments();
  }, [visible, couponId]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const data = await couponAPI.listAssignments(couponId!);
      setAssignments(data);
    } catch (err: any) {
      message.error(err.message || "Không thể tải assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (vals: any) => {
    try {
      await couponAPI.createAssignment(couponId!, {
        userId: vals.userId,
        allowedUses: vals.allowedUses,
        extraUses: vals.extraUses,
        expiresAt: vals.expiresAt ? vals.expiresAt.toISOString() : undefined,
        note: vals.note,
      });
      message.success("Assignment đã được tạo");
      form.resetFields();
      loadAssignments();
    } catch (err: any) {
      message.error(err.message || "Tạo thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await couponAPI.deleteAssignment(id);
      message.success("Đã xóa");
      loadAssignments();
    } catch (err: any) {
      message.error(err.message || "Xóa thất bại");
    }
  };

  const columns = [
    { title: "User ID", dataIndex: "userId", key: "userId" },
    { title: "Allowed", dataIndex: "allowedUses", key: "allowedUses" },
    { title: "Extra", dataIndex: "extraUses", key: "extraUses" },
    { title: "ExpiresAt", dataIndex: "expiresAt", key: "expiresAt", render: (d: string) => d ? new Date(d).toLocaleString() : "-" },
    { title: "Note", dataIndex: "note", key: "note" },
    { title: "Action", key: "action", render: (_: any, rec: any) => (
      <Popconfirm title="Xóa?" onConfirm={() => handleDelete(rec.id)}>
        <a>Delete</a>
      </Popconfirm>
    )},
  ];

  return (
    <Modal visible={visible} onCancel={onClose} footer={null} width={800} title={`Assignments cho coupon ${couponId}`}>
      <div style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline" onFinish={handleCreate}>
          <Form.Item name="userId" rules={[{ required: true }]}>
            <Input placeholder="User ID" />
          </Form.Item>
          <Form.Item name="allowedUses">
            <InputNumber placeholder="Allowed" />
          </Form.Item>
          <Form.Item name="extraUses">
            <InputNumber placeholder="Extra" />
          </Form.Item>
          <Form.Item name="expiresAt">
            <DatePicker showTime />
          </Form.Item>
          <Form.Item name="note">
            <Input placeholder="Note" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Thêm</Button>
          </Form.Item>
        </Form>
      </div>

      <Table dataSource={assignments} columns={columns} rowKey="id" loading={loading} />
    </Modal>
  );
};

export default AssignmentModal;
