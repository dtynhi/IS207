export type Product = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  discountPercentage: number;
  stock: number;
  soldCount: number; 
  thumbnail: string | null;
  slug: string;
  school: string | null;
  brand: string | null;
  status: "active" | "inactive";
  productCategoryId: string | null;
  featured: boolean;
  dailyFlashSaleId: string | null; 
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
  flashSale?: boolean;
};


export type FlashSaleStatus = "UPCOMING" | "ONGOING" | "ENDED";

export type FlashSaleSession = {
  id: string;
  startTime: string; // ISO datetime
  endTime: string;   // ISO datetime
  status: FlashSaleStatus;
  products: Product[];
};