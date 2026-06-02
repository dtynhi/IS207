
import {
  DollarOutlined,
  DashboardOutlined,
  FolderOpenOutlined,
  HomeOutlined,
  LockOutlined,
  LogoutOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UserOutlined,
  FireOutlined,
  GiftOutlined,
  TagsOutlined
} from "@ant-design/icons";
import { Button, Layout, Menu, Space, Typography, Spin, Result } from "antd";

import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { clearAdminId, getAdminId } from "../../shared/session/storage";
import { useAdminMyAccount } from "../../features/admin/hooks/use-admin-my-account";

const { Header, Content, Sider } = Layout;

// Map routes to resource permission keys
const resourceMap: Record<string, string> = {
  "/admin/dashboard": "dashboard",
  "/admin/revenue": "dashboard",
  "/admin/products": "products",
  "/admin/categories": "categories",
  "/admin/orders": "orders",
  "/admin/coupons": "coupons",
  "/admin/flash-sale": "products",
  "/admin/campaigns": "products",
  "/admin/roles": "roles",
  "/admin/accounts": "accounts",
  "/admin/settings": "settings",
};

const hasPermission = (permissions: any, resource: string, action = "read") => {
  if (!permissions || typeof permissions !== "object") return false;
  const resourcePermissions = permissions[resource];
  return Array.isArray(resourcePermissions) && resourcePermissions.includes(action);
};

export const AdminLayout = () => {
  const location = useLocation();
  const nav = useNavigate();
  const adminId = getAdminId();
  
  // Fetch logged in admin profile (contains role & permissions)
  const { query } = useAdminMyAccount();
  const data = query.data as any;
  const isSuperAdmin = data?.role?.title === "Quản trị hệ thống";

  // Guard: Redirect to login if not authenticated
  useEffect(() => {
    if (!adminId) {
      nav("/admin/login");
    }
  }, [adminId, nav]);

  const menuItems = [
    { key: "/admin/dashboard", label: <Link to="/admin/dashboard">Tổng quan</Link>, icon: <DashboardOutlined /> },
    { key: "/admin/revenue", label: <Link to="/admin/revenue">Doanh thu</Link>, icon: <DollarOutlined /> },
    { key: "/admin/products", label: <Link to="/admin/products">Sản phẩm</Link>, icon: <ShopOutlined /> },
    { key: "/admin/categories", label: <Link to="/admin/categories">Danh mục</Link>, icon: <FolderOpenOutlined /> },
    { key: "/admin/orders", label: <Link to="/admin/orders">Đơn hàng</Link>, icon: <ShoppingCartOutlined /> },
    { key: "/admin/coupons", label: <Link to="/admin/coupons">Mã giảm giá</Link>, icon: <TagsOutlined /> },
    { key: "/admin/flash-sale", label: <Link to="/admin/flash-sale">Flash Sale</Link>, icon: <FireOutlined /> },
    { key: "/admin/campaigns", label: <Link to="/admin/campaigns">Chiến dịch</Link>, icon: <GiftOutlined/> },
    { key: "/admin/roles", label: <Link to="/admin/roles">Vai trò</Link>, icon: <LockOutlined /> },
    { key: "/admin/accounts", label: <Link to="/admin/accounts">Tài khoản</Link>, icon: <TeamOutlined /> },
    { key: "/admin/my-account", label: <Link to="/admin/my-account">Tài khoản của tôi</Link>, icon: <UserOutlined /> },
    { key: "/admin/settings", label: <Link to="/admin/settings">Cài đặt</Link>, icon: <SettingOutlined /> },
  ];

  // While fetching admin data, show a loading state
  if (query.isLoading && adminId) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <Spin size="large" tip="Đang tải dữ liệu quyền..." />
      </div>
    );
  }

  // Filter menu items based on permissions
  const allowedMenuItems = menuItems.filter((item) => {
    const resource = resourceMap[item.key];
    if (!resource) return true; // always allow my-account
    return isSuperAdmin || hasPermission(data?.role?.permissions, resource, "read");
  });

  const selected = allowedMenuItems.find((m) => location.pathname.startsWith(m.key))?.key || "/admin/dashboard";

  // Check if current path is allowed
  const currentPath = location.pathname;
  const matchedKey = Object.keys(resourceMap).find((key) => currentPath.startsWith(key));
  const currentResource = matchedKey ? resourceMap[matchedKey] : null;

  const isRouteAllowed =
    !currentResource ||
    isSuperAdmin ||
    hasPermission(data?.role?.permissions, currentResource, "read");

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between bg-[#0EA5E9] px-6">
        <Link to="/admin/dashboard" className="text-lg font-extrabold text-white">
          <Space>
            <ShopOutlined />
            Quản trị 5N Store
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
          <Menu mode="inline" selectedKeys={[selected]} items={allowedMenuItems} className="h-full border-r-0 pt-2" />
        </Sider>
        <Content className="bg-[var(--bg)] p-6">
          <div className="animate-in">
            {isRouteAllowed ? (
              <Outlet />
            ) : (
              <Result
                status="403"
                title="403"
                subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
                extra={
                  <Button type="primary" onClick={() => nav("/admin/dashboard")}>
                    Quay lại Tổng quan
                  </Button>
                }
              />
            )}
          </div>
          <div className="pt-10 text-center">
            <Typography.Text type="secondary" className="text-xs">5N Store Admin · IS207 · UIT</Typography.Text>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
