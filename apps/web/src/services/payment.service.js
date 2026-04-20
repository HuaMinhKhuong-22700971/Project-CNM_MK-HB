import { httpClient } from "./http";

export async function createPayment(payload) {
  const response = await httpClient.post("/payments", payload);
  return response.data;
}

export async function getPaymentStatus(paymentId) {
  const response = await httpClient.get(`/payments/${paymentId}`);
  return response.data;
}

export async function confirmPayment(paymentId, payload) {
  const response = await httpClient.post(`/payments/${paymentId}/confirm`, payload);
  return response.data;
}
