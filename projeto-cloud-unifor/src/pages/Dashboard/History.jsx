import React, { useEffect, useMemo, useState } from "react";
import Table from "../../components/Table";
import { listProducts } from "../../services/productService";
import { listOrders } from "../../services/orderService";

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("pt-BR");
}

const labelPriority = (p) =>
  p === "alta" ? "Alta" : p === "media" ? "Média" : p === "baixa" ? "Baixa" : p;

const labelStatus = (s) =>
  s === "confirmado" ? "Confirmado" : s === "em_andamento" ? "Em andamento" : "Entregue";

const priorityStyle = (p) => {
  if (p === "alta")   return { background: "rgba(220,38,38,.08)",  color: "#b91c1c", border: "1px solid rgba(220,38,38,.18)" };
  if (p === "media")  return { background: "rgba(245,158,11,.08)", color: "#b45309", border: "1px solid rgba(245,158,11,.18)" };
  return               { background: "rgba(34,197,94,.08)",  color: "#15803d", border: "1px solid rgba(34,197,94,.18)" };
};

const statusStyle = (s) => {
  if (s === "entregue")     return { background: "rgba(34,197,94,.08)",  color: "#15803d", border: "1px solid rgba(34,197,94,.18)" };
  if (s === "em_andamento") return { background: "rgba(59,110,245,.08)", color: "#1a3a9e", border: "1px solid rgba(59,110,245,.18)" };
  return                     { background: "rgba(245,158,11,.08)", color: "#b45309", border: "1px solid rgba(245,158,11,.18)" };
};

const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
    <path d="M3.51 9a9 9 0 0114.36-3.36L23 10M1 14l5.13 4.36A9 9 0 0020.49 15"/>
  </svg>
);

const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
  </svg>
);

export default function History() {
  const [refresh, setRefresh] = useState(0);

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      const [o, p] = await Promise.all([listOrders(), listProducts()]);
      setOrders(o ?? []);
      setProducts(p ?? []);
    })().catch((e) => alert(e.message));
  }, [refresh]);

  const prodById = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const rows = useMemo(() => {
    return [...orders]
      .sort((a, b) => (Date.parse(b.createdAt || 0) || 0) - (Date.parse(a.createdAt || 0) || 0))
      .map((o) => ({
        id: o.id,
        customerName: o.customerName,
        productName: prodById.get(o.productId)?.name ?? "(produto removido)",
        priority: o.priority,
        status: o.status,
        createdAt: o.createdAt,
      }));
  }, [orders, prodById]);

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
        .hist-refresh-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 18px; border-radius: 10px;
          border: 1px solid var(--border); background: var(--surface);
          font-size: 13px; font-weight: 600; font-family: inherit;
          color: var(--blue-600); cursor: pointer;
          transition: background .18s, transform .18s, box-shadow .18s;
        }
        .hist-refresh-btn:hover {
          background: var(--blue-50); transform: translateY(-1px);
          box-shadow: 0 2px 12px rgba(59,110,245,.1);
        }
        .hist-refresh-btn:active { transform: translateY(0); }

        .hist-badge {
          display: inline-flex; align-items: center;
          padding: 3px 10px; border-radius: 99px;
          font-size: 11px; font-weight: 700;
          letter-spacing: .03em; white-space: nowrap;
        }

        .hist-table-wrap {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(59,110,245,.07);
        }
      `}</style>

      {/* ── header ── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--blue-600)", marginBottom: 4 }}>
            Registros
          </p>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(20px,3vw,26px)", color: "var(--text-1)", letterSpacing: "-.02em" }}>
            Histórico
          </h1>
          <p style={{ marginTop: 4, fontSize: 13.5, color: "var(--text-3)" }}>
            Registro de pedidos cadastrados no sistema.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* count chip */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "var(--blue-50)", border: "1px solid rgba(59,110,245,.15)" }}>
            <IconClock />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--blue-700)" }}>
              {rows.length} {rows.length === 1 ? "pedido" : "pedidos"}
            </span>
          </div>
          <button className="hist-refresh-btn" onClick={() => setRefresh((n) => n + 1)}>
            <IconRefresh /> <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* ── table card ── */}
      <div className="hist-table-wrap">
        <Table
          columns={[
            {
              key: "id",
              header: "ID",
              render: (r) => (
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-3)", background: "var(--bg)", padding: "2px 8px", borderRadius: 6, border: "1px solid var(--border)" }}>
                  {r.id}
                </span>
              ),
            },
            {
              key: "customerName",
              header: "Cliente",
              render: (r) => (
                <span style={{ fontWeight: 600, color: "var(--text-1)", fontSize: 13.5 }}>
                  {r.customerName}
                </span>
              ),
            },
            {
              key: "productName",
              header: "Produto",
              render: (r) => (
                <span style={{ fontSize: 13.5, color: "var(--text-2)" }}>
                  {r.productName}
                </span>
              ),
            },
            {
              key: "priority",
              header: "Prioridade",
              render: (r) => (
                <span className="hist-badge" style={priorityStyle(r.priority)}>
                  {labelPriority(r.priority)}
                </span>
              ),
            },
            {
              key: "status",
              header: "Estado",
              render: (r) => (
                <span className="hist-badge" style={statusStyle(r.status)}>
                  {labelStatus(r.status)}
                </span>
              ),
            },
            {
              key: "createdAt",
              header: "Data de cadastro",
              render: (r) => (
                <span style={{ fontSize: 12.5, color: "var(--text-3)", whiteSpace: "nowrap" }}>
                  {formatDate(r.createdAt)}
                </span>
              ),
            },
          ]}
          rows={rows}
          emptyText="Nenhum pedido cadastrado ainda."
        />
      </div>
    </div>
  );
}