import { httpClient } from "./http";

export async function createOrder(payload) {
  const response = await httpClient.post("/orders/checkout", payload);
  return response.data;
}

export async function getMyOrders() {
  const response = await httpClient.get("/orders/my");
  return response.data;
}

export async function getOrderDetail(orderId) {
  const response = await httpClient.get(`/orders/${orderId}`);
  return response.data;
}
