import { Button, Card, Result, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const { Text } = Typography;

export const CheckoutBankSandboxPage = () => {
  const navigate = useNavigate();
  const { orderId = "" } = useParams();

  const handleComplete = () => {
    // In a real integration, this would be replaced with the bank's sandbox flow and a webhook/callback.
    // Here we simulate a successful payment and navigate to the success page.
    navigate(`/checkout/success/${orderId}`);
  };

  return (
    <div className="animate-in pt-6 pb-6">
      <Card>
        <Result
          status="info"
          title="Thanh toán bằng ngân hàng (Sandbox)"
          subTitle={<Text>Hệ thống đang chạy ở môi trường sandbox. Nhấn nút bên dưới để giả lập thanh toán thành công.</Text>}
          extra={[
            <Button type="primary" key="complete" onClick={handleComplete}>Hoàn tất thanh toán (Sandbox)</Button>,
            <Button key="cancel" onClick={() => navigate(-1)}>Quay lại</Button>,
          ]}
        />
      </Card>
    </div>
  );
};
