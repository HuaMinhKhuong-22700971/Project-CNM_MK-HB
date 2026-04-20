import { httpClient } from "./http";

export async function sendAiChat(payload) {
  const response = await httpClient.post("/ai/chat", payload);
  return response.data;
}
