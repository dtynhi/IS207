import { EnvironmentOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Form, Input, Row, Col, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "../../../shared/components/breadcrumb";
import { Price } from "../../../shared/components/price";
import { CheckoutProductList } from "../components/checkout-product-list";
import { useCheckoutPage } from "../hooks/use-checkout-page";
import type { CheckoutFormValues } from "../types/checkout.types";

const { Text } = Typography;

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartQuery, orderMutation, submitOrder, contextHolder } = useCheckoutPage();

  const items = cartQuery.data?.items || [];
  const total = Number(cartQuery.data?.totalPrice || 0);

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
            <Form id="checkout-form" layout="vertical" onFinish={(values: CheckoutFormValues) => submitOrder(values)}>
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
              <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: "Nhập địa chỉ" }]}>
                <Input placeholder="Địa chỉ nhận hàng" />
              </Form.Item>
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
