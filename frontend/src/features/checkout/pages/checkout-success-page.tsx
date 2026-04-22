import { CheckCircleOutlined } from "@ant-design/icons";
import { Button, Card, Descriptions, Result, Skeleton, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useCheckoutSuccess } from "../hooks/use-checkout-success";

const { Text } = Typography;

export const CheckoutSuccessPage = () => {
  const navigate = useNavigate();
  const { orderId, query } = useCheckoutSuccess();

  const data = (query.data || {}) as Record<string, unknown>;

  if (query.isPending) {
    return (
      <div className="pt-6 pb-6">
        <Card className="animate-in">
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
      </div>
    );
  }

  const rows = [
    { key: "order", label: "Mã đơn hàng", value: String(data.id || orderId).slice(0, 8).toUpperCase() },
    { key: "fullName", label: "Người nhận", value: String(data.fullName || "") },
    { key: "phone", label: "SĐT", value: String(data.phone || "") },
    { key: "address", label: "Địa chỉ", value: String(data.address || "") },
    { key: "status", label: "Trạng thái", value: String(data.status || "Đang xử lý") },
  ];

  return (
    <div className="animate-in mx-auto mt-10 max-w-[520px] pt-6">
      <Card>
        <Result
          icon={<CheckCircleOutlined className="text-[var(--primary)]" />}
          status="success"
          title="Đặt hàng thành công!"
          subTitle="Cảm ơn bạn đã mua sắm tại Uni Market."
          extra={[
            <Space key="actions">
              <Button onClick={() => navigate("/user/purchase")} className="h-11 rounded-xl px-7">Xem đơn mua</Button>
              <Button type="primary" onClick={() => navigate("/")} className="h-11 rounded-xl px-7">Tiếp tục mua sắm</Button>
            </Space>,
          ]}
        />

        <Descriptions bordered size="small" column={1} className="mt-2">
          {rows.map((row, index) => (
            <Descriptions.Item key={row.key} label={row.label}>
              {index === 0 ? <Text strong className="text-[var(--primary)]">{row.value}</Text> : row.value}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>
    </div>
  );
};
