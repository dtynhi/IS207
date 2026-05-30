import { prisma } from "../../infrastructure/db/prisma.client";
import { getSearchValue, toPaginationMeta, toSkipTake } from "../../shared/query/query-utils";
import type { Prisma } from "@prisma/client";
import type { CouponQueryParams } from "./coupon.query";

export type CouponClassification = "PERCENT_DISCOUNT" | "FIXED_DISCOUNT" | "FREE_SHIPPING";
export type VoucherStatus = "ACTIVE" | "EXPIRED" | "DISABLED" | "OUT_OF_USAGE";

export interface CreateCouponInput {
  code: string;
  description?: string;
  classification?: CouponClassification;
  type: "percent" | "amount";
  value: number;
  startsAt?: Date;
  endsAt?: Date;
  totalUsageLimit?: number;
  maxUsagePerUser?: number;
  mode?: "PUBLIC" | "PRIVATE" | "LIMITED";
  refundPolicy?: "NONE" | "ON_CANCEL" | "ON_RETURN";
  minOrderAmount?: number;
  applyTo?: Prisma.InputJsonValue;
  status: "active" | "inactive";
}

export interface UpdateCouponInput extends Partial<CreateCouponInput> {
  id: string;
}

// Validate coupon input
export const getCouponComputedStatus = (coupon: {
  status: string;
  startsAt?: Date | string | null;
  endsAt?: Date | string | null;
  usedCount: number;
  totalUsageLimit?: number | null;
}): VoucherStatus => {
  const now = new Date();

  if (coupon.endsAt && now > new Date(coupon.endsAt)) {
    return "EXPIRED";
  }

  if (coupon.status !== "active") {
    return "DISABLED";
  }

  if (coupon.startsAt && now < new Date(coupon.startsAt)) {
    return "DISABLED";
  }

  if (coupon.totalUsageLimit != null && coupon.usedCount >= coupon.totalUsageLimit) {
    return "OUT_OF_USAGE";
  }

  return "ACTIVE";
};

const withComputedStatus = <T extends Parameters<typeof getCouponComputedStatus>[0]>(coupon: T) => ({
  ...coupon,
  computedStatus: getCouponComputedStatus(coupon),
});

const validateClassification = (classification: CouponClassification): boolean =>
  ["PERCENT_DISCOUNT", "FIXED_DISCOUNT", "FREE_SHIPPING"].includes(classification);

const resolveCouponClassification = (input: {
  classification?: CouponClassification;
  type: "percent" | "amount";
}): CouponClassification => {
  if (input.classification && validateClassification(input.classification)) {
    return input.classification;
  }

  return input.type === "percent" ? "PERCENT_DISCOUNT" : "FIXED_DISCOUNT";
};

const ensureTypeMatchesClassification = (classification: CouponClassification, type: string, value: number) => {
  if (classification === "PERCENT_DISCOUNT" && type !== "percent") {
    throw new Error("Classification PERCENT_DISCOUNT yêu cầu type là 'percent'");
  }
  if (classification === "FIXED_DISCOUNT" && type !== "amount") {
    throw new Error("Classification FIXED_DISCOUNT yêu cầu type là 'amount'");
  }
  if (classification === "FREE_SHIPPING") {
    if (type !== "amount") {
      throw new Error("Classification FREE_SHIPPING yêu cầu type là 'amount'");
    }
    if (value !== 0) {
      throw new Error("FREE_SHIPPING phải có value = 0");
    }
  }
};

