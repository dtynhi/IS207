import { prisma } from "../../infrastructure/db/prisma.client";

export const getGeneralSetting = async () => {
  return prisma.settingGeneral.findFirst({ orderBy: { createdAt: "desc" } });
};

export const upsertGeneralSetting = async (payload: {
  websiteName: string;
  logo?: string;
  phone?: string;
  email?: string;
  address?: string;
  copyright?: string;
}) => {
  const current = await prisma.settingGeneral.findFirst({ orderBy: { createdAt: "desc" } });
  if (!current) {
    return prisma.settingGeneral.create({ data: payload });
  }
  return prisma.settingGeneral.update({ where: { id: current.id }, data: payload });
};
