import { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Space,
  message,
  Divider,
  Switch,
  Row,
  Col,
  Tooltip,
  Spin,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { couponAPI, type Coupon } from "../api/coupon.api";
import { searchUsersForAdminApi, type UserSearchHit } from "../../user/api/user.api";

export const CouponFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!id;
  const [mode, setMode] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [userOptions, setUserOptions] = useState<UserSearchHit[]>([]);
  const [userSearching, setUserSearching] = useState(false);

  useEffect(() => {
    if (id) {
      loadCoupon();
    }
  }, [id]);

  const loadCoupon = async () => {
    try {
      const data = await couponAPI.getById(id!);
      setMode(data.mode || "PUBLIC");
      form.setFieldsValue({
        code: data.code,
        description: data.description,
        type: data.type,
        value: data.value,
        startsAt: data.startsAt ? dayjs(data.startsAt) : null,
        endsAt: data.endsAt ? dayjs(data.endsAt) : null,
        totalUsageLimit: data.totalUsageLimit,
        maxUsagePerUser: data.maxUsagePerUser,
        mode: data.mode || "PUBLIC",
        refundPolicy: data.refundPolicy,
        minOrderAmount: data.minOrderAmount,
        status: data.status === "active",
        assignedUserIds: (data as any).assignedUserIds || [],
      });
    } catch (error: any) {
      message.error(error.message);
      navigate("/admin/coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSearch = async (value: string) => {
    const q = value.trim();
    if (q.length < 2) {
      setUserOptions([]);
      return;
    }
    setUserSearching(true);
    try {
      const users = await searchUsersForAdminApi(q);
      setUserOptions(users);
    } catch {
      setUserOptions([]);
    } finally {
      setUserSearching(false);
    }
  };

  const formatUserOption = (user: UserSearchHit) => {
    const phone = user.phone ? ` · ${user.phone}` : "";
    return `${user.fullName} (${user.email})${phone}`;
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const payload: any = {
        code: values.code.toUpperCase(),
        description: values.description,
        type: values.type,
        value: values.value,
        startsAt: values.startsAt ? values.startsAt.toISOString() : undefined,
        endsAt: values.endsAt ? values.endsAt.toISOString() : undefined,
        totalUsageLimit: values.totalUsageLimit,
        maxUsagePerUser: values.maxUsagePerUser,
        mode: values.mode,
        refundPolicy: values.refundPolicy,
        minOrderAmount: values.minOrderAmount || 0,
        status: values.status ? "active" : "inactive",
        assignedUserIds: values.assignedUserIds,
      };

      if (isEdit) {
        await couponAPI.update(id!, payload);
        message.success("Cập nhật coupon thành công");
      } else {
        await couponAPI.create(payload);
        message.success("Tạo coupon thành công");
      }

      navigate("/admin/coupons");
    } catch (error: any) {
      const apiMessage = error?.response?.data?.error || error.message || "Đã có lỗi xảy ra";
      message.error(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
      </h1>

      <div className="bg-white p-8 rounded-lg">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{
            type: "percent",
            mode: "PUBLIC",
            refundPolicy: "NONE",
            status: true,
            minOrderAmount: 0,
          }}
        >
          {/* Thông tin cơ bản */}
          <Divider>Thông tin cơ bản</Divider>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Mã giảm giá"
                name="code"
                rules={[
                  { required: true, message: "Vui lòng nhập mã giảm giá" },
                  {
                    pattern: /^[A-Z0-9_]+$/,
                    message: "Chỉ chứa chữ cái in hoa, số và dấu gạch dưới",
                  },
                ]}
              >
                <Input placeholder="VD: SAVE10, SUMMER2024" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Mô tả"
                name="description"
              >
                <Input placeholder="VD: Giảm 10% cho mọi sản phẩm" />
              </Form.Item>
            </Col>
          </Row>

          {/* Loại giảm giá */}
          <Divider>Loại & Giá trị giảm</Divider>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Loại giảm giá"
                name="type"
                rules={[{ required: true, message: "Vui lòng chọn loại" }]}
              >
                <Select
                  options={[
                    { label: "Giảm theo phần trăm", value: "percent" },
                    { label: "Giảm số tiền cố định", value: "amount" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Giá trị"
                name="value"
                rules={[
                  { required: true, message: "Vui lòng nhập giá trị" },
                  { type: "number", min: 1, message: "Phải > 0" },
                ]}
              >
                <InputNumber
                  min={1}
                  placeholder="0"
                  className="w-full"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Thời gian */}
          <Divider>Thời gian áp dụng</Divider>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Ngày bắt đầu"
                name="startsAt"
                rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
              >
                <DatePicker showTime className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Ngày kết thúc"
                name="endsAt"
                rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
              >
                <DatePicker showTime className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          {/* Giới hạn sử dụng */}
          <Divider>Giới hạn sử dụng</Divider>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tổng số lượt sử dụng toàn hệ thống"
                name="totalUsageLimit"
                rules={[
                  { required: true, message: "Vui lòng nhập tổng số lượt sử dụng" },
                  { type: "number", min: 1, message: "Phải >= 1" },
                ]}
              >
                <InputNumber min={1} className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Giới hạn sử dụng mỗi khách hàng"
                name="maxUsagePerUser"
                rules={[
                  { required: true, message: "Vui lòng nhập giới hạn sử dụng mỗi khách hàng" },
                  { type: "number", min: 1, message: "Phải >= 1" },
                ]}
              >
                <InputNumber min={1} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Chế độ phát hành"
                name="mode"
              >
                <Select
                  onChange={(value) => setMode(value)}
                  options={[
                    { label: "Công khai", value: "PUBLIC" },
                    { label: "Riêng tư", value: "PRIVATE" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Hoàn lượt khi hủy đơn"
                name="refundPolicy"
              >
                <Select
                  options={[
                    { label: "Không hoàn", value: "NONE" },
                    { label: "Hoàn khi hủy đơn", value: "ON_CANCEL" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          {mode === "PRIVATE" && (
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  label="Khách hàng được áp dụng"
                  name="assignedUserIds"
                  rules={[
                    { required: true, message: "Chế độ Riêng tư phải có ít nhất 1 khách hàng" },
                  ]}
                >
                  <Select
                    mode="multiple"
                    showSearch
                    filterOption={false}
                    placeholder="Tìm kiếm khách hàng theo tên, email hoặc số điện thoại"
                    onSearch={handleUserSearch}
                    notFoundContent={userSearching ? <Spin size="small" /> : "Không tìm thấy"}
                    options={userOptions.map((user) => ({
                      value: user.id,
                      label: formatUserOption(user),
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Đơn hàng tối thiểu (đ)"
                name="minOrderAmount"
              >
                <InputNumber min={0} placeholder="0" className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          {/* Trạng thái */}
          <Divider>Trạng thái</Divider>

          <Form.Item label="Kích hoạt" name="status" valuePropName="checked">
            <Switch />
          </Form.Item>

          {/* Submit buttons */}
          <Form.Item className="mb-0">
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {isEdit ? "Cập nhật" : "Tạo mới"}
              </Button>
              <Button onClick={() => navigate("/admin/coupons")}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
