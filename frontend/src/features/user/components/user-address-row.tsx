import { Button, Flex, Popconfirm, Switch, Tag, Typography } from "antd";
import type { UserAddress } from "../types/user.types";

const { Text } = Typography;

type UserAddressRowProps = {
  address: UserAddress;
  onEdit: (address: UserAddress) => void;
  onToggleDefault: (id: string, value: boolean) => void;
  onDelete: (id: string) => void;
};

export const UserAddressRow = ({ address, onEdit, onToggleDefault, onDelete }: UserAddressRowProps) => {
  return (
    <Flex align="center" justify="space-between" gap={12} className="border-b border-[var(--border-light)] py-[14px]">
      <Text className="flex-1 text-sm">
        {address.mainAddress}
        {address.isDefault && <Tag color="purple" className="ml-2">Mặc định</Tag>}
      </Text>

      <Flex gap={10} align="center" className="shrink-0">
        <Switch size="small" checked={address.isDefault} onChange={(value) => onToggleDefault(address.idAddress, value)} />
        <Button size="small" onClick={() => onEdit(address)}>Sửa</Button>
        <Popconfirm title="Xoá?" onConfirm={() => onDelete(address.idAddress)} okText="Xoá" cancelText="Huỷ">
          <Button size="small" danger>Xoá</Button>
        </Popconfirm>
      </Flex>
    </Flex>
  );
};
