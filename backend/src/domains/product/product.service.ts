import { prisma } from "../../infrastructure/db/prisma.client";
import { getSearchValue, toPaginationMeta, toSkipTake, toSort } from "../../shared/query/query-utils";
import type { ProductQueryParams } from "./product.query";

export const listProducts = async (
  params: ProductQueryParams,
  mode: "client" | "admin"
) => {
  const { skip, take } = toSkipTake(params);
  const search = getSearchValue(params);

  const where: Record<string, unknown> = {
    deleted: false,
  };

  if (mode === "client") {
    where.status = params.status ?? "active";
  } else if (params.status) {
    where.status = params.status;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { school: { contains: search, mode: "insensitive" } },
    ];
  }

  if (params.school && params.school.length > 0) {
    where.school = { in: params.school };
  }

  if (params.facet && params.facet.length > 0) {
    where.productCategoryId = { in: params.facet };
  }

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    where.price = {
      gte: params.minPrice,
      lte: params.maxPrice,
    };
  }

  if (params.flashSale === true) {
    where.discountPercentage = { gt: 0 };
  }

  const [items, totalItems] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: toSort(params.sortBy, params.sortOrder),
      include: { saleCampaign: true }, // Móc nối đúng tên trong Schema
    }),
    prisma.product.count({ where }),
  ]);

  // Áp dụng luật ưu tiên: Ép % Chiến dịch đè % Flash Sale
  const formattedItems = items.map((item: any) => {
    if (item.saleCampaign && item.saleCampaign.isActive) {
      return {
        ...item,
        discountPercentage: item.saleCampaign.discount,
      };
    }
    return item;
  });

  return {
    items: formattedItems,
    meta: toPaginationMeta(params, totalItems),
  };
};

export const getProductDetail = async (slug: string) => {
  const product = await prisma.product.findFirst({
    where: { slug, deleted: false, status: "active" },
    include: { productCategory: true, saleCampaign: true }, 
  });

  if (product && product.saleCampaign && product.saleCampaign.isActive) {
    return {
      ...product,
      discountPercentage: product.saleCampaign.discount
    };
  }
  return product;
};

export const getAdminProductDetail = async (id: string) => {
  const product = await prisma.product.findFirst({
    where: { id, deleted: false },
    include: { productCategory: true, saleCampaign: true }, 
  });

  if (product && product.saleCampaign && product.saleCampaign.isActive) {
    return {
      ...product,
      discountPercentage: product.saleCampaign.discount
    };
  }
  return product;
};

export const createProduct = async (payload: {
  title: string;
  price: number;
  slug: string;
  description?: string;
  discountPercentage?: number;
  stock?: number;
  productCategoryId?: string;
  school?: string;
  position?: number;
  featured?: boolean;
  status?: "active" | "inactive";
  createdById?: string;
  thumbnail?: string;
  brand?: string;
}) => {
  return prisma.product.create({
    data: {
      title: payload.title,
      price: payload.price,
      slug: payload.slug,
      description: payload.description,
      discountPercentage: payload.discountPercentage ?? 0,
      stock: payload.stock ?? 0,
      featured: payload.featured ?? false,
      status: payload.status ?? "active",
      deleted: false,
      productCategoryId: payload.productCategoryId,
      school: payload.school,
      position: payload.position ?? 0,
      createdById: payload.createdById,
      thumbnail: payload.thumbnail,
      brand: payload.brand,
    },
  });
};

export const updateProduct = async (id: string, payload: Record<string, unknown>) => {
  const safePayload = { ...payload };

  if ('discountPercentage' in safePayload) {
    const value = safePayload.discountPercentage;
    if (value === null || value === undefined || value === "" || value === 0) {
      safePayload.discountPercentage = 0;
    } else {
      safePayload.discountPercentage = Number(value);
    }
  }

  return prisma.product.update({ where: { id }, data: safePayload });
};

export const updateProductStatus = async (id: string, status: "active" | "inactive") => {
  return prisma.product.update({ where: { id }, data: { status } });
};

export const changeMultiProducts = async (payload: {
  type: "active" | "inactive" | "delete-all" | "change-position";
  ids: string[];
}) => {
  if (payload.type === "active" || payload.type === "inactive") {
    const result = await prisma.product.updateMany({
      where: { id: { in: payload.ids } },
      data: { status: payload.type },
    });
    return { affected: result.count };
  }

  if (payload.type === "delete-all") {
    const result = await prisma.product.updateMany({
      where: { id: { in: payload.ids } },
      data: { deleted: true },
    });
    return { affected: result.count };
  }

  let affected = 0;
  for (const item of payload.ids) {
    const [id, positionRaw] = item.split("-");
    const position = Number(positionRaw);
    if (!id || Number.isNaN(position)) continue;
    await prisma.product.update({ where: { id }, data: { position } });
    affected += 1;
  }
  return { affected };
};

export const deleteProduct = async (id: string, deletedById?: string) => {
  return prisma.product.update({ where: { id }, data: { deleted: true, deletedById } });
};


