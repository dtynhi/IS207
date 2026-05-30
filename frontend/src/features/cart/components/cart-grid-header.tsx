import { Card, Checkbox, Typography } from "antd";

const { Text } = Typography;

type Props = {
  isAllSelected: boolean;
  onToggleAll: (checked: boolean) => void;
};
export const CartGridHeader = ({ isAllSelected, onToggleAll }: Props) => {
  return (
    <Card className="mb-3" styles={{ body: { padding: "12px 20px" } }}>
     {/* Cập nhật grid: Thêm cột 40px ở đầu tiên cho Checkbox */}
      <div className="grid grid-cols-[40px_1fr_120px_120px_120px_60px] gap-3 text-[13px] font-semibold uppercase text-[var(--text-muted)] items-center">
        <Checkbox 
          checked={isAllSelected} 
          onChange={(e) => onToggleAll(e.target.checked)} 
        />
        <Text>Sản phẩm</Text>
        <Text className="text-center">Đơn giá</Text>
        <Text className="text-center">Số lượng</Text>
        <Text className="text-center">Thành tiền</Text>
        <Text />
      </div>
    </Card>
  );
};
