import { prisma } from "../../infrastructure/db/prisma.client";
import type { BaseQueryParams } from "../../shared/query/base-query.params";
import { getSearchValue, toPaginationMeta, toSkipTake, toSort } from "../../shared/query/query-utils";
import { Prisma } from "@prisma/client";

export const listRoles = async (params: BaseQueryParams) => {
  const { skip, take } = toSkipTake(params);
  const where: Record<string, unknown> = { deleted: false };
  const search = getSearchValue(params);
  if (search) where.title = { contains: search, mode: "insensitive" };
  if (params.status) where.status = params.status;

  const [items, totalItems] = await Promise.all([
    prisma.role.findMany({ where, skip, take, orderBy: toSort(params.sortBy, params.sortOrder) }),
    prisma.role.count({ where }),
  ]);

  return { items, meta: toPaginationMeta(params, totalItems) };
};

export const getRoleDetail = async (id: string) => {
  return prisma.role.findFirst({
    where: {
      id,
      deleted: false,
    },
  });
};

export const createRole = async (payload: { title: string; description?: string; permissions?: unknown }) => {
  const permissions =
    payload.permissions === undefined ? undefined : (payload.permissions as Prisma.InputJsonValue);

  return prisma.role.create({
    data: {
      title: payload.title,
      description: payload.description,
      permissions,
      status: "active",
      deleted: false,
    },
  });
};

export const updateRole = async (id: string, payload: Record<string, unknown>) => {
  return prisma.role.update({ where: { id }, data: payload });
};

export const updateRolePermissions = async (
  payload: Array<{ id: string; permissions?: unknown }>
) => {
  let affected = 0;

  for (const item of payload) {
    const permissions =
      item.permissions === undefined ? Prisma.JsonNull : (item.permissions as Prisma.InputJsonValue);

    await prisma.role.update({
      where: { id: item.id },
      data: { permissions },
    });
    affected += 1;
  }

  return { affected };
};

export const deleteRole = async (id: string) => {
  return prisma.role.update({ where: { id }, data: { deleted: true } });
};
