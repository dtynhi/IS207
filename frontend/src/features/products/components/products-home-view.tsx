import { AppstoreOutlined, BulbOutlined, ClockCircleOutlined, FireOutlined, StarOutlined } from "@ant-design/icons";
import { Card, Empty, Pagination, Space, Typography, Modal, Tag } from "antd";
import { useState, type ReactNode } from "react";
import type { SetURLSearchParams } from "react-router-dom";
import { ProductCard } from "./product-card";
import { ProductLoadingGrid } from "./product-loading-grid";
import type { Product } from "../types/product.types";
import { FlashSaleCard } from "../../flash-sale/components/flash-sale-card";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getActiveCampaignApi } from "../api/product.api";

const { Text } = Typography;

type DisplayCategory = {
  id: string;
  title: string;
  slug: string;
  icon?: ReactNode; 
  image?: string;   
  source: "admin" | "suggestion";
};

type ProductsHomeViewProps = {
  countdown: { h: string; m: string; s: string };
  displayCats: DisplayCategory[];
  flashSaleProducts: Product[];
  bestSellers: Product[];
  productsPending: boolean;
  products: Product[];
  page: number;
  limit: number;
  totalItems: number;
  onPickCategory: (category: DisplayCategory) => void;
  onSetPageParams: SetURLSearchParams;
};

