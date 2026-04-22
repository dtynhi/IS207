import { LockOutlined, ShoppingOutlined, SolutionOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Flex, Typography } from "antd";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

const { Text } = Typography;

const items: { path: string; label: string; icon: ReactNode }[] = [
  { path: "/user/profile", label: "Hồ sơ", icon: <UserOutlined /> },
  { path: "/user/address", label: "Địa chỉ", icon: <SolutionOutlined /> },
  { path: "/user/purchase", label: "Đơn mua", icon: <ShoppingOutlined /> },
  { path: "/user/change-password", label: "Đổi mật khẩu", icon: <LockOutlined /> },
];

export const UserSidebar = ({ name }: { name?: string }) => {
  const { pathname } = useLocation();

  return (
    <div className="um-sidebar">
      {name && (
        <Flex gap={12} align="center" className="mb-1 border-b border-[var(--border-light)] p-[14px]">
          <Avatar size={40} className="!bg-[linear-gradient(135deg,var(--primary),var(--primary-dark))]">{name[0]?.toUpperCase() || "U"}</Avatar>
          <Flex vertical>
            <Text strong className="text-sm">{name}</Text>
            <Text type="secondary" className="text-xs">Sửa hồ sơ</Text>
          </Flex>
        </Flex>
      )}
      {items.map((it) => (
        <Link key={it.path} to={it.path} className={`um-sidebar-item ${pathname === it.path ? "active" : ""}`}>
          {it.icon} {it.label}
        </Link>
      ))}
    </div>
  );
};
