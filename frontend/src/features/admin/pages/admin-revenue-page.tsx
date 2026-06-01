import React, { useState } from "react";
import { Card, Col, Row, Table, Space, Typography, Button, Tag, Select, DatePicker, Segmented } from "antd";
import { 
  DollarCircleOutlined, ShoppingCartOutlined, LineChartOutlined, 
  DownloadOutlined, AppstoreOutlined, RetweetOutlined, ArrowUpOutlined, ArrowDownOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line 
} from "recharts";
import { useRevenueStatistic } from "../hooks/use-admin-statistic";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#fbbf24'];

export const AdminRevenuePage = () => {
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [chartPeriod, setChartPeriod] = useState<string>("Ngày");

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    const today = dayjs();
    if (value === "today") setDateRange([today.startOf('day').toISOString(), today.endOf('day').toISOString()]);
    else if (value === "yesterday") setDateRange([today.subtract(1, 'day').startOf('day').toISOString(), today.subtract(1, 'day').endOf('day').toISOString()]);
    else if (value === "7days") setDateRange([today.subtract(7, 'day').startOf('day').toISOString(), today.endOf('day').toISOString()]);
    else if (value === "30days") setDateRange([today.subtract(30, 'day').startOf('day').toISOString(), today.endOf('day').toISOString()]);
    else if (value === "thisMonth") setDateRange([today.startOf('month').toISOString(), today.endOf('month').toISOString()]);
    else if (value === "thisYear") setDateRange([today.startOf('year').toISOString(), today.endOf('year').toISOString()]);
    else setDateRange(null);
  };

  const handleRangeChange = (dates: any) => {
    if (dates) {
      setDateRange([dates[0].toISOString(), dates[1].toISOString()]);
      setFilterType("custom");
    } else {
      setDateRange(null);
      setFilterType("all");
    }
  };

  const { data, isLoading } = useRevenueStatistic(
    dateRange ? { startDate: dateRange[0], endDate: dateRange[1] } : undefined
  );

  const stats = data?.overview || {};
  const trends = stats.trends || {};
  const sparklines = stats.sparklines || {};
  const chartData = data?.chartData || [];
  const categoryData = data?.categoryChartData || [];
  const orderList = data?.completedOrdersList || [];
  const topProducts = data?.topProducts || [];

  const handleExportExcel = () => {
    if (!orderList || orderList.length === 0) return;
    const exportData = orderList.map((order: any, index: number) => ({
      "Mã Đơn": order.id,
      "Khách Hàng": order.fullName,
      "Ngày Hoàn Thành": dayjs(order.completedAt).format("DD/MM/YYYY HH:mm"),
      "Phương Thức TT": order.paymentMethod,
      "Tổng Tiền (VNĐ)": order.totalPrice,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Doanh Thu");
    XLSX.writeFile(workbook, `BaoCaoDoanhThu_${dayjs().format('DD-MM-YYYY')}.xlsx`);
  };

  // Component Thẻ thống kê đọc dữ liệu TREND thật
 const SparklineCard = ({ title, value, suffix, icon: Icon, colorClass, bgIconClass, valueColor, percent, isUp, sparkData, sparkColor, reverseColor = false, hideTrend = false }: any) => {
    const isGood = reverseColor ? !isUp : isUp;
    
    return (
      <Card bordered={false} className="shadow-sm rounded-2xl h-full border border-gray-100">
        <div className="flex justify-between items-start h-full">
          <div className="flex flex-col h-full justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgIconClass}`}>
                <Icon className={`text-lg ${colorClass}`} />
              </div>
              <Text type="secondary" className="text-sm font-medium">{title}</Text>
            </div>
            <div>
              <div className={`text-[26px] font-bold ${valueColor} mb-1 leading-none tracking-tight`}>
                {value} <span className="text-base font-normal">{suffix}</span>
              </div>
              
              {/* CHỈ HIỂN THỊ % KHI KHÔNG PHẢI LÀ 'TẤT CẢ THỜI GIAN' */}
              {!hideTrend ? (
                <div className={`flex items-center gap-1 text-xs font-medium ${isGood ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  <span>{percent}% <span className="text-gray-400 font-normal">so với kỳ trước</span></span>
                </div>
              ) : (
                <div className="h-5"></div> /* Giữ khoảng trống để thẻ không bị lùn đi */
              )}
            </div>
          </div>
          <div className="w-24 h-12 self-end mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line type="monotone" dataKey="val" stroke={sparkColor} strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    );
  };

  // Dữ liệu fallback nếu BE chưa kịp load
  const fallbackSpark = [{val:0},{val:0}];

  return (
    <div className="space-y-6 bg-[#f8fafc] min-h-screen p-4 sm:p-6">
      
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-[#f8fafc]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xl">
            <LineChartOutlined />
          </div>
          <div>
            <Title level={3} style={{ margin: 0, fontSize: '22px', color: '#1e293b' }}>Tổng quan doanh thu</Title>
            <Text type="secondary" className="text-sm">Phân tích chuyên sâu hiệu suất bán hàng</Text>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          <CalendarOutlined className="text-gray-400 ml-2" />
          <Select value={filterType} onChange={handleFilterChange} style={{ width: 150 }} bordered={false}>
            <Select.Option value="all">Tất cả thời gian</Select.Option>
            <Select.Option value="today">Hôm nay</Select.Option>
            <Select.Option value="7days">7 ngày qua</Select.Option>
            <Select.Option value="30days">30 ngày qua</Select.Option>
            <Select.Option value="thisMonth">Tháng này</Select.Option>
          </Select>
          <div className="w-[1px] h-6 bg-gray-200"></div>
          <RangePicker onChange={handleRangeChange} bordered={false} className="hover:bg-gray-50" />
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExportExcel} className="bg-indigo-500 hover:bg-indigo-600 border-0 rounded-lg h-9 px-4 font-medium ml-2 shadow-sm">
            Xuất Excel
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <SparklineCard 
            title="Tổng doanh thu" value={stats.totalRevenue?.toLocaleString() || 0} suffix="VNĐ" 
            icon={DollarCircleOutlined} bgIconClass="bg-blue-50" colorClass="text-blue-600" valueColor="text-blue-600"
            percent={trends.revenue?.percent || 0} isUp={trends.revenue?.isUp ?? true} 
            sparkData={sparklines.revenue || fallbackSpark} sparkColor="#3b82f6" 
            hideTrend={filterType === 'all'} // <--- THÊM DÒNG NÀY
          />
        </Col>
        <Col xs={24} lg={8}>
          <SparklineCard 
            title="Số đơn hoàn thành" value={stats.totalCompletedOrders?.toLocaleString() || 0} suffix="đơn" 
            icon={ShoppingCartOutlined} bgIconClass="bg-emerald-50" colorClass="text-emerald-500" valueColor="text-gray-800"
            percent={trends.orders?.percent || 0} isUp={trends.orders?.isUp ?? true} 
            sparkData={sparklines.orders || fallbackSpark} sparkColor="#10b981" 
            hideTrend={filterType === 'all'} // <--- THÊM DÒNG NÀY
          />
        </Col>
        <Col xs={24} lg={8}>
          <SparklineCard 
            title="Giá trị trung bình (AOV)" value={stats.aov?.toLocaleString() || 0} suffix="VNĐ" 
            icon={LineChartOutlined} bgIconClass="bg-purple-50" colorClass="text-purple-600" valueColor="text-purple-600"
            percent={trends.aov?.percent || 0} isUp={trends.aov?.isUp ?? true} 
            sparkData={sparklines.aov || fallbackSpark} sparkColor="#8b5cf6" 
            hideTrend={filterType === 'all'} // <--- THÊM DÒNG NÀY
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <SparklineCard 
            title="Sản phẩm bán ra" value={stats.totalItemsSold?.toLocaleString() || 0} suffix="SP" 
            icon={AppstoreOutlined} bgIconClass="bg-amber-50" colorClass="text-amber-500" valueColor="text-gray-800"
            percent={trends.items?.percent || 0} isUp={trends.items?.isUp ?? true} 
            sparkData={sparklines.items || fallbackSpark} sparkColor="#f59e0b" 
            hideTrend={filterType === 'all'} // <--- THÊM DÒNG NÀY
          />
        </Col>
        <Col xs={24} lg={12}>
          <SparklineCard 
            title="Tỷ lệ hoàn trả" value={stats.returnRate || 0} suffix="%" 
            icon={RetweetOutlined} bgIconClass="bg-rose-50" colorClass="text-rose-500" valueColor="text-gray-800"
            percent={trends.returnRate?.percent || 0} isUp={trends.returnRate?.isUp ?? false} 
            sparkData={sparklines.returnRate || fallbackSpark} sparkColor="#ef4444" reverseColor={true}
            hideTrend={filterType === 'all'} // <--- THÊM DÒNG NÀY
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={15}>
          <Card bordered={false} className="shadow-sm rounded-2xl border border-gray-100" bodyStyle={{ padding: '24px' }}>
            <div className="flex justify-between items-center mb-6">
              <Text className="font-bold text-base text-gray-800">Biểu đồ doanh thu theo thời gian</Text>
              <Segmented options={['Ngày', 'Tuần', 'Tháng', 'Năm']} value={chartPeriod} onChange={(val) => setChartPeriod(val as string)} className="bg-indigo-50/50 text-indigo-600 font-medium" />
            </div>
            {chartData.length > 0 ? (
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                    <YAxis tickFormatter={(val: number) => `${val / 1000}k`} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} />
                    <RechartsTooltip formatter={(val: any) => [`${Number(val || 0).toLocaleString()} đ`, "Doanh thu"]} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />  
                    <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="flex h-[320px] items-center justify-center text-gray-400">Không có dữ liệu</div>}
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card bordered={false} className="shadow-sm rounded-2xl border border-gray-100" bodyStyle={{ padding: '24px' }}>
            <Text className="font-bold text-base text-gray-800 mb-6 block">Doanh thu theo danh mục</Text>
            {categoryData.length > 0 ? (
               <div className="relative w-full h-[320px]">
                 <ResponsiveContainer>
                   <PieChart>
                     <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                       {categoryData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                     </Pie>
                     <RechartsTooltip formatter={(val: any) => [`${Number(val || 0).toLocaleString()} đ`, "Doanh thu"]} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                     <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '13px', color: '#475569' }} />
                   </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute top-1/2 left-[50%] -translate-x-[50%] -translate-y-1/2 text-center pointer-events-none pr-[110px]">
                    
                 </div>
               </div>
            ) : <div className="flex h-[320px] items-center justify-center text-gray-400">Không có dữ liệu</div>}
          </Card>
        </Col>
      </Row>

      {/* --- HAI BẢNG DANH SÁCH (THIẾT KẾ DỌC) --- */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card bordered={false} className="shadow-sm rounded-2xl border border-gray-100" title={<div className="flex items-center gap-2 pt-2"><div className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center text-xs"><AppstoreOutlined /></div><span className="text-gray-800 font-bold text-base">Danh sách đơn hàng gần nhất</span></div>}>
            <Table
              loading={isLoading}
              dataSource={orderList}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              scroll={{ x: 'max-content' }}
              columns={[
                { title: "Mã đơn", dataIndex: "id", key: "id", render: (t) => <Text className="text-gray-500 font-mono text-xs">{t}</Text> },
                { title: "Khách hàng", dataIndex: "fullName", key: "name", render: (t) => <Text className="text-gray-800 font-medium">{t}</Text> },
                { title: "Ngày hoàn thành", dataIndex: "completedAt", key: "date", render: (d) => <Text className="text-gray-600">{dayjs(d).format("DD/MM/YYYY HH:mm")}</Text> },
                { title: "Thanh toán", dataIndex: "paymentMethod", key: "method", render: (m) => (
                    <Tag className={`rounded-md border-0 px-2 py-0.5 ${m === 'COD' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {m === 'COD' ? 'COD' : 'Chuyển khoản'}
                    </Tag>
                )},
                { title: "Tổng tiền", dataIndex: "totalPrice", key: "price", render: (v) => <Text className="text-rose-500 font-bold">{v?.toLocaleString()} đ</Text> },
                { title: "Trạng thái", key: "status", render: () => <Tag className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 px-3">Đã hoàn thành</Tag> }
                // ĐÃ XÓA CỘT XEM CHI TIẾT THEO YÊU CẦU
              ]}
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card bordered={false} className="shadow-sm rounded-2xl border border-gray-100" title={<div className="flex items-center gap-2 pt-2"><div className="w-6 h-6 bg-orange-50 text-orange-500 rounded flex items-center justify-center text-xs"><ShoppingCartOutlined /></div><span className="text-gray-800 font-bold text-base">🏆 Top sản phẩm bán chạy nhất</span></div>}>
            <Table
              loading={isLoading}
              dataSource={topProducts}
              rowKey="name"
              pagination={false}
              scroll={{ x: 'max-content' }}
              columns={[
                { title: "Tên sản phẩm", dataIndex: "name", key: "name", render: (t) => <Text strong className="text-gray-700">{t}</Text> },
                { title: "Số lượng đã bán", dataIndex: "quantity", key: "qty", align: "center", render: (v) => <Tag color="orange" className="rounded-md text-sm px-2 py-1">{v} SP</Tag> },
                { title: "Doanh thu", dataIndex: "revenue", key: "rev", render: (v) => <Text className="text-emerald-600 font-bold text-base">{v?.toLocaleString()} ₫</Text> },
              ]}
            />
          </Card>
        </Col>
      </Row>

    </div>
  );
};