import { z } from "zod";
import { baseQueryParamsSchema } from "./base-query.params";

export const extendBaseQueryParams = <
  TShape extends z.ZodRawShape
>(shape: TShape) => {
  return baseQueryParamsSchema.extend(shape);
};
