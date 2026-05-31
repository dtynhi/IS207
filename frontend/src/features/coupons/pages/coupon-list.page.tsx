import { useEffect, useState } from "react";
import { Table, Button, Space, Input, Select, Modal, message, Tooltip, Tag } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { couponAPI, type Coupon, type VoucherComputedStatus } from "../api/coupon.api";
import AssignmentModal from "../components/assignment-modal";

const VOUCHER_STATUS_DISPLAY: Record<
  VoucherComputedStatus,
  { color: string; label: string }
> = {
  ACTIVE: { color: "green", label: "Active" },
  EXPIRED: { color: "orange", label: "Expired" },
  DISABLED: { color: "red", label: "Disabled" },
  OUT_OF_USAGE: { color: "default", label: "Hết lượt" },
};

export const CouponListPage = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [computedStatusFilter, setComputedStatusFilter] = useState<
    VoucherComputedStatus | undefined
  >();
  const [assignmentCouponId, setAssignmentCouponId] = useState<string | null>(null);
  const [assignmentVisible, setAssignmentVisible] = useState(false);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await couponAPI.list(
        pagination.current,
        pagination.pageSize,
        search,
        computedStatusFilter,
      );
      setCoupons(data.items);
      setPagination((prev) => ({ ...prev, total: data.meta.total }));
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [pagination.current, pagination.pageSize, search, computedStatusFilter]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn chắc chắn muốn xóa coupon này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await couponAPI.delete(id);
          message.success("Xóa coupon thành công");
          loadCoupons();
        } catch (error: any) {
          message.error(error.message);
        }
      },
    });
  };

  const columns = [
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 200,
      render: (text: string) => text || "-",
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: string) => (
        <Tag color={type === "percent" ? "blue" : "green"}>
          {type === "percent" ? "Phần trăm %" : "Tiền cứng"}
        </Tag>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      width: 100,
      render: (value: number, record: Coupon) => {
        return record.type === "percent" ? `${value}%` : `${value.toLocaleString()}đ`;
      },
    },
    {
      title: "Dùng / Tối đa",
      dataIndex: "usedCount",
      key: "usedCount",
      width: 120,
      render: (used: number, record: Coupon) => {
        const max = record.totalUsageLimit ?? "Không giới hạn";
        return `${used} / ${max}`;
      },
    },
    {
      title: "Hết hạn",
      dataIndex: "endsAt",
      key: "endsAt",
      width: 150,
      render: (date: string) => {
        if (!date) return "-";
        const d = new Date(date);
        return d.toLocaleDateString("vi-VN");
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "computedStatus",
      key: "computedStatus",
      width: 120,
      render: (_: unknown, record: Coupon) => {
        const key = record.computedStatus ?? "DISABLED";
        const { color, label } = VOUCHER_STATUS_DISPLAY[key] ?? VOUCHER_STATUS_DISPLAY.DISABLED;
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      render: (_: any, record: Coupon) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/coupons/edit/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Assignments">
            <Button type="text" size="small" onClick={() => { setAssignmentCouponId(record.id); setAssignmentVisible(true); }}>
              Assign
            </Button>
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Coupon</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/admin/coupons/create")}
        >
          Tạo Coupon
        </Button>
      </div>

      <div className="flex gap-4 bg-white p-4 rounded-lg">
        <Input
          placeholder="Tìm theo mã hoặc mô tả..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagination((prev) => ({ ...prev, current: 1 }));
          }}
          style={{ width: 300 }}
        />
        <Select
          placeholder="Lọc theo trạng thái"
          allowClear
          value={computedStatusFilter}
          onChange={(value) => {
            setComputedStatusFilter(value);
            setPagination((prev) => ({ ...prev, current: 1 }));
          }}
          options={[
            { label: "Active", value: "ACTIVE" },
            { label: "Expired", value: "EXPIRED" },
            { label: "Disabled", value: "DISABLED" },
            { label: "Hết lượt", value: "OUT_OF_USAGE" },
          ]}
          style={{ width: 200 }}
        />
      </div>

      <Table
        
        dataSource={coupons}
        columns={columns}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} coupon`,
        }}
        onChange={(pag) => {
          setPagination({
            current: pag.current || 1,
            pageSize: pag.pageSize || 20,
            total: pagination.total,
          });
        }}
        rowKey="id"
        className="bg-white rounded-lg"
      />

      <AssignmentModal visible={assignmentVisible} couponId={assignmentCouponId} onClose={() => setAssignmentVisible(false)} />
    </div>
  );
};
