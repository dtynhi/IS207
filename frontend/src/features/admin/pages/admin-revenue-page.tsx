import React from "react";
import { Card, Col, Row, Statistic, Table, Space, Typography, Button, Tag, message } from "antd";
import { DollarCircleOutlined, ShoppingCartOutlined, LineChartOutlined, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx"; // <-- Đảm bảo bạn đã cài: npm install xlsx

// Gọi file Hook gốc của nhóm bạn
import { useRevenueStatistic } from "../hooks/use-admin-statistic";

const { Title, Text } = Typography;

export const AdminRevenuePage = () => {
  // =================================================================
  // PHẦN 1: DỮ LIỆU TỪ HOOK GỐC (KHÔNG TRUYỀN NGÀY)
  // =================================================================
  const { data, isLoading } = useRevenueStatistic();

  const stats = {
    totalRevenue: data?.totalRevenue ?? data?.data?.totalRevenue ?? 0,
    totalCompletedOrders: data?.totalCompletedOrders ?? data?.data?.totalCompletedOrders ?? 0,
    completedOrdersList: data?.completedOrdersList ?? data?.data?.completedOrdersList ?? []
  };

  // =================================================================
  // PHẦN 2: HÀM XỬ LÝ XUẤT FILE EXCEL
  // =================================================================
  const handleExportExcel = () => {
    const orderList = stats.completedOrdersList;
    if (!orderList || orderList.length === 0) {
      message.warning("Không có dữ liệu đơn hàng để xuất!");
      return;
    }

    // Định dạng dữ liệu dịch sang tiếng Việt cho file Excel đẹp mắt
    const exportData = orderList.map((order: any, index: number) => ({
      "STT": index + 1,
      "Mã Đơn Hàng": order.id,
      "Khách Hàng": order.fullName || "Khách vãng lai",
      "Ngày Hoàn Thành": order.completedAt ? new Date(order.completedAt).toLocaleDateString("vi-VN") : "---",
      "Phương Thức": order.paymentMethod || "---",
      "Tổng Tiền (VNĐ)": order.totalPrice,
    }));

    // Sử dụng thư viện xlsx để đóng gói dữ liệu xuống máy
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Doanh Thu");
    
    // Tự động tải xuống file Excel đặt tên kèm ngày hôm nay
    const todayStr = new Date().toLocaleDateString("vi-VN").replace(/\//g, "-");
    XLSX.writeFile(workbook, `BaoCaoDoanhThu_${todayStr}.xlsx`);
    message.success("Xuất file Excel thành công!");
  };

  // =================================================================
  // PHẦN 3: CẤU HÌNH CỘT THEO ĐÚNG CẤU TRÚC BIẾN GỐC CỦA BẠN
  // =================================================================
  const columns = [
    {
      title: "Mã Đơn Hàng",
      dataIndex: "id",
      key: "id",
      render: (text: string) => <Text copyable className="font-mono text-blue-600">{text}</Text>,
    },
    {
      title: "Khách Hàng",
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => text ? text : "Khách vãng lai"
    },
    {
      title: "Ngày Hoàn Thành",
      dataIndex: "completedAt", // <-- Trả về đúng trường gốc, hiển thị đúng ngày
      key: "completedAt",
      render: (date: string) => date ? new Date(date).toLocaleString("vi-VN") : "---",
    },
    {
      title: "Phương Thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method: string) => <Tag color="blue">{method || "---"}</Tag>,
    },
    {
      title: "Tổng Tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (value: number) => (
        <Text strong className="text-green-600">
          {value?.toLocaleString("vi-VN")} đ
        </Text>
      ),
    },
  ];

  // =================================================================
  // PHẦN 4: HIỂN THỊ GIAO DIỆN (UI)
  // =================================================================
  return (
    <div className="space-y-6">
      {/* TIÊU ĐỀ VÀ NÚT BẤM */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 gap-4">
        <div>
          <Title level={3} style={{ margin: 0 }}>Thống Kê Doanh Thu</Title>
          <Text type="secondary">Báo cáo hiệu suất tài chính và đơn hàng của hệ thống</Text>
        </div>
        <Space wrap>
          {/* Đã gỡ bỏ RangePicker lịch chọn ngày rườm rà */}
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExportExcel}>
            Xuất Excel
          </Button>
        </Space>
      </div>

      {/* CÁC THẺ CARD WIDGETS TỔNG QUAN */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card loading={isLoading} className="shadow-sm border-l-4 border-[#0EA5E9] rounded-xl">
            <Statistic
              title={<span className="text-gray-500 font-medium">Tổng Doanh Thu</span>}
              value={stats?.totalRevenue || 0}
              suffix="VNĐ"
              prefix={<DollarCircleOutlined className="text-[#0EA5E9] mr-2" />}
              valueStyle={{ fontWeight: "bold", color: "#c22915" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card loading={isLoading} className="shadow-sm border-l-4 border-green-500 rounded-xl">
            <Statistic
              title={<span className="text-gray-500 font-medium">Đơn Hàng Thành Công</span>}
              value={stats?.totalCompletedOrders || 0}
              suffix="đơn"
              prefix={<ShoppingCartOutlined className="text-green-500 mr-2" />}
              valueStyle={{ fontWeight: "bold", color: "#c22915" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card loading={isLoading} className="shadow-sm border-l-4 border-purple-500 rounded-xl">
            <Statistic
              title={<span className="text-gray-500 font-medium">Trung Bình / Đơn</span>}
              value={stats?.totalCompletedOrders > 0 ? Math.round(stats.totalRevenue / stats.totalCompletedOrders) : 0}
              suffix="VNĐ"
              prefix={<LineChartOutlined className="text-purple-500 mr-2" />}
              valueStyle={{ fontWeight: "bold", color: "#c22915" }}
            />
          </Card>
        </Col>
      </Row>

      {/* BẢNG DANH SÁCH CHI TIẾT */}
      <Card title="Danh Sách Đơn Hàng Đã Quyết Toán" className="shadow-sm rounded-xl">
        <Table
          loading={isLoading}
          columns={columns}
          dataSource={stats?.completedOrdersList || []}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          locale={{ emptyText: "Chưa có dữ liệu chi tiết đơn hàng" }}
        />
      </Card>
    </div>
  );
};