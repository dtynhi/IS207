import { apiClient } from "../../../shared/api/client";
import type { ApiSuccessResponse } from "../../../shared/api/types";
import type { Product, ProductCategory, ProductListParams } from "../types/product.types";

export const getProducts = async (params: ProductListParams) => {
  const response = await apiClient.get<ApiSuccessResponse<Product[]>>("/products", {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      school: params.school,
      facet: params.facet,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
    },
  });

  return {
    items: response.data.data,
    meta: response.data.meta,
  };
};

export const getProductBySlug = async (slug: string) => {
  const response = await apiClient.get<ApiSuccessResponse<Product>>(`/products/detail/${slug}`);
  return response.data.data;
};

export const getCategories = async () => {
  const response = await apiClient.get<ApiSuccessResponse<ProductCategory[]>>("/categories");
  return response.data.data;
};
