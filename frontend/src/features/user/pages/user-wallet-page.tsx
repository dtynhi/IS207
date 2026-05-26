import { Card, Empty, List, Typography } from "antd";
import { Price } from "../../../shared/components/price";
import { UserSidebar } from "../components/user-sidebar";
import { useUserWallet } from "../hooks/use-user-wallet";

const { Text } = Typography;

export const UserWalletPage = () => {
  const { wallet } = useUserWallet();
  const data = wallet.data;

  return (
    <div className="animate-in flex items-start gap-5 pt-6 pb-6">
      <UserSidebar />

      <div className="flex-1">
        <Card
          title="Ví của tôi"
          extra={data ? <Price value={data.balance} size="lg" /> : null}
          className="mb-4"
        >
          {wallet.isPending && <Text type="secondary">Đang tải...</Text>}
          {!wallet.isPending && !data && <Empty description="Chưa có ví" />}
        </Card>

        {data && (
          <Card title="Lịch sử giao dịch" styles={{ body: { padding: data.transactions.length ? undefined : 0 } }}>
            {data.transactions.length === 0 ? (
              <Empty description="Chưa có giao dịch" />
            ) : (
              <List
                dataSource={data.transactions}
                renderItem={(tx) => (
                  <List.Item>
                    <div className="w-full">
                      <div className="flex items-center justify-between">
                        <Text>{tx.reason || (tx.type === "credit" ? "Hoàn tiền" : "Giao dịch ví")}</Text>
                        <Price value={tx.amount} />
                      </div>
                      <Text type="secondary" className="text-xs">
                        {tx.orderId ? `Đơn: ${tx.orderId}` : ""}
                      </Text>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        )}
      </div>
    </div>
  );
};
