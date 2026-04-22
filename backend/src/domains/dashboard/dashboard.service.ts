import { prisma } from "../../infrastructure/db/prisma.client";

export const getDashboardSummary = async () => {
  const [totalProducts, totalUsers, totalOrders, totalCategories] = await Promise.all([
    prisma.product.count({ where: { deleted: false } }),
    prisma.user.count({ where: { deleted: false } }),
    prisma.order.count(),
    prisma.productCategory.count({ where: { deleted: false } }),
  ]);

  return { totalProducts, totalUsers, totalOrders, totalCategories };
};
