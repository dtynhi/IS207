import type { BaseQueryParams } from "../../shared/query/base-query.params";

export type CouponComputedStatusFilter = "ACTIVE" | "EXPIRED" | "DISABLED" | "OUT_OF_USAGE";

export interface CouponQueryParams extends BaseQueryParams {
  computedStatus?: CouponComputedStatusFilter;
}
