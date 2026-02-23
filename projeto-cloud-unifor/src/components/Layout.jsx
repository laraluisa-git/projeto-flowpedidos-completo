import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../auth/AuthContext";

function pageTitle(pathname) {
  if (pathname === "/dashboard") return "Dashboard Principal";
  if (pathname.includes("/dashboard/pedidos")) return "Gestão de Pedidos";
  if (pathname.includes("/dashboard/estoque")) return "Estoque";
  if (pathname.includes("/dashboard/status")) return "Status";
  if (pathname.includes("/dashboard/historico")) return "Histórico";
  return "FlowPedidos";
}

function pageSubtitle(pathname) {
  if (pathname === "/dashboard") return "Visão geral do sistema";
  if (pathname.includes("/dashboard/pedidos")) return "Acompanhe e gerencie seus pedidos";
  if (pathname.includes("/dashboard/estoque")) return "Controle de produtos e níveis de estoque";
  if (pathname.includes("/dashboard/status")) return "Status das operações em andamento";
  if (pathname.includes("/dashboard/historico")) return "Histórico completo de pedidos";
  return "Sistema de gestão";
}

const IconHome = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const loc = useLocation();

  return (
    <div
      translate="no"
      style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#f5f7fc", minHeight: "100vh" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap');
        :root {
          --blue-700:#1a3a9e; --blue-600:#2350d8; --blue-500:#3b6ef5;
          --blue-400:#6390f9; --blue-100:#dce9ff; --blue-50:#eef4ff;
          --surface:#fff; --bg:#f5f7fc;
          --text-1:#0e1726; --text-2:#4a5568; --text-3:#718096;
          --border:rgba(59,110,245,.14);
        }

        .ly-home-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 10px;
          border: 1px solid var(--border); background: var(--surface);
          font-size: 13px; font-weight: 600; font-family: inherit;
          color: var(--text-2); text-decoration: none;
          transition: background .18s, transform .18s, box-shadow .18s;
        }
        .ly-home-btn:hover {
          background: var(--blue-50); transform: translateY(-1px);
          box-shadow: 0 2px 12px rgba(59,110,245,.1);
          color: var(--blue-600);
        }

        .ly-logout-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, var(--blue-600), var(--blue-500));
          color: #fff; font-size: 13px; font-weight: 600;
          font-family: inherit; cursor: pointer;
          box-shadow: 0 4px 16px rgba(59,110,245,.3);
          transition: transform .2s, box-shadow .2s, opacity .2s;
        }
        .ly-logout-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(59,110,245,.4);
        }

        .ly-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, var(--blue-700), var(--blue-500));
          display: flex; align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif; font-weight: 700;
          font-size: 14px; color: #fff; flex-shrink: 0;
        }

        .ly-breadcrumb {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 10px; border-radius: 99px;
          background: var(--blue-50); border: 1px solid var(--blue-100);
          font-size: 11px; font-weight: 600; color: var(--blue-600);
          letter-spacing: .04em; text-transform: uppercase;
        }
        .ly-breadcrumb-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--blue-500);
          animation: lyBlink 2s infinite;
        }
        @keyframes lyBlink { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>

      <div style={{ maxWidth: 1340, margin: "0 auto", padding: "20px 20px" }}>
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "18rem 1fr" }}>

          {/* ── Sidebar ── */}
          <Sidebar />

          {/* ── Right side ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>

            {/* ── Topbar ── */}
            <header style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "18px 24px",
              boxShadow: "0 4px 20px rgba(59,110,245,.07)",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* subtle gradient accent */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: "linear-gradient(90deg, var(--blue-700), var(--blue-500), var(--blue-400))",
                borderRadius: "20px 20px 0 0",
              }} />

              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                {/* left: avatar + title */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div className="ly-avatar">
                    {user?.name?.charAt(0)?.toUpperCase() ?? "F"}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <h1 style={{
                        fontFamily: "'Sora', sans-serif",
                        fontWeight: 700, fontSize: 16,
                        color: "var(--text-1)", letterSpacing: "-.01em",
                      }}>
                        {pageTitle(loc.pathname)}
                      </h1>
                      <span className="ly-breadcrumb">
                        <span className="ly-breadcrumb-dot" />
                        ao vivo
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-3)" }}>
                      {user ? `Olá, ${user.name} · ` : ""}{pageSubtitle(loc.pathname)}
                    </p>
                  </div>
                </div>

                {/* right: actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Link to="/" className="ly-home-btn">
                    <IconHome /> <span>Home</span>
                  </Link>
                  <button onClick={logout} className="ly-logout-btn">
                    <IconLogout /> <span>Sair</span>
                  </button>
                </div>
              </div>
            </header>

            {/* ── Main content ── */}
            <main style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 4px 20px rgba(59,110,245,.07)",
              minHeight: 400,
            }}>
              <Outlet />
            </main>

          </div>
        </div>
      </div>
    </div>
  );
}