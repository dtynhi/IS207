import { FilterOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Pagination, Space } from "antd";
import type { SetURLSearchParams } from "react-router-dom";
import { Breadcrumb } from "../../../shared/components/breadcrumb";
import { ProductCard } from "./product-card";
import { ProductFilterForm, type ProductFilterValues } from "./product-filter-form";
import { ProductLoadingGrid } from "./product-loading-grid";
import type { Product, ProductCategory } from "../types/product.types";

type ProductsFilteredViewProps = {
  search: string | null;
  activeCategory: string | null;
  apiCats: ProductCategory[];
  params: ProductFilterValues;
  productsPending: boolean;
  products: Product[];
  page: number;
  limit: number;
  totalItems: number;
  onApplyFilter: (values: ProductFilterValues) => void;
  onResetFilter: () => void;
  onSetPageParams: SetURLSearchParams;
};

export const ProductsFilteredView = ({
  search,
  activeCategory,
  apiCats,
  params,
  productsPending,
  products,
  page,
  limit,
  totalItems,
  onApplyFilter,
  onResetFilter,
  onSetPageParams,
}: ProductsFilteredViewProps) => {
  return (
    <div className="animate-in pt-5 pb-6">
      <Breadcrumb
        items={[
          { label: "Trang chủ", to: "/" },
          ...(activeCategory ? [{ label: activeCategory }] : []),
          ...(search ? [{ label: `Tìm: \"${search}\"` }] : []),
        ]}
      />

      <div className="flex items-start gap-6 max-md:flex-col max-md:gap-4">
        <aside className="w-[240px] shrink-0 max-md:w-full">
          <div className="mb-5 text-base font-bold">
            <Space>
              <FilterOutlined />
              BỘ LỌC TÌM KIẾM
            </Space>
          </div>
          <ProductFilterForm
            categories={apiCats}
            initialValues={{
              search: params.search,
              facet: params.facet,
              minPrice: params.minPrice,
              maxPrice: params.maxPrice,
            }}
            onSubmit={onApplyFilter}
            onReset={onResetFilter}
          />
        </aside>

        <section className="flex-1">
          <Card styles={{ body: { padding: productsPending || products.length === 0 ? 24 : 16 } }}>
            {productsPending && <ProductLoadingGrid count={10} />}

            {!productsPending && products.length === 0 && (
              <div className="p-10 text-center">
                <Empty description="Không tìm thấy sản phẩm phù hợp" />
                <Button type="primary" onClick={onResetFilter} className="mt-4">
                  Xoá bộ lọc
                </Button>
              </div>
            )}

            {!productsPending && products.length > 0 && (
              <>
                <div className="um-product-grid">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
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
        </section>
      </div>
    </div>
  );
};
