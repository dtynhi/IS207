import { Link } from "react-router-dom";
import { Price } from "../../../shared/components/price";
import type { Product } from "../../products/types/product.types";

export const FlashSaleCard = ({ product }: { product: Product }) => {
  const finalPrice = Math.floor(product.price * (1 - product.discountPercentage / 100));

  return (
    <div className="bg-white rounded-md p-2 flex flex-col h-full relative border border-gray-200 hover:shadow-md transition-shadow">
      
      {/* Nhãn phần trăm giảm giá góc trái */}
      {product.discountPercentage > 0 && (
        <div className="absolute top-0 left-0 bg-red-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-br-md z-10">
          GIẢM {product.discountPercentage}%
        </div>
      )}

      {/* Ảnh sản phẩm */}
      <Link to={`/products/${product.slug}`} className="w-full aspect-square mb-2 block">
          {product.thumbnail ? (
            <img 
              src={product.thumbnail} 
              alt={product.title} 
              className="w-full h-full object-contain" 
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://placehold.co/400x400/e2e8f0/64748b?text=Not+Found";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No Image</div>
          )}
      </Link>

      {/* Tên sản phẩm */}
      <Link to={`/products/${product.slug}`} className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 flex-grow hover:text-orange-500">
          {product.title}
      </Link>

      {/* Khu vực Giá & Nút bấm */}
      <div className="mt-auto">
        <div className="flex flex-col mb-2">
           <Price value={finalPrice} size="md" className="text-red-600 font-bold" />
           {product.discountPercentage > 0 && (
              <span className="text-xs text-gray-400 line-through">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
              </span>
           )}
        </div>

        {/* Nút THÊM VÀO GIỎ*/}
        <button 
            className="w-full bg-[#EE6AA7] hover:bg-[#FF69B4] text-white font-bold py-1.5 rounded-full text-sm transition-colors shadow-md"          
            onClick={(e) => {
             e.preventDefault();
             alert('Đã thêm vào giỏ!');
          }}
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};