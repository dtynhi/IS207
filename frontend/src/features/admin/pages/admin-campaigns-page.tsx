import { useState } from "react";
import { Table, InputNumber, Button, Typography, Space, Tag, Select, Divider, message, Card, DatePicker, Input, Row, Col, Upload, Popconfirm } from "antd";
import { FireOutlined, RocketOutlined, NotificationOutlined, UploadOutlined, StopOutlined, UnorderedListOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { useProductsQuery } from "../../products/hooks/use-products-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories, createCampaignApi, getActiveCampaignApi, deactivateCampaignApi, getAllCampaignsApi } from "../../products/api/product.api"; 

import { deleteCampaignApi } from "../../products/api/product.api";
import { DeleteOutlined } from "@ant-design/icons"; 
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const AdminCampaignsPage = () => {
  const { data, isPending } = useProductsQuery({ page: 1, limit: 100 });
  const products = data?.items || [];
  const queryClient = useQueryClient();
  
  const { data: categoriesData } = useQuery({ queryKey: ["admin-categories"], queryFn: getCategories });
  const categories: any[] = (categoriesData as any[]) || [];

  const { data: activeCampaign } = useQuery({
    queryKey: ["active-campaign-admin"],
    queryFn: getActiveCampaignApi,
  });

  const { data: allCampaigns, isPending: isCampaignsPending } = useQuery({
    queryKey: ["all-campaigns-admin"],
    queryFn: getAllCampaignsApi,
  });

  const [eventName, setEventName] = useState("");
  const [eventDates, setEventDates] = useState<any>(null);
  const [bannerUrl, setBannerUrl] = useState(""); 
  const [targetType, setTargetType] = useState<'category' | 'random'>('category');
  const [targetValue, setTargetValue] = useState<string>(''); 
  const [campaignDiscount, setCampaignDiscount] = useState<number>(0);
  
  const [isDeploying, setIsDeploying] = useState(false);

  const handleImageUpload = async (info: any) => {
    if (info.file.status === 'uploading') return;
    try {
      const file = info.file.originFileObj || info.file;
      const base64String = await getBase64(file);
      setBannerUrl(base64String);
      message.success("Tải ảnh lên thành công!");
    } catch (error) {
      message.error("Có lỗi khi đọc file ảnh!");
    }
  };

  const handleDeployCampaign = async () => {
    if (!eventName || !eventDates || !campaignDiscount || !targetValue) {
      message.error("Vui lòng điền đầy đủ thông tin chiến dịch!");
      return;
    }

    setIsDeploying(true);
    message.loading({ content: 'Đang khởi tạo sự kiện...', key: 'campaign', duration: 0 });

    try {
      let targetProducts: any[] = [];
      if (targetType === 'category') {
        targetProducts = products.filter((p: any) => p.productCategoryId === targetValue);
      } else if (targetType === 'random') {
        const available = products.filter((p: any) => !p.discountPercentage);
        targetProducts = [...available].sort(() => 0.5 - Math.random()).slice(0, Number(targetValue));
      }

      if (targetProducts.length === 0) throw new Error("Không tìm thấy sản phẩm nào để áp dụng Sale!");

      await createCampaignApi({
        name: eventName,
        startTime: eventDates[0].toISOString(),
        endTime: eventDates[1].toISOString(),
        bannerUrl: bannerUrl,
        discount: campaignDiscount,
        productIds: targetProducts.map(p => p.id)
      });

      message.destroy();
      message.success({ content: `Đã kích hoạt chiến dịch "${eventName}" thành công!`, key: 'campaign', duration: 4 });
      
      setEventName(""); setEventDates(null); setBannerUrl(""); setTargetValue(""); setCampaignDiscount(0);

      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["active-campaign-admin"] });
      queryClient.invalidateQueries({ queryKey: ["all-campaigns-admin"] }); // Load lại bảng chiến dịch
      setIsDeploying(false);

    } catch (error: any) {
      message.destroy();
      message.error({ content: error.message || "Lỗi từ Server!", key: 'campaign' });
      setIsDeploying(false);
    }
  };

