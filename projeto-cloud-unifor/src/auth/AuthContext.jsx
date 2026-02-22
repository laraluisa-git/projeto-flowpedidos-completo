import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as auth from "../services/authService";

const AuthContext = createContext(null);

function readToken() {
  return localStorage.getItem("token");
}

function readUser() {
  const raw = localStorage.getItem("user");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readToken());
  const [user, setUser] = useState(() => readUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) localStorage.removeItem("token");
    else localStorage.setItem("token", token);
  }, [token]);

  useEffect(() => {
    if (!user) localStorage.removeItem("user");
    else localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      loading,

      async login(email, senha) {
        setLoading(true);
        try {
          const resp = await auth.login(email, senha);
          if (resp?.token) setToken(resp.token);
          if (resp?.user || resp?.usuario) setUser(resp.user ?? resp.usuario);
          return resp;
        } finally {
          setLoading(false);
        }
      },

      // ✅ agora aceita um payload completo (bate com sua tabela usuarios)
      // payload esperado:
      // {
      //   nome, email, senha,
      //   endereco, tipoConta, nomeEmpresa
      // }
      async register(payload) {
        setLoading(true);
        try {
          const resp = await auth.register(payload);
          if (resp?.token) setToken(resp.token);
          if (resp?.user || resp?.usuario) setUser(resp.user ?? resp.usuario);
          return resp;
        } finally {
          setLoading(false);
        }
      },

      logout() {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      },
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}