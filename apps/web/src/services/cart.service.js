import { httpClient } from "./http";

export async function getCart() {
  const response = await httpClient.get("/cart");
  return response.data;
}

export async function updateCartItem(itemId, payload) {
  const response = await httpClient.patch(`/cart/items/${itemId}`, payload);
  return response.data;
}

export async function addItemToCart(payload) {
  const response = await httpClient.post("/cart/items", payload);
  return response.data;
}

export async function removeCartItem(itemId) {
  const response = await httpClient.delete(`/cart/items/${itemId}`);
  return response.data;
}
