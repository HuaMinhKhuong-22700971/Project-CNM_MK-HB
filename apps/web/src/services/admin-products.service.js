import { httpClient } from "./http";

export async function getAdminProducts(params = {}) {
  const response = await httpClient.get("/admin/products", { params });
  return response.data;
}

export async function createAdminProduct(payload) {
  const response = await httpClient.post("/admin/products", payload);
  return response.data;
}

export async function updateAdminProduct(productId, payload) {
  const response = await httpClient.patch(`/admin/products/${productId}`, payload);
  return response.data;
}

export async function changeAdminProductStatus(productId, status) {
  const response = await httpClient.patch(`/admin/products/${productId}/status`, { status });
  return response.data;
}