export const createCampaign = async (data: any) => {
  const campaign = await prisma.saleCampaign.create({
    data: {
      name: data.name,
      bannerUrl: data.bannerUrl,
      discount: data.discount,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      isActive: true,
    },
  });
  if (data.productIds && data.productIds.length > 0) {
    await prisma.product.updateMany({
      where: { id: { in: data.productIds } },
      data: { 
        campaignId: campaign.id,
        discountPercentage: data.discount 
      },
    });
  } 
  return campaign;
};
export const getActiveCampaign = async () => {
  const now = new Date();
  const campaigns = await prisma.saleCampaign.findMany({ 
    where: { 
      isActive: true, 
      startTime: { lte: now }, 
      endTime: { gt: now }
    },
    orderBy: { createdAt: 'desc' },
    include: { products: true } 
  });

  return campaigns.map(campaign => ({
    ...campaign,
    products: campaign.products.map(product => ({
      ...product,
      discountPercentage: campaign.discount 
    }))
  }));
};
export const deactivateActiveCampaign = async (id: string) => {
  const campaign = await prisma.saleCampaign.findUnique({ 
    where: { id } 
  });
  
  if (!campaign) return null;

  const now = new Date();

  await prisma.saleCampaign.update({ 
    where: { id }, 
    data: { 
      isActive: false,
      endTime: now 
    } 
  });

  await prisma.product.updateMany({
    where: { campaignId: id },
    data: { discountPercentage: 0, campaignId: null },
  });
  return true;
};

export const getAllCampaigns = async () => {
  return prisma.saleCampaign.findMany({ orderBy: { createdAt: "desc" } });
};

export const getCampaignById = async (id: string) => {
  return prisma.saleCampaign.findUnique({ where: { id }, include: { products: true } });
};

export const getActiveFlashSale = async () => {
  const now = new Date(); 

  const activeFlashSale = await prisma.dailyFlashSale.findFirst({
    where: { 
      status: "ONGOING",
      endTime: { gt: now } 
    },
    include: {
      products: { 
        where: { status: "active", deleted: false },
        include: { saleCampaign: true }
      },
    },
    orderBy: { startTime: "asc" },
  });

  if (!activeFlashSale) return null;

  const productsWithPriority = activeFlashSale.products.map((product: any) => {
    if (product.saleCampaign && product.saleCampaign.isActive) {
      return {
        ...product,
        discountPercentage: product.saleCampaign.discount
      };
    }
    return product;
  });

  return {
    ...activeFlashSale,
    products: productsWithPriority
  };
};

export const getFlashSaleSessions = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.dailyFlashSale.findMany({
    where: {
      startTime: { gte: startOfDay, lte: endOfDay },
    },
    include: {
      products: { where: { status: "active", deleted: false } },
    },
    orderBy: { startTime: "asc" },
  });
};

export const getAllFlashSaleAdmin = async () => {
  return prisma.dailyFlashSale.findMany({
    include: { products: true },
    orderBy: { startTime: "desc" },
  });
};

export const createFlashSaleSession = async (data: {
  startTime: string;
  endTime: string;
  productIds: string[];
}) => {
  const session = await prisma.dailyFlashSale.create({
    data: {
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      status: "UPCOMING",
    },
  });

  if (data.productIds && data.productIds.length > 0) {
    for (const productId of data.productIds) {
      const randomDiscount = Math.floor(Math.random() * 6) + 5;      
      await prisma.product.update({
        where: { id: productId },
        data: { 
          dailyFlashSaleId: session.id, 
          discountPercentage: randomDiscount 
        },
      });
    }
  }

  return prisma.dailyFlashSale.findUnique({
    where: { id: session.id },
    include: { products: true }
  });
};
export const updateFlashSaleStatus = async (
  id: string,
  status: "UPCOMING" | "ONGOING" | "ENDED"
) => {
  return prisma.dailyFlashSale.update({
    where: { id },
    data: { status },
    include: { products: true },
  });
};

export const deleteFlashSaleSession = async (id: string) => {
  // Tháo liên kết products
  await prisma.product.updateMany({
    where: { dailyFlashSaleId: id },
    data: { dailyFlashSaleId: null },
  });

  return prisma.dailyFlashSale.delete({ where: { id } });
};

export const syncFlashSaleStatuses = async () => {
  const now = new Date();

  try {
    await prisma.dailyFlashSale.updateMany({
      where: {
        status: "UPCOMING",
        startTime: { lte: now },
        endTime: { gt: now },
      },
      data: { status: "ONGOING" },
    });

    const endedSessions = await prisma.dailyFlashSale.findMany({
      where: {
        status: "ONGOING",
        endTime: { lte: now },
      },
      include: { products: true }
    });

    for (const session of endedSessions) {
      await prisma.dailyFlashSale.update({
        where: { id: session.id },
        data: { status: "ENDED" },
      });

      if (session.products && session.products.length > 0) {
        const productIds = session.products.map(p => p.id);
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { 
            discountPercentage: 0, 
            dailyFlashSaleId: null 
          }
        });
      }
      console.log(`[FlashSale] Đã TẮT TỰ ĐỘNG ca Sale ${session.id} và khôi phục giá gốc!`);
    }
  } catch (error) {
    console.error("[FlashSale] Lỗi khi đồng bộ trạng thái:", error);
  }
};

export const removeProductFromFlashSale = async (sessionId: string, productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) throw new Error("Không tìm thấy sản phẩm");

  let revertDiscount = 0;
  if (product.campaignId) {
    const campaign = await prisma.saleCampaign.findUnique({ where: { id: product.campaignId } });
    if (campaign && campaign.isActive) {
      revertDiscount = campaign.discount;
    }
  }

  return prisma.product.update({
    where: { id: productId },
    data: {
      dailyFlashSaleId: null, 
      discountPercentage: revertDiscount 
    }
  });
};

export const deleteCampaign = async (id: string) => {
  await prisma.product.updateMany({
    where: { campaignId: id },
    data: { discountPercentage: 0, campaignId: null },
  });

  return prisma.saleCampaign.delete({
    where: { id },
  });
};