import crypto from "crypto";
import { prisma } from "../../infrastructure/db/prisma.client";
import type { BaseQueryParams } from "../../shared/query/base-query.params";
import { toPaginationMeta, toSkipTake } from "../../shared/query/query-utils";

type UserAddress = {
  idAddress: string;
  mainAddress: string;
  isDefault: boolean;
};

type UserAddressJson = UserAddress[];

const toAddressArray = (value: unknown): UserAddressJson => {
  if (!Array.isArray(value)) {
    return [];
  }

  const result: UserAddress[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;

    const record = item as Record<string, unknown>;
    const idAddress = typeof record.idAddress === "string" ? record.idAddress : crypto.randomUUID();
    const mainAddress = typeof record.mainAddress === "string" ? record.mainAddress : "";
    const isDefault = Boolean(record.isDefault);

    result.push({
      idAddress,
      mainAddress,
      isDefault,
    });
  }

  return result;
};

const sanitizeUser = (user: {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  tokenUser: string | null;
  status: "active" | "inactive";
  address: unknown;
  createdAt: Date;
  updatedAt: Date;
}) => {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    tokenUser: user.tokenUser,
    status: user.status,
    address: toAddressArray(user.address),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const getUserProfile = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.deleted) {
    return null;
  }

  return sanitizeUser(user);
};

export const updateUserProfile = async (
  id: string,
  payload: {
    fullName?: string;
    phone?: string;
    avatar?: string;
  }
) => {
  const user = await prisma.user.update({ where: { id }, data: payload });
  return sanitizeUser(user);
};

export const listUserAddresses = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      address: true,
      deleted: true,
    },
  });

  if (!user || user.deleted) {
    return null;
  }

  return toAddressArray(user.address);
};

export const createUserAddress = async (userId: string, mainAddress: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, address: true, deleted: true },
  });

  if (!user || user.deleted) {
    return null;
  }

  const addresses = toAddressArray(user.address);
  const nextAddress: UserAddress = {
    idAddress: crypto.randomUUID(),
    mainAddress,
    isDefault: addresses.length === 0,
  };

  addresses.push(nextAddress);

  await prisma.user.update({
    where: { id: userId },
    data: {
      address: addresses,
    },
  });

  return nextAddress;
};

export const updateUserAddress = async (
  userId: string,
  addressId: string,
  payload: { mainAddress?: string; isDefault?: boolean }
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, address: true, deleted: true },
  });

  if (!user || user.deleted) {
    return { ok: false as const, reason: "USER_NOT_FOUND" as const };
  }

  const addresses = toAddressArray(user.address);
  const index = addresses.findIndex((item) => item.idAddress === addressId);

  if (index < 0) {
    return { ok: false as const, reason: "ADDRESS_NOT_FOUND" as const };
  }

  if (payload.mainAddress !== undefined) {
    addresses[index].mainAddress = payload.mainAddress;
  }

  if (payload.isDefault) {
    for (const item of addresses) {
      item.isDefault = false;
    }
    addresses[index].isDefault = true;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      address: addresses,
    },
  });

  return { ok: true as const, data: addresses[index] };
};

export const deleteUserAddress = async (userId: string, addressId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, address: true, deleted: true },
  });

  if (!user || user.deleted) {
    return { ok: false as const, reason: "USER_NOT_FOUND" as const };
  }

  const addresses = toAddressArray(user.address);
  const filtered = addresses.filter((item) => item.idAddress !== addressId);

  if (filtered.length === addresses.length) {
    return { ok: false as const, reason: "ADDRESS_NOT_FOUND" as const };
  }

  if (!filtered.some((item) => item.isDefault) && filtered.length > 0) {
    filtered[0].isDefault = true;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      address: filtered,
    },
  });

  return { ok: true as const };
};

export const listUserPurchases = async (userId: string, params: BaseQueryParams) => {
  const { skip, take } = toSkipTake(params);

  const where = {
    userId,
  };

  const [items, totalItems] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take,
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
    prisma.order.count({ where }),
  ]);

  return {
    items,
    meta: toPaginationMeta(params, totalItems),
  };
};
