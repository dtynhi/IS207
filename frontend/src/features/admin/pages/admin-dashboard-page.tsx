import React from "react";
import { Card, Col, Row, Statistic, Typography } from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  TagsOutlined,
  AppstoreOutlined,
  DashboardOutlined
} from "@ant-design/icons";
import { useAdminDashboard } from "../hooks/use-admin-dashboard";
import { RevenueWidget } from "../components/revenue-widget";

const { Title, Text } = Typography;

// 💡 Hàm thông minh: Tự động phân tích tên Key để trả về Icon và Màu sắc tương ứng
const getCardStyle = (key: string) => {
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes("user") || lowerKey.includes("khách") || lowerKey.includes("tài khoản")) {
    return { icon: <UserOutlined />, color: "border-sky-500", iconColor: "text-sky-500", bg: "bg-sky-50" };
  }
  if (lowerKey.includes("product") || lowerKey.includes("sản phẩm")) {
    return { icon: <ShoppingOutlined />, color: "border-amber-500", iconColor: "text-amber-500", bg: "bg-amber-50" };
  }
  if (lowerKey.includes("category") || lowerKey.includes("danh mục")) {
    return { icon: <TagsOutlined />, color: "border-purple-500", iconColor: "text-purple-500", bg: "bg-purple-50" };
  }
  // Mặc định cho các chỉ số khác
  return { icon: <AppstoreOutlined />, color: "border-emerald-500", iconColor: "text-emerald-500", bg: "bg-emerald-50" };
};

const statLabelMap: Record<string, string> = {
  totalProducts: "Tổng số sản phẩm",
  totalUsers: "Tổng số khách hàng",
  totalOrders: "Tổng số đơn hàng",
  totalCategories: "Tổng số danh mục",
};

export const AdminDashboardPage = () => {
  const { data } = useAdminDashboard();
  const stats = data || {};

  return (
    <div className="space-y-8 bg-gray-50/30 p-2 rounded-2xl min-h-screen">
      
      {/* 1. HEADER CHUYÊN NGHIỆP */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-xl shadow-sm text-white flex items-center justify-center">
            <DashboardOutlined className="text-2xl" />
          </div>
          <div>
            <Title level={3} style={{ margin: 0 }} className="text-gray-800">
              TỔNG QUAN HỆ THỐNG
            </Title>
            <Text className="text-gray-500">Theo dõi các chỉ số và hoạt động kinh doanh mới nhất</Text>
          </div>
        </div>
      </div>

      {/* 2. KHU VỰC DOANH THU (2 Thẻ gọi từ RevenueWidget) */}
      <section>
        <Text strong className="text-lg mb-4 block text-gray-700 uppercase tracking-wider">
          💰 Tài chính & Bán hàng
        </Text>
        <RevenueWidget />
      </section>

      {/* 3. KHU VỰC DỮ LIỆU HỆ THỐNG (Từ vòng lặp tự động) */}
      <section>
        <Text strong className="text-lg mb-4 block text-gray-700 uppercase tracking-wider">
          📊 Dữ liệu hệ thống
        </Text>
        <Row gutter={[16, 16]}>
          {Object.entries(stats).map(([key, value]) => {
            // Gọi hàm thông minh để lấy giao diện tương ứng cho từng ô
            const { icon, color, iconColor, bg } = getCardStyle(key);
            
            return (
              <Col key={key} xs={24} sm={12} lg={6}>
                <Card
                  bordered={false}
                  className={`shadow-sm hover:shadow-md transition-all duration-300 rounded-xl border-l-4 ${color}`}
                  bodyStyle={{ padding: "20px" }}
                >
                  <Statistic
                    title={
                      <span className="text-gray-500 font-medium block mb-1">
                        {statLabelMap[key] || key.replace(/_/g, " ")}
                      </span>
                    }
                    value={Number(value)}
                    prefix={
                      <div className={`mr-3 ${bg} ${iconColor} p-2 rounded-lg flex items-center justify-center`}>
                        {icon}
                      </div>
                    }
                    valueStyle={{ fontWeight: "700", fontSize: "26px", color: "#374151" }}
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      </section>
      
    </div>
  );
};