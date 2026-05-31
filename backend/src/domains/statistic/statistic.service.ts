import { prisma } from "../../infrastructure/db/prisma.client";
import { Request, Response } from "express"; 

export const getRevenueStatisticsService = async () => {
  try {
    // 1. Lấy đơn hàng hoàn thành (Không cần include bảng user nữa)
    const completedOrders = await prisma.order.findMany({
      where: {
        status: "delivered", // Sửa thành chữ thường "completed" nếu db lưu chữ thường
      },
      orderBy: {
        updatedAt: "desc", 
      }
    });

    // 2. Tính Tổng đơn và Tổng tiền
    const totalCompletedOrders = completedOrders.length;
    
    const totalRevenue = completedOrders.reduce((sum, order) => {
      return sum + Number(order.finalAmount || 0);
    }, 0);

    // 3. Xào nấu danh sách đơn hàng (Lấy thẳng tên từ order.fullName)
    const completedOrdersList = completedOrders .filter(order => Number(order.finalAmount) > 0).map(order => ({
      id: order.id,
      fullName: order.fullName || "Khách hàng vãng lai", // <-- SỬA Ở ĐÂY
      totalPrice: Number(order.finalAmount || 0),
      paymentMethod: order.paymentMethod,
      completedAt: order.updatedAt, 
    }));

    // 4. Trả dữ liệu về Frontend
    return ({
      totalRevenue,
      totalCompletedOrders,
      completedOrdersList
    });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê doanh thu:", error);
    throw new Error("Lỗi khi lấy thống kê doanh thu");
  }
};

