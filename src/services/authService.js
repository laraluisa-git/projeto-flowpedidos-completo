const API_BASE = "/api";

export async function login(email, senha) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "Falha no login");
  return text ? JSON.parse(text) : null;
}

export async function register(payload) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "Falha no cadastro");
  return text ? JSON.parse(text) : null;
}