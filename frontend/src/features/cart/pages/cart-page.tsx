import { ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Result, Typography } from "antd";
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

  const items = cart.data?.items || [];
  const total = Number(cart.data?.totalPrice || 0);

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
          <CartGridHeader />
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} onUpdateQty={(id, quantity) => update.mutate({ id, quantity })} onRemove={(id) => remove.mutate(id)} />
          ))}

          <Card className="border border-[var(--primary-light)] bg-[var(--primary-soft)]" styles={{ body: { padding: "16px 20px" } }}>
            <div className="flex items-center justify-end gap-4 max-md:flex-wrap max-md:justify-start">
              <Text className="text-[var(--text-secondary)]">Tổng ({items.length} sản phẩm):</Text>
              <Price value={total} size="lg" />
              <Button type="primary" size="large" onClick={() => navigate("/checkout")} className="h-12 rounded-xl px-10 font-semibold">Thanh toán</Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
