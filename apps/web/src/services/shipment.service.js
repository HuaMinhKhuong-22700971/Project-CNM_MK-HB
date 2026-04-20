import { httpClient } from "./http";

export async function getShipmentByOrder(orderId) {
  const response = await httpClient.get(`/shipments/order/${orderId}`);
  return response.data;
}

export async function createShipment(payload) {
  const response = await httpClient.post("/shipments", payload);
  return response.data;
}

export async function updateShipmentStatus(shipmentId, payload) {
  const response = await httpClient.patch(`/shipments/${shipmentId}/status`, payload);
  return response.data;
}
