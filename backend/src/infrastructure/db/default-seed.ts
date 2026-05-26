import type { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "./prisma.client";
import { hashPassword } from "../../shared/security/password";

// ⚠️ AUTO-UPDATED FILE
// Được sinh tự động từ database mỗi lần thêm/sửa sản phẩm
// File này được maintain bởi hệ thống, không edit thủ công

type SeedCategory = {
  title: string;
  description: string;
  position: number;
  thumbnail: string;
};

type SeedProduct = {
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  stock: number;
  school: string;
  brand?: string;
  categorySlug: string;
  thumbnail: string;
  featured?: boolean;
};

type SeedUser = {
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  addresses: Array<{ fullName?: string; phone?: string; province?: string; ward?: string; addressLine: string; isDefault: boolean } | { mainAddress?: string; isDefault: boolean }>;
};

const normalizeSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// Helper function to normalize address to new format
const normalizeAddress = (addr: any) => {
  if (addr.fullName !== undefined) {
    // Already in new format
    return {
      idAddress: addr.idAddress || "",
      fullName: addr.fullName,
      phone: addr.phone || "",
      province: addr.province || "",
      ward: addr.ward || "",
      addressLine: addr.addressLine || "",
      isDefault: addr.isDefault || false,
    };
  }

  // Convert from old format (mainAddress)
  const mainAddress = addr.mainAddress || addr.addressLine || "";
  // Simple parsing: take last part as province, middle as ward, rest as addressLine
  const parts = mainAddress.split(",").map((p: string) => p.trim());
  
  return {
    idAddress: addr.idAddress || "",
    fullName: addr.fullName || "",
    phone: addr.phone || "",
    province: parts.length > 1 ? parts[parts.length - 1] : "TP.HCM",
    ward: parts.length > 2 ? parts[parts.length - 2] : (parts.length > 1 ? parts[0] : ""),
    addressLine: parts.length > 2 ? parts.slice(0, -2).join(", ") : (parts.length > 1 ? parts[0] : mainAddress),
    isDefault: addr.isDefault || false,
  };
};


import * as fs from "fs";
import * as path from "path";

const seedDataPath = path.join(__dirname, "seed-data.json");
let rawSeedData = "{}";
try {
  rawSeedData = fs.readFileSync(seedDataPath, "utf-8");
} catch(e) {
  console.error("[default-seed] Khong the doc file seed-data.json", e);
}
const parsedSeedData = JSON.parse(rawSeedData);
const vietnameseCategories: SeedCategory[] = parsedSeedData.vietnameseCategories || [];
const vietnameseProducts: SeedProduct[] = parsedSeedData.vietnameseProducts || [];
const demoUsers: SeedUser[] = parsedSeedData.demoUsers || [];


const defaultPassword = "123456";
const defaultPermissions = {
  dashboard: ["read"],
  products: ["read", "create", "update", "delete"],
  categories: ["read", "create", "update", "delete"],
  roles: ["read", "create", "update"],
  accounts: ["read", "create", "update"],
  settings: ["read", "update"],
};

const seedRolesAndAccounts = async () => {
  const adminRole = await prisma.role.upsert({
    where: { id: "role-admin-he-thong" },
    update: {
      title: "Quản trị hệ thống",
      description: "Toàn quyền quản trị hệ thống Uni Market",
      permissions: defaultPermissions as Prisma.InputJsonValue,
      status: "active",
      deleted: false,
    },
    create: {
      id: "role-admin-he-thong",
      title: "Quản trị hệ thống",
      description: "Toàn quyền quản trị hệ thống Uni Market",
      permissions: defaultPermissions as Prisma.InputJsonValue,
      status: "active",
      deleted: false,
    },
  });

  const operatorRole = await prisma.role.upsert({
    where: { id: "role-van-hanh" },
    update: {
      title: "Nhân viên vận hành",
      description: "Quản lý sản phẩm, đơn hàng và danh mục",
      permissions: {
        dashboard: ["read"],
        products: ["read", "create", "update"],
        categories: ["read", "create", "update"],
        accounts: ["read"],
      } as Prisma.InputJsonValue,
      status: "active",
      deleted: false,
    },
    create: {
      id: "role-van-hanh",
      title: "Nhân viên vận hành",
      description: "Quản lý sản phẩm, đơn hàng và danh mục",
      permissions: {
        dashboard: ["read"],
        products: ["read", "create", "update"],
        categories: ["read", "create", "update"],
        accounts: ["read"],
      } as Prisma.InputJsonValue,
      status: "active",
      deleted: false,
    },
  });

  const accounts = [
    {
      fullName: "Quản trị viên Uni Market",
      email: "admin@unimarket.vn",
      phone: "0909000001",
      roleId: adminRole.id,
    },
    {
      fullName: "Nhân viên vận hành A",
      email: "vanhanh@unimarket.vn",
      phone: "0909000002",
      roleId: operatorRole.id,
    },
    {
      fullName: "Nhân viên hỗ trợ khách hàng",
      email: "hotro@unimarket.vn",
      phone: "0909000003",
      roleId: operatorRole.id,
    },
  ];

  for (const account of accounts) {
    await prisma.account.upsert({
      where: { email: account.email },
      update: {
        fullName: account.fullName,
        phone: account.phone,
        roleId: account.roleId,
        status: "active",
        deleted: false,
      },
      create: {
        fullName: account.fullName,
        email: account.email,
        password: hashPassword(defaultPassword),
        phone: account.phone,
        roleId: account.roleId,
        status: "active",
        deleted: false,
      },
    });
  }
};

const seedGeneralSettings = async () => {
  const current = await prisma.settingGeneral.findFirst({ orderBy: { createdAt: "asc" } });

  if (!current) {
    await prisma.settingGeneral.create({
      data: {
        websiteName: "Uni Market - Chợ đồ sinh viên",
        logo: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=240&h=240",
        phone: "02873001234",
        email: "hotro@unimarket.vn",
        address: "Khu đô thị Đại học Quốc gia TP.HCM, TP Thủ Đức, TP.HCM",
        copyright: "© 2026 Uni Market. Dữ liệu mẫu phục vụ học tập và phát triển dự án.",
      },
    });
    return;
  }

  await prisma.settingGeneral.update({
    where: { id: current.id },
    data: {
      websiteName: current.websiteName || "Uni Market - Chợ đồ sinh viên",
      phone: current.phone || "02873001234",
      email: current.email || "hotro@unimarket.vn",
      address: current.address || "Khu đô thị Đại học Quốc gia TP.HCM, TP Thủ Đức, TP.HCM",
      copyright:
        current.copyright || "© 2026 Uni Market. Dữ liệu mẫu phục vụ học tập và phát triển dự án.",
    },
  });
};

const seedCategories = async () => {
  const map = new Map<string, string>();

  for (const category of vietnameseCategories) {
    const slug = normalizeSlug(category.title);
    const saved = await prisma.productCategory.upsert({
      where: { slug },
      update: {
        title: category.title,
        description: category.description,
        position: category.position,
        thumbnail: category.thumbnail,
        status: "active",
        deleted: false,
      },
      create: {
        title: category.title,
        slug,
        description: category.description,
        position: category.position,
        thumbnail: category.thumbnail,
        status: "active",
        deleted: false,
      },
    });

    map.set(slug, saved.id);
  }

  return map;
};

const seedProducts = async (categoryMap: Map<string, string>) => {
  for (const product of vietnameseProducts) {
    const categoryId = categoryMap.get(product.categorySlug);
    if (!categoryId) continue;

    const slug = normalizeSlug(product.title);
    await prisma.product.upsert({
      where: { slug },
      update: {
        title: product.title,
        description: product.description,
        price: product.price,
        discountPercentage: product.discountPercentage,
        stock: product.stock,
        school: product.school,
        brand: product.brand,
        thumbnail: product.thumbnail,
        productCategoryId: categoryId,
        featured: product.featured ?? false,
        status: "active",
        deleted: false,
      },
      create: {
        title: product.title,
        slug,
        description: product.description,
        price: product.price,
        discountPercentage: product.discountPercentage,
        stock: product.stock,
        school: product.school,
        brand: product.brand,
        thumbnail: product.thumbnail,
        images: [] as Prisma.InputJsonValue,
        productCategoryId: categoryId,
        featured: product.featured ?? false,
        status: "active",
        deleted: false,
      },
    });
  }
};

const seedUsers = async () => {
  for (const user of demoUsers) {
    const normalizedAddresses = user.addresses.map((addr, index) => {
      const normalized = normalizeAddress(addr);
      return {
        ...normalized,
        idAddress: `${normalizeSlug(user.email)}-dia-chi-${index + 1}`,
      };
    });

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        fullName: user.fullName,
        phone: user.phone,
        avatar: user.avatar,
        address: normalizedAddresses as Prisma.InputJsonValue,
        status: "active",
        deleted: false,
      },
      create: {
        fullName: user.fullName,
        email: user.email,
        password: hashPassword(defaultPassword),
        tokenUser: `token-${normalizeSlug(user.email)}`,
        phone: user.phone,
        avatar: user.avatar,
        address: normalizedAddresses as Prisma.InputJsonValue,
        status: "active",
        deleted: false,
      },
    });
  }
};