export const validateCoupon = (input: CreateCouponInput): string[] => {
  const errors: string[] = [];
  const classification = resolveCouponClassification(input);

  if (!input.code || input.code.trim().length === 0) {
    errors.push("Code là bắt buộc");
  } else if (!/^[A-Z0-9_]+$/.test(input.code.toUpperCase())) {
    errors.push("Code chỉ được chứa chữ cái, số và dấu gạch dưới");
  }

  if (!input.type || !["percent", "amount"].includes(input.type)) {
    errors.push("Type phải là 'percent' hoặc 'amount'");
  }

  if (input.value < 0) {
    errors.push("Value phải >= 0");
  } else if (input.type === "percent" && input.value > 100) {
    errors.push("Value phần trăm không được vượt quá 100");
  }

  if (classification === "FREE_SHIPPING" && input.value !== 0) {
    errors.push("FREE_SHIPPING phải có value = 0");
  }

  if (classification === "PERCENT_DISCOUNT" && input.type !== "percent") {
    errors.push("PERCENT_DISCOUNT yêu cầu type là 'percent'");
  }

  if (classification === "FIXED_DISCOUNT" && input.type !== "amount") {
    errors.push("FIXED_DISCOUNT yêu cầu type là 'amount'");
  }

  if (input.startsAt && input.endsAt && new Date(input.startsAt) >= new Date(input.endsAt)) {
    errors.push("startsAt phải trước endsAt");
  }

  const totalUsageLimit = input.totalUsageLimit;
  if (totalUsageLimit !== undefined && totalUsageLimit !== null && totalUsageLimit < 1) {
    errors.push("totalUsageLimit phải >= 1");
  }

  if (input.maxUsagePerUser !== undefined && input.maxUsagePerUser !== null && input.maxUsagePerUser < 1) {
    errors.push("maxUsagePerUser phải >= 1");
  }

  if (input.mode && !["PUBLIC", "PRIVATE", "LIMITED"].includes(input.mode)) {
    errors.push("mode phải là PUBLIC, PRIVATE hoặc LIMITED");
  }

  if (input.refundPolicy && !["NONE", "ON_CANCEL", "ON_RETURN"].includes(input.refundPolicy)) {
    errors.push("refundPolicy phải là NONE, ON_CANCEL hoặc ON_RETURN");
  }

  if ((input.minOrderAmount ?? 0) < 0) {
    errors.push("minOrderAmount không được âm");
  }

  return errors;
};

// Create coupon
export const createCoupon = async (input: CreateCouponInput) => {
  const errors = validateCoupon(input);
  if (errors.length > 0) {
    throw new Error(errors.join(", "));
  }

  // Check if code already exists
  const existing = await prisma.coupon.findUnique({
    where: { code: input.code.toUpperCase() },
  });

  if (existing) {
    throw new Error("Code coupon đã tồn tại");
  }

  return prisma.coupon.create({
    data: {
      code: input.code.toUpperCase(),
      description: input.description,
      type: input.type,
      value: input.value,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      totalUsageLimit: input.totalUsageLimit,
      maxUsagePerUser: input.maxUsagePerUser,
      mode: input.mode ?? "PUBLIC",
      allowStacking: false,
      maxVouchersPerOrder: 1,
      refundPolicy: input.refundPolicy ?? "NONE",
      minOrderAmount: input.minOrderAmount ?? 0,
      applyTo: input.applyTo,
      status: input.status,
    },
  });
};

// Update coupon
export const updateCoupon = async (input: UpdateCouponInput) => {
  const { id, ...data } = input;

  if (data.code && data.type) {
    const errors = validateCoupon({
      code: data.code,
      classification: data.classification,
      type: data.type,
      value: data.value ?? 0,
      status: data.status ?? "active",
    });
    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }
  }

  // Check if code already exists (excluding current coupon)
  if (data.code) {
    const existing = await prisma.coupon.findFirst({
      where: {
        code: data.code.toUpperCase(),
        NOT: { id },
      },
    });
    if (existing) {
      throw new Error("Code coupon đã tồn tại");
    }
  }

  return prisma.coupon.update({
    where: { id },
    data: {
      ...data,
      code: data.code ? data.code.toUpperCase() : undefined,
      totalUsageLimit: data.totalUsageLimit,
      mode: data.mode,
      refundPolicy: data.refundPolicy,
    },
  });
};

// Get coupon by ID
export const getCouponById = async (id: string) => {
  const coupon = await prisma.coupon.findUnique({
    where: { id },
  });
  if (!coupon) {
    return null;
  }
  return withComputedStatus(coupon);
};

// Get coupon by code
export const getCouponByCode = async (code: string, tx?: Prisma.TransactionClient) => {
  const client = tx ?? prisma;
  return client.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });
};

const lockCouponById = async (tx: Prisma.TransactionClient, couponId: string) => {
  await tx.$executeRaw`SELECT id FROM "Coupon" WHERE id = ${couponId} FOR UPDATE`;
};

const lockVoucherUsage = async (tx: Prisma.TransactionClient, couponId: string, userId: string) => {
  await tx.$executeRaw`SELECT id FROM "VoucherUsage" WHERE "voucherId" = ${couponId} AND "userId" = ${userId} FOR UPDATE`;
};

export const getVoucherAssignment = async (
  couponId: string,
  userId: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx ?? prisma;
  return client.voucherAssignment.findUnique({
    where: { voucherId_userId: { voucherId: couponId, userId } },
  });
};

