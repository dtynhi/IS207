import type { Order, Prisma } from "@prisma/client";
import { prisma } from "../../infrastructure/db/prisma.client";
import { getSearchValue, toPaginationMeta, toSkipTake, toSort } from "../../shared/query/query-utils";

type OrderStatus =
  | "pending_confirm"
  | "ready_to_pick"
  | "ready_to_ship"
  | "delivered"
  | "returned"
  | "cancelled";

type PaymentStatus = "unpaid" | "paid";
type PaymentMethod = "COD" | "BANK_TRANSFER";
type ActorType = "customer" | "admin" | "system";

type OrderCreateFailureReason = "PRODUCT_NOT_FOUND" | "OUT_OF_STOCK";

type OrderCreateResult =
  | { ok: true; data: Order }
  | { ok: false; reason: OrderCreateFailureReason; productId?: string };

class OrderPlacementError extends Error {
  reason: OrderCreateFailureReason;
  productId?: string;

  constructor(reason: OrderCreateFailureReason, productId?: string) {
    super(reason);
    this.name = "OrderPlacementError";
    this.reason = reason;
    this.productId = productId;
  }
}

const orderTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending_confirm: ["ready_to_pick", "cancelled"],
  ready_to_pick: ["ready_to_ship", "cancelled"],
  ready_to_ship: ["delivered", "cancelled"],
  delivered: ["returned"],
  returned: [],
  cancelled: [],
};

const isTransitionAllowed = (from: OrderStatus, to: OrderStatus) => {
  if (from === to) return true;
  return orderTransitions[from]?.includes(to);
};

const createStatusLog = async (
  tx: Prisma.TransactionClient,
  payload: {
    orderId: string;
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus;
    actorType?: ActorType;
    actorId?: string;
    reason?: string;
  }
) => {
  return tx.orderStatusLog.create({
    data: {
      orderId: payload.orderId,
      fromStatus: payload.fromStatus,
      toStatus: payload.toStatus,
      actorType: payload.actorType ?? "system",
      actorId: payload.actorId,
      reason: payload.reason,
    },
  });
};

const restoreStock = async (tx: Prisma.TransactionClient, orderId: string) => {
  const items = await tx.orderItem.findMany({
    where: { orderId },
    select: { productId: true, quantity: true },
  });

  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }
};

const adminOrderInclude: Prisma.OrderInclude = {
  items: {
    include: {
      product: true,
    },
  },
  assignedToAccount: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
  statusLogs: {
    orderBy: { createdAt: "desc" },
  },
  returnLog: true,
};

export const createOrder = async (payload: {
  userId?: string;
  fullName: string;
  phone: string;
  address: string;
  paymentMethod?: PaymentMethod;
  items: Array<{ productId: string; quantity: number }>;
}): Promise<OrderCreateResult> => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const items = payload.items;
      const quantityByProduct = new Map<string, number>();
      const productIds = new Set<string>();

      for (const item of items) {
        const current = quantityByProduct.get(item.productId) ?? 0;
        quantityByProduct.set(item.productId, current + item.quantity);
        productIds.add(item.productId);
      }

      const products = await tx.product.findMany({
        where: {
          id: { in: Array.from(productIds) },
          deleted: false,
          status: "active",
        },
        select: {
          id: true,
          price: true,
          discountPercentage: true,
          stock: true,
        },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));
      const missing = Array.from(productIds).find((id) => !productMap.has(id));
      if (missing) {
        return { ok: false, reason: "PRODUCT_NOT_FOUND", productId: missing } as const;
      }

      for (const [productId, totalQty] of quantityByProduct.entries()) {
        const product = productMap.get(productId);
        if (!product || product.stock < totalQty) {
          return { ok: false, reason: "OUT_OF_STOCK", productId } as const;
        }
      }

      const order = await tx.order.create({
        data: {
          userId: payload.userId,
          fullName: payload.fullName,
          phone: payload.phone,
          address: payload.address,
          paymentMethod: payload.paymentMethod ?? "COD",
        },
      });

      await createStatusLog(tx, {
        orderId: order.id,
        fromStatus: null,
        toStatus: "pending_confirm",
      });

      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) throw new OrderPlacementError("PRODUCT_NOT_FOUND", item.productId);

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity: item.quantity,
            price: product.price,
            discountPercentage: product.discountPercentage,
          },
        });
      }

      for (const [productId, totalQty] of quantityByProduct.entries()) {
        const updated = await tx.product.updateMany({
          where: { id: productId, stock: { gte: totalQty } },
          data: { stock: { decrement: totalQty } },
        });

        if (updated.count === 0) throw new OrderPlacementError("OUT_OF_STOCK", productId);
      }

      if (payload.userId) {
        await tx.cart.deleteMany({ where: { userId: payload.userId } });
      }

      return { ok: true, data: order } as const;
    });

    return result;
  } catch (error) {
    if (error instanceof OrderPlacementError) {
      return { ok: false, reason: error.reason, productId: error.productId };
    }
    throw error;
  }
};

