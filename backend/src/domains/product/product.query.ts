import { z } from "zod";
import { extendBaseQueryParams } from "../../shared/query/extend-query.params";

const toArray = (value: unknown): string[] | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  if (Array.isArray(value)) return value.map(String);
  return [String(value)];
};

const toNumberOrUndefined = (value: unknown) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

export const productQuerySchema = extendBaseQueryParams({
  school: z.preprocess(toArray, z.array(z.string().trim()).optional()),
  facet: z.preprocess(toArray, z.array(z.string().trim()).optional()),
  minPrice: z.preprocess(toNumberOrUndefined, z.number().min(0).optional()),
  maxPrice: z.preprocess(toNumberOrUndefined, z.number().min(0).optional()),
  status: z.enum(["active", "inactive"]).optional(),
});

export type ProductQueryParams = z.infer<typeof productQuerySchema>;
