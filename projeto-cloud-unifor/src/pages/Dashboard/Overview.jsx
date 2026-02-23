import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Table from "../../components/Table";
import { listProducts } from "../../services/productService";
import { listOrders } from "../../services/orderService";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

function monthKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function money(n) {
  return (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const IconTrend = ({ color = "currentColor" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M4 16l6-6 4 4 6-8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M14 6h6v6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconCart = ({ color = "currentColor" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M6 6h15l-2 8H8L6 3H3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill={color} />
    <path d="M18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill={color} />
  </svg>
);
const IconBox = ({ color = "currentColor" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M21 8l-9-5-9 5 9 5 9-5Z" stroke={color} strokeWidth="2" />
    <path d="M3 8v10l9 5 9-5V8" stroke={color} strokeWidth="2" />
    <path d="M12 13v10" stroke={color} strokeWidth="2" />
  </svg>
);
const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0114.36-3.36L23 10M1 14l5.13 4.36A9 9 0 0020.49 15" />
  </svg>
);
const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

/* ── custom tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(59,110,245,.15)", borderRadius: 12, padding: "10px 16px", boxShadow: "0 8px 24px rgba(59,110,245,.12)", fontSize: 13 }}>
      <p style={{ color: "#718096", marginBottom: 4 }}>{label}</p>
      <p style={{ fontWeight: 700, color: "#1a3a9e" }}>{money(payload[0].value)}</p>
    </div>
  );
};

/* ── stat card ── */
function StatCard({ variant = "white", title, value, badge, icon, trend }) {
  const isBlue = variant === "blue";
  const isOrange = variant === "orange";

  const bg = isBlue
    ? "linear-gradient(135deg, #1a3a9e 0%, #2350d8 60%, #3b6ef5 100%)"
    : "#ffffff";
  const borderColor = isBlue ? "rgba(255,255,255,.15)" : isOrange ? "rgba(249,115,22,.2)" : "rgba(59,110,245,.14)";
  const textColor = isBlue ? "#fff" : "#0e1726";
  const subColor = isBlue ? "rgba(255,255,255,.7)" : "#718096";
  const iconBg = isBlue ? "rgba(255,255,255,.15)" : isOrange ? "rgba(249,115,22,.08)" : "rgba(59,110,245,.08)";
  const iconColor = isBlue ? "#fff" : isOrange ? "#ea580c" : "#2350d8";
  const badgeBg = isBlue ? "rgba(255,255,255,.18)" : isOrange ? "rgba(249,115,22,.1)" : "rgba(59,110,245,.08)";
  const badgeColor = isBlue ? "#fff" : isOrange ? "#c2410c" : "#2350d8";

  return (
    <div style={{
      background: bg,
      border: `1px solid ${borderColor}`,
      borderRadius: 20,
      padding: "24px",
      boxShadow: isBlue ? "0 12px 40px rgba(35,80,216,.35)" : "0 4px 20px rgba(59,110,245,.07)",
      transition: "transform .25s, box-shadow .25s",
      cursor: "default",
      position: "relative",
      overflow: "hidden",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = isBlue ? "0 20px 48px rgba(35,80,216,.4)" : "0 12px 32px rgba(59,110,245,.14)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = isBlue ? "0 12px 40px rgba(35,80,216,.35)" : "0 4px 20px rgba(59,110,245,.07)"; }}
    >
      {/* decorative circle */}
      {isBlue && <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
        {badge && (
          <span style={{ padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: badgeBg, color: badgeColor, letterSpacing: ".03em" }}>
            {badge}
          </span>
        )}
      </div>
      <p style={{ marginTop: 20, fontSize: 12, fontWeight: 600, color: subColor, textTransform: "uppercase", letterSpacing: ".06em" }}>{title}</p>
      <p style={{ marginTop: 6, fontSize: 32, fontWeight: 800, color: textColor, letterSpacing: "-.02em", fontFamily: "'Sora',sans-serif" }}>{value}</p>
    </div>
  );
}

/* ── chart wrapper ── */
function ChartCard({ title, subtitle, children }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid rgba(59,110,245,.14)",
      borderRadius: 20,
      padding: 24,
      boxShadow: "0 4px 20px rgba(59,110,245,.07)",
    }}>
      <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: "#0e1726" }}>{title}</p>
      <p style={{ marginTop: 3, fontSize: 13, color: "#718096" }}>{subtitle}</p>
      <div style={{ marginTop: 20, height: 260 }}>{children}</div>
    </div>
  );
}

export default function Overview() {
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [o, p] = await Promise.all([listOrders(), listProducts()]);
        setOrders(o ?? []);
        setProducts(p ?? []);
      } finally {
        setLoading(false);
      }
    })().catch((e) => alert(e.message));
  }, [refresh]);

  const prodById = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const deliveredThisMonth = orders.filter(
    (o) => o.status === "entregue" && o.deliveredAt && monthKey(o.deliveredAt) === currentMonth
  );
  const salesThisMonth = deliveredThisMonth.reduce((acc, o) => {
    const p = prodById.get(o.productId);
    return acc + (p?.unitPrice || 0) * (o.quantity || 0);
  }, 0);

  const activeOrders = orders.filter((o) => o.status !== "entregue").length;
  const activeProducts = products.filter((p) => p.isActive).length;

  const monthlySeries = useMemo(() => {
    const m = new Map();
    orders
      .filter((o) => o.status === "entregue" && o.deliveredAt)
      .forEach((o) => {
        const key = monthKey(o.deliveredAt);
        const p = prodById.get(o.productId);
        const val = (p?.unitPrice || 0) * (o.quantity || 0);
        m.set(key, (m.get(key) || 0) + val);
      });
    const out = [];
    const base = new Date(now.getFullYear(), now.getMonth(), 1);
    for (let i = 5; i >= 0; i--) {
      const d = new Date(base);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      out.push({ month: key.slice(5), value: Math.round((m.get(key) || 0) * 100) / 100 });
    }
    return out;
  }, [orders, prodById]);

  const weeklySeries = useMemo(() => {
    const map = new Map();
    orders
      .filter((o) => o.status === "entregue" && o.deliveredAt)
      .forEach((o) => {
        const key = dayKey(o.deliveredAt);
        const p = prodById.get(o.productId);
        const val = (p?.unitPrice || 0) * (o.quantity || 0);
        map.set(key, (map.get(key) || 0) + val);
      });
    const out = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      const key = dayKey(d.getTime());
      out.push({ day: key.slice(5), value: Math.round((map.get(key) || 0) * 100) / 100 });
    }
    return out;
  }, [orders, prodById]);

  const lowStock = products
    .filter((p) => p.isActive && p.stockQty <= p.minStockQty)
    .sort((a, b) => a.stockQty - b.stockQty)
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      name: p.name,
      minStockQty: p.minStockQty,
      stockQty: p.stockQty,
      statusLabel: "ESTOQUE BAIXO",
    }));

  const pct = (s, min) => Math.min(100, Math.round((s / Math.max(min, 1)) * 100));

  return (
    <div translate="no" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap');
        :root {
          --blue-700:#1a3a9e; --blue-600:#2350d8; --blue-500:#3b6ef5;
          --blue-400:#6390f9; --blue-100:#dce9ff; --blue-50:#eef4ff;
          --surface:#fff; --bg:#f5f7fc;
          --text-1:#0e1726; --text-2:#4a5568; --text-3:#718096;
          --border:rgba(59,110,245,.14);
        }
        .ov-section-label {
          font-size:11px; font-weight:700; letter-spacing:.08em;
          text-transform:uppercase; color:var(--blue-600);
        }
        .ov-stock-row {
          display:flex; align-items:center; justify-content:space-between; gap:16px;
          padding:16px 20px;
          border-radius:16px;
          border:1px solid rgba(220,38,38,.15);
          background:#fff5f5;
          transition:transform .2s, box-shadow .2s;
        }
        .ov-stock-row:hover { transform:translateX(4px); box-shadow:0 4px 16px rgba(220,38,38,.1); }
        .ov-refresh-btn {
          display:inline-flex; align-items:center; gap:6px;
          padding:9px 16px; border-radius:10px;
          border:1px solid var(--border); background:var(--surface);
          font-size:13px; font-weight:600; font-family:inherit;
          color:var(--blue-600); cursor:pointer;
          transition:background .18s, transform .18s, box-shadow .18s;
        }
        .ov-refresh-btn:hover { background:var(--blue-50); transform:translateY(-1px); box-shadow:0 2px 12px rgba(59,110,245,.1); }
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line { stroke:rgba(59,110,245,.07); }
        .recharts-tooltip-cursor { fill:rgba(59,110,245,.04); }
      `}</style>

      {/* ── page header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p className="ov-section-label">Visão Geral</p>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(20px,3vw,28px)", color: "var(--text-1)", letterSpacing: "-.02em", marginTop: 4 }}>
            Dashboard
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link
            to="/quem-somos"
            className="ov-refresh-btn"
            style={{
              textDecoration: "none"
            }}
          >
            Conheça nossa equipe
          </Link>
        </div>

      </div>

      {/* ── stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
        <StatCard
          variant="blue"
          title="Vendas do Mês"
          value={money(salesThisMonth)}
          badge="+0%"
          icon={<IconTrend color="#fff" />}
        />
        <StatCard
          variant="white"
          title="Pedidos Ativos"
          value={activeOrders}
          badge={`+${activeOrders}`}
          icon={<IconCart color="#2350d8" />}
        />
        <StatCard
          variant="orange"
          title="Produtos Ativos"
          value={activeProducts}
          badge={lowStock.length ? `${lowStock.length} alertas` : "OK"}
          icon={<IconBox color="#ea580c" />}
        />
      </div>

      {/* ── charts ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
        <ChartCard title="Vendas Mensais" subtitle={`Últimos 6 meses · ${currentMonth}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySeries} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#718096" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#718096" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59,110,245,.05)" }} />
              <Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b6ef5" />
                  <stop offset="100%" stopColor="#6390f9" stopOpacity=".7" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Pedidos da Semana" subtitle="Últimos 7 dias">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklySeries}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1a3a9e" />
                  <stop offset="100%" stopColor="#3b6ef5" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#718096" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#718096" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#lineGrad)"
                strokeWidth={3}
                dot={{ r: 4, fill: "#3b6ef5", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, fill: "#1a3a9e", stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── low stock ── */}
      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(59,110,245,.07)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>
              Alertas de Estoque Baixo
            </p>
            <p style={{ marginTop: 3, fontSize: 13, color: "var(--text-3)" }}>
              Produtos com estoque menor ou igual ao mínimo
            </p>
          </div>
          {/* badge count */}
          {lowStock.length > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 99, background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.15)", fontSize: 12, fontWeight: 700, color: "#b91c1c" }}>
              <IconAlert /> {lowStock.length} {lowStock.length === 1 ? "alerta" : "alertas"}
            </span>
          )}
        </div>

        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          {lowStock.length === 0 ? (
            <div style={{ padding: "18px 20px", borderRadius: 14, background: "var(--bg)", border: "1px solid var(--border)", fontSize: 14, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>✅</span> Sem estoque baixo no momento.
            </div>
          ) : (
            lowStock.map((p) => {
              const ratio = pct(p.stockQty, p.minStockQty);
              return (
                <div key={p.id} className="ov-stock-row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</p>
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, height: 6, borderRadius: 99, background: "rgba(220,38,38,.12)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${ratio}%`, borderRadius: 99, background: ratio < 50 ? "#ef4444" : "#f97316", transition: "width .5s" }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>Mín: {p.minStockQty}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 26, color: "#dc2626", lineHeight: 1 }}>{p.stockQty}</p>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", letterSpacing: ".05em", textTransform: "uppercase", marginTop: 2 }}>
                      {p.statusLabel}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* hidden table fallback */}
        <div style={{ display: "none" }}>
          <Table
            columns={[
              { key: "name", header: "Produto" },
              { key: "minStockQty", header: "Mínimo" },
              { key: "stockQty", header: "Estoque" },
              { key: "statusLabel", header: "Alerta" },
            ]}
            rows={lowStock}
            emptyText="Sem alertas."
          />
        </div>
      </div>
    </div>
  );
}