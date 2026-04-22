export type Product = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  discountPercentage: number;
  stock: number;
  thumbnail: string | null;
  slug: string;
  school: string | null;
  status: "active" | "inactive";
  productCategoryId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductCategory = {
  id: string;
  title: string;
  slug: string;
  status: "active" | "inactive";
};

export type ProductListParams = {
  page: number;
  limit: number;
  search?: string;
  school?: string[];
  facet?: string[];
  minPrice?: number;
  maxPrice?: number;
};
