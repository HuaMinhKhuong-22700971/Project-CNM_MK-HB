import { httpClient } from "./http";

export async function getProducts(params = {}) {
  const normalizedParams = {
    ...params,
    min_price: params.min_price ?? params.minPrice,
    max_price: params.max_price ?? params.maxPrice,
    keyword: params.keyword ?? params.search
  };
  const response = await httpClient.get("/products", { params: normalizedParams });
  return response.data;
}

export async function getProductFilterOptions() {
  const response = await httpClient.get("/products/filter-options");
  return response.data;
}

export async function getCompareProducts(ids) {
  const response = await httpClient.get("/products/compare", {
    params: {
      ids: Array.isArray(ids) ? ids.join(",") : ids
    }
  });
  return response.data;
}

export async function getProductDetail(idOrSlug) {
  const response = await httpClient.get(`/products/${idOrSlug}`);
  return response.data;
}

export async function getCategories() {
  const response = await httpClient.get("/categories");
  return response.data;
}

export async function getBrands() {
  const response = await httpClient.get("/brands");
  return response.data;
}
