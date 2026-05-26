import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  List,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useMemo, useState } from "react";
import { useAdminOrders } from "../hooks/use-admin-orders";
import type { AdminOrderItemRow, AdminOrderRow, AdminOrderStatusLog } from "../types/admin.types";
import { getAdminId } from "../../../shared/session/storage";

const { Title, Text } = Typography;

const statusColor: Record<AdminOrderRow["status"], string> = {
  pending_confirm: "gold",
  ready_to_pick: "blue",
  ready_to_ship: "cyan",
  delivered: "green",
  awaiting_return: "orange",
  returned: "volcano",
  cancelled: "red",
  completed: "default",
};

const statusLabel: Record<AdminOrderRow["status"], string> = {
  pending_confirm: "Chờ xác nhận",
  ready_to_pick: "Chờ lấy hàng",
  ready_to_ship: "Chờ giao hàng",
  delivered: "Đã giao",
  awaiting_return: "Đợi hoàn hàng",
  returned: "Trả hàng",
  cancelled: "Đã hủy",
  completed: "Hoàn thành (nội bộ)",
};

const paymentColor: Record<AdminOrderRow["paymentStatus"], string> = {
  unpaid: "orange",
  paid: "green",
};

const paymentLabel: Record<AdminOrderRow["paymentStatus"], string> = {
  unpaid: "Chờ thanh toán",
  paid: "Đã thanh toán",
};

const getNextStatuses = (status: AdminOrderRow["status"]) => {
  if (status === "pending_confirm") return ["pending_confirm", "ready_to_pick", "cancelled"];
  if (status === "ready_to_pick") return ["ready_to_pick", "ready_to_ship", "cancelled"];
  if (status === "ready_to_ship") return ["ready_to_ship", "delivered", "cancelled"];
  if (status === "delivered") return ["delivered", "awaiting_return"];
  if (status === "awaiting_return") return ["awaiting_return"];
  return [status];
};

const toDisplayDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const calcItemTotal = (item: AdminOrderItemRow) => {
  const discountedPrice = item.price * (1 - item.discountPercentage / 100);
  return Math.round(discountedPrice * item.quantity);
};

