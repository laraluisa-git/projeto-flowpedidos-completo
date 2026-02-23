import { apiFetch } from "./apiClient";

export async function listMembers() {
  return apiFetch("/membros");
}

export async function createMember(payload) {
  const data = await apiFetch("/membros", { method: "POST", body: payload });
  return data?.membro ?? data;
}

export async function updateMember(id, payload) {
  const data = await apiFetch(`/membros/${id}`, { method: "PUT", body: payload });
  return data?.membro ?? data;
}

export async function deleteMember(id) {
  return apiFetch(`/membros/${id}`, { method: "DELETE" });
}