export const ProductsHomeView = ({
  countdown,
  displayCats,
  flashSaleProducts,
  bestSellers,
  productsPending,
  products,
  page,
  limit,
  totalItems,
  onPickCategory,
  onSetPageParams,
}: ProductsHomeViewProps) => {

  const navigate = useNavigate();
  const { data: activeCampaign } = useQuery({
    queryKey: ["active-campaign"],
    queryFn: getActiveCampaignApi,
  });

  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  return (
    <div className="animate-in pt-5 pb-6">
      
      {/* KHỐI DANH MỤC */}
      <Card 
        title={<Space><AppstoreOutlined className="!text-xl" /><Text strong className="!text-xl">Danh mục</Text></Space>} 
        styles={{ header: { backgroundColor: '#76EEC6' }, body: { padding: "20px 16px 24px" } }} 
        className="mb-4 overflow-hidden"
      >
        <div className="um-cat-grid flex flex-wrap gap-4 justify-center">
          {displayCats.map((cat) => (
            <div key={cat.id} className="um-cat-item cursor-pointer text-center flex flex-col items-center gap-2" onClick={() => onPickCategory(cat)}>
              <div className="um-cat-icon flex items-center justify-center">
                {cat.image ? (
                  <img src={cat.image} alt={cat.title} className="w-[60px] h-[60px] object-cover rounded-full shadow-sm border border-gray-100" />
                ) : (
                  <div className="text-3xl">{cat.icon}</div>
                )}
              </div>
              <div className="um-cat-name font-bold text-[15px]">{cat.title}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* KHỐI FLASH SALE */}
      {flashSaleProducts.length > 0 && (
        <Card
          title={
            <div className="um-flash-head flex items-center gap-4">
              <Space><FireOutlined className="text-[var(--sale)] !text-xl" /><Text strong className="um-flash-title !text-xl">FLASH SALE</Text></Space>
              <div className="um-countdown flex items-center">
                <Text className="um-countdown-box">{countdown.h}</Text><Text className="um-countdown-divider">:</Text>
                <Text className="um-countdown-box">{countdown.m}</Text><Text className="um-countdown-divider">:</Text>
                <Text className="um-countdown-box">{countdown.s}</Text><ClockCircleOutlined className="ml-2" />
              </div>
            </div>
          }
          extra={<Link to="/flash-sale" className="px-4 py-1.5 rounded-full border border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white transition-colors text-sm font-medium">Xem tất cả &gt;</Link>}
          styles={{ body: { padding: "12px 16px 20px" } }}
          className="mb-4"
        >
          <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar scroll-smooth px-2 sm:px-0">
            {flashSaleProducts.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-[140px] md:w-[190px]">
                <FlashSaleCard product={product} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* KHỐI CHIẾN DỊCH KHUYẾN MÃI (NẾU CÓ) */}
      {activeCampaign && activeCampaign.length > 0 && (
        <div className="flex flex-col gap-6 mb-8">
          {activeCampaign.map((campaign: any) => (
            <div 
              key={campaign.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-xl transition-all border border-pink-100"
              // Khi click, lưu nguyên cái cục chiến dịch đó vào state
              onClick={() => setSelectedCampaign(campaign)}
            >
              <div className="relative w-full h-auto aspect-[3/1] bg-pink-50 flex items-center justify-center overflow-hidden group">
                <span className="absolute text-pink-500 text-2xl md:text-4xl font-bold uppercase tracking-widest text-center px-4 z-0">
                  {campaign.name || "SỰ KIỆN ESMURA"}
                </span>
                <img 
                  src={campaign.bannerUrl} 
                  alt={campaign.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 z-10" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all z-20">
                  <span className="bg-white text-red-600 font-bold px-6 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                    XEM CHI TIẾT SỰ KIỆN
                  </span>
                </div>
              </div>
            </div>
          ))}          
          
          <Modal
            title={
              <div className="flex flex-col gap-1 pb-2">
                <span className="text-xl md:text-2xl text-red-600 font-extrabold uppercase tracking-tight"> 
                  {selectedCampaign?.name}
                </span>
                <Space>
                  <Tag color="red" className="font-bold border-red-200">
                    Đồng giá giảm {selectedCampaign?.discount}%
                  </Tag>
                  <Tag color="orange">
                    Kết thúc: {selectedCampaign ? new Date(selectedCampaign.endTime).toLocaleString('vi-VN') : ''}
                  </Tag>
                </Space>
              </div>
            }
            // Mở Modal nếu có chiến dịch đang được chọn
            open={!!selectedCampaign}
            // Hủy chọn chiến dịch để đóng Modal
            onCancel={() => setSelectedCampaign(null)}
            footer={null} 
            width={1000} 
            style={{ top: 20 }}
          >
            <div className="bg-red-50/50 p-4 rounded-xl mt-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="um-product-grid grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Duyệt qua sản phẩm của chiến dịch đang được chọn */}
                {selectedCampaign?.products?.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </Modal>
        </div> // 
      )}

      {/* KHỐI SẢN PHẨM NỔI BẬT */}
      {bestSellers.length > 0 && (
        <Card 
          title={<Space><StarOutlined className="!text-xl" /><Text strong className="!text-xl">Sản phẩm nổi bật</Text></Space>} 
          styles={{ header: { backgroundColor: '#76EEC6' }, body: { padding: "12px 16px 20px" } }} 
          className="mb-4 overflow-hidden"
        >
          <div className="um-product-grid">
            {bestSellers.map((product) => (<ProductCard key={product.id} product={product} />))}
          </div>
        </Card>
      )}

      {/* KHỐI GỢI Ý CHO BẠN */}
      <Card 
        id="um-suggestions" 
        title={<Space><BulbOutlined className="!text-xl" /><Text strong className="!text-xl">Gợi ý cho bạn</Text></Space>} 
        styles={{ header: { backgroundColor: '#76EEC6' }, body: { padding: productsPending || products.length === 0 ? 24 : 16 } }}
        className="overflow-hidden"
      >
        {productsPending && <ProductLoadingGrid count={10} />}
        {!productsPending && products.length === 0 && (<div className="p-10 text-center"><Empty description="Chưa có sản phẩm" /></div>)}
        {!productsPending && products.length > 0 && (
          <>
            <div className="um-product-grid">
              {products.map((product) => (<ProductCard key={product.id} product={product} />))}
            </div>
            <div className="flex justify-center pt-6">
              <Pagination
                current={page}
                pageSize={limit}
                total={totalItems}
                showSizeChanger
                pageSizeOptions={["10", "20", "30"]}
                onChange={(nextPage, nextSize) => {
                  onSetPageParams((previous) => {
                    const next = new URLSearchParams(previous);
                    next.set("page", String(nextPage));
                    next.set("limit", String(nextSize));
                    return next;
                  });
                }}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
};