export const AdminOrdersPage = () => {
  const adminId = getAdminId();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: undefined as AdminOrderRow["status"] | undefined,
    assignedTo: undefined as string | undefined,
    search: "",
  });
  const [detail, setDetail] = useState<AdminOrderRow | null>(null);
  const [statusForm] = Form.useForm<{ status: AdminOrderRow["status"]; reason?: string }>();
  const [reviewForm] = Form.useForm<{ reviewReason?: string }>();
  const [processForm] = Form.useForm<{ reason?: string }>();

  const {
    query,
    detailMutation,
    claimMutation,
    releaseMutation,
    statusMutation,
    reviewReturnMutation,
    processReturnMutation,
    contextHolder,
  } = useAdminOrders(filters);

  const tableData = useMemo(() => (query.data?.items || []) as AdminOrderRow[], [query.data]);

  const openDetail = async (record: AdminOrderRow) => {
    try {
      const data = (await detailMutation.mutateAsync(record.id)) as AdminOrderRow;
      setDetail(data);
      statusForm.setFieldsValue({ status: data.status, reason: "" });
      reviewForm.resetFields();
      processForm.resetFields();
    } catch {
      setDetail(null);
    }
  };

  const updateStatus = async () => {
    if (!detail) return;
    try {
      const values = await statusForm.validateFields();
      const updated = (await statusMutation.mutateAsync({
        id: detail.id,
        payload: {
          status: values.status,
          reason: values.reason?.trim() || undefined,
          lockVersion: detail.lockVersion,
        },
      })) as AdminOrderRow;
      setDetail(updated);
      statusForm.setFieldsValue({ status: updated.status, reason: "" });
    } catch {
      // handled by mutation or validation
    }
  };

  const reviewReturn = async (decision: "approved" | "rejected") => {
    if (!detail?.returnRequest) return;
    try {
      const values = await reviewForm.validateFields();
      await reviewReturnMutation.mutateAsync({
        id: detail.returnRequest.id,
        payload: {
          decision,
          reviewReason: values.reviewReason?.trim() || undefined,
          lockVersion: detail.lockVersion,
        },
      });
      const refreshed = (await detailMutation.mutateAsync(detail.id)) as AdminOrderRow;
      setDetail(refreshed);
    } catch {
      // handled by mutation or validation
    }
  };

  const processReturn = async (result: "approved" | "rejected") => {
    if (!detail) return;
    try {
      const values = await processForm.validateFields();
      await processReturnMutation.mutateAsync({
        id: detail.id,
        payload: {
          result,
          reason: values.reason?.trim() || undefined,
        },
      });
      const refreshed = (await detailMutation.mutateAsync(detail.id)) as AdminOrderRow;
      setDetail(refreshed);
    } catch {
      // handled by mutation or validation
    }
  };

  const handleClaim = async (id: string) => {
    try {
      const updated = (await claimMutation.mutateAsync(id)) as AdminOrderRow;
      if (detail?.id === id) {
        setDetail({ ...detail, ...updated });
      }
    } catch {
      // handled by mutation
    }
  };

  const handleRelease = async (id: string) => {
    try {
      const updated = (await releaseMutation.mutateAsync(id)) as AdminOrderRow;
      if (detail?.id === id) {
        setDetail({ ...detail, ...updated });
      }
    } catch {
      // handled by mutation
    }
  };

  const isAssignedToMe = detail?.assignedToAccount?.id && detail.assignedToAccount.id === adminId;
  const orderTotal = detail?.items?.reduce((sum, item) => sum + calcItemTotal(item), 0) || 0;

  return (
    <Card>
      {contextHolder}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Title level={3} className="!m-0">Quản lý đơn hàng</Title>
        <Space>
          <Input.Search
            allowClear
            placeholder="Tìm mã đơn / tên / SĐT"
            onSearch={(value) => setFilters((prev) => ({ ...prev, search: value, page: 1 }))}
          />
          <Select
            allowClear
            placeholder="Trạng thái"
            className="min-w-[140px]"
            value={filters.status}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value as AdminOrderRow["status"], page: 1 }))}
            options={[
              { value: "pending_confirm", label: "Chờ xác nhận" },
              { value: "ready_to_pick", label: "Chờ lấy hàng" },
              { value: "ready_to_ship", label: "Chờ giao hàng" },
              { value: "delivered", label: "Đã giao" },
              { value: "awaiting_return", label: "Đợi hoàn hàng" },
              { value: "returned", label: "Trả hàng" },
              { value: "cancelled", label: "Đã hủy" },
              { value: "completed", label: "Hoàn thành (nội bộ)" },
            ]}
          />
          <Select
            allowClear
            placeholder="Phân công"
            className="min-w-[160px]"
            value={filters.assignedTo}
            onChange={(value) => setFilters((prev) => ({ ...prev, assignedTo: value as string, page: 1 }))}
            options={[
              { value: "unassigned", label: "Chưa nhận" },
              ...(adminId ? [{ value: adminId, label: "Đơn của tôi" }] : []),
            ]}
          />
        </Space>
      </div>

      <Table<AdminOrderRow>
        rowKey="id"
        loading={query.isPending}
        dataSource={tableData}
        pagination={{
          current: query.data?.meta?.page,
          pageSize: query.data?.meta?.limit,
          total: query.data?.meta?.totalItems,
          onChange: (page) => setFilters((prev) => ({ ...prev, page })),
          showSizeChanger: false,
        }}
        columns={[
          { title: "Mã đơn", dataIndex: "id", width: 180 },
          { title: "Khách hàng", dataIndex: "fullName" },
          { title: "SĐT", dataIndex: "phone", width: 140 },
          {
            title: "Trạng thái",
            render: (_, record) => (
              <Space>
                <Tag color={paymentColor[record.paymentStatus]}>{paymentLabel[record.paymentStatus]}</Tag>
                <Tag color={statusColor[record.status]}>{statusLabel[record.status]}</Tag>
              </Space>
            ),
          },
          {
            title: "Phụ trách",
            render: (_, record) => (
              record.assignedToAccount?.fullName ? record.assignedToAccount.fullName : <Text type="secondary">Chưa nhận</Text>
            ),
          },
          { title: "Tạo lúc", dataIndex: "createdAt", render: (value) => toDisplayDate(value), width: 170 },
          {
            title: "Thao tác",
            render: (_, record) => {
              const assignedId = record.assignedToAccount?.id;
              const canClaim = !assignedId;
              const canRelease = assignedId === adminId;
              return (
                <Space>
                  <Button onClick={() => openDetail(record)}>Chi tiết</Button>
                  {canClaim && (
                    <Button type="primary" onClick={() => handleClaim(record.id)} loading={claimMutation.isPending}>
                      Nhận xử lý
                    </Button>
                  )}
                  {canRelease && (
                    <Button onClick={() => handleRelease(record.id)} loading={releaseMutation.isPending}>
                      Bỏ nhận
                    </Button>
                  )}
                </Space>
              );
            },
          },
        ]}
      />

      <Modal
        title="Chi tiết đơn hàng"
        open={!!detail}
        onCancel={() => setDetail(null)}
        onOk={updateStatus}
        okText="Cập nhật trạng thái"
        okButtonProps={{ disabled: !isAssignedToMe || !detail }}
        confirmLoading={statusMutation.isPending}
        width={900}
      >
        {detail && (
          <>
            <Space direction="vertical" className="w-full" size="small">
              <Text><strong>Mã đơn:</strong> {detail.id}</Text>
              <Text><strong>Khách hàng:</strong> {detail.fullName} · {detail.phone}</Text>
              <Text><strong>Địa chỉ:</strong> {detail.address}</Text>
              <Text>
                <strong>Trạng thái:</strong>{" "}
                <Space>
                  <Tag color={paymentColor[detail.paymentStatus]}>{paymentLabel[detail.paymentStatus]}</Tag>
                  <Tag color={statusColor[detail.status]}>{statusLabel[detail.status]}</Tag>
                </Space>
              </Text>
              <Text><strong>Phụ trách:</strong> {detail.assignedToAccount?.fullName || "Chưa nhận"}</Text>
              <Text><strong>Ngày tạo:</strong> {toDisplayDate(detail.createdAt)}</Text>
            </Space>

            <Divider />

            <Title level={5}>Sản phẩm</Title>
            <Table<AdminOrderItemRow>
              rowKey="id"
              pagination={false}
              dataSource={detail.items}
              size="small"
              columns={[
                { title: "Sản phẩm", dataIndex: ["product", "title"], render: (_, record) => record.product?.title || "N/A" },
                { title: "Số lượng", dataIndex: "quantity", width: 100 },
                { title: "Giá", dataIndex: "price", width: 140 },
                { title: "Giảm %", dataIndex: "discountPercentage", width: 100 },
                {
                  title: "Thành tiền",
                  render: (_, record) => calcItemTotal(record),
                  width: 140,
                },
              ]}
            />
            <div className="mt-2 text-right">
              <Text strong>Tổng cộng: {orderTotal}</Text>
            </div>

            <Divider />

            {detail.returnRequest && (
              <>
                <Title level={5}>Yêu cầu hoàn hàng</Title>
                <Space direction="vertical" className="w-full" size="small">
                  <Text><strong>Lý do:</strong> {detail.returnRequest.reason}</Text>
                  {detail.returnRequest.description && <Text><strong>Mô tả:</strong> {detail.returnRequest.description}</Text>}
                  {Array.isArray(detail.returnRequest.mediaUrls) && detail.returnRequest.mediaUrls.length ? (
                    <Text><strong>Minh chứng:</strong> {detail.returnRequest.mediaUrls.join(", ")}</Text>
                  ) : null}
                  {detail.returnRequest.reviewReason && (
                    <Text><strong>Ghi chú duyệt:</strong> {detail.returnRequest.reviewReason}</Text>
                  )}
                  <Text><strong>Trạng thái yêu cầu:</strong> {detail.returnRequest.status}</Text>
                </Space>

                {detail.returnRequest.status === "pending" && (
                  <Form form={reviewForm} layout="vertical" className="mt-3">
                    <Form.Item name="reviewReason" label="Ghi chú duyệt (tuỳ chọn)">
                      <Input.TextArea rows={2} disabled={!isAssignedToMe} />
                    </Form.Item>
                    <Space>
                      <Button
                        type="primary"
                        onClick={() => reviewReturn("approved")}
                        disabled={!isAssignedToMe}
                        loading={reviewReturnMutation.isPending}
                      >
                        Duyệt hoàn hàng
                      </Button>
                      <Button
                        danger
                        onClick={() => reviewReturn("rejected")}
                        disabled={!isAssignedToMe}
                        loading={reviewReturnMutation.isPending}
                      >
                        Từ chối
                      </Button>
                    </Space>
                  </Form>
                )}

                <Divider />
              </>
            )}

            {detail.status === "awaiting_return" && (
              <>
                <Title level={5}>Xử lý hàng hoàn về</Title>
                <Form form={processForm} layout="vertical">
                  <Form.Item name="reason" label="Ghi chú kiểm tra (tuỳ chọn)">
                    <Input.TextArea rows={2} disabled={!isAssignedToMe} />
                  </Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      onClick={() => processReturn("approved")}
                      disabled={!isAssignedToMe}
                      loading={processReturnMutation.isPending}
                    >
                      Hàng OK → nhập kho & hoàn tiền
                    </Button>
                    <Button
                      danger
                      onClick={() => processReturn("rejected")}
                      disabled={!isAssignedToMe}
                      loading={processReturnMutation.isPending}
                    >
                      Hàng lỗi → hoàn tiền
                    </Button>
                  </Space>
                </Form>
                <Divider />
              </>
            )}

            <Title level={5}>Cập nhật trạng thái</Title>
            <Form form={statusForm} layout="vertical">
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true }]}
              >
                <Select
                  disabled={!isAssignedToMe}
                  options={getNextStatuses(detail.status).map((value) => ({
                    value,
                    label: statusLabel[value as AdminOrderRow["status"]],
                  }))}
                />
              </Form.Item>
              <Form.Item name="reason" label="Ghi chú (tuỳ chọn)">
                <Input.TextArea rows={3} disabled={!isAssignedToMe} />
              </Form.Item>
            </Form>

            <Divider />

            <Title level={5}>Lịch sử trạng thái</Title>
            <List<AdminOrderStatusLog>
              dataSource={detail.statusLogs || []}
              locale={{ emptyText: "Chưa có lịch sử" }}
              renderItem={(log) => (
                <List.Item>
                  <Space direction="vertical" size={0}>
                    <Text>
                      {log.fromStatus ? statusLabel[log.fromStatus] : "Khởi tạo"} → {statusLabel[log.toStatus]}
                    </Text>
                    <Text type="secondary">
                      {toDisplayDate(log.createdAt)}
                      {log.changedByAccount?.fullName ? ` · ${log.changedByAccount.fullName}` : ""}
                    </Text>
                    {log.reason && <Text type="secondary">Lý do: {log.reason}</Text>}
                  </Space>
                </List.Item>
              )}
            />
          </>
        )}
      </Modal>
    </Card>
  );
};
