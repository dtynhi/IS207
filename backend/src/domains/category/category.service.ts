import { prisma } from "../../infrastructure/db/prisma.client";
import type { BaseQueryParams } from "../../shared/query/base-query.params";
import { getSearchValue, toPaginationMeta, toSkipTake, toSort } from "../../shared/query/query-utils";

export const listClientCategories = async () => {
  return prisma.productCategory.findMany({
    where: { deleted: false, status: "active" },
    orderBy: { position: "desc" },
  });
};

export const listAdminCategories = async (params: BaseQueryParams) => {
  const { skip, take } = toSkipTake(params);
  const search = getSearchValue(params);
  const where: Record<string, unknown> = { deleted: false };

  if (params.status) {
    where.status = params.status;
  }

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  const [items, totalItems] = await Promise.all([
    prisma.productCategory.findMany({
      where,
      skip,
      take,
      orderBy: toSort(params.sortBy, params.sortOrder),
    }),
    prisma.productCategory.count({ where }),
  ]);

  return {
    items,
    meta: toPaginationMeta(params, totalItems),
  };
};

export const getCategoryDetail = async (id: string) => {
  return prisma.productCategory.findFirst({
    where: {
      id,
      deleted: false,
    },
  });
};

export const createCategory = async (payload: {
  title: string;
  slug: string;
  parentId?: string;
  position?: number;
  description?: string;
  thumbnail?: string;
  status?: "active" | "inactive";
}) => {
  const position = payload.position;
  const nextPosition =
    position ??
    (((await prisma.productCategory.aggregate({
      _max: {
        position: true,
      },
      where: {
        deleted: false,
      },
    }))?._max?.position ?? 0) + 1);

  return prisma.productCategory.create({
    data: {
      title: payload.title,
      slug: payload.slug,
      parentId: payload.parentId,
      position: nextPosition,
      description: payload.description,
      thumbnail: payload.thumbnail,
      status: payload.status ?? "active",
      deleted: false,
    },
  });
};

export const updateCategory = async (id: string, payload: Record<string, unknown>) => {
  const updatePosition = typeof payload.position === "number" ? payload.position : undefined;
  if (updatePosition === undefined) {
    return prisma.productCategory.update({ where: { id }, data: payload });
  }

  const current = await prisma.productCategory.findUnique({ where: { id } });
  if (!current) {
    throw new Error("Category not found");
  }

  if (current.position === updatePosition) {
    return prisma.productCategory.update({ where: { id }, data: payload });
  }

  const swapTarget = await prisma.productCategory.findFirst({
    where: {
      position: updatePosition,
      deleted: false,
      id: { not: id },
    },
  });

  if (!swapTarget) {
    return prisma.productCategory.update({ where: { id }, data: payload });
  }

  const [, updatedCategory] = await prisma.$transaction([
    prisma.productCategory.update({ where: { id: swapTarget.id }, data: { position: current.position } }),
    prisma.productCategory.update({ where: { id }, data: payload }),
  ]);

  return updatedCategory;
};

export const updateCategoryStatus = async (id: string, status: "active" | "inactive") => {
  return prisma.productCategory.update({
    where: { id },
    data: {
      status,
    },
  });
};

export const deleteCategory = async (id: string) => {
  const current = await prisma.productCategory.findUnique({ where: { id } });
  if (!current) {
    throw new Error("Category not found");
  }

  return prisma.productCategory.update({
    where: { id },
    data: {
      deleted: true,
      slug: `${current.slug}-${current.id}`,
    },
  });
};
