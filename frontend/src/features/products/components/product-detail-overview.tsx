import { PlusOutlined, ShoppingCartOutlined, TagOutlined, ThunderboltOutlined, FireOutlined, GiftOutlined,MinusOutlined } from "@ant-design/icons";
import { Button, Descriptions, InputNumber, Tag, Typography } from "antd";
import type { Dispatch, SetStateAction } from "react";
import { Price } from "../../../shared/components/price";
import { useQuery } from "@tanstack/react-query";
import { getFlashSaleSessionsApi } from "../api/product.api"; 

const { Title, Text } = Typography;

type ProductDetailOverviewProps = {
  data: any; 
  quantity: number;
  setQuantity: Dispatch<SetStateAction<number>>;
  addCartPending: boolean;
  onAddCart: () => void;
  onBuyNow: () => void;
};

export const ProductDetailOverview = ({
  data,
  quantity,
  setQuantity,
  addCartPending,
  onAddCart,
  onBuyNow,
}: ProductDetailOverviewProps) => {
  
  const { data: sessions = [] } = useQuery({
    queryKey: ["flash-sale-sessions"],
    queryFn: getFlashSaleSessionsApi,
  });

  const activeFlashSale = sessions.find(
    (s: any) => s.status === "ONGOING" && s.products?.some((p: any) => p.id === data.id)
  );

  const upcomingFlashSale = sessions.find(
    (s: any) => s.status === "UPCOMING" && s.products?.some((p: any) => p.id === data.id)
  );

  // 2. Logic Giá Hiện Tại
  const isUpcomingCampaign = data.isUpcomingCampaign;
  const effectiveDiscount = data.discountPercentage || 0;
  const price = Math.floor(data.price * (1 - effectiveDiscount / 100));

  return (
    <div className="um-surface flex flex-wrap gap-8 p-7 max-md:gap-5 max-md:p-4">
      
      {/* ẢNH SẢN PHẨM */}
      <div className="w-[400px] shrink-0 max-md:w-full relative">
        {data.thumbnail ? (
          <img src={data.thumbnail} alt={data.title} className="aspect-square w-full rounded-[14px] object-cover shadow-sm border border-gray-100" />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,var(--primary-soft),var(--primary-light))] text-[80px] opacity-40">
            <TagOutlined />
          </div>
        )}
      </div>

      <div className="min-w-[280px] flex-1 flex flex-col">
        <Title level={3} className="!mb-4">{data.title}</Title>

        <div className="flex flex-col gap-3 mb-5">
          {activeFlashSale && (
            <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-xl flex items-start gap-3">
              <FireOutlined className="text-red-500 text-xl mt-0.5" />
              <div className="flex flex-col">
                <Text className="text-red-800 font-bold text-[15px]">Đang trong khung giờ Flash Sale!</Text>
                <Text className="text-red-600 text-sm">Nhanh tay mua ngay với giá siêu giảm trước khi kết thúc.</Text>
              </div>
            </div>
          )}

          {upcomingFlashSale && !activeFlashSale && (
            <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-xl flex items-start gap-3">
              <ThunderboltOutlined className="text-blue-500 text-xl mt-0.5" />
              <div className="flex flex-col">
                <Text className="text-blue-800 font-bold text-[15px]">Sắp diễn ra Flash Sale!</Text>
                <Text className="text-blue-600 text-sm">
                  Sẽ sốc sẽ mở lúc <span className="font-extrabold text-red-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-red-100">{new Date(upcomingFlashSale.startTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</span>
                </Text>
              </div>
            </div>
          )}

          {isUpcomingCampaign && (
            <div className="bg-purple-50 border border-purple-200 px-4 py-3 rounded-xl flex items-start gap-3">
              <GiftOutlined className="text-purple-500 text-xl mt-0.5" />
              <div className="flex flex-col">
                <Text className="text-purple-800 font-bold text-[15px]">Sắp có Sự Kiện Khuyến Mãi Lớn!</Text>
                <Text className="text-purple-600 text-sm">
                  Giá sốc sẽ mở lúc <span className="font-extrabold text-red-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-red-100">{new Date(data.campaignStartTime).toLocaleString("vi-VN")}</span>. Bạn có thể chốt đơn ngay bây giờ hoặc chờ săn deal!
                </Text>
              </div>
            </div>
          )}
        </div>

        {/* KHU VỰC HIỂN THỊ GIÁ THẬT */}
        <div className="mb-6 rounded-[14px] bg-[linear-gradient(135deg,#FFF5F5,#FEF2F2)] px-6 py-5">
          <div className="flex items-center">
            <Price value={price} old={effectiveDiscount > 0 ? data.price : undefined} size="xl" />
            {effectiveDiscount > 0 && <Tag color="red" className="ml-3 font-semibold text-sm">-{effectiveDiscount}%</Tag>}
          </div>

          {/* GIÁ CHIẾN DỊCH BỊ CHE */}
          {isUpcomingCampaign && (
            <div className="mt-4 pt-4 border-t border-red-200 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <span className="text-red-800 font-bold text-sm">Giá Sự kiện sắp tới:</span>
                  <span className="text-red-500 font-black text-2xl tracking-widest">đ ?.?00</span>
               </div>
               <Tag color="purple" className="border-none font-bold text-sm">CHỜ GIÁ SỐC</Tag>
            </div>
          )}
        </div>

        <Descriptions size="small" column={1} className="mb-5" items={[
          {
            key: "status",
            label: "Tình trạng",
            children: <Tag color={data.status === "active" ? "green" : "default"}>{data.status === "active" ? "Đang bán" : "Ngưng bán"}</Tag>,
          },
          { key: "stock", label: "Kho hàng", children: data.stock > 0 ? `${data.stock} sản phẩm` : "Hết hàng" },
          ...(data.brand ? [{ key: "brand", label: "Brand", children: data.brand }] : []),
        ]} />

        <div className="mb-7 flex items-center gap-4">
          <Text className="w-[110px] shrink-0 text-[var(--text-muted)]">Số lượng</Text>
          <InputNumber 
            min={1} 
            max={data.stock || 99} 
            value={quantity} 
            onChange={(value) => setQuantity(value || 1)} 
            addonBefore={
              <MinusOutlined 
                className="cursor-pointer px-1 hover:text-red-500 transition-colors" 
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))} 
              />
            }
            addonAfter={
              <PlusOutlined 
                className="cursor-pointer px-1 hover:text-green-500 transition-colors" 
                onClick={() => setQuantity((prev) => Math.min(data.stock || 99, prev + 1))} 
              />
            } 
          />
        </div>

        {/* NÚT MUA HÀNG*/}
        <div className="flex gap-3 mt-auto">
          <Button
            size="large"
            onClick={onAddCart}
            loading={addCartPending}
            disabled={data.stock <= 0}
            className="h-[50px] rounded-xl border-2 border-[var(--primary)] bg-[var(--primary-soft)] px-7 font-semibold text-[var(--primary)]"
            icon={<ShoppingCartOutlined />}
          >
            Thêm vào giỏ
          </Button>

          <Button 
            type="primary" 
            size="large" 
            disabled={data.stock <= 0} 
            onClick={onBuyNow} 
            className="h-[50px] rounded-xl px-10 font-semibold"
          >
            Mua ngay
          </Button>
        </div>
      </div>
    </div>
  );
};