export const getOrderDetail = async (id: string) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });
};

export const markOrderUser = async (orderId: string, userId: string) => {
  return prisma.order.update({
    where: { id: orderId },
    data: { userId },
  });
};

export const listOrders = async (params: { page: number; limit: number; userId?: string }) => {
  const skip = (params.page - 1) * params.limit;
  const where: Prisma.OrderWhereInput = params.userId ? { userId: params.userId } : {};

  const [items, totalItems] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: params.limit,
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, title: true, slug: true, thumbnail: true },
            },
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items,
    meta: {
      page: params.page,
      limit: params.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / params.limit),
    },
  };
};

export const cancelOrderByCustomer = async (orderId: string, userId: string) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, userId: true, paymentStatus: true },
    });

    if (!order) return { error: "NOT_FOUND" as const };
    if (order.userId !== userId) return { error: "FORBIDDEN" as const };
    if (order.status !== "pending_confirm") return { error: "CANNOT_CANCEL" as const };
    if (order.paymentStatus === "paid") return { error: "ALREADY_PAID" as const };

    await restoreStock(tx, orderId);

    await tx.order.update({
      where: { id: orderId },
      data: { status: "cancelled" },
    });

    await createStatusLog(tx, {
      orderId,
      fromStatus: "pending_confirm",
      toStatus: "cancelled",
      actorType: "customer",
      actorId: userId,
    });

    return { ok: true as const };
  });
};

export const updateOrderPaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
  return prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus },
  });
};

export const markOrderPaidByAdmin = async (orderId: string, adminId: string) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { id: true, paymentStatus: true, paymentMethod: true },
    });

    if (!order) return { error: "NOT_FOUND" as const };
    if (order.paymentStatus === "paid") return { error: "ALREADY_PAID" as const };
    if (order.paymentMethod !== "COD") return { error: "NOT_COD" as const };

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { paymentStatus: "paid" },
    });

    return { ok: true as const, order: updated };
  });
};

export const getOrderTotalAmount = async (orderId: string) => {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    select: { price: true, quantity: true, discountPercentage: true },
  });

  return items.reduce((sum, item) => {
    const discountedPrice = item.price * (1 - item.discountPercentage / 100);
    return sum + Math.round(discountedPrice * item.quantity);
  }, 0);
};

export const listAdminOrders = async (params: {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  status?: OrderStatus;
  search?: string;
  keyword?: string;
  from?: string;
  to?: string;
  assignedTo?: string;
}) => {
  const { skip, take } = toSkipTake(params);
  const search = getSearchValue(params);
  const where: Prisma.OrderWhereInput = {};

  if (params.status) where.status = params.status;

  if (params.assignedTo) {
    where.assignedToAccountId = params.assignedTo === "unassigned" ? null : params.assignedTo;
  }

  if (search) {
    where.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { fullName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  if (params.from || params.to) {
    where.createdAt = {};
    if (params.from) where.createdAt.gte = new Date(params.from);
    if (params.to) where.createdAt.lte = new Date(params.to);
  }

  const [items, totalItems] = await Promise.all([
    prisma.order.findMany({
      skip,
      take,
      where,
      orderBy: toSort(params.sortBy, params.sortOrder),
      include: {
        items: {
          include: {
            product: {
              select: { id: true, title: true, slug: true, thumbnail: true },
            },
          },
        },
        assignedToAccount: {
          select: { id: true, fullName: true, email: true },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { items, meta: toPaginationMeta(params, totalItems) };
};

export const getAdminOrderDetail = async (id: string) => {
  return prisma.order.findUnique({
    where: { id },
    include: adminOrderInclude,
  });
};

export const claimOrder = async (orderId: string, adminId: string) => {
  const claimed = await prisma.order.updateMany({
    where: { id: orderId, assignedToAccountId: null },
    data: {
      assignedToAccountId: adminId,
      assignedAt: new Date(),
      lockVersion: { increment: 1 },
    },
  });

  if (claimed.count === 0) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, assignedToAccountId: true },
    });
    return { claimed: false, order };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: adminOrderInclude });
  return { claimed: true, order };
};

export const releaseOrder = async (orderId: string, adminId: string) => {
  const released = await prisma.order.updateMany({
    where: { id: orderId, assignedToAccountId: adminId },
    data: {
      assignedToAccountId: null,
      assignedAt: null,
      lockVersion: { increment: 1 },
    },
  });

  if (released.count === 0) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, assignedToAccountId: true },
    });
    return { released: false, order };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: adminOrderInclude });
  return { released: true, order };
};

