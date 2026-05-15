import { Typography } from "antd";
import { FlashSaleCard } from "../components/flash-sale-card";
import { useProductsQuery } from "../../products/hooks/use-products-query";

const { Title } = Typography;

export const FlashSalePage = () => {
  // 1. Mượn "người đi chợ" của team để lấy danh sách sản phẩm (Lấy 100 món cho nhiều)
  const { data, isPending } = useProductsQuery({ page: 1, limit: 100 });
  const allProducts = data?.items || [];
  
  // 2. Lọc ra những món có % giảm giá > 0
  const flashSaleProducts = allProducts.filter(item => item.discountPercentage > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in">
      {/* Khung Tiêu đề */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border-l-4 border-red-600">
        <Title level={3} className="!mb-1 text-red-600 uppercase tracking-wide">
          SALE TO TRONG THÁNG
        </Title>
        <p className="text-gray-500 text-sm">({flashSaleProducts.length} sản phẩm)</p>
      </div>

      {/* Hiển thị sản phẩm */}
      {isPending ? (
        <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {flashSaleProducts.map((product) => (
            <FlashSaleCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};