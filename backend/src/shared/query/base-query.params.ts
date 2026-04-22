import { z } from "zod";

const toNumberOrUndefined = (value: unknown) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

const toArray = (value: unknown): string[] | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  if (Array.isArray(value)) return value.map(String);
  return [String(value)];
};

export const baseQueryParamsSchema = z.object({
  page: z.preprocess(toNumberOrUndefined, z.number().int().min(1).default(1)),
  limit: z.preprocess(toNumberOrUndefined, z.number().int().min(1).max(100).default(20)),
  sortBy: z.string().trim().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().trim().optional(),
  keyword: z.string().trim().optional(),
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
  ids: z.preprocess(toArray, z.array(z.string().trim()).optional()),
  status: z.string().trim().optional(),
});

export type BaseQueryParams = z.infer<typeof baseQueryParamsSchema>;
