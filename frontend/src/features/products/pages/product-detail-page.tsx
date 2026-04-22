import { InboxOutlined } from "@ant-design/icons";
import { Button, Result, Skeleton, Typography } from "antd";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../../shared/components/breadcrumb";
import { getUserId } from "../../../shared/session/storage";
import { ProductDetailOverview } from "../components/product-detail-overview";
import { useProductDetailActions } from "../hooks/use-product-detail-actions";
import { useProductDetailQuery } from "../hooks/use-product-detail-query";

const { Title, Paragraph } = Typography;

export const ProductDetailPage = () => {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { data, isPending, isError } = useProductDetailQuery(slug);
  const [quantity, setQuantity] = useState(1);
  const userId = getUserId();
  const { addCart, contextHolder, api } = useProductDetailActions({ userId, productId: data?.id, quantity });

  if (isPending) {
    return (
      <div className="um-surface animate-in p-8">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="um-surface animate-in p-8">
        <Result icon={<InboxOutlined />} title="Không tìm thấy sản phẩm" extra={<Button type="primary" onClick={() => navigate("/")}>Quay lại trang chủ</Button>} />
      </div>
    );
  }

  return (
    <div className="animate-in pt-6 pb-6">
      {contextHolder}
      <Breadcrumb items={[{ label: "Uni Market", to: "/" }, { label: data.title }]} />

      <ProductDetailOverview
        data={data}
        quantity={quantity}
        setQuantity={setQuantity}
        addCartPending={addCart.isPending}
        onAddCart={() => {
          if (!userId) {
            api.warning("Vui lòng đăng nhập");
            return;
          }
          addCart.mutate();
        }}
        onBuyNow={() => {
          if (!userId) {
            navigate("/auth/login");
            return;
          }
          addCart.mutate();
          setTimeout(() => navigate("/cart"), 400);
        }}
      />

      <div className="um-surface mt-4 p-7 max-md:p-[18px]">
        <Title level={4} className="!mb-4 !border-b-2 !border-[var(--primary-light)] !pb-3 !uppercase">Mô tả sản phẩm</Title>
        <Paragraph className="!mb-0 text-sm leading-[1.8] text-[var(--text-secondary)]">{data.description || "Chưa có mô tả cho sản phẩm này."}</Paragraph>
      </div>
    </div>
  );
};
