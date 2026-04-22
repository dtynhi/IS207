import { Alert, Button, Card, Descriptions, Form, Input, Skeleton, Typography } from "antd";
import { UserSidebar } from "../components/user-sidebar";
import { useUserProfile } from "../hooks/use-user-profile";
import type { UserProfileFormValues } from "../types/user.types";

const { Text } = Typography;

export const UserProfilePage = () => {
  const { userId, profile, save, contextHolder } = useUserProfile();

  return (
    <div className="animate-in flex items-start gap-5 pt-6 pb-6">
      {contextHolder}
      <UserSidebar name={profile.data?.fullName} />

      <Card className="flex-1" title="Hồ sơ của tôi" extra={<Text type="secondary" className="text-[13px]">Quản lý thông tin tài khoản</Text>}>
        {!userId && <Alert type="warning" showIcon message="Vui lòng đăng nhập" className="mb-4" />}

        {profile.isPending ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : profile.data ? (
          <div className="max-w-[460px]">
            <Descriptions bordered size="small" column={1} className="mb-5" items={[{ key: "email", label: "Email", children: profile.data.email }]} />

            <Form
              layout="vertical"
              onFinish={(values: UserProfileFormValues) => save.mutate(values)}
              initialValues={{
                fullName: profile.data.fullName,
                phone: profile.data.phone || undefined,
                avatar: profile.data.avatar || undefined,
              }}
              key={profile.data.id}
            >
              <Form.Item name="fullName" label="Họ tên"><Input /></Form.Item>
              <Form.Item name="phone" label="Số điện thoại"><Input /></Form.Item>
              <Form.Item name="avatar" label="URL ảnh đại diện"><Input /></Form.Item>
              <Button type="primary" htmlType="submit" loading={save.isPending}>Lưu thay đổi</Button>
            </Form>
          </div>
        ) : null}
      </Card>
    </div>
  );
};
