import { InboxOutlined } from "@ant-design/icons";
import { Card, Flex, List, Tag, Typography } from "antd";
import { Price } from "../../../shared/components/price";
import { purchaseStatusMap, type UserPurchase } from "../types/user.types";

const { Text } = Typography;

type UserPurchaseCardProps = {
  order: UserPurchase;
};

export const UserPurchaseCard = ({ order }: UserPurchaseCardProps) => {
  const status = purchaseStatusMap[order.status] || { color: "default", label: order.status };
  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity * (1 - item.discountPercentage / 100), 0);

  return (
    <Card className="mb-3" styles={{ body: { padding: 0 } }}>
      <Flex justify="space-between" className="border-b border-[var(--border-light)] px-5 py-2.5">
        <Text type="secondary" className="text-[13px]">#{order.id.slice(0, 8).toUpperCase()}</Text>
        <Tag color={status.color}>{status.label}</Tag>
      </Flex>

      <List
        split
        dataSource={order.items}
        renderItem={(item) => (
          <List.Item className="!px-5 !py-2.5">
            <Flex align="center" justify="space-between" className="w-full" gap={12}>
              <Flex align="center" gap={10} className="min-w-0 flex-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-xl"><InboxOutlined /></div>
                <Text ellipsis>{item.product?.title || "Sản phẩm"}</Text>
              </Flex>
              <Text type="secondary">x{item.quantity}</Text>
              <Price value={Math.floor(item.price * (1 - item.discountPercentage / 100) * item.quantity)} />
            </Flex>
          </List.Item>
        )}
      />

      <Flex justify="end" align="center" gap={8} className="bg-[var(--primary-soft)] px-5 py-3">
        <Text type="secondary" className="text-[13px]">Thành tiền:</Text>
        <Price value={Math.floor(total)} size="lg" />
      </Flex>
    </Card>
  );
};
