import { apiClient } from "../../../shared/api/client";

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: "percent" | "amount";
  value: number;
  startsAt?: string;
  endsAt?: string;
  totalUsageLimit?: number;
  usedCount: number;
  minOrderAmount: number;
  applyTo?: Record<string, unknown>;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponPayload {
  code: string;
  description?: string;
  type: "percent" | "amount";
  value: number;
  startsAt?: string;
  endsAt?: string;
  totalUsageLimit?: number;
  maxUsagePerUser?: number;
  mode?: "PUBLIC" | "PRIVATE" | "LIMITED";
  allowStacking?: boolean;
  maxVouchersPerOrder?: number;
  refundPolicy?: "NONE" | "ON_CANCEL" | "ON_RETURN";
  minOrderAmount?: number;
  applyTo?: Record<string, unknown>;
  status: "active" | "inactive";
}

export interface UpdateCouponPayload extends Partial<CreateCouponPayload> {}

export interface ListCouponsResponse {
  items: Coupon[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const couponAPI = {
  // List coupons
  list: async (page = 1, limit = 20, search = "", status?: string) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    if (search) params.set("search", search);
    if (status) params.set("status", status);

    const response = await apiClient.get(`/coupons?${params}`);
    return response.data as ListCouponsResponse;
  },

  // Get coupon by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/coupons/${id}`);
    return response.data as Coupon;
  },

  // Create coupon
  create: async (payload: CreateCouponPayload) => {
    const response = await apiClient.post("/coupons", payload);
    return response.data as Coupon;
  },

  // Update coupon
  update: async (id: string, payload: UpdateCouponPayload) => {
    const response = await apiClient.put(`/coupons/${id}`, payload);
    return response.data as Coupon;
  },

  // Delete coupon
  delete: async (id: string) => {
    await apiClient.delete(`/coupons/${id}`);
  },

  // Validate coupon for use
  validate: async (code: string, orderTotal: number, productIds?: string[]) => {
    const response = await apiClient.post("/coupons/validate", {
      code,
      orderTotal,
      productIds,
    });
    return response.data;
  },

  // Apply coupon
  apply: async (code: string, orderTotal: number, productIds?: string[]) => {
    const response = await apiClient.post("/coupons/apply", {
      code,
      orderTotal,
      productIds,
    });
    return response.data;
  },
  // Assignments
  createAssignment: async (couponId: string, payload: { userId: string; allowedUses?: number; extraUses?: number; expiresAt?: string; note?: string }) => {
    const response = await apiClient.post(`/coupons/${couponId}/assignments`, payload);
    return response.data;
  },

  listAssignments: async (couponId: string) => {
    const response = await apiClient.get(`/coupons/${couponId}/assignments`);
    return response.data as any[];
  },

  deleteAssignment: async (assignmentId: string) => {
    await apiClient.delete(`/coupons/assignments/${assignmentId}`);
  },
};
