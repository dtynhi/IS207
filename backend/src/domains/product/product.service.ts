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

  const [items, totalItems] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: toSort(params.sortBy, params.sortOrder),
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    meta: toPaginationMeta(params, totalItems),
  };
};

export const getProductDetail = async (slug: string) => {
  return prisma.product.findFirst({
    where: { slug, deleted: false, status: "active" },
    include: { productCategory: true },
  });
};

export const getAdminProductDetail = async (id: string) => {
  return prisma.product.findFirst({
    where: { id, deleted: false },
    include: { productCategory: true },
  });
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
  status?: "active" | "inactive";
  createdById?: string;
}) => {
  return prisma.product.create({
    data: {
      title: payload.title,
      price: payload.price,
      slug: payload.slug,
      description: payload.description,
      discountPercentage: payload.discountPercentage ?? 0,
      stock: payload.stock ?? 0,
      status: payload.status ?? "active",
      deleted: false,
      productCategoryId: payload.productCategoryId,
      school: payload.school,
      position: payload.position ?? 0,
      createdById: payload.createdById,
    },
  });
};

export const updateProduct = async (id: string, payload: Record<string, unknown>) => {
  return prisma.product.update({ where: { id }, data: payload });
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
      where: {
        id: {
          in: payload.ids,
        },
      },
      data: {
        status: payload.type,
      },
    });

    return { affected: result.count };
  }

  if (payload.type === "delete-all") {
    const result = await prisma.product.updateMany({
      where: {
        id: {
          in: payload.ids,
        },
      },
      data: {
        deleted: true,
      },
    });

    return { affected: result.count };
  }

  let affected = 0;
  for (const item of payload.ids) {
    const [id, positionRaw] = item.split("-");
    const position = Number(positionRaw);
    if (!id || Number.isNaN(position)) {
      continue;
    }

    await prisma.product.update({
      where: {
        id,
      },
      data: {
        position,
      },
    });

    affected += 1;
  }

  return { affected };
};

export const deleteProduct = async (id: string, deletedById?: string) => {
  return prisma.product.update({ where: { id }, data: { deleted: true, deletedById } });
};