const seedDemoCartsAndOrders = async () => {
  const existingOrders = await prisma.order.count();
  if (existingOrders > 0) return;

  const users = await prisma.user.findMany({ where: { deleted: false }, take: 3, orderBy: { createdAt: "asc" } });
  const products = await prisma.product.findMany({ where: { deleted: false, status: "active" }, take: 9, orderBy: { createdAt: "asc" } });

  if (users.length === 0 || products.length === 0) return;

  for (let i = 0; i < Math.min(users.length, 3); i += 1) {
    const user = users[i];
    const userProducts = products.slice(i * 3, i * 3 + 3);
    if (userProducts.length === 0) continue;

    for (const product of userProducts.slice(0, 2)) {
      await prisma.cart.upsert({
        where: { userId_productId: { userId: user.id, productId: product.id } },
        update: { quantity: 1 },
        create: { userId: user.id, productId: product.id, quantity: 1 },
      });
    }

    const statusCycle: OrderStatus[] = ["pending_confirm", "ready_to_pick", "delivered"];
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        fullName: user.fullName,
        phone: user.phone || "0900000000",
        address: `Địa chỉ giao hàng mẫu của ${user.fullName}`,
        status: statusCycle[i % statusCycle.length],
        // paymentStatus: i % 2 === 0 ? "unpaid" : "paid",
      },
    });

    for (const product of userProducts) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          price: product.price,
          discountPercentage: product.discountPercentage,
          quantity: 1,
        },
      });
    }
  }
};

