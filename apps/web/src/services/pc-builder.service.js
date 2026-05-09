import { httpClient } from "./http";

export async function createBuild(payload = {}) {
  const response = await httpClient.post("/pc-builder", payload);
  return response.data;
}

export async function getBuildDetail(buildId) {
  const response = await httpClient.get(`/pc-builder/${buildId}`);
  return response.data;
}

export async function addBuildItem(buildId, payload) {
  const response = await httpClient.post(`/pc-builder/${buildId}/items`, payload);
  return response.data;
}

export async function replaceBuildItem(buildId, componentType, payload) {
  const response = await httpClient.patch(`/pc-builder/${buildId}/items/${componentType}`, payload);
  return response.data;
}

export async function removeBuildItem(buildId, componentType) {
  const response = await httpClient.delete(`/pc-builder/${buildId}/items/${componentType}`);
  return response.data;
}

export async function saveBuild(buildId, payload = {}) {
  const response = await httpClient.patch(`/pc-builder/${buildId}/save`, payload);
  return response.data;
}

export async function checkBuildCompatibility(buildId) {
  const response = await httpClient.get(`/compatibility/builds/${buildId}`);
  return response.data;
}

export async function checkRawCompatibility(payload) {
  const response = await httpClient.post("/pc-builder/check-compatibility", payload);
  return response.data;
}

export async function suggestBuild(payload) {
  const response = await httpClient.post("/ai-advisor/suggest-build", payload);
  return response.data;
}
