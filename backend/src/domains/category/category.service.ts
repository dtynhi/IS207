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
  return prisma.productCategory.create({
    data: {
      title: payload.title,
      slug: payload.slug,
      parentId: payload.parentId,
      position: payload.position ?? 0,
      description: payload.description,
      thumbnail: payload.thumbnail,
      status: payload.status ?? "active",
      deleted: false,
    },
  });
};

export const updateCategory = async (id: string, payload: Record<string, unknown>) => {
  return prisma.productCategory.update({ where: { id }, data: payload });
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
  return prisma.productCategory.update({ where: { id }, data: { deleted: true } });
};
