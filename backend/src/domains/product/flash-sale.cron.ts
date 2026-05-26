import cron from "node-cron";
import { prisma } from "../../infrastructure/db/prisma.client";

export const startFlashSaleCron = () => {
  cron.schedule("* * * * *", async () => {
    const now = new Date();

    try {
      const upcomingCampaigns = await prisma.saleCampaign.findMany({
        where: {
          isActive: false,
          startTime: { lte: now },
          endTime: { gt: now }
        },
        include: { products: true }
      });

      for (const cp of upcomingCampaigns) {
        await prisma.saleCampaign.update({
          where: { id: cp.id },
          data: { isActive: true }
        });
        
        if (cp.products && cp.products.length > 0) {
          await prisma.product.updateMany({
            where: { campaignId: cp.id },
            data: { discountPercentage: cp.discount }
          });
        }
        console.log(`[Campaign] Đã tự động kích hoạt chiến dịch: ${cp.name}`);
      }

      const ongoingCampaigns = await prisma.saleCampaign.findMany({
        where: {
          isActive: true,
          endTime: { lte: now }
        },
        include: { products: true }
      });

      for (const cp of ongoingCampaigns) {
        await prisma.saleCampaign.update({
          where: { id: cp.id },
          data: { isActive: false }
        });
        
        if (cp.products && cp.products.length > 0) {
          await prisma.product.updateMany({
            where: { campaignId: cp.id },
            data: { discountPercentage: 0, campaignId: null }
          });
        }
        console.log(`[Campaign] Đã tự động kết thúc chiến dịch: ${cp.name}`);
      }

    } catch (error) {
      console.error("[FlashSaleCron] Lỗi khi chạy tự động:", error);
    }
  });
};