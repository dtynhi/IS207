import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../api/product.api";

export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: ["product-categories"],
    queryFn: getCategories,
  });
};
