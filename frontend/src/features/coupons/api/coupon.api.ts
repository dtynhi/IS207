import { apiClient } from "../../../shared/api/client";



export type VoucherComputedStatus = "ACTIVE" | "EXPIRED" | "DISABLED" | "OUT_OF_USAGE";

export type VoucherMode = "PUBLIC" | "PRIVATE";



export interface Coupon {

  id: string;

  code: string;

  description?: string;

  type: "percent" | "amount";

  value: number;

  startsAt?: string;

  endsAt?: string;

  totalUsageLimit: number;

  maxUsagePerUser: number;

  mode?: VoucherMode;

  usedCount: number;

  minOrderAmount: number;

  applyTo?: Record<string, unknown>;

  status: "active" | "inactive";

  computedStatus?: VoucherComputedStatus;

  refundPolicy?: "NONE" | "ON_CANCEL" | "ON_RETURN";

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

  totalUsageLimit: number;

  maxUsagePerUser: number;

  mode?: VoucherMode;

  refundPolicy?: "NONE" | "ON_CANCEL" | "ON_RETURN";

  minOrderAmount?: number;

  applyTo?: Record<string, unknown>;

  status: "active" | "inactive";

  assignedUserIds?: string[];

}



export interface UpdateCouponPayload extends Partial<CreateCouponPayload> {}



export interface CouponValidateResult {

  coupon: Coupon;

  discount: number;

  finalPrice: number;

}





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

  list: async (

    page = 1,

    limit = 20,

    search = "",

    computedStatus?: VoucherComputedStatus,

  ) => {

    const params = new URLSearchParams();

    params.set("page", page.toString());

    params.set("limit", limit.toString());

    if (search) params.set("search", search);

    if (computedStatus) params.set("computedStatus", computedStatus);



    const response = await apiClient.get(`/coupons?${params}`);

    return response.data as ListCouponsResponse;

  },



  getById: async (id: string) => {

    const response = await apiClient.get(`/coupons/${id}`);

    return response.data as Coupon;

  },



  create: async (payload: CreateCouponPayload) => {

    const response = await apiClient.post("/coupons", payload);

    return response.data as Coupon;

  },



  update: async (id: string, payload: UpdateCouponPayload) => {

    const response = await apiClient.put(`/coupons/${id}`, payload);

    return response.data as Coupon;

  },



  delete: async (id: string) => {

    await apiClient.delete(`/coupons/${id}`);

  },



  validate: async (

    code: string,

    orderTotal: number,

    productIds?: string[],

    userId?: string,

  ) => {

    const response = await apiClient.post("/coupons/validate", {

      code,

      orderTotal,

      productIds,

      userId,

    });

    return response.data as CouponValidateResult;

  },



};

