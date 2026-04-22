import { prisma } from "../../infrastructure/db/prisma.client";

export const createOrder = async (payload: {
  userId?: string;
  fullName: string;
  phone: string;
  address: string;
  items: Array<{ productId: string; quantity: number }>;
}) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId: payload.userId,
        fullName: payload.fullName,
        phone: payload.phone,
        address: payload.address,
      },
    });

    for (const item of payload.items) {
      const product = await tx.product.findFirst({
        where: {
          id: item.productId,
          deleted: false,
          status: "active",
        },
      });

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Product ${item.productId} out of stock`);
      }

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
          discountPercentage: product.discountPercentage,
        },
      });

      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: product.stock - item.quantity,
        },
      });
    }

    if (payload.userId) {
      await tx.cart.deleteMany({
        where: {
          userId: payload.userId,
        },
      });
    }

    return order;
  });
};

export const getOrderDetail = async (id: string) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
};

export const markOrderUser = async (orderId: string, userId: string) => {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      userId,
    },
  });
};

export const listOrders = async (params: { page: number; limit: number }) => {
  const skip = (params.page - 1) * params.limit;

  const [items, totalItems] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: params.limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnail: true,
              },
            },
          },
        },
      },
    }),
    prisma.order.count(),
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
