import { Alert, Card, Spin, Typography } from "antd";
import { useHealthQuery } from "../hooks/use-health-query";

const { Title, Paragraph } = Typography;

export const HealthPage = () => {
  const { data, isPending, isError } = useHealthQuery();

  return (
    <Card>
      <Title level={4}>System Health</Title>
      <Paragraph type="secondary">Quick backend health check.</Paragraph>

      {isPending && <Spin />}
      {isError && <Alert type="error" message="Backend is unreachable" showIcon />}

      {data && (
        <Paragraph>
          Service: <strong>{data.service}</strong> | Status: <strong>{data.status}</strong> | Time:{" "}
          <strong>{new Date(data.timestamp).toLocaleString()}</strong>
        </Paragraph>
      )}
    </Card>
  );
};
