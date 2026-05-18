import { useState } from "react";
import { Table, InputNumber, Button, message, Typography, Space, Tag, Input } from "antd";
import { FireOutlined, SaveOutlined } from "@ant-design/icons";
import { useProductsQuery } from "../../products/hooks/use-products-query";
//Import hook chìa khóa của team
import { useAdminProducts } from "../hooks/use-admin-products";
const { Title, Text } = Typography;

export const AdminFlashSalePage = () => {
  const { data, isPending } = useProductsQuery({ page: 1, limit: 100 });
  const products = data?.items || [];
  const { updateMutation, contextHolder } = useAdminProducts();
  const [editingDiscounts, setEditingDiscounts] = useState<Record<string, number>>({});
  const [searchText, setSearchText] = useState("");

  const handleDiscountChange = (productId: string, value: number | null) => {
    setEditingDiscounts(prev => ({ ...prev, [productId]: value || 0 }));
  };

const handleSave = (productId: string) => {
    const newDiscount = editingDiscounts[productId];
    
    updateMutation.mutate({
      id: productId,
      payload: { 
        discountPercentage: newDiscount // Gửi số bình thường (0, 10, 20...)
      }
    });
  };
  
  const filteredProducts = products.filter((product: any) => 
    product.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <Space>
          <img src={record.thumbnail} alt="thumb" className="w-10 h-10 object-cover rounded border border-gray-100" />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Giá gốc',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <Text type="secondary" className="line-through">
          {new Intl.NumberFormat('vi-VN').format(price)} đ
        </Text>
      )
    },
    // ĐÂY LÀ CỘT MỚI THÊM: Tính toán và hiển thị giá sau giảm lập tức
    {
      title: 'Giá sau giảm',
      key: 'finalPrice',
      render: (_: any, record: any) => {
        // Lấy % giảm giá đang gõ, nếu không gõ thì lấy % hiện tại của sản phẩm
        const currentDiscount = editingDiscounts[record.id] ?? record.discountPercentage ?? 0;
        
        // Công thức tính giá mới: Giá gốc * (1 - phần trăm / 100)
        const finalPrice = record.price * (1 - currentDiscount / 100);
        
        return (
          <Text className="text-red-600 font-bold text-[16px]">
            {new Intl.NumberFormat('vi-VN').format(finalPrice)} đ
          </Text>
        );
      }
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: any) => {
        const currentDiscount = editingDiscounts[record.id] ?? record.discountPercentage;
        return currentDiscount > 0 
          ? <Tag color="red" icon={<FireOutlined />}>Đang Sale {currentDiscount}%</Tag>
          : <Tag color="default">Không Sale</Tag>;
      }
    },
    {
      title: 'Thiết lập % Giảm',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <InputNumber
            min={0}
            max={100}
            formatter={value => `${value}%`}
            parser={value => value!.replace('%', '')}
            defaultValue={record.discountPercentage}
            onChange={(val) => handleDiscountChange(record.id, val)}
          />
          <Button 
            type="primary" 
            icon={<SaveOutlined />}
            onClick={() => handleSave(record.id)}
            disabled={editingDiscounts[record.id] === undefined}
          >
            Lưu
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm animate-in">{contextHolder}
      <div className="mb-6 border-b pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <Title level={3} className="!mb-1">
            <FireOutlined className="text-red-500 mr-2" />
            Quản lý Flash Sale
          </Title>
          <Text type="secondary">Cài đặt % giảm giá để tự động đưa sản phẩm ra trang Khuyến mãi.</Text>
        </div>
        
        <div className="w-full sm:w-72">
          <Input.Search 
            placeholder="Tìm tên sản phẩm..." 
            allowClear 
            onChange={(e) => setSearchText(e.target.value)}
            size="large"
          />
        </div>
      </div>

      <Table 
        columns={columns} 
        dataSource={filteredProducts} 
        rowKey="id" 
        loading={isPending}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};