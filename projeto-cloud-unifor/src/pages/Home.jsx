import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ─── tiny hook: intersection observer for fade-in ─── */
function useFadeIn(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function FadeSection({ children, delay = 0, className = "" }) {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── animated counter ─── */
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useFadeIn();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [visible, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Home() {
  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f5f7fc" }}
      className="min-h-screen"
    >
      {/* ── inject @import in head via style tag ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap');

        :root {
          --blue-900: #0f1f5c;
          --blue-700: #1a3a9e;
          --blue-600: #2350d8;
          --blue-500: #3b6ef5;
          --blue-400: #6390f9;
          --blue-100: #dce9ff;
          --blue-50:  #eef4ff;
          --surface:  #ffffff;
          --bg:       #f5f7fc;
          --text-1:   #0e1726;
          --text-2:   #4a5568;
          --text-3:   #718096;
          --border:   rgba(59,110,245,.14);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--blue-400); border-radius: 99px; }

        /* hero gradient mesh */
        .mesh {
          position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
        }
        .mesh::before {
          content:'';
          position: absolute;
          top: -120px; left: -80px;
          width: 640px; height: 640px;
          background: radial-gradient(ellipse at center, rgba(59,110,245,.18) 0%, transparent 70%);
          border-radius: 50%;
          animation: pulse 7s ease-in-out infinite alternate;
        }
        .mesh::after {
          content:'';
          position: absolute;
          bottom: -80px; right: -60px;
          width: 480px; height: 480px;
          background: radial-gradient(ellipse at center, rgba(99,144,249,.13) 0%, transparent 70%);
          border-radius: 50%;
          animation: pulse 9s ease-in-out infinite alternate-reverse;
        }
        @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.12); } }

        /* glass card */
        .glass {
          background: rgba(255,255,255,.82);
          backdrop-filter: blur(16px);
          border: 1px solid var(--border);
          border-radius: 20px;
        }

        /* feature pill hover */
        .feat-item {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 14px 16px;
          border-radius: 14px;
          transition: background .2s, transform .2s;
          cursor: default;
        }
        .feat-item:hover { background: var(--blue-50); transform: translateX(4px); }

        /* step card */
        .step-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 28px 24px;
          transition: transform .25s, box-shadow .25s;
        }
        .step-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(59,110,245,.12); }

        /* benefit card */
        .benefit-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 28px 24px;
          transition: transform .25s, box-shadow .25s;
        }
        .benefit-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(59,110,245,.12); }

        /* faq card */
        .faq-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 24px;
          transition: border-color .2s;
        }
        .faq-card:hover { border-color: var(--blue-400); }

        /* stat chip */
        .stat-chip {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 18px 22px;
          flex: 1;
        }

        /* cta section */
        .cta-section {
          background: linear-gradient(135deg, var(--blue-700) 0%, var(--blue-500) 100%);
          border-radius: 24px;
          padding: 56px 48px;
          position: relative;
          overflow: hidden;
        }
        .cta-section::before {
          content:'';
          position: absolute;
          top:-80px; right:-80px;
          width:320px; height:320px;
          background: rgba(255,255,255,.06);
          border-radius: 50%;
          pointer-events: none;
        }

        /* nav link */
        .nav-link {
          padding: 9px 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-2);
          text-decoration: none;
          transition: background .18s, box-shadow .18s, transform .18s;
          display: inline-block;
        }
        .nav-link:hover { background: var(--blue-50); box-shadow: 0 2px 12px rgba(59,110,245,.1); transform: translateY(-1px); }

        /* primary btn */
        .btn-primary {
          display: inline-block;
          padding: 13px 28px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          background: linear-gradient(135deg, var(--blue-600), var(--blue-500));
          color: #fff;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(59,110,245,.38);
          transition: transform .2s, box-shadow .2s, opacity .2s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(59,110,245,.45); }

        /* ghost btn */
        .btn-ghost {
          display: inline-block;
          padding: 13px 28px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          border: 1.5px solid rgba(255,255,255,.4);
          color: #fff;
          text-decoration: none;
          transition: background .2s, transform .2s;
          background: rgba(255,255,255,.08);
        }
        .btn-ghost:hover { background: rgba(255,255,255,.18); transform: translateY(-2px); }

        /* dot icon */
        .dot-icon {
          width: 34px; height: 34px; border-radius: 50%;
          background: var(--blue-50);
          border: 1px solid var(--blue-100);
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .dot-icon svg { width:14px; height:14px; color: var(--blue-600); }

        /* badge */
        .badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px;
          border-radius: 99px;
          font-size: 12px; font-weight: 600;
          background: var(--blue-50);
          color: var(--blue-600);
          border: 1px solid var(--blue-100);
          letter-spacing: .03em;
          text-transform: uppercase;
        }
        .badge-dot { width:7px; height:7px; border-radius:50%; background:var(--blue-500); animation: blink 2s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

        /* mock dashboard */
        .mock-bar { height:8px; border-radius:99px; background: var(--blue-100); overflow:hidden; }
        .mock-bar-fill { height:100%; border-radius:99px; background: linear-gradient(90deg, var(--blue-600), var(--blue-400)); }

        /* section title */
        .section-label {
          font-size:12px; font-weight:600; letter-spacing:.08em;
          text-transform:uppercase; color:var(--blue-600); margin-bottom:8px;
        }

        /* responsive grid helpers */
        @media(max-width:768px) {
          .hero-grid { grid-template-columns:1fr !important; }
          .cta-section { padding:36px 24px; }
          .cta-row { flex-direction:column !important; gap:20px !important; }
        }
      `}</style>

      {/* ════════════ NAV ════════════ */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid var(--border)", background: "rgba(245,247,252,.88)", backdropFilter: "blur(16px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,var(--blue-700),var(--blue-500))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><rect x="2" y="2" width="6" height="6" rx="2" fill="#fff"/><rect x="9" y="2" width="6" height="6" rx="2" fill="rgba(255,255,255,.5)"/><rect x="2" y="9" width="6" height="6" rx="2" fill="rgba(255,255,255,.5)"/><rect x="9" y="9" width="6" height="6" rx="2" fill="#fff"/></svg>
            </div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 17, color: "var(--blue-700)", letterSpacing: "-.02em" }}>FlowPedidos</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/quem-somos" className="nav-link">Conheça a equipe</Link>
            <Link to="/login" className="btn-primary" style={{ padding: "9px 18px" }}>Login</Link>
          </div>
        </div>
      </nav>

      {/* ════════════ HERO ════════════ */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 24px 56px", position: "relative" }}>
        <div className="mesh" />
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start", position: "relative", zIndex: 1 }}>

          {/* left */}
          <div>
            <div style={{ opacity: 0, animation: "fadeUp .6s .1s forwards" }}>
              <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
              <div className="badge" style={{ marginBottom: 20 }}>
                <span className="badge-dot" /> Sistema de gerenciamento
              </div>
              <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "clamp(32px,5vw,52px)", lineHeight: 1.1, letterSpacing: "-.03em", color: "var(--text-1)" }}>
                Gerencie pedidos<br />
                <span style={{ background: "linear-gradient(135deg,var(--blue-700),var(--blue-400))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  e estoque
                </span>{" "}
                com clareza.
              </h1>
              <p style={{ marginTop: 20, fontSize: 16, color: "var(--text-2)", lineHeight: 1.7, maxWidth: 440 }}>
                O FlowPedidos une pedidos, estoque e entregas em um sistema moderno e completo — tudo em uma única interface.
              </p>
              <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link to="/login" className="btn-primary">Cadastre-se grátis</Link>
              </div>

              {/* demo access */}
              <div style={{ marginTop: 32, padding: "18px 22px", borderRadius: 16, background: "var(--blue-50)", border: "1px solid var(--blue-100)", maxWidth: 380 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--blue-700)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Acesso de teste</p>
                <p style={{ fontSize: 13, color: "var(--text-2)" }}>
                  Email: <code style={{ fontFamily: "monospace", background: "#fff", padding: "2px 6px", borderRadius: 6, color: "var(--blue-700)" }}>admin@demo.com</code>
                </p>
                <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}>
                  Senha: <code style={{ fontFamily: "monospace", background: "#fff", padding: "2px 6px", borderRadius: 6, color: "var(--blue-700)" }}>admin123</code>
                </p>
              </div>
            </div>
          </div>

          {/* right — mock dashboard card */}
          <div style={{ opacity: 0, animation: "fadeUp .65s .25s forwards" }}>
            <div className="glass" style={{ padding: 28, boxShadow: "0 24px 64px rgba(59,110,245,.13)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text-1)" }}>Visão rápida do sistema</p>
                <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, background: "#e6f4ea", color: "#1a7c3e", fontWeight: 600 }}>● Ao vivo</span>
              </div>

              {/* stats row */}
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <div className="stat-chip">
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em" }}>Pedidos Ativos</p>
                  <p style={{ fontSize: 30, fontWeight: 700, color: "var(--blue-700)", marginTop: 4 }}><Counter target={28} /></p>
                </div>
                <div className="stat-chip">
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em" }}>Estoque Baixo</p>
                  <p style={{ fontSize: 30, fontWeight: 700, color: "#e05252", marginTop: 4 }}><Counter target={4} /></p>
                </div>
              </div>

              {/* mini bar chart */}
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>Pedidos por dia — semana</p>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 72 }}>
                {[55, 80, 45, 90, 70, 60, 85].map((h, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <div style={{
                      height: `${h}%`, borderRadius: "6px 6px 0 0",
                      background: i === 3 ? "linear-gradient(180deg,var(--blue-500),var(--blue-600))" : "var(--blue-100)",
                      transition: "height .6s ease",
                    }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map(d => (
                  <span key={d} style={{ fontSize: 10, color: "var(--text-3)", flex: 1, textAlign: "center" }}>{d}</span>
                ))}
              </div>

              {/* progress rows */}
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Entregues", pct: 74, color: "#22c55e" },
                  { label: "Em preparo", pct: 18, color: "var(--blue-500)" },
                  { label: "Aguardando", pct: 8, color: "#f59e0b" },
                ].map(r => (
                  <div key={r.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 500 }}>{r.label}</span>
                      <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>{r.pct}%</span>
                    </div>
                    <div className="mock-bar">
                      <div className="mock-bar-fill" style={{ width: `${r.pct}%`, background: r.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ FEATURES ════════════ */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "64px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeSection>
            <p className="section-label" style={{ textAlign: "center" }}>Recursos</p>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "clamp(24px,4vw,36px)", color: "var(--text-1)", textAlign: "center", letterSpacing: "-.02em" }}>
              Recursos Inteligentes
            </h2>
            <p style={{ marginTop: 10, color: "var(--text-2)", textAlign: "center", fontSize: 15 }}>
              Tudo o que você precisa para gerenciar seu negócio com eficiência.
            </p>
          </FadeSection>

          <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
            {[
              { icon: "📊", title: "Dashboard inteligente", desc: "Gráficos e alertas em tempo real para decisões rápidas." },
              { icon: "📦", title: "Pedidos dinâmicos", desc: "Status e prioridade configuráveis por pedido." },
              { icon: "🗂️", title: "Controle de estoque", desc: "Categorias, mínimos e alertas de reposição automáticos." },
              { icon: "🕓", title: "Histórico completo", desc: "Rastreie todo o fluxo de pedidos cadastrados." },
            ].map((f, i) => (
              <FadeSection key={f.title} delay={i * 80}>
                <div className="benefit-card" style={{ height: "100%" }}>
                  <span style={{ fontSize: 28 }}>{f.icon}</span>
                  <p style={{ marginTop: 14, fontWeight: 600, fontSize: 15, color: "var(--text-1)" }}>{f.title}</p>
                  <p style={{ marginTop: 6, fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ WHY ════════════ */}
      <section style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeSection>
            <p className="section-label">Por que usar</p>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "clamp(24px,4vw,36px)", color: "var(--text-1)", letterSpacing: "-.02em", maxWidth: 500 }}>
              Por que usar o FlowPedidos
            </h2>
            <p style={{ marginTop: 10, color: "var(--text-2)", fontSize: 15, maxWidth: 420 }}>
              Controle, agilidade e visibilidade para o dia a dia do seu negócio.
            </p>
          </FadeSection>

          <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {[
              { n: "01", title: "Decisão rápida", desc: "Indicadores claros para acompanhar pedidos, estoque e prioridades em um único painel.", color: "var(--blue-600)" },
              { n: "02", title: "Menos retrabalho", desc: "Histórico e status centralizados para evitar desencontros de informação.", color: "var(--blue-500)" },
              { n: "03", title: "Controle do estoque", desc: "Organização por categoria e alertas de mínimo para reposição no momento certo.", color: "var(--blue-400)" },
            ].map((b, i) => (
              <FadeSection key={b.n} delay={i * 100}>
                <div className="benefit-card">
                  <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 36, fontWeight: 800, color: b.color, opacity: .18, lineHeight: 1 }}>{b.n}</span>
                  <p style={{ marginTop: 12, fontWeight: 600, fontSize: 16, color: "var(--text-1)" }}>{b.title}</p>
                  <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-2)", lineHeight: 1.65 }}>{b.desc}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "72px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeSection style={{ textAlign: "center" }}>
            <p className="section-label" style={{ textAlign: "center" }}>Como funciona</p>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "clamp(24px,4vw,36px)", color: "var(--text-1)", textAlign: "center", letterSpacing: "-.02em" }}>
              Em 3 passos simples
            </h2>
            <p style={{ marginTop: 10, color: "var(--text-2)", textAlign: "center", fontSize: 15 }}>
              Em poucos passos, você organiza o fluxo do seu negócio.
            </p>
          </FadeSection>

          <div style={{ marginTop: 44, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20, position: "relative" }}>
            {[
              { n: "1", title: "Cadastre produtos", desc: "Defina categoria, mínimo e valor unitário para cada item.", icon: "📝" },
              { n: "2", title: "Registre pedidos", desc: "Acompanhe status, prioridade e histórico em tempo real.", icon: "🚀" },
              { n: "3", title: "Monitore o painel", desc: "Veja alertas e totais em uma visão rápida e centralizada.", icon: "📈" },
            ].map((s, i) => (
              <FadeSection key={s.n} delay={i * 110}>
                <div className="step-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: 28 }}>{s.icon}</span>
                    <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 42, color: "var(--blue-100)", lineHeight: 1 }}>{s.n}</span>
                  </div>
                  <p style={{ marginTop: 16, fontWeight: 600, fontSize: 15, color: "var(--text-1)" }}>{s.title}</p>
                  <p style={{ marginTop: 6, fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FAQ ════════════ */}
      <section style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeSection>
            <p className="section-label">FAQ</p>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "clamp(24px,4vw,36px)", color: "var(--text-1)", letterSpacing: "-.02em" }}>
              Perguntas frequentes
            </h2>
          </FadeSection>

          <div style={{ marginTop: 36, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
            {[
              { q: "Preciso ser admin para usar?", a: "Não. O perfil admin é necessário apenas para ações de edição e gerenciamento." },
              { q: "Consigo ver histórico?", a: "Sim. Há uma área dedicada para histórico e acompanhamento de registros." },
              { q: "O sistema é responsivo?", a: "Sim. O layout se adapta para desktop e dispositivos móveis." },
              { q: "Posso testar com um acesso padrão?", a: "Sim. Utilize o acesso de teste informado na página para explorar o sistema." },
            ].map((f, i) => (
              <FadeSection key={f.q} delay={i * 70}>
                <div className="faq-card">
                  <p style={{ fontWeight: 600, fontSize: 14.5, color: "var(--text-1)", lineHeight: 1.4 }}>{f.q}</p>
                  <p style={{ marginTop: 8, fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.65 }}>{f.a}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CTA ════════════ */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="cta-section">
              <div className="cta-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 32 }}>
                <div>
                  <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "clamp(22px,3.5vw,34px)", color: "#fff", letterSpacing: "-.02em", lineHeight: 1.2 }}>
                    Pronto(a) para começar?
                  </p>
                  <p style={{ marginTop: 10, color: "rgba(255,255,255,.75)", fontSize: 15 }}>
                    Acesse o sistema e teste o painel em poucos minutos.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", flexShrink: 0 }}>
                  <button
                    onClick={() => window.open("https://github.com/laraluisa-git/projeto-flowpedidos", "_blank")}
                    style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"13px 28px", borderRadius:12, fontSize:14, fontWeight:600, background:"#fff", color:"#1a3a9e", border:"none", cursor:"pointer", boxShadow:"0 4px 20px rgba(0,0,0,.15)" }}
                  >
                    <img src="https://cdn.simpleicons.org/github/1a3a9e" alt="GitHub" width={18} height={18} />
                    Ver no GitHub
                  </button>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "var(--text-3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          © {new Date().getFullYear()} FlowPedidos. Projeto acadêmico.
          <a
            href="https://github.com/laraluisa-git"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            style={{ display: "inline-flex", alignItems: "center" }}
            onMouseOver={e => e.currentTarget.querySelector("img").src = "https://cdn.simpleicons.org/github/3b6ef5"}
            onMouseOut={e => e.currentTarget.querySelector("img").src = "https://cdn.simpleicons.org/github/718096"}
          >
            <img
              src="https://cdn.simpleicons.org/github/718096"
              alt="GitHub"
              width={18}
              height={18}
              style={{ display: "block", transition: "opacity .2s" }}
            />
          </a>
        </p>
      </footer>
    </div>
  );
}
