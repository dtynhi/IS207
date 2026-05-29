export interface CouponQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive";
}
