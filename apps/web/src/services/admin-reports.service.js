import { httpClient } from "./http";

export async function getAdminSalesReport(params = {}) {
  const response = await httpClient.get("/admin/reports/sales", { params });
  return response.data;
}