const runDefaultSeedData = async () => {
  await seedRolesAndAccounts();
  await seedGeneralSettings();
  const categoryMap = await seedCategories();
  await seedProducts(categoryMap);
  await seedUsers();
  await seedDemoCartsAndOrders();
};

const hasExistingBusinessData = async () => {
  const [roles, accounts, users, categories, products, orders, carts] = await Promise.all([
    prisma.role.count(),
    prisma.account.count(),
    prisma.user.count(),
    prisma.productCategory.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.cart.count(),
  ]);

  return roles + accounts + users + categories + products + orders + carts > 0;
};

const clearAllSeedableData = async () => {
  await prisma.walletTransaction.deleteMany();
  await prisma.refundRequest.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.returnLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.forgotPassword.deleteMany();
  await prisma.user.deleteMany();
  await prisma.account.deleteMany();
  await prisma.role.deleteMany();
  await prisma.settingGeneral.deleteMany();
};

export const getSeedSummary = () => {
  return {
    categories: vietnameseCategories.length,
    products: vietnameseProducts.length,
    demoUsers: demoUsers.length,
  };
};

export const ensureDefaultSeedData = async () => {
  const hasData = await hasExistingBusinessData();

  if (hasData) {
    return { seeded: false };
  }

  await runDefaultSeedData();
  return { seeded: true };
};

export const overwriteDefaultSeedData = async () => {
  await clearAllSeedableData();
  await runDefaultSeedData();
  return { seeded: true };
};
