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
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { couponAPI, type Coupon } from "../api/coupon.api";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export const CouponFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      loadCoupon();
    }
  }, [id]);

  const loadCoupon = async () => {
    try {
      const data = await couponAPI.getById(id!);
      setCoupon(data);
      form.setFieldsValue({
        code: data.code,
        description: data.description,
        type: data.type,
        value: data.value,
        startsAt: data.startsAt ? dayjs(data.startsAt) : null,
        endsAt: data.endsAt ? dayjs(data.endsAt) : null,
        maxUses: data.maxUses,
        minOrderAmount: data.minOrderAmount,
        status: data.status === "active",
      });
    } catch (error: any) {
      message.error(error.message);
      navigate("/admin/coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const payload = {
        code: values.code.toUpperCase(),
        description: values.description,
        type: values.type,
        value: values.value,
        startsAt: values.startsAt ? values.startsAt.toISOString() : undefined,
        endsAt: values.endsAt ? values.endsAt.toISOString() : undefined,
        maxUses: values.maxUses,
        minOrderAmount: values.minOrderAmount || 0,
        status: values.status ? "active" : "inactive",
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
      message.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "Chỉnh sửa Coupon" : "Tạo Coupon mới"}
      </h1>

      <div className="bg-white p-8 rounded-lg">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{
            type: "percent",
            status: true,
            minOrderAmount: 0,
          }}
        >
          {/* Thông tin cơ bản */}
          <Divider>Thông tin cơ bản</Divider>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Mã Coupon"
                name="code"
                rules={[
                  { required: true, message: "Vui lòng nhập mã coupon" },
                  {
                    pattern: /^[A-Z0-9_]+$/,
                    message: "Chỉ chứa chữ cái, số và dấu gạch dưới",
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
                    { label: "Phần trăm (%)", value: "percent" },
                    { label: "Tiền cố định (đ)", value: "amount" },
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
              <Form.Item label="Ngày bắt đầu" name="startsAt">
                <DatePicker showTime className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Ngày kết thúc" name="endsAt">
                <DatePicker showTime className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          {/* Giới hạn sử dụng */}
          <Divider>Giới hạn sử dụng</Divider>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <Tooltip title="Để trống = không giới hạn">
                    Số lần sử dụng tối đa
                  </Tooltip>
                }
                name="maxUses"
              >
                <InputNumber min={1} placeholder="Để trống = không giới hạn" className="w-full" />
              </Form.Item>
            </Col>
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