export const updateOrderStatusByAdmin = async (payload: {
  orderId: string;
  status: OrderStatus;
  adminId: string;
  lockVersion: number;
  reason?: string;
}) => {
  return prisma.$transaction(async (tx) => {
    const current = await tx.order.findUnique({
      where: { id: payload.orderId },
      select: { id: true, status: true, lockVersion: true, assignedToAccountId: true, paymentMethod: true },
    });

    if (!current) return { error: "NOT_FOUND" as const };
    if (current.assignedToAccountId !== payload.adminId) return { error: "NOT_ASSIGNED" as const };
    if (current.lockVersion !== payload.lockVersion) {
      return { error: "CONFLICT" as const, currentVersion: current.lockVersion };
    }
    if (!isTransitionAllowed(current.status, payload.status)) {
      return { error: "INVALID_TRANSITION" as const };
    }

    const autoPay = payload.status === "delivered" && current.paymentMethod === "COD";

    const updated = await tx.order.updateMany({
      where: { id: payload.orderId, lockVersion: payload.lockVersion },
      data: {
        status: payload.status,
        lockVersion: { increment: 1 },
        ...(autoPay && { paymentStatus: "paid" }),
      },
    });

    if (updated.count === 0) {
      return { error: "CONFLICT" as const, currentVersion: current.lockVersion };
    }

    if (payload.status === "cancelled") {
      await restoreStock(tx, payload.orderId);
    }

    if (current.status !== payload.status) {
      await createStatusLog(tx, {
        orderId: current.id,
        fromStatus: current.status,
        toStatus: payload.status,
        actorType: "admin",
        actorId: payload.adminId,
        reason: payload.reason,
      });
    }

    const order = await tx.order.findUnique({ where: { id: payload.orderId }, include: adminOrderInclude });
    return { order };
  });
};

export const listPendingReturns = async (params: { page: number; limit: number }) => {
  const skip = (params.page - 1) * params.limit;

  const [items, totalItems] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: params.limit,
      where: { status: "returned", returnLog: null },
      orderBy: { updatedAt: "asc" },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, title: true, slug: true, thumbnail: true, stock: true },
            },
          },
        },
        assignedToAccount: {
          select: { id: true, fullName: true, email: true },
        },
      },
    }),
    prisma.order.count({ where: { status: "returned", returnLog: null } }),
  ]);

  return {
    items,
    meta: {
      page: params.page,
      limit: params.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / params.limit),
    },
  };
};

export const getReturnDetail = async (orderId: string) => {
  return prisma.order.findUnique({
    where: { id: orderId, status: "returned" },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, title: true, slug: true, thumbnail: true, stock: true },
          },
        },
      },
      returnLog: {
        include: {
          processedByAccount: {
            select: { id: true, fullName: true, email: true },
          },
        },
      },
    },
  });
};

export const processReturn = async (payload: {
  orderId: string;
  adminId: string;
  result: "approved" | "rejected";
  reason?: string;
}) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: payload.orderId },
      select: { id: true, status: true, returnLog: { select: { id: true } } },
    });

    if (!order) return { error: "NOT_FOUND" as const };
    if (order.status !== "returned") return { error: "NOT_RETURNED" as const };
    if (order.returnLog) return { error: "ALREADY_PROCESSED" as const };

    let restocked = false;

    if (payload.result === "approved") {
      await restoreStock(tx, payload.orderId);
      restocked = true;
    }

    const returnLog = await tx.returnLog.create({
      data: {
        orderId: payload.orderId,
        result: payload.result,
        reason: payload.reason,
        restocked,
        processedByAccountId: payload.adminId,
      },
    });

    return { ok: true as const, returnLog };
  });
};
