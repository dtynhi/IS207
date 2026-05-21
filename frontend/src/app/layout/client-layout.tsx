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
  DownOutlined,
} from "@ant-design/icons";

import { Badge, Button, Input, List, Space, Typography, Dropdown} from "antd";
import type { MenuProps } from "antd";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logoutUserApi } from "../../features/auth/api/auth.api";
import { clearAllSession, getUserEmail, getUserId } from "../../shared/session/storage";
import { useCartIndicator } from "../../features/cart/hooks/use-cart-indicator";
import { useGeneralSettings } from "../../shared/settings/use-general-settings";
import { PromoPopup } from "../../features/user/components/Popup_homepage";
import { TopBanner } from '../../features/user/components/top-banner';
const { Text } = Typography;

const footerColumns: { title: string; items: string[] }[] = [
  {
    title: "Hỗ trợ",
    items: ["Trung tâm trợ giúp", "Hướng dẫn mua hàng", "Chính sách bảo hành"],
  },
  {
    title: "Về chúng tôi",
    items: ["Giới thiệu", "Cẩm nang làm đẹp", "Chính sách bảo mật"],
  },
];

// Dữ liệu menu cho các dropdown danh mục
const dauGoiItems: MenuProps['items'] = [
  { key: '1', label: <Link to="/?search=Clear">Clear</Link> },
  { key: '2', label: <Link to="/?search=Sunsilk">Sunsilk</Link> },
  { key: '3', label: <Link to="/?search=Dove">Dove</Link> },
  { key: '4', label: <Link to="/?search=Pantene">Pantene</Link> },
];

const suaTamItems: MenuProps['items'] = [
  { key: '1', label: <Link to="/?search=Lifebuoy">Lifebuoy</Link> },
  { key: '2', label: <Link to="/?search=Dove">Dove</Link> },
  { key: '3', label: <Link to="/?search=Lashe">Lashe</Link> },
  { key: '4', label: <Link to="/?search=Nivea">Nivea</Link> },
];

const suaRuaMatItems: MenuProps['items'] = [
  { key: '1', label: <Link to="/?search=Cetaphil">Cetaphil</Link> },
  { key: '2', label: <Link to="/?search=Senka">Senka</Link> },
  { key: '3', label: <Link to="/?search=Simple">Simple</Link> },
  { key: '4', label: <Link to="/?search=Hada+Labo">Hada Labo</Link> },
];

