import { httpClient } from "./http";

export async function getStaffOrders(params = {}) {
  const response = await httpClient.get("/staff/orders", { params });
  return response.data;
}

export async function getStaffOrderDetail(orderId) {
  const response = await httpClient.get(`/staff/orders/${orderId}`);
  return response.data;
}

export async function updateStaffOrderStatus(orderId, status, payload = {}) {
  const response = await httpClient.patch(`/staff/orders/${orderId}/status`, { status, ...payload });
  return response.data;
}

export async function createStaffShipment(orderId, payload = {}) {
  const response = await httpClient.post(`/staff/orders/${orderId}/shipment`, payload);
  return response.data;
}

export async function updateStaffConsultationNote(orderId, note) {
  const response = await httpClient.patch(`/staff/orders/${orderId}/consultation-note`, { note });
  return response.data;
}
