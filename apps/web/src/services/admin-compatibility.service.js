import { httpClient } from "./http";

export async function getAdminCompatibilityRules() {
  const response = await httpClient.get("/admin/compatibility-rules");
  return response.data;
}

export async function createAdminCompatibilityRule(payload) {
  const response = await httpClient.post("/admin/compatibility-rules", payload);
  return response.data;
}

export async function updateAdminCompatibilityRule(ruleId, payload) {
  const response = await httpClient.patch(`/admin/compatibility-rules/${ruleId}`, payload);
  return response.data;
}

export async function changeAdminCompatibilityRuleStatus(ruleId, status) {
  const response = await httpClient.patch(`/admin/compatibility-rules/${ruleId}/status`, { status });
  return response.data;
}
