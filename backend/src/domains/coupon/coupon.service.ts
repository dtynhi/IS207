import { prisma } from "../../infrastructure/db/prisma.client";
import { getSearchValue, toPaginationMeta, toSkipTake } from "../../shared/query/query-utils";
import type { Prisma } from "@prisma/client";
import type { CouponQueryParams } from "./coupon.query";

export type VoucherStatus = "ACTIVE" | "EXPIRED" | "DISABLED" | "OUT_OF_USAGE";

export interface CreateCouponInput {
  code: string;
  description?: string;
  type: "percent" | "amount";
  value: number;
  startsAt?: Date;
  endsAt?: Date;
  totalUsageLimit: number;
  maxUsagePerUser: number;
  mode?: "PUBLIC" | "PRIVATE";
  refundPolicy?: "NONE" | "ON_CANCEL" | "ON_RETURN";
  minOrderAmount?: number;
  applyTo?: Prisma.InputJsonValue;
  status: "active" | "inactive";
  assignedUserIds?: string[];
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

export const validateCoupon = (input: CreateCouponInput): string[] => {
  const errors: string[] = [];

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

  if (!input.startsAt) {
    errors.push("Ngày bắt đầu là bắt buộc");
  }

  if (!input.endsAt) {
    errors.push("Ngày kết thúc là bắt buộc");
  }

  if (input.startsAt && input.endsAt && new Date(input.startsAt) >= new Date(input.endsAt)) {
    errors.push("Ngày bắt đầu phải trước ngày kết thúc");
  }

  if (!input.totalUsageLimit || input.totalUsageLimit < 1) {
    errors.push("Tổng số lượt sử dụng toàn hệ thống là bắt buộc và phải >= 1");
  }

  if (!input.maxUsagePerUser || input.maxUsagePerUser < 1) {
    errors.push("Giới hạn sử dụng mỗi khách hàng là bắt buộc và phải >= 1");
  }

  if (input.mode === "PRIVATE") {
    if (!input.assignedUserIds || input.assignedUserIds.length === 0) {
      errors.push("Chế độ Riêng tư phải có ít nhất 1 khách hàng được chỉ định");
    }
  }

  if (input.mode && !["PUBLIC", "PRIVATE"].includes(input.mode)) {
    errors.push("mode phải là PUBLIC hoặc PRIVATE");
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

  const coupon = await prisma.coupon.create({
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

  // Create voucher assignments for PRIVATE mode
  if (input.mode === "PRIVATE" && input.assignedUserIds && input.assignedUserIds.length > 0) {
    for (const userId of input.assignedUserIds) {
      await prisma.voucherAssignment.create({
        data: {
          voucherId: coupon.id,
          userId,
          grantedAt: new Date(),
        },
      });
    }
  }

  return withComputedStatus(coupon);
};

// Update coupon
export const updateCoupon = async (input: UpdateCouponInput) => {
  const { id, ...data } = input;

  // Get existing coupon to preserve dates if not provided
  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Coupon không tồn tại");
  }

  // Use existing dates if not provided in update
  const startsAt = data.startsAt ?? (existing.startsAt || undefined);
  const endsAt = data.endsAt ?? (existing.endsAt || undefined);

  if (data.code && data.type) {
    const errors = validateCoupon({
      code: data.code,
      type: data.type,
      value: data.value ?? 0,
      status: data.status ?? "active",
      totalUsageLimit: data.totalUsageLimit ?? 1,
      maxUsagePerUser: data.maxUsagePerUser ?? 1,
      mode: data.mode,
      assignedUserIds: data.assignedUserIds,
      startsAt,
      endsAt,
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

  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      code: data.code ? data.code.toUpperCase() : undefined,
      description: data.description,
      type: data.type,
      value: data.value,
      startsAt: startsAt,
      endsAt: endsAt,
      totalUsageLimit: data.totalUsageLimit,
      maxUsagePerUser: data.maxUsagePerUser,
      mode: data.mode,
      refundPolicy: data.refundPolicy,
      minOrderAmount: data.minOrderAmount,
      applyTo: data.applyTo,
      status: data.status,
    },
  });

  // Update voucher assignments for PRIVATE mode
  if (data.mode === "PRIVATE" && data.assignedUserIds !== undefined) {
    // Delete existing assignments
    await prisma.voucherAssignment.deleteMany({
      where: { voucherId: id },
    });

    // Create new assignments
    for (const userId of data.assignedUserIds) {
      await prisma.voucherAssignment.create({
        data: {
          voucherId: id,
          userId,
          grantedAt: new Date(),
        },
      });
    }
  }

  // If mode changed from PRIVATE to PUBLIC, delete all assignments
  if (data.mode === "PUBLIC") {
    await prisma.voucherAssignment.deleteMany({
      where: { voucherId: id },
    });
  }

  return withComputedStatus(coupon);
};

// Get coupon by ID
export const getCouponById = async (id: string) => {
  const coupon = await prisma.coupon.findUnique({
    where: { id },
    include: {
      assignments: {
        select: {
          userId: true,
        },
      },
    },
  });
  if (!coupon) {
    return null;
  }
  const couponWithStatus = withComputedStatus(coupon);
  // Add assignedUserIds to the response
  const assignedUserIds = coupon.assignments.map((a) => a.userId);
  return {
    ...couponWithStatus,
    assignedUserIds,
  };
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

    const usedCount = usage?.usedCount ?? 0;
    if (userQuota != null && usedCount >= userQuota) {
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

export const createVoucherAssignment = async (
  couponId: string,
  userId: string,
  grantedById?: string,
  input?: { allowedUses?: number; extraUses?: number; expiresAt?: Date; note?: string },
) => {
  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!coupon) {
    throw new Error("Coupon không tồn tại");
  }
  if (coupon.mode !== "PRIVATE") {
    throw new Error("Chỉ voucher PRIVATE mới cần gán user (assignment)");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deleted) {
    throw new Error("User không tồn tại");
  }

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
    include: {
      user: { select: { id: true, email: true, fullName: true, phone: true } },
    },
    orderBy: { grantedAt: "desc" },
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

