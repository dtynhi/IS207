import { Link } from "react-router-dom";
import { Progress, message, Tag } from "antd"; // Import Tag
import { FireOutlined, LockOutlined, GiftOutlined } from "@ant-design/icons";
import { Price } from "../../../shared/components/price";
import type { Product } from "../../products/types/product.types";
import { useProductDetailActions } from "../../products/hooks/use-product-detail-actions";
import { getUserId } from "../../../shared/session/storage";

export const FlashSaleCard = ({ product, status = "ONGOING" }: { product: Product, status?: string }) => {
  const userId = getUserId();
  const { addCart, contextHolder } = useProductDetailActions({
    userId: userId || "",
    productId: product.id,
    quantity: 1,
  });

  const soldCount = product.soldCount ?? 0;
  const totalStock = (product.stock ?? 0) + soldCount;
  const soldPercent = totalStock > 0 ? Math.round((soldCount / totalStock) * 100) : 0;
  
  const progressColor = soldPercent >= 80 ? "#ef4444" : soldPercent >= 50 ? "#f97316" : "#EE6AA7";
  const stockLabel = product.stock === 0 ? "Đã hết hàng" : product.stock <= 5 ? `Còn ${product.stock} SP` : "Đang bán chạy";

  // --- LOGIC GIÁ & TRANH CHẤP CHIẾN DỊCH ---
  const campaign = (product as any).saleCampaign;
  const isCampaignOngoing = campaign?.isActive && new Date(campaign.startTime).getTime() <= Date.now();
  const hasUpcomingCampaign = (product as any).hasUpcomingCampaign;

  // Cờ báo hiệu: Card này đang nằm trong khung giờ CHƯA TỚI
  const isUpcomingFlashSale = status === "UPCOMING"; 

  // Tính giá hiển thị
  // NẾU Flash Sale chưa chạy -> Lấy giá gốc của Flash Sale để nhá hàng (Dù bị Chiến dịch đe dọa)
  const finalPrice = Math.floor(product.price * (1 - product.discountPercentage / 100));

  return (
    <div className={`bg-white rounded-md p-2 flex flex-col h-full relative border border-gray-200 transition-all overflow-hidden ${isUpcomingFlashSale ? 'opacity-90 hover:shadow-md' : 'hover:shadow-lg'}`}>
      {contextHolder}

      {/* BADGE GIẢM GIÁ (Luôn hiển thị % của tab hiện tại) */}
      {product.discountPercentage > 0 && (
        <div className={`absolute top-0 left-0 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-br-md z-10 flex items-center gap-0.5 shadow-sm ${isCampaignOngoing ? "bg-purple-600" : "bg-red-600"}`}>
          {isCampaignOngoing ? <GiftOutlined className="text-yellow-300 text-[10px]" /> : <FireOutlined className="text-yellow-300 text-[10px]" />}
          -{product.discountPercentage}%
        </div>
      )}

      {/* BADGE SẮP DIỄN RA HOẶC BỊ ĐÈ */}
      <div className="absolute top-0 right-0 z-10 flex flex-col gap-1 items-end p-1">
         {isUpcomingFlashSale && (
           <Tag color="blue" className="m-0 border-none font-bold text-[10px]">SẮP MỞ BÁN</Tag>
         )}
         {/* Nếu Ca này đang chạy, mà tương lai có Chiến dịch -> Báo trước cho khách */}
         {!isUpcomingFlashSale && hasUpcomingCampaign && (
           <Tag color="purple" className="m-0 border-none font-bold text-[9px] px-1 py-0 shadow-sm opacity-90">SẮP CÓ SỰ KIỆN</Tag>
         )}
      </div>

      <Link to={`/products/${product.slug}`} className="w-full aspect-square mb-2 block relative group">
        <img
          src={product.thumbnail ?? "https://placehold.co/400x400/e2e8f0/64748b?text=No+Image"}
          alt={product.title}
          className={`w-full h-full object-contain transition-transform ${isUpcomingFlashSale ? 'grayscale-[20%]' : 'group-hover:scale-105'}`}
        />
        
        {/* LỚP PHỦ CHE KHI CHƯA MỞ BÁN */}
        {isUpcomingFlashSale && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 z-20">
            <div className="bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
               <LockOutlined /> 
            </div>
          </div>
        )}
      </Link>

      <Link to={`/products/${product.slug}`} className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 flex-grow hover:text-red-500 transition-colors">
        {product.title}
      </Link>

      <div className="mt-auto">
        <div className="flex flex-col mb-1.5 min-h-[42px] justify-end">
          {/* CHE GIÁ NẾU CA FLASH SALE CHƯA TỚI GIỜ */}
          {isUpcomingFlashSale ? (
             <div className="flex flex-col">
                <span className="text-red-500 font-black text-lg tracking-widest flex items-center gap-1">
                  <span className="text-sm">₫</span>?.?00
                </span>
                <span className="text-[10px] text-gray-500 font-medium line-through">Giá gốc: {product.price.toLocaleString('vi-VN')}đ</span>
             </div>
          ) : (
             <>
                <Price value={finalPrice} size="md" className="text-red-600 font-bold" />
                {product.discountPercentage > 0 && (
                  <span className="text-xs text-gray-400 line-through">
                    {product.price.toLocaleString('vi-VN')}đ
                  </span>
                )}
             </>
          )}
        </div>

        {totalStock > 0 && !isUpcomingFlashSale && (
          <div className="mb-2">
            <Progress percent={soldPercent} showInfo={false} strokeColor={progressColor} trailColor="#f1f5f9" size={["100%", 6]} className="!mb-0.5" />
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold" style={{ color: progressColor }}>{stockLabel}</span>
              {soldCount > 0 && <span className="text-[10px] text-gray-400">Đã bán {soldCount}</span>}
            </div>
          </div>
        )}

        <button
          className={`w-full text-white font-bold py-1.5 rounded-md text-sm transition-all
            ${isUpcomingFlashSale 
              ? "bg-gray-400 cursor-not-allowed" 
              : product.stock === 0
              ? "bg-gray-300 cursor-not-allowed"
              : addCart.isPending
              ? "bg-red-400 cursor-wait"
              : "bg-red-600 hover:bg-red-700 shadow-sm"
            }`}
          disabled={addCart.isPending || product.stock === 0 || isUpcomingFlashSale}
          onClick={(e) => {
            e.preventDefault();
            if (!userId) return message.warning("Bạn cần đăng nhập để thêm giỏ hàng!");
            addCart.mutate();
          }}
        >
          {isUpcomingFlashSale ? "Chờ mở bán" : product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ"}
        </button>
      </div>
    </div>
  );
};