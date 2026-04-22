import {
  AppstoreOutlined,
  BookOutlined,
  CarOutlined,
  CoffeeOutlined,
  DesktopOutlined,
  GiftOutlined,
  HomeOutlined,
  ReadOutlined,
  MobileOutlined,
  SkinOutlined,
  SoundOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductsFilteredView } from "../components/products-filtered-view";
import { ProductsHomeView } from "../components/products-home-view";
import type { Product, ProductCategory } from "../types/product.types";
import { useCategoriesQuery } from "../hooks/use-categories-query";
import { useProductsQuery } from "../hooks/use-products-query";
import type { ProductFilterValues } from "../components/product-filter-form";

type CategoryView = {
  id: string;
  title: string;
  slug: string;
  icon: ReactNode;
  source: "admin" | "suggestion";
  facetId?: string;
  searchKeyword?: string;
};

const DEFAULT_CATS: { title: string; keyword: string; icon: ReactNode }[] = [
  { title: "Điện thoại", keyword: "điện thoại", icon: <MobileOutlined /> },
  { title: "Laptop", keyword: "laptop", icon: <DesktopOutlined /> },
  { title: "Thời trang", keyword: "thời trang", icon: <SkinOutlined /> },
  { title: "Sách vở", keyword: "sách", icon: <ReadOutlined /> },
  { title: "Phụ kiện", keyword: "phụ kiện", icon: <SoundOutlined /> },
  { title: "Đồ ăn", keyword: "đồ ăn", icon: <CoffeeOutlined /> },
  { title: "Mỹ phẩm", keyword: "mỹ phẩm", icon: <SkinOutlined /> },
  { title: "Gia dụng", keyword: "gia dụng", icon: <HomeOutlined /> },
  { title: "Thể thao", keyword: "thể thao", icon: <TrophyOutlined /> },
  { title: "Xe cộ", keyword: "xe", icon: <CarOutlined /> },
];

const catIconMap: Record<string, ReactNode> = {
  "điện thoại": <MobileOutlined />,
  laptop: <DesktopOutlined />,
  "thời trang": <SkinOutlined />,
  sách: <ReadOutlined />,
  "phụ kiện": <SoundOutlined />,
  "đồ ăn": <CoffeeOutlined />,
  "mỹ phẩm": <SkinOutlined />,
  "gia dụng": <HomeOutlined />,
  "thể thao": <TrophyOutlined />,
  xe: <CarOutlined />,
};

const getIcon = (name: string) => {
  const key = Object.keys(catIconMap).find((item) => name.toLowerCase().includes(item));
  return catIconMap[key || ""] || <GiftOutlined />;
};

const useCountdown = () => {
  const [t, setT] = useState(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000));
  });

  useEffect(() => {
    const id = setInterval(() => setT((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  return {
    h: String(Math.floor(t / 3600)).padStart(2, "0"),
    m: String(Math.floor((t % 3600) / 60)).padStart(2, "0"),
    s: String(t % 60).padStart(2, "0"),
  };
};

const parseNum = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
};

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const countdown = useCountdown();

  const activeFacets = searchParams.getAll("facet");
  const isFiltered =
    activeFacets.length > 0 ||
    Boolean(searchParams.get("search")) ||
    Boolean(searchParams.get("minPrice")) ||
    Boolean(searchParams.get("maxPrice"));

  const params = useMemo(
    () => ({
      page: parseNum(searchParams.get("page"), 1),
      limit: parseNum(searchParams.get("limit"), isFiltered ? 10 : 20),
      search: searchParams.get("search") || undefined,
      facet: activeFacets.length > 0 ? activeFacets : undefined,
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    }),
    [searchParams, isFiltered, activeFacets],
  );

  const productsQuery = useProductsQuery(params);
  const categoriesQuery = useCategoriesQuery();

  const apiCats: ProductCategory[] = categoriesQuery.data || [];
  const allProducts: Product[] = productsQuery.data?.items || [];

  const displayCats: CategoryView[] = useMemo(() => {
    const adminCats: CategoryView[] = apiCats.map((cat) => ({
      id: cat.id,
      title: cat.title,
      slug: cat.slug,
      icon: getIcon(cat.title),
      source: "admin",
      facetId: cat.id,
    }));

    const existingTitles = new Set(adminCats.map((cat) => cat.title.toLowerCase().trim()));
    const suggestionCats: CategoryView[] = DEFAULT_CATS.filter((cat) => !existingTitles.has(cat.title.toLowerCase().trim()))
      .map((cat) => ({
        id: `suggest-${cat.keyword}`,
        title: cat.title,
        slug: cat.keyword.replace(/\s+/g, "-"),
        icon: cat.icon,
        source: "suggestion",
        searchKeyword: cat.keyword,
      }));

    return [...adminCats, ...suggestionCats].slice(0, 10);
  }, [apiCats]);

  const flashSaleProducts = useMemo(() => allProducts.filter((item) => item.discountPercentage > 0).slice(0, 10), [allProducts]);
  const bestSellers = useMemo(
    () => allProducts.filter((item) => item.stock > 0 && item.discountPercentage === 0).slice(0, 5),
    [allProducts],
  );

  const currentSearch = searchParams.get("search") || "";
  const activeCategory = useMemo(() => {
    if (activeFacets.length === 1) {
      return displayCats.find((cat) => cat.facetId === activeFacets[0])?.title || null;
    }
    if (currentSearch) {
      return displayCats.find((cat) => cat.searchKeyword?.toLowerCase() === currentSearch.toLowerCase())?.title || null;
    }
    return null;
  }, [activeFacets, currentSearch, displayCats]);

  const navigateToCategory = (category: CategoryView) => {
    const next = new URLSearchParams();
    next.set("page", "1");
    if (category.facetId) {
      next.append("facet", category.facetId);
    } else if (category.searchKeyword) {
      next.set("search", category.searchKeyword);
    }
    setSearchParams(next);
  };

  const applyFilter = (values: ProductFilterValues) => {
    const next = new URLSearchParams();
    next.set("page", "1");

    if (values.search) next.set("search", values.search);
    if (values.minPrice !== undefined) next.set("minPrice", String(values.minPrice));
    if (values.maxPrice !== undefined) next.set("maxPrice", String(values.maxPrice));
    values.facet?.forEach((id) => next.append("facet", id));

    setSearchParams(next);
  };

  const resetFilter = () => setSearchParams({});

  if (isFiltered) {
    return (
      <ProductsFilteredView
        search={searchParams.get("search")}
        activeCategory={activeCategory}
        apiCats={apiCats}
        params={params}
        productsPending={productsQuery.isPending}
        products={allProducts}
        page={productsQuery.data?.meta?.page || params.page}
        limit={productsQuery.data?.meta?.limit || params.limit}
        totalItems={productsQuery.data?.meta?.totalItems || 0}
        onApplyFilter={applyFilter}
        onResetFilter={resetFilter}
        onSetPageParams={setSearchParams}
      />
    );
  }

  return (
    <ProductsHomeView
      countdown={countdown}
      displayCats={displayCats}
      flashSaleProducts={flashSaleProducts}
      bestSellers={bestSellers}
      productsPending={productsQuery.isPending}
      products={allProducts}
      page={productsQuery.data?.meta?.page || params.page}
      limit={productsQuery.data?.meta?.limit || params.limit}
      totalItems={productsQuery.data?.meta?.totalItems || 0}
      onPickCategory={navigateToCategory}
      onSetPageParams={setSearchParams}
    />
  );
};
