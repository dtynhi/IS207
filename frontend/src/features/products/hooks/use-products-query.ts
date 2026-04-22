import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../api/product.api";
import type { ProductListParams } from "../types/product.types";

export const useProductsQuery = (params: ProductListParams) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
    placeholderData: (previousData) => previousData,
  });
};
