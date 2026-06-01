import { prisma } from "../../infrastructure/db/prisma.client";

interface StatQuery {
  startDate?: string;
  endDate?: string;
}

export const getRevenueStatisticsService = async (query: StatQuery) => {
  try {
    const { startDate, endDate } = query;
    
    // 1. Khởi tạo bộ lọc thời gian hiện tại
    const whereClause: any = {
      status: { in: ["delivered", "completed"] },
      paymentStatus: "paid",
      returnRequest: { isNot: { status: "approved" } }
    };

    const dateFilter: any = {};
    let hasDateFilter = false;
    if (startDate) { dateFilter.gte = new Date(startDate); hasDateFilter = true; }
    if (endDate) { dateFilter.lte = new Date(endDate); hasDateFilter = true; }
    if (hasDateFilter) whereClause.updatedAt = dateFilter;

    // 2. Lấy dữ liệu kỳ này
    const completedOrders = await prisma.order.findMany({
      where: whereClause,
      include: { items: { include: { product: { include: { productCategory: true } } } } },
      orderBy: { updatedAt: "asc" }
    });

    const totalOrdersCount = await prisma.order.count({ where: { createdAt: hasDateFilter ? dateFilter : undefined } });
    const returnedOrdersCount = await prisma.order.count({ where: { returnRequest: { status: "approved" }, updatedAt: hasDateFilter ? dateFilter : undefined } });

    // 3. Lấy dữ liệu KỲ TRƯỚC (Để so sánh tính %)
    let prevCompletedOrders: any[] = [];
    let prevReturnedOrdersCount = 0;

    if (hasDateFilter && startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const diff = end - start; // Khoảng thời gian lọc
      const prevStart = new Date(start - diff);
      const prevEnd = new Date(start);
      
      const prevWhere = { ...whereClause, updatedAt: { gte: prevStart, lt: prevEnd } };
      prevCompletedOrders = await prisma.order.findMany({ where: prevWhere, include: { items: true } });
      prevReturnedOrdersCount = await prisma.order.count({ where: { returnRequest: { status: "approved" }, updatedAt: { gte: prevStart, lt: prevEnd } } });
    }

    // 4. Khởi tạo biến lưu trữ và gom nhóm
    let totalRevenue = 0, totalItemsSold = 0;
    const dateMap: Record<string, { rev: number, ord: number, items: number }> = {};
    const productStats: any = {}, categoryStats: any = {};

    completedOrders.forEach(order => {
      const amount = Number(order.finalAmount || 0);
      totalRevenue += amount;
      
      const dateStr = order.updatedAt.toISOString().split("T")[0];
      if (!dateMap[dateStr]) dateMap[dateStr] = { rev: 0, ord: 0, items: 0 };
      dateMap[dateStr].rev += amount;
      dateMap[dateStr].ord += 1;

      order.items.forEach(item => {
        totalItemsSold += item.quantity;
        dateMap[dateStr].items += item.quantity;
        const itemRevenue = item.price * (1 - item.discountPercentage / 100) * item.quantity;

        if (item.product) {
          const pId = item.product.id;
          if (!productStats[pId]) productStats[pId] = { name: item.product.title, quantity: 0, revenue: 0 };
          productStats[pId].quantity += item.quantity;
          productStats[pId].revenue += itemRevenue;

          const categoryName = item.product.productCategory?.title || "Chưa phân loại";
          categoryStats[categoryName] = (categoryStats[categoryName] || 0) + itemRevenue;
        }
      });
    });

    // 5. Tính toán các chỉ số hiện tại
    const totalCompletedOrders = completedOrders.length;
    const aov = totalCompletedOrders > 0 ? Math.round(totalRevenue / totalCompletedOrders) : 0;
    const resolvedCount = totalCompletedOrders + returnedOrdersCount;
    const returnRate = resolvedCount > 0 ? Number(((returnedOrdersCount / resolvedCount) * 100).toFixed(1)) : 0;

    // 6. Tính toán chỉ số kỳ trước
    let prevTotalRevenue = 0, prevTotalItemsSold = 0;
    prevCompletedOrders.forEach(o => {
      prevTotalRevenue += Number(o.finalAmount || 0);
      o.items.forEach((i: any) => prevTotalItemsSold += i.quantity);
    });
    const prevTotalOrders = prevCompletedOrders.length;
    const prevAov = prevTotalOrders > 0 ? Math.round(prevTotalRevenue / prevTotalOrders) : 0;
    const prevResolved = prevTotalOrders + prevReturnedOrdersCount;
    const prevReturnRate = prevResolved > 0 ? Number(((prevReturnedOrdersCount / prevResolved) * 100).toFixed(1)) : 0;

    // Hàm tiện ích tính % tăng trưởng
    const calcTrend = (curr: number, prev: number) => {
      if (prev === 0) return { percent: curr > 0 ? 100 : 0, isUp: curr >= prev };
      const diff = curr - prev;
      return { percent: Number(Math.abs((diff / prev) * 100).toFixed(1)), isUp: diff >= 0 };
    };

    // 7. Tạo dữ liệu biểu đồ mini (Sparklines)
    const sortedDates = Object.keys(dateMap).sort();
    const sparklines = {
      revenue: sortedDates.map(d => ({ val: dateMap[d].rev })),
      orders: sortedDates.map(d => ({ val: dateMap[d].ord })),
      aov: sortedDates.map(d => ({ val: dateMap[d].ord > 0 ? dateMap[d].rev / dateMap[d].ord : 0 })),
      items: sortedDates.map(d => ({ val: dateMap[d].items })),
      returnRate: [{val: prevReturnRate}, {val: returnRate}] 
    };

    // Fix lỗi biểu đồ không vẽ được nếu chỉ có 1 điểm
    Object.keys(sparklines).forEach(k => {
      const arr = (sparklines as any)[k];
      if (arr.length === 0) (sparklines as any)[k] = [{val: 0}, {val: 0}];
      else if (arr.length === 1) (sparklines as any)[k] = [{val: 0}, arr[0]];
    });

    const chartData = sortedDates.map(d => ({ date: d, revenue: dateMap[d].rev }));
    const topProducts = Object.values(productStats).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 5);
    const categoryChartData = Object.entries(categoryStats).map(([name, value]) => ({ name, value }));

    const completedOrdersList = completedOrders.map(order => ({
      id: order.id,
      fullName: order.fullName || "Khách hàng vãng lai",
      totalPrice: Number(order.finalAmount || 0),
      paymentMethod: order.paymentMethod,
      completedAt: order.updatedAt,
    }));

    return {
      overview: { 
        totalRevenue, totalCompletedOrders, totalItemsSold, aov, returnRate,
        trends: { // Dữ liệu thật % tăng/giảm
          revenue: calcTrend(totalRevenue, prevTotalRevenue),
          orders: calcTrend(totalCompletedOrders, prevTotalOrders),
          aov: calcTrend(aov, prevAov),
          items: calcTrend(totalItemsSold, prevTotalItemsSold),
          returnRate: calcTrend(returnRate, prevReturnRate) 
        },
        sparklines // Dữ liệu thật cho biểu đồ mini
      },
      chartData,
      topProducts,
      categoryChartData,
      completedOrdersList
    };
  } catch (error) {
    console.error("Lỗi:", error);
    throw new Error("Lỗi khi lấy thống kê doanh thu");
  }
};