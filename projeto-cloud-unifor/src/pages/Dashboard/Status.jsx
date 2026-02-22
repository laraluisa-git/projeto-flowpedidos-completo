import React, { useMemo, useState } from "react";
import { DB } from "../../storage/db";
import Table from "../../components/Table";

const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
    <path d="M3.51 9a9 9 0 0114.36-3.36L23 10M1 14l5.13 4.36A9 9 0 0020.49 15"/>
  </svg>
);

const statusConfig = {
  confirmado:   { label: "Pedido confirmado", bg: "rgba(245,158,11,.08)", color: "#b45309", border: "1px solid rgba(245,158,11,.2)" },
  em_andamento: { label: "Em andamento",      bg: "rgba(59,110,245,.08)", color: "#1a3a9e", border: "1px solid rgba(59,110,245,.2)" },
  entregue:     { label: "Entregue",          bg: "rgba(34,197,94,.08)",  color: "#15803d", border: "1px solid rgba(34,197,94,.2)"  },
};

export default function Status() {
  const [refresh, setRefresh] = useState(0);

  const snapshot = useMemo(() => DB.read(), [refresh]);
  const { orders, products } = snapshot;

  const prodById = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const rows = orders.map((o) => ({
    id: o.id,
    customerName: o.customerName,
    productName: prodById.get(o.productId)?.name ?? "(produto removido)",
    status: o.status,
  }));

  /* summary counts */
  const counts = useMemo(() => ({
    confirmado:   rows.filter(r => r.status === "confirmado").length,
    em_andamento: rows.filter(r => r.status === "em_andamento").length,
    entregue:     rows.filter(r => r.status === "entregue").length,
  }), [rows]);

  return (
    <div translate="no" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
        :root {
          --blue-700:#1a3a9e; --blue-600:#2350d8; --blue-500:#3b6ef5;
          --blue-50:#eef4ff; --surface:#fff; --bg:#f5f7fc;
          --text-1:#0e1726; --text-2:#4a5568; --text-3:#718096;
          --border:rgba(59,110,245,.14);
        }
        .st-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 18px; border-radius: 10px;
          border: 1px solid var(--border); background: var(--surface);
          font-size: 13px; font-weight: 600; font-family: inherit;
          color: var(--blue-600); cursor: pointer;
          transition: background .18s, transform .18s, box-shadow .18s;
        }
        .st-btn:hover { background: var(--blue-50); transform: translateY(-1px); box-shadow: 0 2px 12px rgba(59,110,245,.1); }
        .st-btn:active { transform: translateY(0); }
        .st-badge {
          display: inline-flex; align-items: center;
          padding: 4px 12px; border-radius: 99px;
          font-size: 11px; font-weight: 700; letter-spacing: .03em;
        }
        .st-summary-card {
          flex: 1; min-width: 140px;
          padding: 18px 20px; border-radius: 16px;
          border: 1px solid var(--border); background: var(--surface);
          transition: transform .2s, box-shadow .2s;
        }
        .st-summary-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(59,110,245,.1); }
      `}</style>

      {/* ── header ── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--blue-600)", marginBottom: 4 }}>Acompanhamento</p>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(20px,3vw,26px)", color: "var(--text-1)", letterSpacing: "-.02em" }}>Status</h1>
          <p style={{ marginTop: 4, fontSize: 13.5, color: "var(--text-3)" }}>Acompanhe rapidamente o estado de cada pedido.</p>
        </div>
        <button className="st-btn" onClick={() => setRefresh((n) => n + 1)}>
          <IconRefresh /> <span>Atualizar</span>
        </button>
      </div>

      {/* ── summary chips ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="st-summary-card">
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-3)", marginBottom: 8 }}>
              {cfg.label}
            </p>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 28, color: cfg.color, letterSpacing: "-.02em", lineHeight: 1 }}>
              {counts[key]}
            </p>
          </div>
        ))}
      </div>

      {/* ── table ── */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(59,110,245,.07)" }}>
        <Table
          columns={[
            {
              key: "id", header: "ID",
              render: (r) => (
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-3)", background: "var(--bg)", padding: "2px 8px", borderRadius: 6, border: "1px solid var(--border)" }}>
                  {r.id}
                </span>
              ),
            },
            {
              key: "customerName", header: "Cliente",
              render: (r) => <span style={{ fontWeight: 600, color: "var(--text-1)", fontSize: 13.5 }}>{r.customerName}</span>,
            },
            {
              key: "productName", header: "Produto",
              render: (r) => <span style={{ fontSize: 13.5, color: "var(--text-2)" }}>{r.productName}</span>,
            },
            {
              key: "status", header: "Status",
              render: (r) => {
                const cfg = statusConfig[r.status] ?? statusConfig.confirmado;
                return (
                  <span className="st-badge" style={{ background: cfg.bg, color: cfg.color, border: cfg.border }}>
                    {cfg.label}
                  </span>
                );
              },
            },
          ]}
          rows={rows}
          emptyText="Nenhum pedido cadastrado."
        />
      </div>
    </div>
  );
}