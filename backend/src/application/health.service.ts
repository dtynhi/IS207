export type HealthStatus = {
  service: string;
  status: "ok";
  timestamp: string;
};

export const getHealthStatus = (): HealthStatus => {
  return {
    service: "unimarket-api",
    status: "ok",
    timestamp: new Date().toISOString(),
  };
};
