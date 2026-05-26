import { apiClient } from "../../../shared/api/client";
import type { ApiSuccessResponse } from "../../../shared/api/types";
import type { Product, ProductCategory, ProductListParams, FlashSaleSession } from "../types/product.types";

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
  return response.data?.data || null;
};

export const deactivateCampaignApi = async (id: string) => {
  const response = await apiClient.post<ApiSuccessResponse<any>>(`/admin/campaigns/${id}/deactivate`);
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


export const getActiveFlashSaleApi = async (): Promise<FlashSaleSession | null> => {
  const response = await apiClient.get<ApiSuccessResponse<FlashSaleSession>>("/flash-sale/active");
  return response.data?.data || null;
};

export const getFlashSaleSessionsApi = async (): Promise<FlashSaleSession[]> => {
  const response = await apiClient.get<ApiSuccessResponse<FlashSaleSession[]>>("/flash-sale/sessions");
  return response.data?.data || [];
};


export const createFlashSaleSessionApi = async (payload: {
  startTime: string;
  endTime: string;
  productIds: string[];
}) => {
  const response = await apiClient.post<ApiSuccessResponse<FlashSaleSession>>("/admin/flash-sale", payload);
  return response.data.data;
};

export const getAllFlashSaleSessionsApi = async (): Promise<FlashSaleSession[]> => {
  const response = await apiClient.get<ApiSuccessResponse<FlashSaleSession[]>>("/admin/flash-sale");
  return response.data?.data || [];
};

export const updateFlashSaleStatusApi = async (id: string, status: "UPCOMING" | "ONGOING" | "ENDED") => {
  const response = await apiClient.patch<ApiSuccessResponse<FlashSaleSession>>(`/admin/flash-sale/${id}/status`, { status });
  return response.data.data;
};

export const deleteFlashSaleSessionApi = async (id: string) => {
  const response = await apiClient.delete(`/admin/flash-sale/${id}`);
  return response.data;
};