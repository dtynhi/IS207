import { ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Result, Typography, message } from "antd";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "../../../shared/components/breadcrumb";
import { Price } from "../../../shared/components/price";
import { CartGridHeader } from "../components/cart-grid-header";
import { CartItemRow } from "../components/cart-item-row";
import { useCartPage } from "../hooks/use-cart-page";

const { Text, Title } = Typography;

export const CartPage = () => {
  const navigate = useNavigate();
  const { userId, cart, update, remove, contextHolder } = useCartPage();

  // 1. STATE: Lưu danh sách ID các sản phẩm được tích chọn
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const items = useMemo(() => {
    const rawItems = cart.data?.items || [];
    
    // Sắp xếp đảo ngược ID: Lấy ID của B (món sau) so sánh với ID của A (món trước)
    return [...rawItems].sort((a, b) => b.id.localeCompare(a.id));
  }, [cart.data?.items]);


  // 2. TÍNH TOÁN: Chỉ cộng tiền những món được chọn
  const selectedTotal = useMemo(() => {
    return items
      .filter((item) => selectedIds.includes(item.id))
      .reduce((sum, item) => sum + Number(item.totalPrice), 0);
  }, [items, selectedIds]);

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  // 3. HANDLER: Bấm chọn/bỏ chọn tất cả
  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(items.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 4. HANDLER: Bấm chọn/bỏ chọn 1 món
  const handleToggleItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  // 5. CHUYỂN TRANG THANH TOÁN
  const handleCheckout = () => {
    if (selectedIds.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
      return;
    }
    
    // Gắn danh sách các ID được chọn lên đường dẫn URL (ví dụ: /checkout?items=1,2,3)
    const searchParams = new URLSearchParams();
    searchParams.set("items", selectedIds.join(","));
    navigate(`/checkout?${searchParams.toString()}`);
  };

  if (!userId) {
    return (
      <div className="um-surface animate-in my-6 p-4">
        <Result
          icon={<ShoppingCartOutlined className="text-[56px] opacity-30" />}
          title="Giỏ hàng"
          subTitle="Đăng nhập để xem giỏ hàng"
          extra={<Button type="primary" onClick={() => navigate("/auth/login")}>Đăng nhập</Button>}
        />
      </div>
    );
  }

  return (
    <div className="animate-in pt-6 pb-6">
      {contextHolder}
      <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Giỏ hàng" }]} />

      {items.length === 0 ? (
        <Card>
          <Empty description="Giỏ hàng trống" />
          <div className="mt-3 text-center">
            <Button type="primary" onClick={() => navigate("/")}>Mua sắm ngay</Button>
          </div>
        </Card>
      ) : (
        <>
          <CartGridHeader 
            isAllSelected={isAllSelected} 
            onToggleAll={handleToggleAll} 
          />
          
          {items.map((item) => (
            <CartItemRow 
              key={item.id} 
              item={item} 
              isSelected={selectedIds.includes(item.id)}
              onToggleSelect={handleToggleItem}
              onUpdateQty={(id, quantity) => update.mutate({ id, quantity })} 
              onRemove={(id) => remove.mutate(id)} 
            />
          ))}

          <Card className="border border-[var(--primary-light)] bg-[var(--primary-soft)]" styles={{ body: { padding: "16px 20px" } }}>
            <div className="flex items-center justify-end gap-4 max-md:flex-wrap max-md:justify-start">
              <Text className="text-[var(--text-secondary)]">Tổng thanh toán ({selectedIds.length} sản phẩm):</Text>
              <Price value={selectedTotal} className="text-2xl font-bold text-[var(--primary)]" />
              <Button 
                type="primary" 
                size="large" 
                className="ml-4 w-[200px] max-md:w-full"
                onClick={handleCheckout}
              >
                Mua hàng
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};