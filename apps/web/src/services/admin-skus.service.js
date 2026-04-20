import { httpClient } from "./http";

export async function getAdminSkus(params = {}) {
  const response = await httpClient.get("/admin/skus", { params });
  return response.data;
}

export async function getAdminSkuDetail(skuId) {
  const response = await httpClient.get(`/admin/skus/${skuId}`);
  return response.data;
}

export async function createAdminSku(payload) {
  const response = await httpClient.post("/admin/skus", payload);
  return response.data;
}

export async function updateAdminSku(skuId, payload) {
  const response = await httpClient.patch(`/admin/skus/${skuId}`, payload);
  return response.data;
}

export async function deleteAdminSku(skuId) {
  const response = await httpClient.delete(`/admin/skus/${skuId}`);
  return response.data;
}

export async function assignAdminSkuAttributes(skuId, attributeValueIds) {
  const response = await httpClient.put(`/admin/skus/${skuId}/attributes`, { attributeValueIds });
  return response.data;
}
