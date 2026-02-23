import { apiFetch } from "./apiClient";

export async function listAudit() {
  return apiFetch("/auditoria");
}
