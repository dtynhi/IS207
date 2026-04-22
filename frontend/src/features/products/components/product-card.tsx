import { InboxOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Price } from "../../../shared/components/price";
import type { Product } from "../types/product.types";

export const ProductCard = ({ product }: { product: Product }) => {
  const finalPrice = Math.floor(product.price * (1 - product.discountPercentage / 100));

  return (
    <Link to={`/products/${product.slug}`} className="um-product-card-link">
      <div className="um-card um-product-card-root">
        {/* Badges */}
        {product.discountPercentage > 0 && (
          <div className="um-card-badge">-{product.discountPercentage}%</div>
        )}
        {product.stock <= 0 && <div className="um-card-badge-out">Hết hàng</div>}

        {/* Image */}
        <div className="um-card-img-wrap">
          {product.thumbnail ? (
            <img 
              src={product.thumbnail} 
              alt={product.title} 
              className="um-card-img" 
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null; // prevent infinite loop
                e.currentTarget.src = "https://placehold.co/400x400/e2e8f0/64748b?text=Not+Found";
              }}
            />
          ) : (
            <div className="um-card-img-placeholder"><InboxOutlined /></div>
          )}
        </div>

        {/* Body */}
        <div className="um-card-body">
          <div className="um-card-title">{product.title}</div>
          <div className="um-card-footer">
            <Price
              value={finalPrice}
              old={product.discountPercentage > 0 ? product.price : undefined}
              size="md"
            />
            <div className="um-card-sold">Đã bán {Math.abs(product.id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)) % 250 + 5}</div>
          </div>
        </div>
      </div>
    </Link>
  );
};
