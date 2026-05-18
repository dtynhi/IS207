import { AppstoreOutlined, BulbOutlined, ClockCircleOutlined, FireOutlined, StarOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Pagination, Space, Typography } from "antd";
import type { ReactNode } from "react";
import type { SetURLSearchParams } from "react-router-dom";
import { ProductCard } from "./product-card";
import { ProductLoadingGrid } from "./product-loading-grid";
import type { Product } from "../types/product.types";
import { FlashSaleCard } from "../../flash-sale/components/flash-sale-card";
import { Link } from "react-router-dom";
const { Title, Paragraph, Text } = Typography;

type DisplayCategory = {
  id: string;
  title: string;
  slug: string;
  icon?: ReactNode; // Đã thêm dấu ? để không bắt buộc phải có icon
  image?: string;   // Thêm trường image để truyền link ảnh đại diện
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
  return (
    <div className="animate-in pt-5 pb-6">
      
      {/* KHỐI DANH MỤC */}
      <Card 
        title={
          <Space>
            <AppstoreOutlined className="!text-xl" />
            <Text strong className="!text-xl">Danh mục</Text>
          </Space>
        } 
        styles={{ 
          header: { backgroundColor: '#76EEC6' }, // Đổi màu nền tiêu đề
          body: { padding: "20px 16px 24px" } 
        }} 
        className="mb-4 overflow-hidden"
      >
        <div className="um-cat-grid flex flex-wrap gap-4 justify-center">
          {displayCats.map((cat) => (
            <div key={cat.id} className="um-cat-item cursor-pointer text-center flex flex-col items-center gap-2" onClick={() => onPickCategory(cat)}>
              <div className="um-cat-icon flex items-center justify-center">
                {/* Logic hiển thị ảnh: Nếu có link ảnh thì hiện ảnh, nếu không thì dùng icon mặc định */}
                {cat.image ? (
                  <img 
                    src={cat.image} 
                    alt={cat.title} 
                    className="w-[60px] h-[60px] object-cover rounded-full shadow-sm border border-gray-100" 
                  />
                ) : (
                  <div className="text-3xl">{cat.icon}</div>
                )}
              </div>
              <div className="um-cat-name font-bold text-[15px]">{cat.title}</div>
              {/* Đã xóa phần Text hiển thị "Danh mục từ admin/Gợi ý nhanh" ở đây */}
            </div>
          ))}
        </div>
      </Card>

      {/* KHỐI FLASH SALE */}
      {flashSaleProducts.length > 0 && (
        <Card
          title={
            <div className="um-flash-head flex items-center gap-4">
              <Space>
                <FireOutlined className="text-[var(--sale)] !text-xl" />
                <Text strong className="um-flash-title !text-xl">FLASH SALE</Text>
              </Space>
              <div className="um-countdown flex items-center">
                <Text className="um-countdown-box">{countdown.h}</Text>
                <Text className="um-countdown-divider">:</Text>
                <Text className="um-countdown-box">{countdown.m}</Text>
                <Text className="um-countdown-divider">:</Text>
                <Text className="um-countdown-box">{countdown.s}</Text>
                <ClockCircleOutlined className="ml-2" />
              </div>
            </div>
          }
          extra={<Link to="/flash-sale" className="px-4 py-1.5 rounded-full border border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white transition-colors text-sm font-medium">Xem tất cả &gt;</Link>}
          styles={{ body: { padding: "12px 16px 20px" }}
          }
      
          className="mb-4"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {flashSaleProducts.map((product) => (<FlashSaleCard key={product.id} product={product} />))}
          </div>
        </Card>
      )}
      {/* KHỐI SẢN PHẨM NỔI BẬT */}
      {bestSellers.length > 0 && (
        <Card 
          title={
            <Space>
              <StarOutlined className="!text-xl" />
              <Text strong className="!text-xl">Sản phẩm nổi bật</Text>
            </Space>
          } 
          styles={{ 
            header: { backgroundColor: '#76EEC6' }, 
            body: { padding: "12px 16px 20px" } 
          }} 
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
        title={
          <Space>
            <BulbOutlined className="!text-xl" />
            <Text strong className="!text-xl">Gợi ý cho bạn</Text>
          </Space>
        } 
        styles={{ 
          header: { backgroundColor: '#76EEC6' }, 
          body: { padding: productsPending || products.length === 0 ? 24 : 16 } 
        }}
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