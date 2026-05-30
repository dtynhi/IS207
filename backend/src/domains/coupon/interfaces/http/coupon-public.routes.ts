import { Router, type Request, type Response } from "express";
import { validateCouponForUse, calculateDiscount } from "../../coupon.service";

const router = Router();

/** Khách hàng dùng khi checkout — không yêu cầu admin */
router.post("/validate", async (req: Request, res: Response) => {
  try {
    const { code, orderTotal, productIds, userId } = req.body;
    const coupon = await validateCouponForUse(
      code,
      Number(orderTotal),
      productIds,
      userId,
      1,
    );
    const discount = calculateDiscount(coupon, orderTotal);
    res.json({
      coupon,
      discount,
      finalPrice: Math.max(Number(orderTotal) - discount, 0),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Không thể áp dụng coupon";
    res.status(400).json({ error: message });
  }
});

export default router;
