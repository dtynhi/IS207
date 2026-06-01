import { useEffect, useState } from "react";
import { Table, Button, Space, Input, Select, Modal, message, Tooltip, Tag } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { couponAPI, type Coupon, type VoucherComputedStatus, type VoucherMode } from "../api/coupon.api";

const VOUCHER_STATUS_DISPLAY: Record<
  VoucherComputedStatus,
  { color: string; label: string }
> = {
  ACTIVE: { color: "green", label: "Đang hoạt động" },
  EXPIRED: { color: "orange", label: "Hết hạn" },
  DISABLED: { color: "red", label: "Đã vô hiệu hóa" },
  OUT_OF_USAGE: { color: "default", label: "Hết lượt sử dụng" },
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

  const MODE_LABELS: Record<VoucherMode, string> = {
    PUBLIC: "Công khai",
    PRIVATE: "Riêng tư",
  };

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
          {type === "percent" ? "Giảm theo phần trăm" : "Giảm số tiền cố định"}
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
      title: "Lượt dùng / Giới hạn",
      dataIndex: "usedCount",
      key: "usedCount",
      width: 120,
      render: (used: number, record: Coupon) => {
        const max = record.totalUsageLimit ?? "Không giới hạn";
        return `${used} / ${max}`;
      },
    },
    {
      title: "Chế độ",
      dataIndex: "mode",
      key: "mode",
      width: 130,
      render: (mode: VoucherMode | undefined) => MODE_LABELS[mode ?? "PUBLIC"] ?? mode,
    },
    {
      title: "Đối tượng áp dụng",
      key: "targetAudience",
      width: 150,
      render: (_: unknown, record: Coupon) => {
        if (record.mode === "PUBLIC") {
          return <span>Tất cả khách hàng</span>;
        }
        // For PRIVATE mode, we would need to load assignments count
        // For now, just show the mode label
        return <span>Khách hàng được chỉ định</span>;
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
        return d.toLocaleString("vi-VN");
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
        <h1 className="text-2xl font-bold">Quản lý mã giảm giá</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/admin/coupons/create")}
        >
          Tạo mã giảm giá
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
            { label: "Đang hoạt động", value: "ACTIVE" },
            { label: "Hết hạn", value: "EXPIRED" },
            { label: "Đã vô hiệu hóa", value: "DISABLED" },
            { label: "Hết lượt sử dụng", value: "OUT_OF_USAGE" },
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
          showTotal: (total) => `Tổng ${total} mã giảm giá`,
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

    </div>
  );
};
