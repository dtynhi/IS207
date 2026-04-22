import { useQuery } from "@tanstack/react-query";
import { getProductBySlug } from "../api/product.api";

export const useProductDetailQuery = (slug: string) => {
  return useQuery({
    queryKey: ["product-detail", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug),
  });
};