export const getVoucherUsage = async (
  couponId: string,
  userId: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx ?? prisma;
  return client.voucherUsage.findUnique({
    where: { voucherId_userId: { voucherId: couponId, userId } },
  });
};

const validateSingleCouponForUse = async (
  coupon: any,
  orderTotal: number,
  productIds?: string[],
  userId?: string,
  voucherCount = 1,
  tx?: Prisma.TransactionClient,
) => {
  if (!coupon) {
    throw new Error("Coupon không tồn tại");
  }

  const computedStatus = getCouponComputedStatus(coupon);
  if (computedStatus !== "ACTIVE") {
    if (computedStatus === "EXPIRED") {
      throw new Error("Coupon đã hết hạn");
    }
    if (computedStatus === "OUT_OF_USAGE") {
      throw new Error("Coupon đã dùng hết");
    }
    throw new Error("Coupon không hoạt động");
  }

  if (voucherCount > 1) {
    throw new Error("Mỗi đơn hàng chỉ được áp dụng tối đa 1 voucher");
  }

  const now = new Date();

  if (orderTotal < coupon.minOrderAmount) {
    throw new Error(`Đơn hàng phải >= ${coupon.minOrderAmount} để dùng coupon`);
  }

  if (coupon.applyTo && productIds && productIds.length > 0) {
    const applyData = coupon.applyTo as Record<string, unknown>;
    const productList = applyData.product_ids as string[];
    if (Array.isArray(productList) && productList.length > 0) {
      const hasApplicableProduct = productIds.some((id) => productList.includes(id));
      if (!hasApplicableProduct) {
        throw new Error("Coupon không áp cho sản phẩm trong giỏ hàng");
      }
    }
  }

  if (coupon.mode === "PRIVATE" && !userId) {
    throw new Error("Voucher này chỉ dành cho người dùng được chỉ định");
  }

  if (coupon.mode !== "PUBLIC" && !userId) {
    throw new Error("Cần đăng nhập để sử dụng voucher này");
  }

  if (userId) {
    const assignment = await getVoucherAssignment(coupon.id, userId, tx);
    const usage = await getVoucherUsage(coupon.id, userId, tx);
    let userQuota = coupon.maxUsagePerUser;

    if (assignment?.expiresAt && now > new Date(assignment.expiresAt)) {
      throw new Error("Quyền sử dụng voucher đã hết hạn");
    }

    if (assignment?.allowedUses != null) {
      userQuota = assignment.allowedUses;
    }

    if (assignment?.extraUses != null) {
      userQuota = (userQuota ?? 0) + assignment.extraUses;
    }

    if (coupon.mode === "PRIVATE" && !assignment) {
      throw new Error("Voucher chỉ dành cho người dùng được cấp quyền");
    }

    if (userQuota != null && usage?.usedCount != null && usage.usedCount >= userQuota) {
      throw new Error("Bạn đã sử dụng voucher này quá số lần cho phép");
    }
  }

  return coupon;
};

export const validateCouponForUse = async (
  code: string,
  orderTotal: number,
  productIds?: string[],
  userId?: string,
  voucherCount = 1,
  tx?: Prisma.TransactionClient,
) => {
  const coupon = await getCouponByCode(code, tx);
  return validateSingleCouponForUse(coupon, orderTotal, productIds, userId, voucherCount, tx);
};

