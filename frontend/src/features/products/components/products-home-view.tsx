import { AppstoreOutlined, BulbOutlined, ClockCircleOutlined, FireOutlined, StarOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Pagination, Space, Typography } from "antd";
import type { ReactNode } from "react";
import type { SetURLSearchParams } from "react-router-dom";
import { ProductCard } from "./product-card";
import { ProductLoadingGrid } from "./product-loading-grid";
import type { Product } from "../types/product.types";

const { Title, Paragraph, Text } = Typography;

type DisplayCategory = {
  id: string;
  title: string;
  slug: string;
  icon: ReactNode;
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
      <div className="um-hero">
        <Title level={1} className="!mb-2 !text-white">Chào mừng đến Uni Market</Title>
        <Paragraph className="!mb-[22px] !max-w-[460px] !text-white/90">Nền tảng mua sắm dành cho sinh viên - Đa dạng sản phẩm, giá ưu đãi đặc biệt, giao hàng nhanh chóng!</Paragraph>
        <Button
          type="primary"
          size="large"
          onClick={() => {
            const el = document.getElementById("um-suggestions");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Khám phá ngay
        </Button>
      </div>

      <Card title={<Space><AppstoreOutlined /><Text strong>Danh mục</Text></Space>} styles={{ body: { padding: "12px 16px 20px" } }} className="mb-4">
        <div className="um-cat-grid">
          {displayCats.map((cat) => (
            <div key={cat.id} className="um-cat-item" onClick={() => onPickCategory(cat)}>
              <div className="um-cat-icon">{cat.icon}</div>
              <div className="um-cat-name">{cat.title}</div>
              <Text type="secondary" className="!text-[10px]">
                {cat.source === "admin" ? "Danh mục từ admin" : "Gợi ý nhanh"}
              </Text>
            </div>
          ))}
        </div>
      </Card>

      {flashSaleProducts.length > 0 && (
        <Card
          title={
            <div className="um-flash-head">
              <Space>
                <FireOutlined className="text-[var(--sale)]" />
                <Text strong className="um-flash-title">FLASH SALE</Text>
              </Space>
              <div className="um-countdown">
                <Text className="um-countdown-box">{countdown.h}</Text>
                <Text className="um-countdown-divider">:</Text>
                <Text className="um-countdown-box">{countdown.m}</Text>
                <Text className="um-countdown-divider">:</Text>
                <Text className="um-countdown-box">{countdown.s}</Text>
                <ClockCircleOutlined />
              </div>
            </div>
          }
          styles={{ body: { padding: "12px 16px 20px" }}
          }
          className="mb-4"
        >
          <div className="um-scroll-row">
            {flashSaleProducts.map((product) => (<ProductCard key={product.id} product={product} />))}
          </div>
        </Card>
      )}

      {bestSellers.length > 0 && (
        <Card title={<Space><StarOutlined /><Text strong>Sản phẩm nổi bật</Text></Space>} styles={{ body: { padding: "12px 16px 20px" } }} className="mb-4">
          <div className="um-product-grid">
            {bestSellers.map((product) => (<ProductCard key={product.id} product={product} />))}
          </div>
        </Card>
      )}

      <Card id="um-suggestions" title={<Space><BulbOutlined /><Text strong>Gợi ý cho bạn</Text></Space>} styles={{ body: { padding: productsPending || products.length === 0 ? 24 : 16 } }}>
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
