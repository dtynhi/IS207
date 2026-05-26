import { InboxOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Form, Image, Input, List, Modal, Popconfirm, Tag, Typography } from "antd";
import { useState } from "react";
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
  const [returnForm] = Form.useForm<{ reason: string; description?: string; mediaUrls?: string }>();
  const processStatus = purchaseProcessStatusMap[order.status] || { color: "default", label: order.status };
  const paymentStatus = order.paymentStatus
    ? purchasePaymentStatusMap[order.paymentStatus] || { color: "default", label: order.paymentStatus }
    : null;
  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity * (1 - item.discountPercentage / 100), 0);
  const canCancel = order.status === "pending_confirm";
  const canRequestReturn = order.status === "delivered";

  const submitReturn = async () => {
    if (!onRequestReturn) return;
    const values = await returnForm.validateFields();
    const mediaUrls = values.mediaUrls
      ? values.mediaUrls
          .split(/\r?\n|,/)
          .map((item) => item.trim())
          .filter(Boolean)
      : undefined;
    onRequestReturn({ reason: values.reason, description: values.description, mediaUrls });
    returnForm.resetFields();
    setReturnOpen(false);
  };

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
          {canRequestReturn && (
            <Button size="small" onClick={() => setReturnOpen(true)} loading={isRequestingReturn}>
              Yêu cầu hoàn hàng
            </Button>
          )}
        </Flex>
        <Flex align="center" gap={8}>
          <Text type="secondary" className="text-[13px]">Thành tiền:</Text>
          <Price value={Math.floor(total)} size="lg" />
        </Flex>
      </Flex>

      <Modal
        title="Yêu cầu hoàn hàng"
        open={returnOpen}
        onCancel={() => setReturnOpen(false)}
        onOk={submitReturn}
        okText="Gửi yêu cầu"
        confirmLoading={isRequestingReturn}
      >
        <Form form={returnForm} layout="vertical">
          <Form.Item name="reason" label="Lý do" rules={[{ required: true, message: "Vui lòng nhập lý do" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả chi tiết">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="mediaUrls" label="Link hình/video (mỗi dòng một link)">
            <Input.TextArea rows={3} placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
