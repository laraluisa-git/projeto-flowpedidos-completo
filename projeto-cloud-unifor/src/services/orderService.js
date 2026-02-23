import { apiFetch } from "./apiClient";

export async function listOrders() {
  return apiFetch("/pedidos");
}

export async function createOrder(payload) {
  const data = await apiFetch("/pedidos", { method: "POST", body: payload });
  return data?.pedido ?? data;
}

export async function updateOrder(id, payload) {
  const data = await apiFetch(`/pedidos/${id}`, { method: "PUT", body: payload });
  return data?.pedido ?? data;
}

export async function deleteOrder(id) {
  return apiFetch(`/pedidos/${id}`, { method: "DELETE" });
}
