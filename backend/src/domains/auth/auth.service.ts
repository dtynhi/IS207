import crypto from "crypto";
import { prisma } from "../../infrastructure/db/prisma.client";
import { generateOtp } from "../../shared/security/otp";
import { hashPassword, verifyPassword } from "../../shared/security/password";

const OTP_EXPIRE_MINUTES = 3;

const sanitizeUser = (user: {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  tokenUser: string | null;
  status: "active" | "inactive";
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
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const sanitizeAccount = (account: {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  status: "active" | "inactive";
  roleId: string | null;
  role: { id: string; title: string; permissions: unknown; status: "active" | "inactive" } | null;
  createdAt: Date;
  updatedAt: Date;
}) => {
  return {
    id: account.id,
    fullName: account.fullName,
    email: account.email,
    phone: account.phone,
    avatar: account.avatar,
    status: account.status,
    roleId: account.roleId,
    role: account.role,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
};

export const registerUser = async (payload: {
  fullName: string;
  email: string;
  password: string;
}) => {
  const tokenUser = crypto.randomUUID();

  const user = await prisma.user.create({
    data: {
      fullName: payload.fullName,
      email: payload.email,
      password: hashPassword(payload.password),
      tokenUser,
      status: "active",
      deleted: false,
    },
  });

  return sanitizeUser(user);
};

export const loginUser = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findFirst({
    where: {
      email: payload.email,
      deleted: false,
    },
  });

  if (!user) {
    return null;
  }

  if (user.status !== "active") {
    return null;
  }

  if (!verifyPassword(payload.password, user.password)) {
    return null;
  }

  const tokenUser = crypto.randomUUID();
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { tokenUser },
  });

  return sanitizeUser(updatedUser);
};

export const adminLogin = async (payload: { email: string; password: string }) => {
  const account = await prisma.account.findFirst({
    where: {
      email: payload.email,
      deleted: false,
      status: "active",
    },
    include: {
      role: {
        select: {
          id: true,
          title: true,
          permissions: true,
          status: true,
        },
      },
    },
  });

  if (!account) {
    return null;
  }

  if (!verifyPassword(payload.password, account.password)) {
    return null;
  }

  return sanitizeAccount(account);
};

export const getUserByToken = async (tokenUser: string) => {
  const user = await prisma.user.findFirst({
    where: {
      tokenUser,
      deleted: false,
      status: "active",
    },
  });

  if (!user) return null;
  return sanitizeUser(user);
};

export const createForgotPasswordOtp = async (email: string) => {
  const user = await prisma.user.findFirst({
    where: {
      email,
      deleted: false,
      status: "active",
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) {
    return null;
  }

  const otp = generateOtp(6);
  const expireAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);

  await prisma.forgotPassword.create({
    data: {
      email: user.email,
      otp,
      expireAt,
    },
  });

  return {
    email: user.email,
    otp,
    expireAt,
  };
};

export const verifyForgotPasswordOtp = async (payload: {
  email: string;
  otp: string;
}) => {
  const record = await prisma.forgotPassword.findFirst({
    where: {
      email: payload.email,
      otp: payload.otp,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!record) {
    return null;
  }

  if (record.expireAt.getTime() < Date.now()) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      email: payload.email,
      deleted: false,
      status: "active",
    },
    select: {
      id: true,
      tokenUser: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    tokenUser: user.tokenUser,
  };
};

export const resetPasswordByEmail = async (payload: {
  email: string;
  password: string;
}) => {
  const user = await prisma.user.findFirst({
    where: {
      email: payload.email,
      deleted: false,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    return null;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashPassword(payload.password) },
  });

  return { updated: true };
};

export const changeUserPassword = async (payload: {
  userId: string;
  oldPassword: string;
  newPassword: string;
}) => {
  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
  });

  if (!user || user.deleted || user.status !== "active") {
    return { ok: false as const, reason: "USER_NOT_FOUND" as const };
  }

  if (!verifyPassword(payload.oldPassword, user.password)) {
    return { ok: false as const, reason: "OLD_PASSWORD_INVALID" as const };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashPassword(payload.newPassword),
    },
  });

  return { ok: true as const };
};
