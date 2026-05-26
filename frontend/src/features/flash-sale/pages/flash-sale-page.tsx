import { useState, useMemo } from "react";
import { Typography, Breadcrumb, Menu, Layout } from "antd";
import { FlashSaleCard } from "../components/flash-sale-card";
import { useProductsQuery } from "../../products/hooks/use-products-query";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../products/api/product.api";

const { Title } = Typography;
const { Sider, Content } = Layout;

export const FlashSalePage = () => {
  const { data: productsData, isPending: isProductsPending } = useProductsQuery({ page: 1, limit: 100 });
  const allProducts = productsData?.items || [];

  const { data: categoriesData } = useQuery({ 
    queryKey: ["client-categories"], 
    queryFn: getCategories 
  });
  const allCategories = categoriesData || [];
  // Lọc ra TẤT CẢ sản phẩm đang sale
  const flashSaleProducts = allProducts.filter((item: any) => item.discountPercentage > 0);

  // Lấy ra các MÃ DANH MỤC (productCategoryId) đang có sale
  const activeCategoryIds = Array.from(new Set(flashSaleProducts.map((p: any) => p.productCategoryId))).filter(Boolean);

  // Đổi state để lưu trữ theo ID thay vì tên
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  const displayedProducts = useMemo(() => {
    if (selectedCategoryId === 'all') return flashSaleProducts;
    return flashSaleProducts.filter((p: any) => String(p.productCategoryId) === selectedCategoryId);
  }, [flashSaleProducts, selectedCategoryId]);

  const menuItems = [
    { key: 'all', label: 'Tất Cả Sản Phẩm' },
    ...activeCategoryIds.map((id) => {
      // Đi tìm cái Danh mục có mã ID tương ứng
      const categoryObj = allCategories.find((cat: any) => String(cat.id) === String(id));
      
        const categoryName = categoryObj ? categoryObj.title : `Danh mục chưa rõ tên`;      return {
        key: String(id),
        label: categoryName,
      };
    })
  ];

  const selectedCatObj = allCategories.find((cat: any) => String(cat.id) === selectedCategoryId);
  const headerTitle = selectedCategoryId === 'all' 
    ? 'TẤT CẢ SẢN PHẨM SALE' 
    : `SALE - ${(selectedCatObj?.title || selectedCatObj?.title || 'DANH MỤC').toUpperCase()}`;


  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-[#f8fafc] animate-in">
      <Breadcrumb className="mb-4" items={[
        { title: 'TRANG CHỦ' },
        { title: 'KHUYẾN MÃI' },
        { title: 'SALE TO TRONG THÁNG' },
      ]} />

      <Layout className="bg-transparent gap-6 flex-row">
        
        {/* SIDEBAR DANH MỤC */}
        <Sider width={250} className="bg-white rounded-lg shadow-sm h-fit hidden md:block border border-gray-100">
          <div className="p-4 border-b border-gray-100 bg-[#fff5f5] rounded-t-lg">
            <h3 className="font-bold text-lg mb-0 text-red-600 uppercase">Danh mục Sale</h3>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedCategoryId]} 
            onClick={(e) => setSelectedCategoryId(e.key)} 
            className="border-none rounded-b-lg font-medium"
            items={menuItems} 
          />
        </Sider>

        {/* LƯỚI SẢN PHẨM */}
        <Content>
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex justify-between items-center border border-gray-100">
             <Title level={4} className="!mb-0 text-gray-800 uppercase tracking-wide">
                {headerTitle}
             </Title>
             <span className="text-gray-500 font-medium">{displayedProducts.length} sản phẩm</span>
          </div>

          {isProductsPending ? (
            <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
          ) : displayedProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-gray-100">
                Chưa có sản phẩm nào đang khuyến mãi.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {displayedProducts.map((product: any) => (
                <FlashSaleCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </Content>
      </Layout>
    </div>
  );
};