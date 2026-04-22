import {
  BellOutlined,
  CameraOutlined,
  GlobalOutlined,
  LoginOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Badge, Button, Input, List, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logoutUserApi } from "../../features/auth/api/auth.api";
import { clearAllSession, getUserEmail, getUserId } from "../../shared/session/storage";
import { useCartIndicator } from "../../features/cart/hooks/use-cart-indicator";

const { Text } = Typography;

const footerColumns: { title: string; items: string[] }[] = [
  {
    title: "Hỗ trợ",
    items: ["Trung tâm trợ giúp", "Hướng dẫn mua hàng", "Chính sách bảo hành"],
  },
  {
    title: "Về Uni Market",
    items: ["Giới thiệu", "Điều khoản", "Chính sách bảo mật"],
  },
];

export const ClientLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = getUserId();
  const userEmail = getUserEmail();
  const isAuthPage = location.pathname.startsWith("/auth");
  const { cartCount } = useCartIndicator(userId);
  const initialSearch = new URLSearchParams(location.search).get("search") || "";
  const [searchValue, setSearchValue] = useState(initialSearch);

  useEffect(() => {
    const querySearch = new URLSearchParams(location.search).get("search") || "";
    if (querySearch !== searchValue) {
      setSearchValue(querySearch);
    }
  }, [location.search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (isAuthPage) return;
      const next = searchValue.trim();
      const current = (new URLSearchParams(location.search).get("search") || "").trim();
      if (next === current) return;
      navigate(next ? `/?search=${encodeURIComponent(next)}` : "/", { replace: false });
    }, 450);

    return () => window.clearTimeout(timer);
  }, [searchValue, location.search, isAuthPage, navigate]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="um-header">
        <div className="um-header-top">
          <div className="um-header-top-left">
            <Link to="/admin/login">Kênh Quản Trị</Link>
          </div>
          <div className="um-header-top-right">
            <a href="#"><Space size={4}><BellOutlined />Thông Báo</Space></a>
            <a href="#"><Space size={4}><QuestionCircleOutlined />Hỗ Trợ</Space></a>
            <a href="#"><Space size={4}><GlobalOutlined />Tiếng Việt</Space></a>
            {userId ? (
              <>
                <Link to="/user/profile"><Space size={4}><UserOutlined />{userEmail || "User"}</Space></Link>
                <div className="um-header-top-divider"></div>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    void logoutUserApi().finally(() => {
                      clearAllSession();
                      navigate("/auth/login");
                    });
                  }}
                >
                  <Space size={4}><LogoutOutlined />Đăng xuất</Space>
                </a>
              </>
            ) : (
              <>
                <Link to="/auth/register">Đăng ký</Link>
                <div className="um-header-top-divider"></div>
                <Link to="/auth/login"><Space size={4}><LoginOutlined />Đăng nhập</Space></Link>
              </>
            )}
          </div>
        </div>

        <div className="um-header-main">
          <Link to="/" className="um-logo">
            <Space>
              <ShopOutlined />
              Uni Market
            </Space>
          </Link>

          <div className="flex flex-1 items-center">
            <div className="um-search">
              <Input
                name="search"
                placeholder="Giảm đến 40% sản phẩm sinh viên"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                bordered={false}
                className="!rounded-none"
              />
            </div>
          </div>

          <Link to="/cart" className="mr-1 shrink-0">
            <Badge count={cartCount} size="small" color="#fff" offset={[-2, 4]} overflowCount={99}>
              <Button
                type="text"
                shape="circle"
                icon={<ShoppingCartOutlined />}
                className="!flex !h-12 !w-12 !items-center !justify-center !bg-white/10 !text-2xl !text-white hover:!bg-white/20 hover:!text-white"
              />
            </Badge>
          </Link>
        </div>

        <div className="um-header-tags">
          <div className="um-search-tags">
            <Link to="/?search=Giáo+trình">Giáo Trình IT</Link>
            <Link to="/?search=Laptop">Laptop Cũ</Link>
            <Link to="/?search=Nồi+cơm">Nồi Cơm KTX</Link>
            <Link to="/?search=Bàn+phím">Bàn Phím Cơ</Link>
            <Link to="/?search=Xe">Xe Máy Cũ</Link>
            <Link to="/?search=Quạt">Quạt Hộp</Link>
          </div>
        </div>
      </header>

      {isAuthPage ? (
        <Outlet />
      ) : (
        <main className="flex-1">
          <div className="um-container animate-in">
            <Outlet />
          </div>
        </main>
      )}

      <footer className="um-footer">
        <div className="um-footer-inner">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <Text strong className="!mb-4 !block !text-white !uppercase">{col.title}</Text>
              <List
                dataSource={col.items}
                renderItem={(item) => (
                  <List.Item className="!border-none !py-1 !px-0">
                    <a href="#" className="text-[13px] text-white/50">{item}</a>
                  </List.Item>
                )}
              />
            </div>
          ))}

          <div>
            <Text strong className="!mb-4 !block !text-white !uppercase">Danh mục</Text>
            <List
              dataSource={[
                { label: "Sản phẩm", to: "/" },
                { label: "Giỏ hàng", to: "/cart" },
                { label: "Đơn mua", to: "/user/purchase" },
              ]}
              renderItem={(item) => (
                <List.Item className="!border-none !py-1 !px-0">
                  <Link to={item.to} className="text-[13px] text-white/50">{item.label}</Link>
                </List.Item>
              )}
            />
          </div>

          <div>
            <Text strong className="!mb-4 !block !text-white !uppercase">Kết nối</Text>
            <List
              dataSource={[
                { label: "Facebook", href: "#" },
                { label: "Instagram", href: "#" },
              ]}
              renderItem={(item) => (
                <List.Item className="!border-none !py-1 !px-0">
                  <a href={item.href} className="text-[13px] text-white/50">{item.label}</a>
                </List.Item>
              )}
            />
            <Link to="/admin/login" className="text-[13px] text-white/50">Kênh quản trị</Link>
          </div>
        </div>
        <div className="um-footer-bottom">© 2026 Uni Market — Đồ án IS207 · UIT</div>
      </footer>
    </div>
  );
};
