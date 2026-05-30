import type { BaseQueryParams } from "../../shared/query/base-query.params";

export interface CouponQueryParams extends BaseQueryParams {
  status?: "active" | "inactive";
}
