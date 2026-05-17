import { prisma } from "./prisma.client";
import fs from "fs";
import path from "path";

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
  addresses: Array<{ mainAddress: string; isDefault: boolean }>;
};

const SEED_DATA_PATH = path.join(__dirname, "seed-data.json");

export const syncSeedDataToFile = async () => {
  try {
    console.log("🔄 Bắt đầu đồng bộ dữ liệu vào file seed-data.json...");

    // 1. Fetch Categories
    const categoriesDb = await prisma.productCategory.findMany({
      where: { deleted: false, status: "active" },
      orderBy: { position: "asc" },
    });

    const vietnameseCategories: SeedCategory[] = categoriesDb.map((c) => ({
      title: c.title,
      description: c.description || "",
      position: c.position,
      thumbnail: c.thumbnail || "",
    }));

    // 2. Fetch Products
    const productsDb = await prisma.product.findMany({
      where: { deleted: false, status: "active" },
      include: { productCategory: true },
      orderBy: { createdAt: "asc" },
    });

    const vietnameseProducts: SeedProduct[] = productsDb.map((p) => ({
      title: p.title,
      description: p.description || "",
      price: p.price,
      discountPercentage: p.discountPercentage,
      stock: p.stock,
      school: p.school || "",
      brand: p.brand || undefined,
      categorySlug: p.productCategory?.slug || "",
      thumbnail: p.thumbnail || "",
      featured: p.featured,
    }));

    // 3. Fetch Users
    const usersDb = await prisma.user.findMany({
      where: { deleted: false, status: "active", isSeeded: true }, // Filter out demo users? Or all active users?
      orderBy: { createdAt: "asc" },
    });
    // Wait! In default-seed.ts it's demoUsers. Should we export ALL users, or just seeded users?
    // If the user wants the seed file to auto-update when they register, they mean all users.
    // I will fetch all active users.
    const allUsersDb = await prisma.user.findMany({
      where: { deleted: false, status: "active" },
      orderBy: { createdAt: "asc" },
    });

    const demoUsers: SeedUser[] = allUsersDb.map((u) => {
      let parsedAddresses: Array<{ mainAddress: string; isDefault: boolean }> = [];
      if (u.address && Array.isArray(u.address)) {
        parsedAddresses = u.address.map((addr: any) => ({
          mainAddress: addr.mainAddress || "",
          isDefault: addr.isDefault || false,
        }));
      }
      return {
        fullName: u.fullName,
        email: u.email,
        phone: u.phone || "",
        avatar: u.avatar || "",
        addresses: parsedAddresses,
      };
    });

    // 4. Save to JSON
    const dataToSave = {
      vietnameseCategories,
      vietnameseProducts,
      demoUsers,
    };

    await fs.promises.writeFile(SEED_DATA_PATH, JSON.stringify(dataToSave, null, 2), "utf8");
    console.log("✅ Đồng bộ dữ liệu seed thành công!");
  } catch (error) {
    console.error("❌ Lỗi khi đồng bộ dữ liệu seed:", error);
  }
};

let syncTimeout: NodeJS.Timeout | null = null;
export const triggerSeedUpdate = () => {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  syncTimeout = setTimeout(() => {
    syncSeedDataToFile().catch(console.error);
  }, 3000);
};
