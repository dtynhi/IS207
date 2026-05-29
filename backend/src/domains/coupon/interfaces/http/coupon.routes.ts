import { Router, type Request, type Response } from "express";
import {
  createCoupon,
  updateCoupon,
  getCouponById,
  listCoupons,
  deleteCoupon,
  validateCouponForUse,
  calculateDiscount,
  incrementCouponUsage,
} from "../../coupon.service";
import type { CreateCouponInput, UpdateCouponInput } from "../../coupon.service";

const router = Router();

// Create coupon
router.post("/", async (req: Request, res: Response) => {
  try {
    const input: CreateCouponInput = {
      code: req.body.code,
      description: req.body.description,
      type: req.body.type,
      value: req.body.value,
      startsAt: req.body.startsAt ? new Date(req.body.startsAt) : undefined,
      endsAt: req.body.endsAt ? new Date(req.body.endsAt) : undefined,
      maxUses: req.body.maxUses,
      minOrderAmount: req.body.minOrderAmount,
      applyTo: req.body.applyTo,
      status: req.body.status,
    };

    const coupon = await createCoupon(input);
    res.status(201).json(coupon);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// List coupons
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await listCoupons({
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      search: req.query.search as string,
      status: req.query.status as "active" | "inactive",
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get coupon by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const coupon = await getCouponById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ error: "Coupon không tồn tại" });
    }
    res.json(coupon);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update coupon
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const input: UpdateCouponInput = {
      id: req.params.id,
      code: req.body.code,
      description: req.body.description,
      type: req.body.type,
      value: req.body.value,
      startsAt: req.body.startsAt ? new Date(req.body.startsAt) : undefined,
      endsAt: req.body.endsAt ? new Date(req.body.endsAt) : undefined,
      maxUses: req.body.maxUses,
      minOrderAmount: req.body.minOrderAmount,
      applyTo: req.body.applyTo,
      status: req.body.status,
    };

    const coupon = await updateCoupon(input);
    res.json(coupon);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete coupon
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await deleteCoupon(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Validate coupon for use
router.post("/validate", async (req: Request, res: Response) => {
  try {
    const { code, orderTotal, productIds } = req.body;
    const coupon = await validateCouponForUse(code, orderTotal, productIds);
    const discount = calculateDiscount(coupon, orderTotal);
    const finalPrice = orderTotal - discount;

    res.json({
      coupon,
      discount,
      finalPrice,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Apply coupon
router.post("/apply", async (req: Request, res: Response) => {
  try {
    const { code, orderTotal, productIds } = req.body;
    const coupon = await validateCouponForUse(code, orderTotal, productIds);
    const discount = calculateDiscount(coupon, orderTotal);

    // Increment usage
    await incrementCouponUsage(coupon.id);

    res.json({
      coupon,
      discount,
      finalPrice: orderTotal - discount,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
