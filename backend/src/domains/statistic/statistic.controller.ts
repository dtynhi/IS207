import { Request, Response } from "express";
import {getRevenueStatisticsService } from "./statistic.service";

export const getStatistics = async (req: Request, res: Response) => {
  try {
    console.log("🚀 [BẪY 1]: FRONTEND ĐÃ GỌI VÀO API DOANH THU!");
    const data = await getRevenueStatisticsService();
    console.log("📦 [BẪY 2]: DỮ LIỆU TÌM THẤY TRONG DB LÀ:", data);
    res.status(200).json(data);
  } catch (error) {
    console.error("Lỗi khi lấy thống kê:", error);
    res.status(500).json({ error: "Lỗi khi lấy thống kê" });
  }
};