const handleStopCampaign = async (id: string) => {
    try {
      message.loading({ content: 'Đang tắt chiến dịch...', key: 'stop' });
      await deactivateCampaignApi(id); // Truyền id xuống API
      message.success({ content: "Đã kết thúc chiến dịch sớm thành công!", key: 'stop' });
      
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["active-campaign-admin"] });
      queryClient.invalidateQueries({ queryKey: ["all-campaigns-admin"] });
    } catch (error: any) {
      message.error({ content: error.message || "Không thể tắt chiến dịch!", key: 'stop' });
    }
  };
  const campaignColumns = [
    { title: 'Tên chiến dịch', dataIndex: 'name', key: 'name', render: (text: string) => <Text strong>{text}</Text> },
    { 
      title: 'Thời gian diễn ra', 
      key: 'time', 
      render: (_:any, record: any) => (
        <div className="text-sm">
          <div><Text type="secondary">Từ:</Text> {dayjs(record.startTime).format("DD/MM/YYYY HH:mm")}</div>
          <div><Text type="secondary">Đến:</Text> {dayjs(record.endTime).format("DD/MM/YYYY HH:mm")}</div>
        </div>
      ) 
    },
    { title: 'Mức giảm', dataIndex: 'discount', key: 'discount', render: (val: number) => <Tag color="red">{val}%</Tag> },
    { 
      title: 'Trạng thái', 
      key: 'status', 
      render: (_:any, record: any) => {
        const now = new Date();
        const start = new Date(record.startTime);
        const end = new Date(record.endTime);
        
        if (now > end) return <Tag color="default">Đã kết thúc</Tag>;
        
        if (now < start) return <Tag color="blue">Sắp diễn ra</Tag>;
        
        if (!record.isActive) return <Tag color="red">Đã bị dừng</Tag>;
        
        return <Tag color="green" className="animate-pulse">Đang chạy</Tag>;
      }
    },
{
      title: 'Thao tác',
      key: 'action',
      render: (_:any, record: any) => {
        const now = new Date();
        const start = new Date(record.startTime);
        const end = new Date(record.endTime);
        const isRunning = record.isActive && now >= start && now <= end;

        return isRunning ? (
          <Popconfirm title="Dừng chiến dịch này?" description="Sản phẩm sẽ quay về giá gốc ngay lập tức." onConfirm={() => handleStopCampaign(record.id)} okText="Dừng" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button danger size="small" icon={<StopOutlined />}>Dừng ngay</Button>
          </Popconfirm>
        ) : (
          <Popconfirm title="Xóa chiến dịch này?" description="Hành động này không thể hoàn tác." onConfirm={() => handleDeleteCampaign(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button danger size="small" icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        );
      }  
  }
  ];

  return (
    <div className="bg-[#f5f5f5] min-h-screen p-6 animate-in">
      <div className="max-w-6xl mx-auto">
        <Title level={3} className="!mb-6"><RocketOutlined className="text-[#EE6AA7] mr-2" />Trung Tâm Quản Lý Chiến Dịch</Title>

        <Card className="mb-6 shadow-sm border-t-4 border-t-[#EE6AA7]">
          <Title level={4} className="!mb-4 !text-gray-700">Tạo Sự Kiện Khuyến Mãi Mới</Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div className="space-y-4">
                <div><Text strong>Tên sự kiện (VD: Siêu Sale Đôi 6/6):</Text><Input placeholder="Nhập tên chương trình..." value={eventName} onChange={e => setEventName(e.target.value)} className="mt-1" /></div>
                <div><Text strong>Thời gian diễn ra:</Text><RangePicker showTime className="w-full mt-1" value={eventDates} onChange={val => setEventDates(val)} /></div>
                <div>
                  <Text strong className="block mb-2">Tải ảnh Banner thông báo:</Text>
                  <Upload accept="image/*" showUploadList={false} customRequest={({ onSuccess }) => setTimeout(() => onSuccess?.("ok"), 0)} onChange={handleImageUpload}>
                    {bannerUrl ? (
                      <div className="relative group cursor-pointer border-2 border-dashed border-gray-300 rounded-lg overflow-hidden h-32 flex items-center justify-center">
                        <img src={bannerUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <Button icon={<UploadOutlined />} className="w-full h-20 border-dashed border-2">Chọn ảnh từ máy tính</Button>
                    )}
                  </Upload>
                </div>
              </div>
            </Col>
            
            <Col xs={24} md={12}>
              <div className="space-y-4 p-4 bg-pink-50 rounded-lg border border-pink-100">
                <Text strong className="text-[#EE6AA7]"><FireOutlined /> Cấu hình Sản phẩm áp dụng</Text>
                <div>
                  <Text className="block mb-1">Hình thức chọn sản phẩm:</Text>
                  <Select value={targetType} onChange={(val) => { setTargetType(val); setTargetValue(''); }} className="w-full">
                    <Select.Option value="category">Sale toàn bộ theo Danh mục</Select.Option>
                    <Select.Option value="random">Sale ngẫu nhiên (Số lượng cụ thể)</Select.Option>
                  </Select>
                </div>
                <div>
                  <Text className="block mb-1">{targetType === 'category' ? 'Chọn danh mục:' : 'Nhập số lượng sản phẩm ngẫu nhiên:'}</Text>
                  {targetType === 'category' ? (
                    <Select showSearch placeholder="VD: Sữa rửa mặt" className="w-full" value={targetValue} onChange={setTargetValue} options={categories.map((c: any) => ({ value: c.id, label: c.title }))} filterOption={(input, option) => String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())} />
                  ) : (
                    <InputNumber min={1} max={100} className="w-full" placeholder="VD: 10" value={Number(targetValue)} onChange={val => setTargetValue(String(val))} />
                  )}
                </div>
                <div>
                  <Text className="block mb-1">Mức giảm giá đồng loạt:</Text>
                  <InputNumber min={1} max={100} formatter={val => `${val}%`} parser={val => Number(val!.replace('%', ''))} className="w-full" size="large" value={campaignDiscount} onChange={val => setCampaignDiscount(val || 0)} />
                </div>
              </div>
            </Col>
          </Row>
          <Divider />
          <div className="flex justify-end"><Button type="primary" size="large" className="bg-[#EE6AA7] hover:bg-pink-600 font-bold px-8" icon={<NotificationOutlined />} loading={isDeploying} onClick={handleDeployCampaign}>Kích Hoạt Sự Kiện Ngay</Button></div>
        </Card>

        <Card title={<Space><UnorderedListOutlined /> <Text strong>Danh sách Chiến dịch</Text></Space>} className="shadow-sm mb-6">
          <Table 
            dataSource={allCampaigns || []} 
            rowKey="id" 
            loading={isCampaignsPending}
            pagination={{ pageSize: 5 }}
            columns={campaignColumns}
            locale={{ emptyText: "Chưa có chiến dịch nào được tạo." }}
          />
        </Card>

        <Card title="Danh sách sản phẩm hệ thống" className="shadow-sm">
          <Table 
            dataSource={products} 
            rowKey="id" 
            loading={isPending}
            pagination={{ pageSize: 5 }}
            columns={[
              { title: 'Sản phẩm', render: (_, r: any) => <Space><img src={r.thumbnail} alt="thumb" className="w-8 h-8 rounded" />{r.title}</Space> },
              { title: 'Giá gốc', render: (_, r: any) => new Intl.NumberFormat('vi-VN').format(r.price) + 'đ' },
              { title: 'Trạng thái Sale', render: (_, r: any) => r.discountPercentage > 0 ? <Tag color="magenta">Đang Sale {r.discountPercentage}%</Tag> : <Tag>Không</Tag> }
            ]}
          />
        </Card>

      </div>
    </div>
  );
};

const handleDeleteCampaign = async (id: string) => {
    try {
      message.loading({ content: 'Đang xóa chiến dịch...', key: 'delete' });
      await deleteCampaignApi(id);
      message.success({ content: "Đã xóa chiến dịch thành công!", key: 'delete' });
      
      useQueryClient().invalidateQueries({ queryKey: ["all-campaigns-admin"] });
    } catch (error: any) {
      message.error({ content: "Không thể xóa chiến dịch!", key: 'delete' });
    }
  };