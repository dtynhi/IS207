import { prisma } from "../../infrastructure/db/prisma.client";

const toPriceNew = (price: number, discountPercentage: number) => {
  return Math.floor(price * (1 - discountPercentage / 100));
};

export const getCartByUser = async (userId: string) => {
  const items = await prisma.cart.findMany({
    where: { userId },
    include: {
      product: true,
    },
  });

  let totalPrice = 0;
  const enrichedItems = items.map((item) => {
    const priceNew = toPriceNew(item.product.price, item.product.discountPercentage);
    const itemTotal = priceNew * item.quantity;
    totalPrice += itemTotal;

    return {
      id: item.id,
      userId: item.userId,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        ...item.product,
        priceNew,
      },
      totalPrice: itemTotal,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });

  return {
    items: enrichedItems,
    totalPrice,
  };
};

export const addCartItem = async (userId: string, productId: string, quantity: number) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deleted: false,
      status: "active",
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    return { ok: false as const, reason: "USER_NOT_FOUND" as const };
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      deleted: false,
      status: "active",
    },
    select: {
      id: true,
      stock: true,
    },
  });

  if (!product) {
    return { ok: false as const, reason: "PRODUCT_NOT_FOUND" as const };
  }

  const existing = await prisma.cart.findFirst({ where: { userId, productId } });
  const nextQuantity = (existing?.quantity ?? 0) + quantity;

  if (nextQuantity > product.stock) {
    return { ok: false as const, reason: "OUT_OF_STOCK" as const };
  }

  if (existing) {
    const item = await prisma.cart.update({
      where: { id: existing.id },
      data: { quantity: nextQuantity },
    });
    return { ok: true as const, data: item };
  }

  const item = await prisma.cart.create({ data: { userId, productId, quantity } });
  return { ok: true as const, data: item };
};

export const updateCartItem = async (id: string, quantity: number) => {
  const current = await prisma.cart.findUnique({
    where: { id },
    include: {
      product: {
        select: {
          id: true,
          stock: true,
          deleted: true,
          status: true,
        },
      },
    },
  });

  if (!current || !current.product || current.product.deleted || current.product.status !== "active") {
    return { ok: false as const, reason: "PRODUCT_NOT_FOUND" as const };
  }

  if (quantity > current.product.stock) {
    return { ok: false as const, reason: "OUT_OF_STOCK" as const };
  }

  const item = await prisma.cart.update({ where: { id }, data: { quantity } });
  return { ok: true as const, data: item };
};

export const deleteCartItem = async (id: string) => {
  await prisma.cart.delete({ where: { id } });
};

export const deleteCartItemByProduct = async (userId: string, productId: string) => {
  const item = await prisma.cart.findFirst({ where: { userId, productId } });
  if (!item) {
    return false;
  }

  await prisma.cart.delete({ where: { id: item.id } });
  return true;
};

export const updateCartItemByProduct = async (userId: string, productId: string, quantity: number) => {
  const item = await prisma.cart.findFirst({ where: { userId, productId } });
  if (!item) {
    return { ok: false as const, reason: "CART_ITEM_NOT_FOUND" as const };
  }

  return updateCartItem(item.id, quantity);
};
