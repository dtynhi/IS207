import { prisma } from "../../infrastructure/db/prisma.client";
import { getSearchValue, toPaginationMeta, toSkipTake } from "../../shared/query/query-utils";
import type { Prisma } from "@prisma/client";
import type { CouponQueryParams } from "./coupon.query";

export interface CreateCouponInput {
  code: string;
  description?: string;
  type: "percent" | "amount";
  value: number;
  startsAt?: Date;
  endsAt?: Date;
  maxUses?: number;
  minOrderAmount?: number;
  applyTo?: Record<string, unknown>;
  status: "active" | "inactive";
}

export interface UpdateCouponInput extends Partial<CreateCouponInput> {
  id: string;
}

// Validate coupon input
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

  if (input.value <= 0) {
    errors.push("Value phải > 0");
  } else if (input.type === "percent" && input.value > 100) {
    errors.push("Value phần trăm không được vượt quá 100");
  }

  if (input.startsAt && input.endsAt && new Date(input.startsAt) >= new Date(input.endsAt)) {
    errors.push("startsAt phải trước endsAt");
  }

  if (input.maxUses !== undefined && input.maxUses !== null && input.maxUses < 1) {
    errors.push("maxUses phải >= 1");
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
      maxUses: input.maxUses,
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
    },
  });
};

// Get coupon by ID
export const getCouponById = async (id: string) => {
  return prisma.coupon.findUnique({
    where: { id },
  });
};

// Get coupon by code
export const getCouponByCode = async (code: string, tx?: Prisma.TransactionClient) => {
  const client = tx ?? prisma;
  return client.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });
};

// List coupons
export const listCoupons = async (params: CouponQueryParams) => {
  const { skip, take } = toSkipTake(params);
  const search = getSearchValue(params);

  const where: Record<string, unknown> = {};

  if (params.status) {
    where.status = params.status;
  }

  if (search) {
    where.OR = [
      { code: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
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
    items,
    meta: toPaginationMeta(totalItems, params),
  };
};

// Delete coupon
export const deleteCoupon = async (id: string) => {
  return prisma.coupon.delete({
    where: { id },
  });
};

// Check if coupon is valid for use
export const validateCouponForUse = async (code: string, orderTotal: number, productIds?: string[], tx?: Prisma.TransactionClient) => {
  const coupon = await getCouponByCode(code, tx);

  if (!coupon) {
    throw new Error("Coupon không tồn tại");
  }

  if (coupon.status !== "active") {
    throw new Error("Coupon không hoạt động");
  }

  const now = new Date();
  if (coupon.startsAt && now < new Date(coupon.startsAt)) {
    throw new Error("Coupon chưa bắt đầu");
  }

  if (coupon.endsAt && now > new Date(coupon.endsAt)) {
    throw new Error("Coupon đã hết hạn");
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    throw new Error("Coupon đã dùng hết");
  }

  if (orderTotal < coupon.minOrderAmount) {
    throw new Error(`Đơn hàng phải >= ${coupon.minOrderAmount} để dùng coupon`);
  }

  // Check if coupon applies to products
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

  return coupon;
};

// Calculate discount
export const calculateDiscount = (coupon: any, orderTotal: number): number => {
  if (coupon.type === "percent") {
    return Math.floor((orderTotal * coupon.value) / 100);
  }
  return Math.min(coupon.value, orderTotal);
};

// Increment coupon usage
export const incrementCouponUsage = async (couponId: string, tx?: Prisma.TransactionClient) => {
  const client = tx ?? prisma;
  return client.coupon.update({
    where: { id: couponId },
    data: { usedCount: { increment: 1 } },
  });
};
