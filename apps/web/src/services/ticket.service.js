import { httpClient } from "./http";

function getUploadConfig(payload) {
  if (payload instanceof FormData) {
    return {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    };
  }

  return undefined;
}

export async function createTicket(payload) {
  const response = await httpClient.post("/tickets", payload, getUploadConfig(payload));
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

export async function getTicketStats() {
  const response = await httpClient.get("/tickets/stats");
  return response.data;
}

export async function updateTicket(ticketId, payload) {
  const response = await httpClient.patch(`/tickets/${ticketId}`, payload);
  return response.data;
}

export async function addTicketMessage(ticketId, payload) {
  const response = await httpClient.post(`/tickets/${ticketId}/messages`, payload, getUploadConfig(payload));
  return response.data;
}
