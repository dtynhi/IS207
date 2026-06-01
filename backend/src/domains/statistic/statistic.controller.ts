import { Request, Response } from "express";
import { getRevenueStatisticsService } from "./statistic.service";

export const getStatistics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await getRevenueStatisticsService({
      startDate: startDate as string,
      endDate: endDate as string,
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy thống kê" });
  }
};