import { Router, type Request, type Response } from "express";
import { requireAdmin } from "../../../../shared/middleware/admin-auth.middleware";
import {
  createCoupon,
  updateCoupon,
  getCouponById,
  listCoupons,
  deleteCoupon,
} from "../../coupon.service";
import type { CreateCouponInput, UpdateCouponInput } from "../../coupon.service";

const router = Router();

// Create coupon
router.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const input: CreateCouponInput = {
      code: req.body.code,
      description: req.body.description,
      type: req.body.type,
      value: req.body.value,
      startsAt: req.body.startsAt ? new Date(req.body.startsAt) : undefined,
      endsAt: req.body.endsAt ? new Date(req.body.endsAt) : undefined,
      totalUsageLimit: req.body.totalUsageLimit,
      maxUsagePerUser: req.body.maxUsagePerUser,
      mode: req.body.mode,
      refundPolicy: req.body.refundPolicy,
      minOrderAmount: req.body.minOrderAmount,
      applyTo: req.body.applyTo,
      status: req.body.status,
      assignedUserIds: req.body.assignedUserIds,
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
      sortBy: (req.query.sortBy as string) ?? "createdAt",
      sortOrder: (req.query.sortOrder as "asc" | "desc") ?? "desc",
      search: req.query.search as string,
      computedStatus: req.query.computedStatus as
        | "ACTIVE"
        | "EXPIRED"
        | "DISABLED"
        | "OUT_OF_USAGE"
        | undefined,
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
router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const input: UpdateCouponInput = {
      id: req.params.id,
      code: req.body.code,
      description: req.body.description,
      type: req.body.type,
      value: req.body.value,
      startsAt: req.body.startsAt ? new Date(req.body.startsAt) : undefined,
      endsAt: req.body.endsAt ? new Date(req.body.endsAt) : undefined,
      totalUsageLimit: req.body.totalUsageLimit,
      maxUsagePerUser: req.body.maxUsagePerUser,
      mode: req.body.mode,
      refundPolicy: req.body.refundPolicy,
      minOrderAmount: req.body.minOrderAmount,
      applyTo: req.body.applyTo,
      status: req.body.status,
      assignedUserIds: req.body.assignedUserIds,
    };

    const coupon = await updateCoupon(input);
    res.json(coupon);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete coupon
router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    await deleteCoupon(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});


export default router;
