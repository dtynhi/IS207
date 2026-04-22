import { DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import { Button, Card, InputNumber, Popconfirm, Typography } from "antd";
import { Price } from "../../../shared/components/price";
import type { CartItem } from "../types/cart.types";

const { Text } = Typography;

type CartItemRowProps = {
  item: CartItem;
  onUpdateQty: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
};

export const CartItemRow = ({ item, onUpdateQty, onRemove }: CartItemRowProps) => {
  return (
    <Card className="mb-2" styles={{ body: { padding: "14px 20px" } }}>
      <div className="grid grid-cols-[1fr_120px_120px_120px_60px] items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-[28px]"><InboxOutlined /></div>
          <Text className="text-sm">{item.product?.title || item.productId}</Text>
        </div>

        <div className="text-center">{item.product?.priceNew ? <Price value={item.product.priceNew} size="sm" /> : "-"}</div>
        <div className="text-center"><InputNumber min={1} value={item.quantity} size="small" className="w-[70px]" onChange={(value) => onUpdateQty(item.id, Number(value || 1))} /></div>
        <div className="text-center"><Price value={Number(item.totalPrice)} size="md" /></div>

        <div className="text-center">
          <Popconfirm title="Xoá?" onConfirm={() => onRemove(item.id)} okText="Xoá" cancelText="Huỷ">
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      </div>
    </Card>
  );
};