export const incrementCouponUsage = async (
  couponId: string,
  userId: string | undefined,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx ?? prisma;
  if (tx) {
    await lockCouponById(tx, couponId);
  }

  const coupon = await (tx ?? prisma).coupon.findUnique({
    where: { id: couponId },
  });
  if (!coupon) {
    throw new Error("Coupon không tồn tại");
  }

  const result = await client.coupon.updateMany({
    where: {
      id: couponId,
      OR: [
        { totalUsageLimit: null },
        { usedCount: { lt: coupon.totalUsageLimit ?? Number.MAX_SAFE_INTEGER } },
      ],
    },
    data: {
      usedCount: { increment: 1 },
    },
  });

  if (result.count === 0) {
    throw new Error("Coupon đã dùng hết");
  }

  if (!userId) {
    return;
  }

  if (tx) {
    await lockVoucherUsage(tx, couponId, userId);
  }

  const existingUsage = await client.voucherUsage.findUnique({
    where: { voucherId_userId: { voucherId: couponId, userId } },
  });

  if (existingUsage) {
    await client.voucherUsage.update({
      where: { voucherId_userId: { voucherId: couponId, userId } },
      data: {
        usedCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
    return;
  }

  await client.voucherUsage.create({
    data: {
      voucherId: couponId,
      userId,
      usedCount: 1,
      firstUsedAt: new Date(),
      lastUsedAt: new Date(),
    },
  });
};

export const refundVoucherUsage = async (
  couponId: string,
  userId: string | undefined,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx ?? prisma;
  await client.coupon.updateMany({
    where: { id: couponId, usedCount: { gt: 0 } },
    data: { usedCount: { decrement: 1 } },
  });

  if (!userId) {
    return;
  }

  await client.voucherUsage.updateMany({
    where: { voucherId: couponId, userId, usedCount: { gt: 0 } },
    data: { usedCount: { decrement: 1 } },
  });
};

export const createVoucherAssignment = async (couponId: string, userId: string, grantedById?: string, input?: { allowedUses?: number; extraUses?: number; expiresAt?: Date; note?: string; }) => {
  return prisma.voucherAssignment.upsert({
    where: { voucherId_userId: { voucherId: couponId, userId } },
    update: {
      grantedById,
      allowedUses: input?.allowedUses,
      extraUses: input?.extraUses,
      expiresAt: input?.expiresAt,
      note: input?.note,
      grantedAt: new Date(),
    },
    create: {
      voucherId: couponId,
      userId,
      grantedById,
      allowedUses: input?.allowedUses,
      extraUses: input?.extraUses,
      expiresAt: input?.expiresAt,
      note: input?.note,
    },
  });
};

export const listVoucherAssignments = async (couponId: string) => {
  return prisma.voucherAssignment.findMany({
    where: { voucherId: couponId },
  });
};

export const deleteVoucherAssignment = async (assignmentId: string) => {
  return prisma.voucherAssignment.delete({
    where: { id: assignmentId },
  });
};

const buildComputedStatusPrismaWhere = (
  computedStatus: VoucherStatus,
  now: Date,
): Prisma.CouponWhereInput => {
  const notExpired: Prisma.CouponWhereInput = {
    OR: [{ endsAt: null }, { endsAt: { gte: now } }],
  };

  switch (computedStatus) {
    case "EXPIRED":
      return { endsAt: { lt: now } };
    case "DISABLED":
      return {
        AND: [
          notExpired,
          {
            OR: [{ status: { not: "active" } }, { startsAt: { gt: now } }],
          },
        ],
      };
    case "OUT_OF_USAGE":
      return {
        AND: [
          notExpired,
          { status: "active" },
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { totalUsageLimit: { not: null } },
        ],
      };
    case "ACTIVE":
      return {
        AND: [
          { status: "active" },
          notExpired,
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        ],
      };
    default:
      return {};
  }
};

// List coupons
export const listCoupons = async (params: CouponQueryParams) => {
  const { skip, take } = toSkipTake(params);
  const search = getSearchValue(params);
  const now = new Date();

  const conditions: Prisma.CouponWhereInput[] = [];

  if (params.computedStatus) {
    conditions.push(buildComputedStatusPrismaWhere(params.computedStatus, now));
  }

  if (search) {
    conditions.push({
      OR: [
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  const where: Prisma.CouponWhereInput = conditions.length > 0 ? { AND: conditions } : {};

  const needsUsageFilter =
    params.computedStatus === "ACTIVE" || params.computedStatus === "OUT_OF_USAGE";

  if (needsUsageFilter && params.computedStatus) {
    const all = await prisma.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    const filtered = all.filter(
      (coupon) => getCouponComputedStatus(coupon) === params.computedStatus,
    );
    const totalItems = filtered.length;
    const items = filtered.slice(skip, skip + take);

    return {
      items: items.map((coupon) => withComputedStatus(coupon)),
      meta: toPaginationMeta(params, totalItems),
    };
  }

  const [items, totalItems] = await Promise.all([
    prisma.coupon.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.coupon.count({ where }),
  ]);

  return {
    items: items.map((coupon) => withComputedStatus(coupon)),
    meta: toPaginationMeta(params, totalItems),
  };
};

// Delete coupon
export const deleteCoupon = async (id: string) => {
  return prisma.coupon.delete({
    where: { id },
  });
};

// Calculate discount
export const calculateDiscount = (coupon: any, orderTotal: number): number => {
  if (coupon.type === "percent") {
    return Math.floor((orderTotal * coupon.value) / 100);
  }
  return Math.min(coupon.value, orderTotal);
};

