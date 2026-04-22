import { InboxOutlined } from "@ant-design/icons";
import { Card, Typography } from "antd";
import { Price } from "../../../shared/components/price";
import type { CartItem } from "../../cart/types/cart.types";

const { Text } = Typography;

type CheckoutProductListProps = {
  items: CartItem[];
};

export const CheckoutProductList = ({ items }: CheckoutProductListProps) => {
  return (
    <Card title="Sản phẩm" className="mb-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 border-b border-[var(--border-light)] py-[10px]">
          <div className="flex flex-1 items-center gap-[10px]">
            <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-lg"><InboxOutlined /></div>
            <Text className="text-sm">{item.product?.title || "Sản phẩm"}</Text>
          </div>
          <Text className="text-[13px] text-[var(--text-muted)]">x{item.quantity}</Text>
          <Price value={Number(item.totalPrice)} />
        </div>
      ))}
    </Card>
  );
};
