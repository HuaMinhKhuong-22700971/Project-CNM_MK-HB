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

export async function lookupWarranty(code) {
  const response = await httpClient.get("/warranties/lookup", { params: { q: code } });
  return response.data;
}

export async function submitWarrantyRequest(payload) {
  const formData = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  const response = await httpClient.post("/warranties/request", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
}

export async function getMyWarrantyRequests() {
  const response = await httpClient.get("/warranties/requests/my");
  return response.data;
}
