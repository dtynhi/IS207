import {
  DashboardOutlined,
  FolderOpenOutlined,
  HomeOutlined,
  LockOutlined,
  LogoutOutlined,
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Alert, Button, Layout, Menu, Space, Typography } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearAdminId, getAdminId } from "../../shared/session/storage";

const { Header, Content, Sider } = Layout;

export const AdminLayout = () => {
  const location = useLocation();
  const nav = useNavigate();
  const adminId = getAdminId();

  const menuItems = [
    { key: "/admin/dashboard", label: <Link to="/admin/dashboard">Dashboard</Link>, icon: <DashboardOutlined /> },
    { key: "/admin/products", label: <Link to="/admin/products">Sản phẩm</Link>, icon: <ShopOutlined /> },
    { key: "/admin/categories", label: <Link to="/admin/categories">Danh mục</Link>, icon: <FolderOpenOutlined /> },
    { key: "/admin/roles", label: <Link to="/admin/roles">Vai trò</Link>, icon: <LockOutlined /> },
    { key: "/admin/accounts", label: <Link to="/admin/accounts">Tài khoản</Link>, icon: <TeamOutlined /> },
    { key: "/admin/my-account", label: <Link to="/admin/my-account">Tài khoản tôi</Link>, icon: <UserOutlined /> },
    { key: "/admin/settings", label: <Link to="/admin/settings">Cài đặt</Link>, icon: <SettingOutlined /> },
  ];

  const selected = menuItems.find((m) => location.pathname.startsWith(m.key))?.key || "/admin/dashboard";

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between bg-[#0EA5E9] px-6">
        <Link to="/admin/dashboard" className="text-lg font-extrabold text-white">
          <Space>
            <ShopOutlined />
            Uni Market Admin
          </Space>
        </Link>
        <div className="flex items-center gap-[14px]">
          <Link to="/" className="text-[13px] text-[rgba(255,255,255,0.7)]">
            <Space size={4}>
              <HomeOutlined />
              Trang chính
            </Space>
          </Link>
          <Button size="small" icon={<LogoutOutlined />} onClick={() => { clearAdminId(); nav("/admin/login"); }}>
            Đăng xuất
          </Button>
        </div>
      </Header>
      <Layout>
        <Sider width={220} className="border-r border-[var(--border)] bg-white">
          <Menu mode="inline" selectedKeys={[selected]} items={menuItems} className="h-full border-r-0 pt-2" />
        </Sider>
        <Content className="bg-[var(--bg)] p-6">
          {!adminId && <Alert type="warning" showIcon message="Chưa đăng nhập" className="mb-4" />}
          <div className="animate-in"><Outlet /></div>
          <div className="pt-10 text-center">
            <Typography.Text type="secondary" className="text-xs">Uni Market Admin · IS207 · UIT</Typography.Text>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
