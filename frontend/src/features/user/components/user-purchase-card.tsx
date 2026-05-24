import { InboxOutlined } from "@ant-design/icons";
import { Button, Card, Flex, List, Popconfirm, Tag, Typography, Image } from "antd";
import { Price } from "../../../shared/components/price";
import { purchasePaymentStatusMap, purchaseProcessStatusMap } from "../constants/purchase-status";
import type { UserPurchase } from "../types/user.types";

const { Text } = Typography;

type UserPurchaseCardProps = {
  order: UserPurchase;
  onCancel?: () => void;
  isCancelling?: boolean;
};

export const UserPurchaseCard = ({ order, onCancel, isCancelling }: UserPurchaseCardProps) => {
  const processStatus = purchaseProcessStatusMap[order.status] || { color: "default", label: order.status };
  const paymentStatus = order.paymentStatus
    ? purchasePaymentStatusMap[order.paymentStatus] || { color: "default", label: order.paymentStatus }
    : null;
  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity * (1 - item.discountPercentage / 100), 0);
  const canCancel = order.status === "pending_confirm" && order.paymentStatus !== "paid";

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

      <Flex justify="space-between" align="center" className="bg-[var(--primary-soft)] px-5 py-3">
        {canCancel ? (
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
        ) : (
          <span />
        )}
        <Flex align="center" gap={8}>
          <Text type="secondary" className="text-[13px]">Thành tiền:</Text>
          <Price value={Math.floor(total)} size="lg" />
        </Flex>
      </Flex>
    </Card>
  );
};
