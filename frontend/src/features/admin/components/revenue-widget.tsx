import { Card, Col, Row, Statistic, Skeleton } from "antd";
import { DollarCircleOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useRevenueStatistic } from "../hooks/use-admin-statistic"; 

export const RevenueWidget = () => {
  // 1. Gọi hook lấy dữ liệu doanh thu mới nâng cấp
  const { data, isLoading } = useRevenueStatistic({});

  // 2. Trỏ vào mục overview để lấy dữ liệu từ Backend trả về
  const stats = data?.overview || {};

  // Nếu đang tải dữ liệu thì hiện khung xương chờ mẫu cho đẹp
  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 1 }} />;
  }

  return (
    <Row gutter={[16, 16]} className="mb-2">
      {/* Thẻ 1: Tổng Doanh Thu */}
      <Col xs={24} sm={12}>
        <Card className="shadow-sm rounded-lg border-l-4 border-blue-500">
          <Statistic
            title={<span className="text-gray-500 font-medium">TỔNG DOANH THU</span>}
            value={stats.totalRevenue || 0}
            precision={0}
            suffix={<span className="text-sm ml-1">VNĐ</span>}
            prefix={<DollarCircleOutlined className="text-blue-500 mr-2" />}
            valueStyle={{ fontWeight: 'bold', color: '#d3310d' }}
          />
        </Card>
      </Col>

      {/* Thẻ 2: Đơn Hàng Thành Công */}
      <Col xs={24} sm={12}>
        <Card className="shadow-sm rounded-lg border-l-4 border-green-500">
          <Statistic
            title={<span className="text-gray-500 font-medium">ĐƠN HÀNG THÀNH CÔNG</span>}
            value={stats.totalCompletedOrders || 0}
            suffix={<span className="text-sm ml-1">đơn</span>}
            prefix={<ShoppingCartOutlined className="text-green-500 mr-2" />}
            valueStyle={{ fontWeight: 'bold', color: '#16a34a' }}
          />
        </Card>
      </Col>
    </Row>
  );
};