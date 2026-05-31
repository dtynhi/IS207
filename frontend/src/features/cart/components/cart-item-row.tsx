import { DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import { Button, Card,Checkbox, Image, InputNumber, Popconfirm, Typography } from "antd";
import { Price } from "../../../shared/components/price";
import type { CartItem } from "../types/cart.types";
import { useState, useEffect } from "react";

const { Text } = Typography;

type CartItemRowProps = {
  item: CartItem;
  isSelected: boolean;
  onToggleSelect: (id: string, checked: boolean) => void;
  onUpdateQty: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
};

export const CartItemRow = ({ item, isSelected, onToggleSelect, onUpdateQty, onRemove }: CartItemRowProps) => {
  const [localQty, setLocalQty] = useState(item.quantity);

  useEffect(() => {
    if (localQty === item.quantity) return; // Không đổi thì không gọi API
    
    const timer = setTimeout(() => {
      onUpdateQty(item.id, localQty); // Đợi 300ms (0.3 giây) mới gọi API
    }, 300);
    
    return () => clearTimeout(timer); // Xóa bộ đếm nếu khách bấm tiếp
  }, [localQty, item.quantity, item.id, onUpdateQty]);

  useEffect(() => {
    setLocalQty(item.quantity); // Đồng bộ lại số lượng khi Server trả về
  }, [item.quantity]);
  return (
    <Card className="mb-2" styles={{ body: { padding: "14px 20px" } }}>
      {/* Cập nhật grid: Thêm cột 40px ở đầu tiên cho Checkbox */}
      <div className="grid grid-cols-[40px_1fr_120px_120px_120px_60px] items-center gap-3">
        <Checkbox checked={isSelected} onChange={(e) => onToggleSelect(item.id, e.target.checked)} />
       
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-[28px] overflow-hidden">
            {item.product?.thumbnail ? (
              <Image src={item.product.thumbnail} alt={item.product.title} preview={false} className="h-full w-full object-cover" />
            ) : (
              <InboxOutlined />
            )}
          </div>
          <Text className="text-sm">{item.product?.title || item.productId}</Text>
        </div>

        <div className="text-center">{item.product?.priceNew ? <Price value={item.product.priceNew} size="sm" /> : "-"}</div>
        <div className="text-center"><InputNumber 
   value={localQty} 
   onChange={(val) => {
      if (val !== null) setLocalQty(val);
   }} 
/></div>
        <div className="text-center"><Price value={Number(item.totalPrice)} size="md" /></div>

        <div className="text-center">
          <Popconfirm title="Xoá sản phẩm này?" onConfirm={() => onRemove(item.id)} okText="Xoá" cancelText="Huỷ">
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      </div>
    </Card>
  );
};
