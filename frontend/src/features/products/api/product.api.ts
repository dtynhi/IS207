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
      flashSale: params.flashSale,
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

export const createCampaignApi = async (payload: any) => {
  const response = await apiClient.post("/admin/campaigns", payload);
  return response.data;
};

export const getActiveCampaignApi = async () => {
  const response = await apiClient.get("/campaigns/active");
  // Lưu ý: Nếu Backend trả về null (không có chiến dịch), cần bọc fallback an toàn
  return response.data?.data || null; 
};

export const deactivateCampaignApi = async () => {
  const response = await apiClient.post<ApiSuccessResponse<any>>("/admin/campaigns/deactivate");
  return response.data.data;
};

export const getAllCampaignsApi = async () => {
  const response = await apiClient.get<ApiSuccessResponse<any>>("/admin/campaigns");
  return response.data.data;
};
export const getCampaignByIdApi = async (id: string) => {
  const response = await apiClient.get<ApiSuccessResponse<any>>(`/campaigns/${id}`);
  return response.data.data;
};
