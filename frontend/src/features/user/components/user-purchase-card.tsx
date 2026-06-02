import { InboxOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Form, Image, Input, List, Modal, Popconfirm, Tag, Typography } from "antd";
import { useState } from "react";
import { ImageUpload } from "../../../shared/components/image-upload";
import { Price } from "../../../shared/components/price";
import { purchasePaymentStatusMap, purchaseProcessStatusMap } from "../constants/purchase-status";
import type { UserPurchase } from "../types/user.types";

const { Text } = Typography;

type UserPurchaseCardProps = {
  order: UserPurchase;
  onCancel?: () => void;
  isCancelling?: boolean;
  onRequestReturn?: (payload: { reason: string; description?: string; mediaUrls?: string[] }) => void;
  isRequestingReturn?: boolean;
};

export const UserPurchaseCard = ({
  order,
  onCancel,
  isCancelling,
  onRequestReturn,
  isRequestingReturn,
}: UserPurchaseCardProps) => {
  const [returnOpen, setReturnOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [returnForm] = Form.useForm<{ reason: string; description?: string; mediaUrls?: string[] }>();
  const processStatus = purchaseProcessStatusMap[order.status] || { color: "default", label: order.status };
  const paymentStatus = order.paymentStatus
    ? purchasePaymentStatusMap[order.paymentStatus] || { color: "default", label: order.paymentStatus }
    : null;
  const derivedTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity * (1 - item.discountPercentage / 100), 0);
  const originalTotal = order.originalAmount ?? derivedTotal;
  const finalTotal = order.finalAmount ?? derivedTotal;
  const discountValue = order.discountAmount ?? Math.max(originalTotal - finalTotal, 0);
  const canCancel = order.status === "pending_confirm";
  const hasReturnRequest = Boolean(order.returnRequest);
  const RETURN_WINDOW_MS = 20 * 60 * 1000;
  const isReturnWindowOpen =
    order.deliveredAt != null &&
    Date.now() < new Date(order.deliveredAt).getTime() + RETURN_WINDOW_MS;
  const canRequestReturn = order.status === "delivered" && !hasReturnRequest && isReturnWindowOpen;

  const submitReturn = async () => {
    if (!onRequestReturn) return;
    if (isUploading) return;
    const values = await returnForm.validateFields();
    const mediaUrls =
      Array.isArray(values.mediaUrls) && values.mediaUrls.length > 0 ? values.mediaUrls : undefined;
    onRequestReturn({ reason: values.reason, description: values.description, mediaUrls });
    returnForm.resetFields();
    setReturnOpen(false);
  };

  const getReturnRequestBadge = () => {
    if (!order.returnRequest) return null;
    const statusMap: Record<string, { color: string; label: string }> = {
      pending: { color: "warning", label: "Chờ duyệt" },
      approved: { color: "success", label: "Đã duyệt hoàn hàng" },
      rejected: { color: "error", label: "Bị từ chối" },
    };
    const status = statusMap[order.returnRequest.status];
    return status ? <Tag color={status.color}>{status.label}</Tag> : null;
  };
  const returnRequestBadge = hasReturnRequest ? getReturnRequestBadge() : null;

  return (
    <Card className="mb-3" styles={{ body: { padding: 0 } }}>
      <Flex justify="space-between" className="border-b border-[var(--border-light)] px-5 py-2.5">
        <Text type="secondary" className="text-[13px]">#{order.id.slice(0, 8).toUpperCase()}</Text>
        <Flex align="center" gap={8}>
          {paymentStatus && <Tag color={paymentStatus.color}>{paymentStatus.label}</Tag>}
          <Tag color={processStatus.color}>{processStatus.label}</Tag>
        </Flex>
      </Flex>

      <List
        split
        dataSource={order.items}
        renderItem={(item) => (
          <List.Item className="!px-5 !py-2.5">
            <Flex align="center" justify="space-between" className="w-full" gap={12}>
              <Flex align="center" gap={10} className="min-w-0 flex-1">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-xl overflow-hidden">
                  {item.product?.thumbnail ? (
                    <Image src={item.product.thumbnail} alt={item.product.title} preview={false} className="h-full w-full object-cover" />
                  ) : (
                    <InboxOutlined />
                  )}
                </div>
                <Text ellipsis>{item.product?.title || "Sản phẩm"}</Text>
              </Flex>
              <Text type="secondary">x{item.quantity}</Text>
              <Price value={Math.floor(item.price * (1 - item.discountPercentage / 100) * item.quantity)} />
            </Flex>
          </List.Item>
        )}
      />

      {order.cancellationReason && order.status === "cancelled" && (
        <div className="px-5 py-2 text-[13px] text-[var(--text-muted)]">
          Lý do hủy: <Text type="secondary">{order.cancellationReason}</Text>
        </div>
      )}

      {order.couponCode && order.discountAmount && order.discountAmount > 0 && (
        <div className="px-5 py-2 flex items-center justify-between gap-4 border-b border-[var(--border-light)]">
          <Text type="secondary">
            Áp dụng mã <Text strong>{order.couponCode}</Text>
          </Text>
          <Text type="secondary">Giảm <Price value={order.discountAmount} /></Text>
        </div>
      )}

      <Flex justify="space-between" align="center" className="bg-[var(--primary-soft)] px-5 py-3">
        <Flex align="center" gap={8}>
          {canCancel && (
            <Popconfirm
              title="Hủy đơn hàng"
              description="Bạn có chắc muốn hủy đơn hàng này không?"
              okText="Xác nhận hủy"
              cancelText="Không"
              okButtonProps={{ danger: true }}
              onConfirm={onCancel}
            >
              <Button size="small" danger loading={isCancelling}>
                Hủy đơn
              </Button>
            </Popconfirm>
          )}
          {returnRequestBadge}
          {canRequestReturn && (
            <Button size="small" onClick={() => setReturnOpen(true)} loading={isRequestingReturn}>
              Yêu cầu hoàn hàng
            </Button>
          )}
        </Flex>
        <Flex align="center" gap={8}>
          <Text type="secondary" className="text-[13px]">Thành tiền:</Text>
          <Price value={Math.floor(finalTotal)} size="lg" />
        </Flex>
      </Flex>

      <Modal
        title="Yêu cầu hoàn hàng"
        open={returnOpen}
        onCancel={() => setReturnOpen(false)}
        onOk={submitReturn}
        okText="Gửi yêu cầu"
        confirmLoading={isRequestingReturn}
        okButtonProps={{ disabled: isUploading || isRequestingReturn }}
      >
        <Form form={returnForm} layout="vertical" initialValues={{ mediaUrls: [] }}>
          <Form.Item name="reason" label="Lý do" rules={[{ required: true, message: "Vui lòng nhập lý do" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả chi tiết">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="mediaUrls" label="Ảnh/Video minh chứng">
            <ImageUpload
              maxFiles={5}
              accept="image/*,video/*"
              maxVideoSizeMB={50}
              onUploadingChange={setIsUploading}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
