import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { RouterProvider } from "react-router-dom";
import { QueryProvider } from "./app/providers/query-provider";
import { router } from "./app/router";

const App = () => (
  <ConfigProvider
    locale={viVN}
    theme={{
      token: {
        colorPrimary: "#0EA5E9",
        colorLink: "#0EA5E9",
        colorLinkHover: "#0284C7",
        borderRadius: 10,
        fontFamily: '"Inter", -apple-system, "Segoe UI", sans-serif',
        controlHeight: 42,
        fontSize: 14,
        colorBgContainer: "#ffffff",
        colorBorder: "#E2E8F0",
      },
      components: {
        Button: { borderRadius: 10, controlHeight: 42 },
        Input: { borderRadius: 10, controlHeight: 42 },
        Select: { borderRadius: 10, controlHeight: 42 },
        Card: { borderRadiusLG: 14 },
        Tag: { borderRadiusSM: 99 },
        Table: { borderRadiusLG: 14 },
      },
    }}
  >
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  </ConfigProvider>
);

export default App;
