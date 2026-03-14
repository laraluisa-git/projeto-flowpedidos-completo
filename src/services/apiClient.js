//const API_BASE = "https://projeto-flowpedidos-api.onrender.com/api";
const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("token");
}

export async function apiFetch(path, { method = "GET", body, token, headers } = {}) {
  const auth = token ?? getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      ...(headers || {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;
  if (!res.ok) {
    const message = typeof data === "string" ? data : (data?.error || data?.message || "Erro na requisição");
    const details = typeof data === "object" && data ? (data.details || data.errors) : undefined;
    const err = new Error(message);
    err.status = res.status;
    err.details = details;
    throw err;
  }
  return data;
}
