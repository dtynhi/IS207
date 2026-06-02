import { useState } from "react";
import {
  Table, Button, Typography, Space, Tag, Modal, Form,
  DatePicker, Select, Popconfirm, message, Empty, Spin, Badge, Tabs, InputNumber
} from "antd";
import {
  FireOutlined, PlusOutlined, DeleteOutlined,
  ClockCircleOutlined, ThunderboltOutlined, AppstoreOutlined
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  getAllFlashSaleSessionsApi,
  createFlashSaleSessionApi,
  deleteFlashSaleSessionApi,
  updateFlashSaleStatusApi,
  getCategories,
  removeProductFromFlashSaleApi, 
} from "../../products/api/product.api";
import { useProductsQuery } from "../../products/hooks/use-products-query";
import type { FlashSaleSession } from "../../products/types/product.types";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const STATUS_CONFIG = {
  ONGOING:  { label: "Đang diễn ra", color: "red",     badge: "processing" as const },
  UPCOMING: { label: "Sắp bắt đầu",  color: "orange",  badge: "warning" as const },
  ENDED:    { label: "Đã kết thúc",  color: "default", badge: "default" as const },
};

function formatDT(iso: string) {
  return dayjs(iso).format("DD/MM/YYYY HH:mm");
}

export const AdminFlashSalePage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [saleType, setSaleType] = useState<"manual" | "category" | "random" | "all">("manual");
  const [selectedCategoryModal, setSelectedCategoryModal] = useState<string | undefined>(undefined);
  const [randomCountModal, setRandomCountModal] = useState<number>(10);
  const [manualSelectedIds, setManualSelectedIds] = useState<string[]>([]);

  const { data: sessions = [], isPending: isSessionsPending } = useQuery<FlashSaleSession[]>({
    queryKey: ["admin-flash-sale-sessions"],
    queryFn: getAllFlashSaleSessionsApi,
  });

  const { data: productsData, isPending: isProductsPending } = useProductsQuery({ page: 1, limit: 100 });  
  const allProducts = productsData?.items || [];

  // Lấy danh sách danh mục
  const { data: categories = [] } = useQuery({ 
    queryKey: ["categories"], 
    queryFn: getCategories 
  });

  const createMutation = useMutation({
    mutationFn: createFlashSaleSessionApi,
    onSuccess: () => {
      message.success("Tạo ca Flash Sale thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-flash-sale-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["flash-sale-sessions"] });
      setIsModalOpen(false);
      resetModalState();
    },
    onError: () => message.error("Có lỗi xảy ra, vui lòng thử lại."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFlashSaleSessionApi,
    onSuccess: () => {
      message.success("Đã xóa ca Flash Sale.");
      queryClient.invalidateQueries({ queryKey: ["admin-flash-sale-sessions"] });
    },
    onError: () => message.error("Xóa thất bại."),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "UPCOMING" | "ONGOING" | "ENDED" }) =>
      updateFlashSaleStatusApi(id, status),
    onSuccess: () => {
      message.success("Cập nhật trạng thái thành công.");
      queryClient.invalidateQueries({ queryKey: ["admin-flash-sale-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["flash-sale-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["flash-sale-active"] });
    },
    onError: () => message.error("Cập nhật thất bại."),
  });

  const removeProductMutation = useMutation({
    mutationFn: ({ sessionId, productId }: { sessionId: string; productId: string }) =>
      removeProductFromFlashSaleApi({ sessionId, productId }),
    onSuccess: () => {
      message.success("Đã gỡ sản phẩm khỏi ca Flash Sale!");
      queryClient.invalidateQueries({ queryKey: ["admin-flash-sale-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["flash-sale-active"] });
    },
    onError: () => message.error("Có lỗi xảy ra khi gỡ sản phẩm!"),
  });

  const resetModalState = () => {
    form.resetFields();
    setSaleType("manual");
    setManualSelectedIds([]);
    setSelectedCategoryModal(undefined);
    setRandomCountModal(10);
  };

  const handleCreate = () => {
    form.validateFields(["timeRange"]).then((values) => {
      const [start, end] = values.timeRange;
      let finalProductIds: string[] = [];

      // Logic lọc sản phẩm theo Tab Admin đang chọn
      if (saleType === "manual") {
        finalProductIds = manualSelectedIds;
      } else if (saleType === "all") {
        finalProductIds = allProducts.map((p: any) => p.id);
      } else if (saleType === "category") {
        if (!selectedCategoryModal) {
          message.warning("Vui lòng chọn danh mục!");
          return;
        }
        finalProductIds = allProducts.filter((p: any) => p.productCategoryId === selectedCategoryModal).map((p: any) => p.id);
      } else if (saleType === "random") {
        const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
        finalProductIds = shuffled.slice(0, randomCountModal).map((p: any) => p.id);
      }

      if (finalProductIds.length === 0) {
        message.warning("Không có sản phẩm nào được chọn để đưa vào Flash Sale!");
        return;
      }

      createMutation.mutate({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        productIds: finalProductIds,
      });
    });
  };

  const columns = [
    {
      title: "Khung giờ",
      key: "time",
      render: (_: any, record: FlashSaleSession) => (
        <Space direction="vertical" size={0}>
          <Text strong className="text-base">
            {dayjs(record.startTime).format("HH:mm")} – {dayjs(record.endTime).format("HH:mm")}
          </Text>
          <Text type="secondary" className="text-xs">{formatDT(record.startTime)}</Text>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: keyof typeof STATUS_CONFIG) => {
        const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.ENDED;
        return (
          <Badge status={cfg.badge} text={
            <Tag color={cfg.color} className="font-semibold">{cfg.label}</Tag>
          } />
        );
      },
    },
    {
      title: "Số sản phẩm",
      key: "products",
      render: (_: any, record: FlashSaleSession) => (
        <Tag icon={<FireOutlined />} color="volcano">
          {record.products?.length ?? 0} sản phẩm
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: FlashSaleSession) => (
        <Space>
          {record.status === "UPCOMING" && (
            <Popconfirm
              title="Bật ca này lên ONGOING ngay?"
              onConfirm={() => statusMutation.mutate({ id: record.id, status: "ONGOING" })}
            >
              <Button size="small" type="primary" icon={<ThunderboltOutlined />}>
                Bật ngay
              </Button>
            </Popconfirm>
          )}
          {record.status === "ONGOING" && (
            <Popconfirm
              title="Kết thúc ca Flash Sale này?"
              onConfirm={() => statusMutation.mutate({ id: record.id, status: "ENDED" })}
            >
              <Button size="small" danger>Kết thúc</Button>
            </Popconfirm>
          )}

          <Popconfirm
            title="Xóa ca Flash Sale này?"
            description="Sản phẩm sẽ được tháo khỏi ca, thao tác không hoàn tác được."
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (session: FlashSaleSession) => {
    if (!session.products?.length) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có sản phẩm nào." />;
    }
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 py-3 px-1">
        {session.products.map((p) => {
          // Tính toán giá sau khi giảm để hiển thị cho Admin xem
          const finalPrice = Math.floor(p.price * (1 - p.discountPercentage / 100));

          return (
            // Thêm className "relative group" để bắt sự kiện rê chuột
            <div key={p.id} className="relative group bg-white border border-gray-200 rounded-xl p-3 flex flex-col items-center gap-2 shadow-sm hover:border-red-300 hover:shadow-md transition-all">
              
              {/* Nút Xóa lơ lửng góc phải (Chỉ hiện khi rê chuột) */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <Popconfirm
                  title="Gỡ sản phẩm này?"
                  description="Sản phẩm sẽ bị loại khỏi ca Flash Sale."
                  onConfirm={() => removeProductMutation.mutate({ sessionId: session.id, productId: p.id })}
                  okText="Gỡ luôn"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true, loading: removeProductMutation.isPending }}
                >
                  <Button danger type="primary" shape="circle" icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
              </div>

              {/* Ảnh sản phẩm */}
              <img
                src={p.thumbnail ?? "https://placehold.co/80x80/e2e8f0/64748b?text=?"}
                alt={p.title}
                className="w-16 h-16 object-contain rounded-md"
                onError={(e) => { e.currentTarget.src = "https://placehold.co/80x80/e2e8f0/64748b?text=?"; }}
              />
              
              {/* Tên sản phẩm */}
              <span className="text-xs font-medium text-center line-clamp-2 w-full text-gray-700" title={p.title}>
                {p.title}
              </span>

              {/* KHU VỰC HIỂN THỊ GIÁ TIỀN & % GIẢM */}
              <div className="w-full mt-auto pt-2 border-t border-gray-100 flex flex-col items-center bg-gray-50/50 rounded-lg pb-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-red-600 font-bold text-[15px]">
                    {finalPrice.toLocaleString('vi-VN')}đ
                  </span>
                  <Tag color="red" className="m-0 text-[10px] font-bold px-1.5 border-none leading-tight py-0.5 shadow-sm">
                    -{p.discountPercentage}%
                  </Tag>
                </div>
                {p.discountPercentage > 0 && (
                  <span className="text-[11px] text-gray-400 line-through">
                    {p.price.toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm animate-in">
      {/* Header */}
      <div className="mb-6 border-b pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <Title level={3} className="!mb-1 flex items-center gap-2">
            <ThunderboltOutlined className="text-red-500" />
            Quản lý Flash Sale theo Ca
          </Title>
          <Text type="secondary">
            Tạo các ca Flash Sale theo khung giờ. Hệ thống tự động chuyển trạng thái.
          </Text>
        </div>
        <Button
          type="primary"
          danger
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setIsModalOpen(true)}
        >
          Tạo ca mới
        </Button>
      </div>

      {/* Bảng danh sách ca */}
      {isSessionsPending ? (
        <div className="flex justify-center py-10"><Spin size="large" /></div>
      ) : sessions.length === 0 ? (
        <Empty description="Chưa có ca Flash Sale nào. Hãy tạo ca đầu tiên!" />
      ) : (
        <Table
          columns={columns}
          dataSource={sessions}
          rowKey="id"
          expandable={{ expandedRowRender }}
          pagination={{ pageSize: 10 }}
          rowClassName={(record) =>
            record.status === "ONGOING" ? "bg-red-50" : ""
          }
        />
      )}

      <Modal
        title={
          <Space>
            <ThunderboltOutlined className="text-red-500" />
            <span className="font-bold text-lg">Tạo ca Flash Sale mới</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); resetModalState(); }}
        onOk={handleCreate}
        okText="Kích hoạt ca"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: createMutation.isPending }}
        width={750}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="timeRange"
            label={<span className="font-semibold flex items-center gap-1 text-[16px]"><ClockCircleOutlined /> 1. Khung giờ Flash Sale</span>}
            rules={[{ required: true, message: "Vui lòng chọn khung giờ!" }]}
          >
            <RangePicker
              showTime={{ format: "HH:mm" }}
              format="DD/MM/YYYY HH:mm"
              placeholder={["Giờ bắt đầu", "Giờ kết thúc"]}
              className="w-full"
              size="large"
            />
          </Form.Item>

          <div className="mt-6 mb-2 font-semibold flex items-center gap-1 text-[16px]">
            <FireOutlined className="text-red-500" /> 2. Chọn sản phẩm tham gia
          </div>
          
          <Tabs 
            type="card"
            activeKey={saleType}
            onChange={(key: any) => setSaleType(key)}
            items={[
              {
                key: "manual",
                label: "Chọn thủ công",
                children: (
                  <div className="p-4 border border-gray-200 rounded-b-lg border-t-0 bg-gray-50/50">
                    <Text className="block mb-2">Tìm và tích chọn từng sản phẩm cụ thể:</Text>
                    <Select
                      mode="multiple"
                      placeholder="Gõ tên sản phẩm..."
                      loading={isProductsPending}
                      showSearch
                      value={manualSelectedIds}
                      onChange={setManualSelectedIds}
                      filterOption={(input, option) =>
                        String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                      }
                      options={allProducts.map((p: any) => ({
                        value: p.id,
                        label: p.title,
                      }))}
                      className="w-full"
                      size="large"
                      maxTagCount={5}
                    />
                  </div>
                )
              },
              {
                key: "category",
                label: "Theo Danh mục",
                children: (
                  <div className="p-4 border border-gray-200 rounded-b-lg border-t-0 bg-gray-50/50">
                    <Text className="block mb-2">Tự động lùa <strong className="text-red-500">TẤT CẢ</strong> sản phẩm thuộc danh mục này vào Ca Sale:</Text>
                    <Select 
                      className="w-full" 
                      placeholder="Chọn Danh mục..." 
                      allowClear
                      showSearch
                      size="large"
                      value={selectedCategoryModal}
                      onChange={setSelectedCategoryModal}
                      options={(categories as any[]).map((c: any) => ({ value: c.id, label: c.title }))}
                      filterOption={(input, option) =>
                        String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </div>
                )
              },
              {
                key: "random",
                label: "Chọn ngẫu nhiên",
                children: (
                  <div className="p-4 border border-gray-200 rounded-b-lg border-t-0 bg-gray-50/50">
                    <Text className="block mb-2">Hệ thống sẽ bốc ngẫu nhiên số lượng sản phẩm bạn nhập bên dưới:</Text>
                    <InputNumber 
                      min={1} 
                      max={allProducts.length || 100} 
                      value={randomCountModal} 
                      onChange={(v) => setRandomCountModal(v || 10)} 
                      addonBefore="Bốc ngẫu nhiên:"
                      addonAfter={`/ Tổng ${allProducts.length} SP`}
                      className="w-full"
                      size="large"
                    />
                  </div>
                )
              },
              {
                key: "all",
                label: "Chọn TẤT CẢ",
                children: (
                  <div className="p-6 border border-red-200 bg-red-50 rounded-b-lg border-t-0 text-center">
                    <AppstoreOutlined className="text-red-500 text-3xl mb-2" />
                    <br/>
                    <Text strong className="text-red-600 text-[15px]">Chú ý: Bạn đang đưa TOÀN BỘ kho hàng vào ca Sale này!</Text>
                  </div>
                )
              }
            ]}
          />

          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
            <strong>Lưu ý:</strong> Hệ thống sẽ <strong>tự động chọn ngẫu nhiên mức giảm giá từ 5% đến 10%</strong> cho từng sản phẩm tham gia ca Flash Sale này!
          </div>
        </Form>
      </Modal>
    </div>
  );
};