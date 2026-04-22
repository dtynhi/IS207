import { Button, Card, Form, Input, Typography } from "antd";
import { UserSidebar } from "../components/user-sidebar";
import { useUserChangePassword } from "../hooks/use-user-change-password";
import type { ChangePasswordFormValues } from "../types/user.types";

const { Text } = Typography;

export const ChangePasswordPage = () => {
  const { change, contextHolder } = useUserChangePassword();

  return (
    <div className="animate-in flex items-start gap-5 pt-6 pb-6">
      {contextHolder}
      <UserSidebar />

      <Card className="flex-1" title="Đổi mật khẩu" extra={<Text type="secondary" className="text-[13px]">Bảo mật tài khoản</Text>}>
        <div className="max-w-[400px]">
          <Form layout="vertical" onFinish={(values: ChangePasswordFormValues) => change.mutate(values)}>
            <Form.Item name="oldPassword" label="Mật khẩu hiện tại" rules={[{ required: true, message: "Bắt buộc" }]}><Input.Password /></Form.Item>
            <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true }, { min: 6, message: "Tối thiểu 6 ký tự" }]}><Input.Password /></Form.Item>
            <Form.Item name="confirmPassword" label="Xác nhận" rules={[{ required: true }]}><Input.Password /></Form.Item>
            <Button type="primary" htmlType="submit" loading={change.isPending}>Xác nhận</Button>
          </Form>
        </div>
      </Card>
    </div>
  );
};
