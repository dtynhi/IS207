import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Table,
  Popconfirm,
  message,
  Typography,
  Select,
  Spin,
} from "antd";
import { couponAPI, type VoucherAssignmentRow } from "../api/coupon.api";
import { searchUsersForAdminApi, type UserSearchHit } from "../../user/api/user.api";

const { Text } = Typography;

const formatUserOption = (user: UserSearchHit) => {
  const phone = user.phone ? ` · ${user.phone}` : "";
  return `${user.fullName} (${user.email})${phone}`;
};

export const AssignmentModal = ({
  visible,
  couponId,
  onClose,
}: {
  visible: boolean;
  couponId: string | null;
  onClose: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<VoucherAssignmentRow[]>([]);
  const [form] = Form.useForm();
  const [userOptions, setUserOptions] = useState<UserSearchHit[]>([]);
  const [userSearching, setUserSearching] = useState(false);

  useEffect(() => {
    if (visible && couponId) {
      loadAssignments();
    } else {
      form.resetFields();
      setUserOptions([]);
    }
  }, [visible, couponId]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const data = await couponAPI.listAssignments(couponId!);
      setAssignments(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tải danh sách gán quyền";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSearch = async (value: string) => {
    const q = value.trim();
    if (q.length < 2) {
      setUserOptions([]);
      return;
    }
    setUserSearching(true);
    try {
      const users = await searchUsersForAdminApi(q);
      setUserOptions(users);
    } catch {
      setUserOptions([]);
    } finally {
      setUserSearching(false);
    }
  };

  const handleCreate = async (vals: {
    userId: string;
    allowedUses?: number;
    extraUses?: number;
    expiresAt?: { toISOString: () => string };
    note?: string;
  }) => {
    try {
      await couponAPI.createAssignment(couponId!, {
        userId: vals.userId,
        allowedUses: vals.allowedUses,
        extraUses: vals.extraUses,
        expiresAt: vals.expiresAt ? vals.expiresAt.toISOString() : undefined,
        note: vals.note,
      });
      message.success("Đã gán voucher cho user");
      form.resetFields();
      setUserOptions([]);
      loadAssignments();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        (err instanceof Error ? err.message : "Gán quyền thất bại");
      message.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await couponAPI.deleteAssignment(id);
      message.success("Đã xóa");
      loadAssignments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Xóa thất bại";
      message.error(msg);
    }
  };

  const columns = [
    {
      title: "Khách hàng",
      key: "user",
      render: (_: unknown, rec: VoucherAssignmentRow) => (
        <div>
          <div>{rec.user?.fullName || rec.user?.email || rec.userId}</div>
          {rec.user?.email && <Text type="secondary" className="text-xs">{rec.user.email}</Text>}
        </div>
      ),
    },
    { title: "Lượt cho phép", dataIndex: "allowedUses", key: "allowedUses", render: (v: number | null) => v ?? "—" },
    { title: "Lượt thêm", dataIndex: "extraUses", key: "extraUses", render: (v: number | null) => v ?? "—" },
    {
      title: "Hết hạn quyền",
      dataIndex: "expiresAt",
      key: "expiresAt",
      render: (d: string | null) => (d ? new Date(d).toLocaleString("vi-VN") : "—"),
    },
    { title: "Ghi chú", dataIndex: "note", key: "note", render: (v: string | null) => v || "—" },
    {
      title: "",
      key: "action",
      width: 72,
      render: (_: unknown, rec: VoucherAssignmentRow) => (
        <Popconfirm title="Xóa gán quyền?" onConfirm={() => handleDelete(rec.id)}>
          <Button type="link" danger size="small">
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={880}
      title="Gán voucher PRIVATE cho khách hàng"
      destroyOnClose
    >
      <Text type="secondary" className="block mb-4">
        Tìm khách theo email, số điện thoại hoặc tên — hệ thống lưu <strong>User ID</strong> (cuid) vào assignment.
        User ID cũng có sau khi khách đăng nhập (lưu trong trình duyệt, key <code>uni_user_id</code>).
      </Text>

      <Form form={form} layout="vertical" onFinish={handleCreate} className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Form.Item
            label="Khách hàng"
            name="userId"
            rules={[{ required: true, message: "Chọn khách hàng" }]}
            className="md:col-span-2"
          >
            <Select
              showSearch
              filterOption={false}
              placeholder="Gõ email, SĐT hoặc tên (ít nhất 2 ký tự)"
              onSearch={handleUserSearch}
              notFoundContent={userSearching ? <Spin size="small" /> : "Không tìm thấy"}
              options={userOptions.map((user) => ({
                value: user.id,
                label: formatUserOption(user),
              }))}
            />
          </Form.Item>
          <Form.Item label="Lượt cho phép (allowedUses)" name="allowedUses">
            <InputNumber min={1} className="w-full" placeholder="Để trống = dùng max/user trên coupon" />
          </Form.Item>
          <Form.Item label="Lượt thêm (extraUses)" name="extraUses">
            <InputNumber min={0} className="w-full" placeholder="Cộng thêm vào quota" />
          </Form.Item>
          <Form.Item label="Hết hạn quyền dùng" name="expiresAt">
            <DatePicker showTime className="w-full" />
          </Form.Item>
          <Form.Item label="Ghi chú" name="note" className="md:col-span-2">
            <Input placeholder="Tuỳ chọn" />
          </Form.Item>
        </div>
        <Button type="primary" htmlType="submit">
          Thêm
        </Button>
      </Form>

      <Table dataSource={assignments} columns={columns} rowKey="id" loading={loading} pagination={false} />
    </Modal>
  );
};

export default AssignmentModal;
