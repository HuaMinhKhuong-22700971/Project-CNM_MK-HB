import { httpClient } from "./http";

export async function getEligibleWarrantyItems() {
  const response = await httpClient.get("/warranties/eligible");
  return response.data;
}

export async function getMyWarranties(params = {}) {
  const response = await httpClient.get("/warranties/my", { params });
  return response.data;
}

export async function activateWarranty(payload) {
  const response = await httpClient.post("/warranties/activate", payload);
  return response.data;
}
