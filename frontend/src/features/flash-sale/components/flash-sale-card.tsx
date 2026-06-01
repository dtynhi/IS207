import { Link } from "react-router-dom";
import { Progress, message } from "antd"; 
import { FireOutlined, LockOutlined, GiftOutlined } from "@ant-design/icons"; 
import { Price } from "../../../shared/components/price";
import type { Product } from "../../products/types/product.types";
import { useProductDetailActions } from "../../products/hooks/use-product-detail-actions";
import { getUserId } from "../../../shared/session/storage";

export const FlashSaleCard = ({ product, status = "ONGOING" }: { product: Product, status?: string }) => {
  const finalPrice = Math.floor(product.price * (1 - product.discountPercentage / 100));
  const userId = getUserId();

  const { addCart, contextHolder } = useProductDetailActions({
    userId: userId || "",
    productId: product.id,
    quantity: 1,
  });

  const soldCount = product.soldCount ?? 0;
  const totalStock = (product.stock ?? 0) + soldCount;
  const soldPercent = totalStock > 0 ? Math.round((soldCount / totalStock) * 100) : 0;

  const progressColor =
    soldPercent >= 80 ? "#ef4444" :
    soldPercent >= 50 ? "#f97316" :
    "#EE6AA7";

  const stockLabel =
    product.stock === 0 ? "Đã hết hàng" :
    product.stock <= 5 ? `Còn ${product.stock} sản phẩm` :
    soldPercent >= 70 ? "Đang bán chạy!" : "Đang có hàng";

  const campaign = (product as any).saleCampaign;
  const isCampaignOngoing = campaign?.isActive && new Date(campaign.startTime).getTime() <= Date.now();

  const isUpcoming = status === "UPCOMING" && !isCampaignOngoing;

  return (
    <div className={`bg-white rounded-md p-2 flex flex-col h-full relative border border-gray-200 hover:shadow-md transition-all overflow-hidden ${isUpcoming ? 'opacity-80' : ''}`}>
      {contextHolder}

      {product.discountPercentage > 0 && (
        <div className={`absolute top-0 left-0 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-br-md z-10 flex items-center gap-0.5 shadow-sm ${isCampaignOngoing ? "bg-purple-600" : "bg-red-600"}`}>
          {isCampaignOngoing ? <GiftOutlined className="text-yellow-300 text-[10px]" /> : <FireOutlined className="text-yellow-300 text-[10px]" />}
          -{product.discountPercentage}%
        </div>
      )}

      {isUpcoming && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-md z-10">
          SẮP MỞ BÁN
        </div>
      )}

      {/* Ảnh sản phẩm */}
      <Link to={`/products/${product.slug}`} className="w-full aspect-square mb-2 block relative group">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            className={`w-full h-full object-contain transition-transform ${isUpcoming ? 'grayscale-[30%]' : 'group-hover:scale-105'}`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://placehold.co/400x400/e2e8f0/64748b?text=Not+Found";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        )}
        
        {isUpcoming && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40">
            <div className="bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
               <LockOutlined /> Chờ mở bán
            </div>
          </div>
        )}
      </Link>

      <Link
        to={`/products/${product.slug}`}
        className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 flex-grow hover:text-orange-500"
      >
        {product.title}
      </Link>

      <div className="mt-auto">
        {/* Giá */}
        <div className="flex flex-col mb-1.5 min-h-[40px] justify-end">
          {isUpcoming ? (
            <div className="text-red-600 font-black text-lg tracking-widest flex items-center gap-1">
              <span className="text-sm">₫</span>?.?00
            </div>
          ) : (
            <Price value={finalPrice} size="md" className="text-red-600 font-bold" />
          )}
          
          {product.discountPercentage > 0 && !isUpcoming && (
            <span className="text-xs text-gray-400 line-through">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
            </span>
          )}
        </div>

        {totalStock > 0 && !isUpcoming && (
          <div className="mb-2">
            <Progress
              percent={soldPercent}
              showInfo={false}
              strokeColor={progressColor}
              trailColor="#f1f5f9"
              size={["100%", 6]}
              className="!mb-0.5"
            />
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold" style={{ color: progressColor }}>
                {stockLabel}
              </span>
              {soldCount > 0 && (
                <span className="text-[10px] text-gray-400">Đã bán {soldCount}</span>
              )}
            </div>
          </div>
        )}

        {/* Nút thêm giỏ hàng */}
        <button
          className={`w-full text-white font-bold py-1.5 rounded-full text-sm transition-all shadow-sm
            ${isUpcoming 
              ? "bg-gray-400 cursor-not-allowed opacity-80" 
              : product.stock === 0
              ? "bg-gray-300 cursor-not-allowed"
              : addCart.isPending
              ? "bg-[#EE6AA7] opacity-70 cursor-not-allowed"
              : "bg-[#EE6AA7] hover:bg-[#FF69B4] hover:shadow-md"
            }`}
          disabled={addCart.isPending || product.stock === 0 || isUpcoming}
          onClick={(e) => {
            e.preventDefault();
            if (!userId) {
              message.warning("Bạn cần đăng nhập để thêm vào giỏ hàng nhé!");
              return;
            }
            addCart.mutate();
          }}
        >
          {isUpcoming ? "Sắp mở bán" 
           : product.stock === 0 ? "Hết hàng"
           : addCart.isPending ? "Đang thêm..."
           : "Thêm vào giỏ"}
        </button>
      </div>
    </div>
  );
};