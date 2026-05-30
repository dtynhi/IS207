import { syncFlashSaleStatuses } from "./product.service";

export const startFlashSaleCron = () => {
  console.log("[FlashSale] Cỗ máy đếm giờ đã khởi động! Quét tự động mỗi 60 giây...");
  
  syncFlashSaleStatuses();
  
  setInterval(() => {
    syncFlashSaleStatuses().catch(err => 
      console.error("[FlashSale] Lỗi khi quét tự động:", err)
    );
  }, 60000); 
};