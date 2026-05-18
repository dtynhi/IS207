import { prisma } from "../../infrastructure/db/prisma.client";
import { getSearchValue, toPaginationMeta, toSkipTake, toSort } from "../../shared/query/query-utils";
import type { ProductQueryParams } from "./product.query";
// import { generateSeedFromDb } from "../../infrastructure/db/generate-seed";

// Helper để trigger seed generation không block request
// const triggerSeedUpdate = async () => {
//   try {
//     await generateSeedFromDb();
//   } catch (error) {
//     // Silent fail - log only
//     console.error("[product-service] Lỗi update seed:", error);
//   }
// };

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
  featured?: boolean;
  status?: "active" | "inactive";
  createdById?: string;
  thumbnail?: string;
  brand?: string;
}) => {
  const product = await prisma.product.create({
    data: {
      title: payload.title,
      price: payload.price,
      slug: payload.slug,
      description: payload.description,
      discountPercentage: payload.discountPercentage ?? 0,
      stock: payload.stock ?? 0,
      featured: payload.featured ?? false,
      status: payload.status ?? "active",
      deleted: false,
      productCategoryId: payload.productCategoryId,
      school: payload.school,
      position: payload.position ?? 0,
      createdById: payload.createdById,
      thumbnail: payload.thumbnail,
      brand: payload.brand,
    },
  });

  // Tự động update seed (async, không block)
  // triggerSeedUpdate();

  return product;
};

export const updateProduct = async (id: string, payload: Record<string, unknown>) => {
  
  //TUYỆT CHIÊU CHẶN ĐẦU: Tạo một bản sao dữ liệu để xử lý an toàn
  const safePayload = { ...payload };


  // Kiểm tra xem trong các trường gửi lên có 'discountPercentage' không
  if ('discountPercentage' in safePayload) {
    const value = safePayload.discountPercentage;
    
    // Nếu giá trị gửi xuống là null, undefined, chuỗi rỗng hoặc số 0
    if (value === null || value === undefined || value === "" || value === 0) {
      safePayload.discountPercentage = 0; // Ép chết về số 0 để tắt Flash Sale an toàn
    } else {
      safePayload.discountPercentage = Number(value); // Đảm bảo luôn luôn là kiểu dữ liệu Số
    }
  }

  // Lưu vào database bằng dữ liệu an toàn đã qua xử lý
  return prisma.product.update({ 
    where: { id }, 
    data: safePayload 
  });
};
export const updateProductStatus = async (id: string, status: "active" | "inactive") => {
  const product = await prisma.product.update({ where: { id }, data: { status } });

  // Tự động update seed (async, không block)
  // triggerSeedUpdate();

  return product;
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

    // Tự động update seed
    // triggerSeedUpdate();

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

    // Tự động update seed
    // triggerSeedUpdate();

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

  // Tự động update seed
  // triggerSeedUpdate();

  return { affected };
};

export const deleteProduct = async (id: string, deletedById?: string) => {
  const product = await prisma.product.update({ where: { id }, data: { deleted: true, deletedById } });

  // Tự động update seed
  // triggerSeedUpdate();

  return product;
};
