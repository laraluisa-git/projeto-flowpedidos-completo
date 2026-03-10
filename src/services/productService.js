import { apiFetch } from "./apiClient";

export async function listProducts() {
  const data = await apiFetch("/produtos");
  // normaliza para o shape usado no front
  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.nome,
    category: p.categoria ?? "",
    stockQty: p.stock_qty ?? 0,
    minStockQty: p.min_stock_qty ?? 0,
    unitPrice: p.unit_price ?? 0,
    isActive: p.is_active !== false,
    criadoEm: p.criadoEm,
    createdAt: p.criadoEm || p.criadoem,
    atualizadoEm: p.atualizadoEm,
  }));
}

export async function createProduct(payload) {
  return apiFetch("/produtos", { method: "POST", body: payload });
}

export async function updateProduct(id, payload) {
  return apiFetch(`/produtos/${id}`, { method: "PUT", body: payload });
}

export async function deleteProduct(id) {
  return apiFetch(`/produtos/${id}`, { method: "DELETE" });
}
