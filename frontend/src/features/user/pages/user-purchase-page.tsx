import { Card, Empty } from "antd";
import { UserPurchaseCard } from "../components/user-purchase-card";
import { UserSidebar } from "../components/user-sidebar";
import { useUserPurchase } from "../hooks/use-user-purchase";

export const UserPurchasePage = () => {
  const { purchases } = useUserPurchase();
  const items = purchases.data?.items || [];

  return (
    <div className="animate-in flex items-start gap-5 pt-6 pb-6">
      <UserSidebar />

      <div className="flex-1">
        <Card title="Đơn mua" className="mb-4" styles={{ body: { padding: items.length > 0 ? 0 : undefined } }}>
          {items.length === 0 && <Empty description="Chưa có đơn hàng" />}
        </Card>

        {items.map((order) => (
          <UserPurchaseCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};
