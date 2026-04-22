import type { BaseQueryParams } from "./base-query.params";

export const toSkipTake = (query: BaseQueryParams) => {
  const skip = (query.page - 1) * query.limit;
  const take = query.limit;
  return { skip, take };
};

export const toPaginationMeta = (query: BaseQueryParams, totalItems: number) => {
  const totalPages = Math.ceil(totalItems / query.limit);
  return {
    page: query.page,
    limit: query.limit,
    totalItems,
    totalPages,
  };
};

export const toSort = (sortBy: string, sortOrder: "asc" | "desc") => {
  return { [sortBy]: sortOrder } as Record<string, "asc" | "desc">;
};

export const getSearchValue = (query: BaseQueryParams) => {
  return query.search ?? query.keyword;
};
