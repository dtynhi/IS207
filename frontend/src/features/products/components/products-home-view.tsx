import { AppstoreOutlined, BulbOutlined, ClockCircleOutlined, FireOutlined, StarOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { Card, Empty, Pagination, Space, Typography, Modal, Tag, Button } from "antd";
import { useState, useEffect, type ReactNode } from "react";
import type { SetURLSearchParams } from "react-router-dom";
import { ProductCard } from "./product-card";
import { ProductLoadingGrid } from "./product-loading-grid";
import type { Product, FlashSaleSession } from "../types/product.types";
import { FlashSaleCard } from "../../flash-sale/components/flash-sale-card";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getActiveCampaignApi, getActiveFlashSaleApi } from "../api/product.api";

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
  displayCats: DisplayCategory[];
  bestSellers: Product[];
  productsPending: boolean;
  products: Product[];
  page: number;
  limit: number;
  totalItems: number;
  onPickCategory: (category: DisplayCategory) => void;
  onSetPageParams: SetURLSearchParams;
};

function useCountdown(targetIso: string | null) {
  const [timeLeft, setTimeLeft] = useState({ h: "00", m: "00", s: "00" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!targetIso) return { h: "00", m: "00", s: "00" };

  const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
  const h = String(Math.floor(diff / 3_600_000)).padStart(2, "0");
  const m = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0");
  const s = String(Math.floor((diff % 60_000) / 1_000)).padStart(2, "0");
  return { h, m, s };
}

export const ProductsHomeView = ({
  displayCats,
  bestSellers,
  productsPending,
  products,
  page,
  limit,
  totalItems,
  onPickCategory,
  onSetPageParams,
}: ProductsHomeViewProps) => {
  const { data: activeFlashSale } = useQuery<FlashSaleSession | null>({
    queryKey: ["flash-sale-active"],
    queryFn: getActiveFlashSaleApi,
    refetchInterval: 30_000,
  });

  const { data: activeCampaign } = useQuery({
    queryKey: ["active-campaign"],
    queryFn: getActiveCampaignApi,
  });

  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  const flashSaleProducts = activeFlashSale?.products ?? [];
  const countdownTarget = activeFlashSale?.status === "ONGOING" ? activeFlashSale.endTime : null;
  const countdown = useCountdown(countdownTarget);

  const [currentTime, setCurrentTime] = useState(Date.now());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isFlashSaleAlive = activeFlashSale && new Date(activeFlashSale.endTime).getTime() > currentTime;
  
  const isSelectedCampaignUpcoming = selectedCampaign ? new Date(selectedCampaign.startTime).getTime() > currentTime : false;

  return (
    <div className="animate-in pt-5 pb-6">

      {/*  DANH MỤC  */}
      <Card
        title={<Space><AppstoreOutlined className="!text-xl" /><Text strong className="!text-xl">Danh mục</Text></Space>}
        styles={{ header: { backgroundColor: "#76EEC6" }, body: { padding: "20px 16px 24px" } }}
        className="mb-4 overflow-hidden"
      >
        <div className="um-cat-grid flex flex-wrap gap-4 justify-center">
          {displayCats.map((cat) => (
            <div
              key={cat.id}
              className="um-cat-item cursor-pointer text-center flex flex-col items-center gap-2"
              onClick={() => onPickCategory(cat)}
            >
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

      {/*FLASH SALE */}
      {isFlashSaleAlive && flashSaleProducts.length > 0 && (
        <Card
          title={
            <div className="um-flash-head flex items-center gap-4">
              <Space>
                <ThunderboltOutlined className="text-yellow-400 !text-xl" />
                <Text strong className="um-flash-title !text-xl text-red-600">FLASH SALE</Text>
              </Space>
              <div className="um-countdown flex items-center gap-1">
                {[countdown.h, countdown.m, countdown.s].map((val, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="bg-red-600 text-white font-black text-sm px-1.5 py-0.5 rounded min-w-[26px] text-center tabular-nums">
                      {val}
                    </span>
                    {i < 2 && <span className="text-red-600 font-black">:</span>}
                  </span>
                ))}
                <ClockCircleOutlined className="ml-1 text-red-400" />
              </div>
            </div>
          }
          extra={
            <Link to="/flash-sale" className="px-4 py-1.5 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-sm font-semibold">
              Xem tất cả &gt;
            </Link>
          }
          styles={{ body: { padding: "12px 16px 20px" }, header: { borderBottom: "2px solid #fee2e2" } }}
          className="mb-4 border-red-200"
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

      {/* CHIẾN DỊCH  */}
      {activeCampaign && activeCampaign.length > 0 && (
        <div className="flex flex-col gap-6 mb-8">
          {activeCampaign.map((campaign: any) => {
            const isUpcoming = new Date(campaign.startTime).getTime() > currentTime;

            return (
              <div
                key={campaign.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-xl transition-all border border-pink-100 relative"
                onClick={() => setSelectedCampaign(campaign)}
              >
                {isUpcoming && (
                  <div className="absolute top-4 left-4 z-30">
                    <Tag color="orange" className="text-sm md:text-base font-bold shadow-lg py-1 px-3 border-none">
                      Sắp mở chiến dịch: {new Date(campaign.startTime).toLocaleString("vi-VN")}
                    </Tag>
                  </div>
                )}

                <div className="relative w-full h-auto aspect-[3/1] bg-pink-50 flex items-center justify-center overflow-hidden group">
                  <span className="absolute text-pink-500 text-2xl md:text-4xl font-bold uppercase tracking-widest text-center px-4 z-0">
                    {campaign.name || "SỰ KIỆN 5N"}
                  </span>
                  <img
                    src={campaign.bannerUrl}
                    alt={campaign.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 z-10 ${isUpcoming ? 'opacity-90' : 'group-hover:scale-105'}`}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all z-20">
                    <span className="bg-white text-red-600 font-bold px-6 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                      XEM CHI TIẾT SỰ KIỆN
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

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
                  {isSelectedCampaignUpcoming ? (
                    <Tag color="orange" className="font-bold border-none shadow-sm">
                      Bắt đầu: {new Date(selectedCampaign?.startTime).toLocaleString("vi-VN")}
                    </Tag>
                  ) : (
                    <Tag color="default">
                      Kết thúc: {new Date(selectedCampaign?.endTime).toLocaleString("vi-VN")}
                    </Tag>
                  )}
                </Space>
              </div>
            }
            open={!!selectedCampaign}
            onCancel={() => setSelectedCampaign(null)}
            footer={null}
            width={1000}
            style={{ top: 20 }}
          >
            <div className="bg-red-50/50 p-4 rounded-xl mt-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="um-product-grid grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedCampaign?.products?.map((product: Product) => (
                  // LOGIC CHE GIÁ
                  isSelectedCampaignUpcoming ? (
                    <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col shadow-sm relative group">
                      <div className="absolute top-2 left-2 z-10">
                        <Tag color="blue" className="font-bold border-none shadow-sm">CHỜ MỞ BÁN</Tag>
                      </div>
                      <img src={product.thumbnail ?? ""} alt={product.title} className="w-full aspect-square object-cover rounded-lg group-hover:opacity-90 transition-opacity" />
                      
                      <div className="mt-3 text-sm font-medium line-clamp-2">{product.title}</div>
                      
                      <div className="mt-auto pt-3">
                        <div className="text-red-500 font-black text-2xl tracking-widest">đ ?.?00</div>
                        <div className="text-gray-400 line-through text-xs mt-1">Giá gốc: {product.price.toLocaleString('vi-VN')}đ</div>
                        
                        <Link to={`/products/${product.slug}`}>
                          <Button type="primary" danger ghost className="w-full mt-3 font-semibold">
                            Xem chi tiết
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <ProductCard key={product.id} product={product} />
                  )
                ))}
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* ── SẢN PHẨM NỔI BẬT ── */}
      {bestSellers.length > 0 && (
        <Card
          title={<Space><StarOutlined className="!text-xl" /><Text strong className="!text-xl">Sản phẩm nổi bật</Text></Space>}
          styles={{ header: { backgroundColor: "#76EEC6" }, body: { padding: "12px 16px 20px" } }}
          className="mb-4 overflow-hidden"
        >
          <div className="um-product-grid">
            {bestSellers.map((product) => (<ProductCard key={product.id} product={product} />))}
          </div>
        </Card>
      )}

      {/* ── GỢI Ý CHO BẠN ── */}
      <Card
        id="um-suggestions"
        title={<Space><BulbOutlined className="!text-xl" /><Text strong className="!text-xl">Gợi ý cho bạn</Text></Space>}
        styles={{ header: { backgroundColor: "#76EEC6" }, body: { padding: productsPending || products.length === 0 ? 24 : 16 } }}
        className="overflow-hidden"
      >
        {productsPending && <ProductLoadingGrid count={10} />}
        {!productsPending && products.length === 0 && (
          <div className="p-10 text-center"><Empty description="Chưa có sản phẩm" /></div>
        )}
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