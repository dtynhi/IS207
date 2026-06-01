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

// Bảng màu kẹo ngọt cho biểu đồ
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

  // Component Thẻ thống kê nâng cấp với nền Pastel nguyên khối
  const SparklineCard = ({ title, value, suffix, icon: Icon, colorClass, valueColor, percent, isUp, sparkData, sparkColor, reverseColor = false, hideTrend = false, cardBgClass }: any) => {
    const isGood = reverseColor ? !isUp : isUp;
    
    return (
      <Card bordered={false} className={`shadow-sm rounded-3xl h-full border-0 ${cardBgClass} transition-transform hover:-translate-y-1 hover:shadow-md`}>
        <div className="flex justify-between items-start h-full">
          <div className="flex flex-col h-full justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Icon nổi bật với nền trắng tinh */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm`}>
                <Icon className={`text-xl ${colorClass}`} />
              </div>
              <Text className="text-sm font-bold text-gray-600 tracking-wide uppercase">{title}</Text>
            </div>
            <div>
              <div className={`text-[28px] font-black ${valueColor} mb-2 leading-none tracking-tight drop-shadow-sm`}>
                {value} <span className="text-base font-semibold text-gray-500">{suffix}</span>
              </div>
              {!hideTrend ? (
                <div className={`flex items-center gap-1.5 text-sm font-bold ${isGood ? 'text-emerald-600' : 'text-rose-600'}`}>
                  <div className={`flex items-center justify-center w-5 h-5 rounded-full ${isGood ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    {isUp ? <ArrowUpOutlined className="text-[10px]" /> : <ArrowDownOutlined className="text-[10px]" />}
                  </div>
                  <span>{percent}% <span className="text-gray-500 font-medium">kỳ trước</span></span>
                </div>
              ) : (
                <div className="h-6"></div> 
              )}
            </div>
          </div>
          <div className="w-28 h-16 self-end mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line type="monotone" dataKey="val" stroke={sparkColor} strokeWidth={3} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    );
  };

  const fallbackSpark = [{val:0},{val:0}];

  return (
    <div className="space-y-6 bg-white min-h-screen p-4 sm:p-6 rounded-2xl">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white pb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
            <LineChartOutlined />
          </div>
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#1e293b' }}>Tổng quan doanh thu</Title>
            <Text className="text-gray-500 font-medium">Phân tích chuyên sâu hiệu suất bán hàng</Text>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
          <CalendarOutlined className="text-gray-400 ml-3 text-lg" />
          <Select value={filterType} onChange={handleFilterChange} style={{ width: 160 }} bordered={false} className="font-semibold text-gray-700">
            <Select.Option value="all">Tất cả thời gian</Select.Option>
            <Select.Option value="today">Hôm nay</Select.Option>
            <Select.Option value="7days">7 ngày qua</Select.Option>
            <Select.Option value="30days">30 ngày qua</Select.Option>
            <Select.Option value="thisMonth">Tháng này</Select.Option>
          </Select>
          <div className="w-[2px] h-6 bg-gray-200 rounded-full"></div>
          <RangePicker onChange={handleRangeChange} bordered={false} className="hover:bg-white rounded-xl font-medium" />
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExportExcel} className="bg-indigo-600 hover:bg-indigo-700 border-0 rounded-xl h-10 px-5 font-bold shadow-md ml-1">
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* 5 THẺ THỐNG KÊ (Đã phủ màu Pastel) */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <SparklineCard 
            title="Tổng doanh thu" value={stats.totalRevenue?.toLocaleString() || 0} suffix="VNĐ" 
            icon={DollarCircleOutlined} colorClass="text-blue-500" valueColor="text-blue-700"
            percent={trends.revenue?.percent || 0} isUp={trends.revenue?.isUp ?? true} 
            sparkData={sparklines.revenue || fallbackSpark} sparkColor="#3b82f6" 
            hideTrend={filterType === 'all'} cardBgClass="bg-[#eff6ff]" /* Pastel Blue */
          />
        </Col>
        <Col xs={24} lg={8}>
          <SparklineCard 
            title="Số đơn hoàn thành" value={stats.totalCompletedOrders?.toLocaleString() || 0} suffix="đơn" 
            icon={ShoppingCartOutlined} colorClass="text-emerald-500" valueColor="text-emerald-700"
            percent={trends.orders?.percent || 0} isUp={trends.orders?.isUp ?? true} 
            sparkData={sparklines.orders || fallbackSpark} sparkColor="#10b981" 
            hideTrend={filterType === 'all'} cardBgClass="bg-[#ecfdf5]" /* Pastel Emerald */
          />
        </Col>
        <Col xs={24} lg={8}>
          <SparklineCard 
            title="Giá trị trung bình" value={stats.aov?.toLocaleString() || 0} suffix="VNĐ" 
            icon={LineChartOutlined} colorClass="text-purple-500" valueColor="text-purple-700"
            percent={trends.aov?.percent || 0} isUp={trends.aov?.isUp ?? true} 
            sparkData={sparklines.aov || fallbackSpark} sparkColor="#8b5cf6" 
            hideTrend={filterType === 'all'} cardBgClass="bg-[#faf5ff]" /* Pastel Purple */
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <SparklineCard 
            title="Sản phẩm bán ra" value={stats.totalItemsSold?.toLocaleString() || 0} suffix="SP" 
            icon={AppstoreOutlined} colorClass="text-amber-500" valueColor="text-amber-700"
            percent={trends.items?.percent || 0} isUp={trends.items?.isUp ?? true} 
            sparkData={sparklines.items || fallbackSpark} sparkColor="#f59e0b" 
            hideTrend={filterType === 'all'} cardBgClass="bg-[#fffbeb]" /* Pastel Amber */
          />
        </Col>
        <Col xs={24} lg={12}>
          <SparklineCard 
            title="Tỷ lệ hoàn trả" value={stats.returnRate || 0} suffix="%" 
            icon={RetweetOutlined} colorClass="text-rose-500" valueColor="text-rose-700"
            percent={trends.returnRate?.percent || 0} isUp={trends.returnRate?.isUp ?? false} 
            sparkData={sparklines.returnRate || fallbackSpark} sparkColor="#ef4444" reverseColor={true}
            hideTrend={filterType === 'all'} cardBgClass="bg-[#fff1f2]" /* Pastel Rose */
          />
        </Col>
      </Row>

      {/* HAI BIỂU ĐỒ (Nền Pastel nhạt) */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={15}>
          <Card bordered={false} className="shadow-sm rounded-3xl border-0 bg-[#f0f9ff]" bodyStyle={{ padding: '24px' }}>
            <div className="flex justify-between items-center mb-6">
              <Text className="font-bold text-lg text-gray-800">Biểu đồ doanh thu theo thời gian</Text>
              <Segmented options={['Ngày', 'Tuần', 'Tháng', 'Năm']} value={chartPeriod} onChange={(val) => setChartPeriod(val as string)} className="bg-white text-indigo-600 font-bold shadow-sm" />
            </div>
            {chartData.length > 0 ? (
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                    <YAxis tickFormatter={(val) => `${val / 1000}k`} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dx={-10} />
                    <RechartsTooltip formatter={(val: any) => [`${Number(val || 0).toLocaleString()} đ`, "Doanh thu"]} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />  
                    <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 7, strokeWidth: 0, fill: '#8b5cf6' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="flex h-[320px] items-center justify-center text-gray-400">Không có dữ liệu</div>}
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card bordered={false} className="shadow-sm rounded-3xl border-0 bg-[#faf5ff]" bodyStyle={{ padding: '24px' }}>
            <Text className="font-bold text-lg text-gray-800 mb-6 block">Doanh thu theo danh mục</Text>
            {categoryData.length > 0 ? (
               <div className="relative w-full h-[320px]">
                 <ResponsiveContainer>
                   <PieChart>
                     <Pie data={categoryData} cx="50%" cy="45%" innerRadius={75} outerRadius={105} paddingAngle={3} dataKey="value" stroke="none">
                       {categoryData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                     </Pie>
                     <RechartsTooltip formatter={(val: any) => [`${Number(val || 0).toLocaleString()} đ`, "Doanh thu"]} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                     {/* Đưa Legend nằm ngang dưới đáy cho cân bằng */}
                     <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '13px', color: '#475569', fontWeight: 500, paddingTop: '10px' }} />
                   </PieChart>
                 </ResponsiveContainer>
                 {/* Khối chữ TỔNG đã được căn giữa hoàn hảo */}
                 <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    
                   
                 </div>
               </div>
            ) : <div className="flex h-[320px] items-center justify-center text-gray-400">Không có dữ liệu</div>}
          </Card>
        </Col>
      </Row>

      {/* HAI BẢNG DỮ LIỆU (Card Pastel bọc Table Trắng) */}
      <Row gutter={[16, 16]}>
      <Col span={24}>
          <Card bordered={false} className="shadow-sm rounded-3xl border-0 bg-[#f0fdf4]" title={<div className="flex items-center gap-3 pt-2"><div className="w-8 h-8 bg-white text-emerald-600 rounded-xl flex items-center justify-center text-lg shadow-sm"><AppstoreOutlined /></div><span className="text-gray-800 font-black text-lg">Danh sách tất cả đơn hàng hoàn thành</span></div>}>
            <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-emerald-50">
              <Table
                loading={isLoading}
                dataSource={orderList}
                rowKey="id"
                pagination={false} /* 👈 Tắt phân trang để hiển thị TẤT CẢ */
                scroll={{ x: 'max-content', y: 400 }} /* 👈 Thêm thanh cuộn dọc (cao tối đa 400px) */
                className="custom-revenue-table"
                columns={[
                  { title: "Mã đơn", dataIndex: "id", key: "id", render: (t) => <Text className="text-black font-mono text-xs">{t}</Text> },
                  { title: "Khách hàng", dataIndex: "fullName", key: "name", render: (t) => <Text className="text-gray-800">{t}</Text> },
                  { title: "Ngày hoàn thành", dataIndex: "completedAt", key: "date", render: (d) => <Text className="text-black font-medium">{dayjs(d).format("DD/MM/YYYY HH:mm")}</Text> },
                  { title: "Thanh toán", dataIndex: "paymentMethod", key: "method", render: (m) => (
                      <Tag className={`rounded-lg border-0 px-3 py-1 font-bold ${m === 'COD' ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {m === 'COD' ? 'COD' : 'Chuyển khoản'}
                      </Tag>
                  )},
                  { title: "Tổng tiền", dataIndex: "totalPrice", key: "price", render: (v) => <Text className="text-rose-500 font-black text-base">{v?.toLocaleString()} ₫</Text> }
                ]}
              />
            </div>
          </Card>
        </Col>

        <Col span={24}>
          <Card bordered={false} className="shadow-sm rounded-3xl border-0 bg-[#fffbeb]" title={<div className="flex items-center gap-3 pt-2"><div className="w-8 h-8 bg-white text-amber-500 rounded-xl flex items-center justify-center text-lg shadow-sm"><ShoppingCartOutlined /></div><span className="text-gray-800 font-black text-lg">🏆 Top sản phẩm bán chạy nhất</span></div>}>
            <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-amber-50">
              <Table
                loading={isLoading}
                dataSource={topProducts}
                rowKey="name"
                pagination={false}
                scroll={{ x: 'max-content' }}
                columns={[
                  { title: "Tên sản phẩm", dataIndex: "name", key: "name", render: (t) => <Text className="text-gray-800">{t}</Text> },
                  { title: "Số lượng đã bán", dataIndex: "quantity", key: "qty", align: "center", render: (v) => <Tag color="orange" className="rounded-lg border-0 font-bold text-sm px-3 py-1 bg-amber-50 text-amber-600">{v} SP</Tag> },
                  { title: "Doanh thu", dataIndex: "revenue", key: "rev", render: (v) => <Text className="text-emerald-600 font-black text-base">{v?.toLocaleString()} ₫</Text> },
                ]}
              />
            </div>
          </Card>
        </Col>
      </Row>

    </div>
  );
};