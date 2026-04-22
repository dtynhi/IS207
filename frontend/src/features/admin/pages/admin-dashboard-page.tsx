import { Card, Col, Row, Statistic, Typography } from "antd";
import { useAdminDashboard } from "../hooks/use-admin-dashboard";

const { Title } = Typography;

export const AdminDashboardPage = () => {
  const { data } = useAdminDashboard();
  const stats = data || {};

  return (
    <div className="space-y-4">
      <Title level={3}>Dashboard</Title>
      <Row gutter={[16, 16]}>
        {Object.entries(stats).map(([key, value]) => (
          <Col key={key} xs={24} md={12} lg={6}>
            <Card>
              <Statistic title={key} value={Number(value)} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};
