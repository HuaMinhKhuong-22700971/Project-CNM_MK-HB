import { httpClient } from "./http";

export async function createTicket(payload) {
  const response = await httpClient.post("/tickets", payload);
  return response.data;
}

export async function getMyTickets() {
  const response = await httpClient.get("/tickets/my");
  return response.data;
}

export async function getTicketDetail(ticketId) {
  const response = await httpClient.get(`/tickets/${ticketId}`);
  return response.data;
}

export async function getManageTickets(params = {}) {
  const response = await httpClient.get("/tickets", { params });
  return response.data;
}

export async function updateTicket(ticketId, payload) {
  const response = await httpClient.patch(`/tickets/${ticketId}`, payload);
  return response.data;
}

export async function addTicketMessage(ticketId, payload) {
  const response = await httpClient.post(`/tickets/${ticketId}/messages`, payload);
  return response.data;
}