const kemChongNangItems: MenuProps['items'] = [
  { key: '1', label: <Link to="/?search=La+Roche-Posay">La Roche-Posay</Link> },
  { key: '2', label: <Link to="/?search=Skin+Aqua">Skin Aqua</Link> },
];
export const ClientLayout = () => {
  
  const location = useLocation();
const isHomePage = location.pathname === "/";
  const navigate = useNavigate();
  const userId = getUserId();
  const userEmail = getUserEmail();
  const isAuthPage = location.pathname.startsWith("/auth");
  const { cartCount } = useCartIndicator(userId);
  const { data: settings } = useGeneralSettings();
  const initialSearch = new URLSearchParams(location.search).get("search") || "";
  const [searchValue, setSearchValue] = useState(initialSearch);
  const websiteName = "5N Store";
  const settingPhone = settings?.phone?.trim();
  const settingEmail = settings?.email?.trim();
  const settingAddress = settings?.address?.trim();
  const settingCopyright = settings?.copyright?.trim();


  useEffect(() => {
    const querySearch = new URLSearchParams(location.search).get("search") || "";
    if (querySearch !== searchValue) {
      setSearchValue(querySearch);
    }
  }, [location.search]);  
const { pathname, search } = useLocation();
  useEffect(() => {
  
    window.scrollTo(0, 0);
  }, [pathname, search]);
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
       {/* <div className="um-header-top">
          <div className="um-header-top-right">
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
            ) : null}
          </div>
        </div>
*/}
          <div className="um-header-main">
          <Link to="/" className="um-logo um-logo-pill">
  {websiteName}
</Link>

          <div className="flex flex-1 items-center">
            <div className="um-search">
              <Input
                name="search"
                placeholder="Mùa hè này dùng gì để mượt tóc?"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                bordered={false}
                className="!rounded-none"
              />
            </div>
          </div>

          {/* Auth actions placed in main header, aligned with cart */}
          <div className="um-auth-actions">
            {userId ? (
              <>
                <Link to="/user/profile" className="um-auth um-profile"><Space size={4}><UserOutlined />{userEmail || "User"}</Space></Link>
                <a
                  href="#"
                  className="um-auth um-logout"
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
                <Link to="/auth/register" className="um-auth um-register">Đăng ký</Link>
                <Link to="/auth/login" className="um-auth um-login"><Space size={4}><LoginOutlined />Đăng nhập</Space></Link>
              </>
            )}
          </div>

          <Link to="/cart" className="mr-1 shrink-0 um-cart">
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

 {/* Phần menu danh mục chính, chỉ hiển thị trên trang chủ */}
       {/* Thêm !flex !justify-center để ép toàn bộ thanh tag luôn nằm chính giữa màn hình */}
        {/* Đã xóa hoàn toàn class cũ gây lệch phải, dùng flex justify-center để ép căn giữa 100% */}
        <div className="w-full flex justify-center items-center border-b border-gray-100 bg-[#a8f7dd] py-1">
          <div className="flex justify-center items-center gap-12">
            
            <Dropdown menu={{ items: dauGoiItems }} trigger={['hover']} placement="bottomCenter">
              <a className="cursor-pointer font-bold text-[15px] text-gray-700 hover:text-[var(--primary)] transition-colors" onClick={(e) => e.preventDefault()}>
                Dầu gội
              </a>
            </Dropdown>

            <Dropdown menu={{ items: suaTamItems }} trigger={['hover']} placement="bottomCenter">
              <a className="cursor-pointer font-bold text-[15px] text-gray-700 hover:text-[var(--primary)] transition-colors" onClick={(e) => e.preventDefault()}>
                Sữa tắm
              </a>
            </Dropdown>

            <Dropdown menu={{ items: suaRuaMatItems }} trigger={['hover']} placement="bottomCenter">
              <a className="cursor-pointer font-bold text-[15px] text-gray-700 hover:text-[var(--primary)] transition-colors" onClick={(e) => e.preventDefault()}>
                Sữa rửa mặt
              </a>
            </Dropdown>

            <Dropdown menu={{ items: kemChongNangItems }} trigger={['hover']} placement="bottomCenter">
              <a className="cursor-pointer font-bold text-[15px] text-gray-700 hover:text-[var(--primary)] transition-colors" onClick={(e) => e.preventDefault()}>
                Kem chống nắng
              </a>
            </Dropdown>

          </div>
        </div>
      </header>

      {isAuthPage ? (
        <Outlet />
      ) : (
        <main className="flex-1">
          {isHomePage &&<PromoPopup/> }{/* Thêm component Popup vào đây */}
            

          <div className="um-container animate-in">
           {isHomePage && <TopBanner /> }{/* Thêm component TopBanner vào đây */}
            <Outlet />
          </div>
        </main>
      )}

      <footer className="um-footer">

    
        <div className="um-footer-inner">
          {/* Cột 1 & Cột 2: Hỗ trợ và Về chúng tôi */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <Text strong className="!mb-4 !block !uppercase">{col.title}</Text>
              <List
                dataSource={col.items}
                renderItem={(item) => (
                  <List.Item className="!border-none !py-1 !px-0">
                    <a href="#" className="text-[15px]">{item}</a>
                  </List.Item>
                )}
              />
            </div>
          ))}

          {/* Cột 3: Kết nối */}
          <div>
            <Text strong className="!mb-4 !block !uppercase">Kết nối</Text>
            <List
              dataSource={[
                { label: "Facebook", href: "#" },
                { label: "Instagram", href: "#" },
              ]}
              renderItem={(item) => (
                <List.Item className="!border-none !py-1 !px-0">
                  <a href={item.href} className="text-[15px]">{item.label}</a>
                </List.Item>
              )}
            />
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-[15px]"
            >
              Blog
            </a>
          </div>

          {/* Cột 4: Thanh toán & Vận chuyển (Đã chỉnh viền mỏng p-[2px], khung to ra w-[70px]) */}
          <div>
            <Text strong className="!mb-4 !block !text-white !uppercase">Thanh toán</Text>
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="bg-white rounded flex items-center justify-center w-[70px] h-[38px] p-[2px] shadow-sm">
                <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Transparent.png" alt="MoMo" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="bg-white rounded flex items-center justify-center w-[70px] h-[38px] p-[2px] shadow-sm">
                <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png" alt="VNPAY" className="max-h-full max-w-full object-contain" />
              </div>
            </div>

            <Text strong className="!mb-4 !block !text-white !uppercase">Đơn vị vận chuyển</Text>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white rounded flex items-center justify-center w-[70px] h-[38px] p-[2px] shadow-sm">
                <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/05/Logo-GHTK-Green.png" alt="GHTK" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="bg-white rounded flex items-center justify-center w-[70px] h-[38px] p-[2px] shadow-sm">
                <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/05/Logo-GHN-Orange.png" alt="GHN" className="max-h-full max-w-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
