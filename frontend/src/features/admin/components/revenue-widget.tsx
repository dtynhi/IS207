import { Card, Col, Row, Statistic, Skeleton } from "antd";
import { DollarCircleOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useRevenueStatistic } from "../hooks/use-admin-statistic"; // Trỏ đúng đường dẫn tới file hook ở Bước 2

export const RevenueWidget = () => {
  // Gọi hook để lấy dữ liệu từ API
  const { data: stats, isLoading } = useRevenueStatistic();

  // Đang gọi API thì hiện hiệu ứng khung xương (Skeleton) cho chuyên nghiệp
  if (isLoading) {
    return <Skeleton active />;
  }

  return (
    <Row gutter={16} className="mb-6">
      {/* Thẻ Doanh thu */}
      <Col span={12} md={8}>
        <Card className="shadow-sm rounded-lg border-l-4 border-blue-500">
          <Statistic
            title={<span className="text-gray-500 font-medium">Tổng Doanh Thu</span>}
            value={stats?.totalRevenue || 0}
            precision={0}
            suffix={<span className="text-sm ml-1">VNĐ</span>}
            prefix={<DollarCircleOutlined className="text-blue-500 mr-2" />}
            valueStyle={{ fontWeight: 'bold', color: '#d3310d' }}
          />
        </Card>
      </Col>

      {/* Thẻ Đơn hàng */}
      <Col span={12} md={8}>
        <Card className="shadow-sm rounded-lg border-l-4 border-green-500">
          <Statistic
            title={<span className="text-gray-500 font-medium">Đơn Hoàn Thành</span>}
            value={stats?.totalCompletedOrders || 0}
            prefix={<ShoppingCartOutlined className="text-green-500 mr-2" />}
            valueStyle={{ fontWeight: 'bold', color: '#d44212' }}
          />
        </Card>
      </Col>
    </Row>
  );
};