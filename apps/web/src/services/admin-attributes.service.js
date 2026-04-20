import { httpClient } from "./http";

export async function getAdminAttributes() {
  const response = await httpClient.get("/admin/attributes");
  return response.data;
}

export async function createAdminAttribute(payload) {
  const response = await httpClient.post("/admin/attributes", payload);
  return response.data;
}

export async function updateAdminAttribute(attributeId, payload) {
  const response = await httpClient.patch(`/admin/attributes/${attributeId}`, payload);
  return response.data;
}

export async function deleteAdminAttribute(attributeId) {
  const response = await httpClient.delete(`/admin/attributes/${attributeId}`);
  return response.data;
}

export async function getAdminAttributeValues(params = {}) {
  const response = await httpClient.get("/admin/attribute-values", { params });
  return response.data;
}

export async function createAdminAttributeValue(payload) {
  const response = await httpClient.post("/admin/attribute-values", payload);
  return response.data;
}

export async function updateAdminAttributeValue(attributeValueId, payload) {
  const response = await httpClient.patch(`/admin/attribute-values/${attributeValueId}`, payload);
  return response.data;
}

export async function deleteAdminAttributeValue(attributeValueId) {
  const response = await httpClient.delete(`/admin/attribute-values/${attributeValueId}`);
  return response.data;
}
