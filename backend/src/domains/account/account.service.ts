import { prisma } from "../../infrastructure/db/prisma.client";
import type { BaseQueryParams } from "../../shared/query/base-query.params";
import { getSearchValue, toPaginationMeta, toSkipTake, toSort } from "../../shared/query/query-utils";
import { hashPassword } from "../../shared/security/password";

export const listAccounts = async (params: BaseQueryParams) => {
  const { skip, take } = toSkipTake(params);
  const where: Record<string, unknown> = { deleted: false };

  const search = getSearchValue(params);
  if (search) {
    where.fullName = { contains: search, mode: "insensitive" };
  }

  if (params.status) {
    where.status = params.status;
  }

  const [items, totalItems] = await Promise.all([
    prisma.account.findMany({
      where,
      skip,
      take,
      orderBy: toSort(params.sortBy, params.sortOrder),
      include: { role: true },
    }),
    prisma.account.count({ where }),
  ]);

  return { items, meta: toPaginationMeta(params, totalItems) };
};

export const getAccountDetail = async (id: string) => {
  return prisma.account.findFirst({
    where: {
      id,
      deleted: false,
    },
    include: {
      role: true,
    },
  });
};

export const createAccount = async (payload: {
  fullName: string;
  email: string;
  password: string;
  roleId?: string;
  status?: "active" | "inactive";
}) => {
  return prisma.account.create({
    data: {
      fullName: payload.fullName,
      email: payload.email,
      password: hashPassword(payload.password),
      roleId: payload.roleId,
      status: payload.status ?? "active",
      deleted: false,
    },
  });
};

export const updateAccount = async (id: string, payload: Record<string, unknown>) => {
  const nextPayload = { ...payload };
  const password = nextPayload.password;

  if (typeof password === "string" && password.length > 0) {
    nextPayload.password = hashPassword(password);
  } else {
    delete nextPayload.password;
  }

  return prisma.account.update({ where: { id }, data: nextPayload });
};

export const updateAccountStatus = async (id: string, status: "active" | "inactive") => {
  return prisma.account.update({
    where: { id },
    data: { status },
  });
};

export const deleteAccount = async (id: string) => {
  return prisma.account.update({ where: { id }, data: { deleted: true } });
};

export const findAccountByEmail = async (email: string, excludeId?: string) => {
  return prisma.account.findFirst({
    where: {
      email,
      deleted: false,
      ...(excludeId
        ? {
            id: {
              not: excludeId,
            },
          }
        : {}),
    },
    select: {
      id: true,
    },
  });
};

export const getMyAccount = async (id: string) => {
  return prisma.account.findFirst({
    where: {
      id,
      deleted: false,
    },
    include: {
      role: {
        select: {
          id: true,
          title: true,
          permissions: true,
        },
      },
    },
  });
};
