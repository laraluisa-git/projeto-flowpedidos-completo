import React from "react";
import { NavLink } from "react-router-dom";

const IconGrid = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const IconCart = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M6 6h15l-2 8H8L6 3H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
    <path d="M18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
  </svg>
);
const IconBox = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M21 8l-9-5-9 5 9 5 9-5Z" stroke="currentColor" strokeWidth="2" />
    <path d="M3 8v10l9 5 9-5V8" stroke="currentColor" strokeWidth="2" />
    <path d="M12 13v10" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const IconPin = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" stroke="currentColor" strokeWidth="2" />
    <path d="M12 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="currentColor" />
  </svg>
);
const IconClock = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" stroke="currentColor" strokeWidth="2" />
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

function Item({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
      end={to === "/dashboard"}
      style={{ textDecoration: "none" }}
    >
      {({ isActive }) => (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "11px 12px",
          borderRadius: 14,
          background: isActive ? "rgba(255,255,255,.15)" : "transparent",
          border: `1px solid ${isActive ? "rgba(255,255,255,.2)" : "transparent"}`,
          boxShadow: isActive ? "0 2px 12px rgba(0,0,0,.12)" : "none",
          cursor: "pointer",
          transition: "background .18s, border-color .18s, box-shadow .18s, transform .18s",
        }}
        onMouseEnter={e => {
          if (!isActive) {
            e.currentTarget.style.background = "rgba(255,255,255,.1)";
            e.currentTarget.style.transform = "translateX(3px)";
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "translateX(0)";
          }
        }}
        >
          {/* icon bubble */}
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: isActive ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.08)",
            color: isActive ? "#fff" : "rgba(255,255,255,.75)",
            transition: "background .18s, color .18s",
          }}>
            <Icon />
          </div>

          {/* label */}
          <span style={{
            fontSize: 13,
            fontWeight: isActive ? 700 : 500,
            color: isActive ? "#fff" : "rgba(255,255,255,.75)",
            letterSpacing: isActive ? "-.01em" : "normal",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontFamily: "'DM Sans', sans-serif",
            transition: "color .18s, font-weight .18s",
          }}>
            {label}
          </span>

          {/* active indicator dot */}
          {isActive && (
            <div style={{
              marginLeft: "auto",
              width: 6, height: 6, borderRadius: "50%",
              background: "#fff",
              flexShrink: 0,
              boxShadow: "0 0 6px rgba(255,255,255,.6)",
            }} />
          )}
        </div>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const items = [
    { to: "/dashboard",           label: "Home",              Icon: IconGrid  },
    { to: "/dashboard/pedidos",   label: "Gestão de Pedidos", Icon: IconCart  },
    { to: "/dashboard/estoque",   label: "Estoque",           Icon: IconBox   },
    { to: "/dashboard/status",    label: "Status",            Icon: IconPin   },
    { to: "/dashboard/historico", label: "Histórico",         Icon: IconClock },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
      `}</style>

      <aside style={{ width: "100%", height: "calc(100vh - 40px)", position: "sticky", top: 20 }}>
        <div style={{
          height: "100%",
          borderRadius: 20,
          background: "linear-gradient(160deg, #1a3a9e 0%, #2350d8 55%, #3b6ef5 100%)",
          padding: "24px 16px",
          boxShadow: "0 16px 48px rgba(27,58,158,.35)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}>

          {/* decorative blobs */}
          <div style={{ position:"absolute", top:-60, right:-60, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,.05)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:-40, left:-40, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,.04)", pointerEvents:"none" }} />

          {/* ── Logo ── */}
          <div style={{ padding: "0 8px 20px", borderBottom: "1px solid rgba(255,255,255,.1)", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(255,255,255,.18)",
                border: "1px solid rgba(255,255,255,.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 17 17" fill="none">
                  <rect x="2" y="2" width="6" height="6" rx="2" fill="#fff"/>
                  <rect x="9" y="2" width="6" height="6" rx="2" fill="rgba(255,255,255,.5)"/>
                  <rect x="2" y="9" width="6" height="6" rx="2" fill="rgba(255,255,255,.5)"/>
                  <rect x="9" y="9" width="6" height="6" rx="2" fill="#fff"/>
                </svg>
              </div>
              <div>
                <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:15, color:"#fff", letterSpacing:"-.02em", lineHeight:1.2 }}>
                  FlowPedidos
                </p>
                <p style={{ fontSize:11, color:"rgba(255,255,255,.55)", fontWeight:500, marginTop:1 }}>
                  Sistema de gestão
                </p>
              </div>
            </div>
          </div>

          {/* ── Nav ── */}
          <nav style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 4, flex: 1, position: "relative" }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"rgba(255,255,255,.35)", padding:"0 12px", marginBottom:4 }}>
              Menu
            </p>
            {items.map((it) => (
              <Item key={it.to} {...it} />
            ))}
          </nav>

          {/* ── Tip card ── */}
          <div style={{
            marginTop: 16,
            padding: "14px 16px",
            borderRadius: 14,
            background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.12)",
            position: "relative",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.7)", textTransform:"uppercase", letterSpacing:".06em" }}>Dica</p>
            </div>
            <p style={{ fontSize:12, color:"rgba(255,255,255,.55)", lineHeight:1.55 }}>
              Use <strong style={{ color:"rgba(255,255,255,.8)" }}>Gestão de Pedidos</strong> para criar e atualizar status.
            </p>
          </div>

        </div>
      </aside>
    </>
  );
}