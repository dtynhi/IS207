import { useQuery } from "@tanstack/react-query";
import { EnvironmentOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Form, Input, Row, Col, Space, Typography, Select, Radio } from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Breadcrumb } from "../../../shared/components/breadcrumb";
import { Price } from "../../../shared/components/price";
import { CheckoutProductList } from "../components/checkout-product-list";
import { useCheckoutPage } from "../hooks/use-checkout-page";
import { getUserAddressApi } from "../../user/api/user.api";
import { getUserId } from "../../../shared/session/storage";
import type { CheckoutFormValues } from "../types/checkout.types";
import type { UserAddress } from "../../user/types/user.types";

const { Text } = Typography;
const VN_ADDRESS_API = "https://provinces.open-api.vn/api";

type Province = { code: number; name: string };
type ProvinceDetail = {
  districts: Array<{
    wards: Array<{ code: number; name: string }>;
  }>;
};

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const userId = getUserId();
  const [form] = Form.useForm<CheckoutFormValues>();
  const { cartQuery, orderMutation, submitOrder, contextHolder } = useCheckoutPage();

  const items = cartQuery.data?.items || [];
  const total = Number(cartQuery.data?.totalPrice || 0);
  const selectedProvinceName = Form.useWatch("province", form);

  // Load user's saved addresses
  const userAddressesQuery = useQuery({
    queryKey: ["user-addresses-checkout", userId],
    queryFn: () => getUserAddressApi(userId),
    enabled: Boolean(userId),
  });

  const provincesQuery = useQuery({
    queryKey: ["vn-address-provinces"],
    queryFn: async (): Promise<Province[]> => {
      const response = await fetch(`${VN_ADDRESS_API}/?depth=1`);
      if (!response.ok) {
        throw new Error("Không tải được danh sách tỉnh/thành");
      }
      return response.json();
    },
  });

  const selectedProvince = provincesQuery.data?.find((province) => province.name === selectedProvinceName);

  const wardsQuery = useQuery({
    queryKey: ["vn-address-wards", selectedProvince?.code],
    queryFn: async (): Promise<ProvinceDetail> => {
      const response = await fetch(`${VN_ADDRESS_API}/p/${selectedProvince?.code}?depth=3`);
      if (!response.ok) {
        throw new Error("Không tải được danh sách phường/xã");
      }
      return response.json();
    },
    enabled: Boolean(selectedProvince?.code),
  });

  const provinceOptions = (provincesQuery.data || []).map((province) => ({
    value: province.name,
    label: province.name,
  }));

  const wardOptions = (wardsQuery.data?.districts || [])
    .flatMap((district) => district.wards || [])
    .map((ward) => ({
      value: ward.name,
      label: ward.name,
    }));

  // Create options for saved addresses
  const savedAddressOptions = (userAddressesQuery.data || []).map((addr: UserAddress) => ({
    value: addr.idAddress,
    label: `${addr.fullName} - ${addr.phone} - ${[addr.addressLine, addr.ward, addr.province].filter(Boolean).join(", ")}`,
  }));

  // Handle address selection
  const handleSelectAddress = (addressId: string) => {
    const selectedAddr = (userAddressesQuery.data || []).find((addr: UserAddress) => addr.idAddress === addressId);
    if (selectedAddr) {
      form.setFieldsValue({
        fullName: selectedAddr.fullName,
        phone: selectedAddr.phone,
        province: selectedAddr.province,
        ward: selectedAddr.ward,
        addressLine: selectedAddr.addressLine,
      });
    }
  };

  // Auto-fill default address on first load
  useEffect(() => {
    if (userAddressesQuery.data && userAddressesQuery.data.length > 0) {
      const defaultAddr = userAddressesQuery.data.find((addr: UserAddress) => addr.isDefault);
      if (defaultAddr) {
        handleSelectAddress(defaultAddr.idAddress);
      }
    }
  }, [userAddressesQuery.data]);

  return (
    <div className="animate-in pt-6 pb-6">
      {contextHolder}

      <Breadcrumb
        items={[
          { label: "Trang chủ", to: "/" },
          { label: "Giỏ hàng", to: "/cart" },
          { label: "Thanh toán" },
        ]}
      />

      {items.length === 0 ? (
        <Card>
          <Empty description="Không có sản phẩm" />
          <div className="mt-3 text-center">
            <Button type="primary" onClick={() => navigate("/")}>Mua sắm</Button>
          </div>
        </Card>
      ) : (
        <>
          <Card title={<Space><EnvironmentOutlined className="text-[var(--primary)]" /><Text className="text-[var(--primary)]">Địa chỉ nhận hàng</Text></Space>} className="mb-4 border-t-[3px] border-t-[var(--primary)]">
            <Form
              form={form}
              id="checkout-form"
              layout="vertical"
              initialValues={{ paymentMethod: "cod" }}
              onFinish={(values: CheckoutFormValues) => submitOrder(values)}
            >
              {/* Saved addresses selector */}
              {savedAddressOptions.length > 0 && (
                <Row gutter={16} className="mb-5">
                  <Col xs={24}>
                    <Form.Item label="Chọn địa chỉ đã lưu (hoặc nhập mới)">
                      <Select
                        placeholder="Chọn một địa chỉ đã lưu"
                        options={savedAddressOptions}
                        onChange={handleSelectAddress}
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: "Nhập họ tên" }]}>
                    <Input placeholder="Họ tên người nhận" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="phone" label="SĐT" rules={[{ required: true, message: "Nhập SĐT" }]}>
                    <Input placeholder="Số điện thoại" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="province" label="Tỉnh / Thành" rules={[{ required: true, message: "Chọn tỉnh/thành" }]}>
                    <Select
                      placeholder="Chọn tỉnh/thành"
                      options={provinceOptions}
                      loading={provincesQuery.isLoading}
                      onChange={() => form.setFieldValue("ward", undefined)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="ward" label="Phường / Xã" rules={[{ required: true, message: "Chọn phường/xã" }]}>
                    <Select
                      placeholder={selectedProvince ? "Chọn phường/xã" : "Chọn tỉnh/thành trước"}
                      options={wardOptions}
                      loading={wardsQuery.isLoading}
                      disabled={!selectedProvince}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item name="paymentMethod" label="Phương thức thanh toán" rules={[{ required: true, message: "Chọn phương thức thanh toán" }]}> 
                    <Radio.Group>
                      <Radio value="cod">Thanh toán khi nhận hàng</Radio>
                      <Radio value="bank">Thanh toán VNPay (Sandbox)</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item name="addressLine" label="Tên đường, Tòa nhà, Số nhà" rules={[{ required: true, message: "Nhập địa chỉ chi tiết" }]}>
                    <Input placeholder="Ví dụ: Số 10, Tòa A, Nguyễn Trãi" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <CheckoutProductList items={items} />

          <Card className="border border-[var(--primary-light)] bg-[var(--primary-soft)]" styles={{ body: { padding: "16px 20px" } }}>
            <div className="flex items-center justify-end gap-4 max-md:flex-wrap max-md:justify-start">
              <Text>Tổng ({items.length} sản phẩm):</Text>
              <Price value={total} size="xl" />
              <Button type="primary" htmlType="submit" form="checkout-form" loading={orderMutation.isPending} size="large" className="h-12 rounded-xl px-10 font-semibold">Đặt hàng</Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
