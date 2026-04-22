import { Card, Typography } from "antd";

const { Text } = Typography;

export const CartGridHeader = () => {
  return (
    <Card className="mb-3" styles={{ body: { padding: "12px 20px" } }}>
      <div className="grid grid-cols-[1fr_120px_120px_120px_60px] gap-3 text-[13px] font-semibold uppercase text-[var(--text-muted)]">
        <Text>Sản phẩm</Text>
        <Text className="text-center">Đơn giá</Text>
        <Text className="text-center">Số lượng</Text>
        <Text className="text-center">Thành tiền</Text>
        <Text />
      </div>
    </Card>
  );
};
