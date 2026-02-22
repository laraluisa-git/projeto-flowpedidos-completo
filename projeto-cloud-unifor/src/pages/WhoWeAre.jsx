import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { DB } from "../storage/db";
import { useAuth } from "../auth/AuthContext";

/* ─── fade-in hook ─── */
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

export default function WhoWeAre() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [refresh, setRefresh] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const members = useMemo(() => DB.read().teamMembers, [refresh]);
  const [form, setForm] = useState({ name: "", role: "", links: "" });

  function addMember() {
    if (!form.name || !form.role) return;
    DB.write((d, audit) => {
      const m = { id: DB.uid("t"), ...form };
      d.teamMembers.unshift(m);
      audit("CREATE", "team_member", m.id, `Adicionou membro ${m.name}`);
      return d;
    });
    setForm({ name: "", role: "", links: "" });
    setRefresh((n) => n + 1);
  }

  function removeMember(id) {
    const ok = confirm("Remover integrante?");
    if (!ok) return;
    DB.write((d, audit) => {
      const idx = d.teamMembers.findIndex((x) => x.id === id);
      if (idx === -1) return d;
      const m = d.teamMembers[idx];
      d.teamMembers.splice(idx, 1);
      audit("DELETE", "team_member", id, `Removeu membro ${m.name}`);
      return d;
    });
    setRefresh((n) => n + 1);
  }

  return (
    <div translate="no" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f5f7fc", minHeight: "100vh" }}>
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

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--blue-400); border-radius: 99px; }

        .ww-mesh {
          position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
        }
        .ww-mesh::before {
          content:'';
          position: absolute;
          top: -120px; left: -80px;
          width: 520px; height: 520px;
          background: radial-gradient(ellipse at center, rgba(59,110,245,.15) 0%, transparent 70%);
          border-radius: 50%;
          animation: wwPulse 7s ease-in-out infinite alternate;
        }
        .ww-mesh::after {
          content:'';
          position: absolute;
          bottom: -60px; right: -60px;
          width: 380px; height: 380px;
          background: radial-gradient(ellipse at center, rgba(99,144,249,.1) 0%, transparent 70%);
          border-radius: 50%;
          animation: wwPulse 9s ease-in-out infinite alternate-reverse;
        }
        @keyframes wwPulse { from { transform: scale(1); } to { transform: scale(1.1); } }
        @keyframes wwFadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

        .ww-nav-link {
          padding: 9px 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-2);
          text-decoration: none;
          cursor: pointer;
          transition: background .18s, box-shadow .18s, transform .18s;
          display: inline-block;
        }
        .ww-nav-link:hover { background: var(--blue-50); box-shadow: 0 2px 12px rgba(59,110,245,.1); transform: translateY(-1px); }

        .ww-btn-primary {
          display: inline-block;
          padding: 9px 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          background: linear-gradient(135deg, var(--blue-600), var(--blue-500));
          color: #fff;
          border: none;
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(59,110,245,.38);
          transition: transform .2s, box-shadow .2s;
        }
        .ww-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(59,110,245,.45); }

        .ww-member-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 24px;
          transition: transform .25s, box-shadow .25s, border-color .2s;
        }
        .ww-member-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(59,110,245,.12); border-color: var(--blue-400); }

        .ww-input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg);
          padding: 11px 14px;
          font-size: 14px;
          font-family: inherit;
          color: var(--text-1);
          outline: none;
          transition: border-color .2s, box-shadow .2s;
          box-sizing: border-box;
        }
        .ww-input:focus { border-color: var(--blue-500); box-shadow: 0 0 0 3px rgba(59,110,245,.12); }
        .ww-input::placeholder { color: var(--text-3); }

        .ww-btn-add {
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, var(--blue-600), var(--blue-500));
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(59,110,245,.3);
          transition: transform .2s, box-shadow .2s;
        }
        .ww-btn-add:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(59,110,245,.4); }

        .ww-btn-remove {
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid rgba(220,38,38,.2);
          background: rgba(254,242,242,1);
          color: #b91c1c;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: transform .2s, background .2s;
        }
        .ww-btn-remove:hover { transform: translateY(-1px); background: #fee2e2; }

        .ww-btn-edit {
          padding: 9px 18px;
          border-radius: 10px;
          border: 1px solid var(--blue-100);
          background: var(--blue-50);
          color: var(--blue-700);
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background .2s, transform .2s;
        }
        .ww-btn-edit:hover { background: var(--blue-100); transform: translateY(-1px); }

        .ww-badge {
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
        .ww-badge-dot { width:7px; height:7px; border-radius:50%; background:var(--blue-500); animation: wwBlink 2s infinite; }
        @keyframes wwBlink { 0%,100%{opacity:1} 50%{opacity:.3} }

        .ww-info-card {
          background: var(--blue-50);
          border: 1px solid var(--blue-100);
          border-radius: 20px;
          padding: 28px;
        }

        .ww-form-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 28px;
          max-width: 480px;
        }

        .ww-section-label {
          font-size:12px; font-weight:600; letter-spacing:.08em;
          text-transform:uppercase; color:var(--blue-600); margin-bottom:8px;
          display: block;
        }

        @media(max-width:768px) {
          .ww-members-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid var(--border)", background: "rgba(245,247,252,.88)", backdropFilter: "blur(16px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,var(--blue-700),var(--blue-500))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><rect x="2" y="2" width="6" height="6" rx="2" fill="#fff"/><rect x="9" y="2" width="6" height="6" rx="2" fill="rgba(255,255,255,.5)"/><rect x="2" y="9" width="6" height="6" rx="2" fill="rgba(255,255,255,.5)"/><rect x="9" y="9" width="6" height="6" rx="2" fill="#fff"/></svg>
            </div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 17, color: "var(--blue-700)", letterSpacing: "-.02em" }}>FlowPedidos</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {isAdmin && (
              <button className="ww-btn-edit" onClick={() => setEditMode((v) => !v)}>
                <span>{editMode ? "Sair da edição" : "Modo edição"}</span>
              </button>
            )}
            <Link to="/" className="ww-nav-link">Home</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px 48px", position: "relative" }}>
        <div className="ww-mesh" />
        <div style={{ position: "relative", zIndex: 1, opacity: 0, animation: "wwFadeUp .6s .1s forwards" }}>
          <div className="ww-badge" style={{ marginBottom: 18 }}>
            <span className="ww-badge-dot" /> Grupo 8
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "clamp(28px,5vw,48px)", lineHeight: 1.1, letterSpacing: "-.03em", color: "var(--text-1)" }}>
            Conheça a{" "}
            <span style={{ background: "linear-gradient(135deg,var(--blue-700),var(--blue-400))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              equipe
            </span>
          </h1>
          <p style={{ marginTop: 14, fontSize: 15, color: "var(--text-2)", lineHeight: 1.7, maxWidth: 480 }}>
            Conectando aprendizado, criatividade e muita vontade de evoluir.
          </p>
        </div>
      </section>

      {/* ── MEMBERS GRID ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 56px" }}>
        <FadeSection>
          <span className="ww-section-label">Integrantes</span>
        </FadeSection>

        <div
          className="ww-members-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, marginTop: 16 }}
        >
          {members.map((m, i) => (
            <FadeSection key={m.id} delay={i * 70}>
              <div className="ww-member-card">
                {/* avatar initial */}
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,var(--blue-600),var(--blue-400))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: "#fff" }}>
                    {m.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p style={{ fontWeight: 600, fontSize: 15, color: "var(--text-1)" }}>{m.name}</p>
                <p style={{ fontSize: 13, color: "var(--blue-600)", fontWeight: 500, marginTop: 2 }}>{m.role}</p>
                {m.links && (
                  <p style={{ marginTop: 8, fontSize: 12, color: "var(--text-3)", wordBreak: "break-all", lineHeight: 1.5 }}>{m.links}</p>
                )}
                {isAdmin && editMode && (
                  <div style={{ marginTop: 16 }}>
                    <button className="ww-btn-remove" onClick={() => removeMember(m.id)}>
                      Remover
                    </button>
                  </div>
                )}
              </div>
            </FadeSection>
          ))}
        </div>
      </section>

      {/* ── FORM + INFO ── */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "56px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24, alignItems: "start" }}>

          {/* form card */}
          <FadeSection>
            <div className="ww-form-card">
              <span className="ww-section-label">Cadastro</span>
              <p style={{ fontWeight: 600, fontSize: 16, color: "var(--text-1)" }}>Cadastro de integrantes</p>
              <p style={{ marginTop: 4, fontSize: 13.5, color: "var(--text-2)" }}>
                {isAdmin ? "Disponível no modo edição (admin)." : "Somente admin pode editar."}
              </p>

              {isAdmin && editMode ? (
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                  <input
                    className="ww-input"
                    placeholder="Nome"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <input
                    className="ww-input"
                    placeholder="Função (ex: Front-end, Banco, Docs)"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                  <input
                    className="ww-input"
                    placeholder="Links (LinkedIn/GitHub) — opcional"
                    value={form.links}
                    onChange={(e) => setForm({ ...form, links: e.target.value })}
                  />
                  <button className="ww-btn-add" onClick={addMember}>
                    Adicionar integrante
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: 16, padding: "16px 18px", borderRadius: 14, background: "var(--bg)", border: "1px solid var(--border)", fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.6 }}>
                  <span translate="no">Para editar a equipe, entre como </span><strong style={{ color: "var(--text-1)" }}>admin</strong><span translate="no"> e ative o </span><strong style={{ color: "var(--text-1)" }}>Modo edição</strong><span>.</span>
                </div>
              )}
            </div>
          </FadeSection>

          {/* info card */}
          <FadeSection delay={120}>
            <div className="ww-info-card">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--blue-100)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <p style={{ fontWeight: 600, fontSize: 15, color: "var(--blue-900)" }}>Sobre a equipe</p>
              </div>
              <p style={{ fontSize: 14, color: "var(--blue-700)", lineHeight: 1.7 }}>
                A equipe do projeto FlowPedidos é composta pelos integrantes do Grupo 8 da disciplina de Desenvolvimento de Software em Nuvem do curso de Análise e Desenvolvimento de Sistemas da Universidade de Fortaleza.
              </p>
            </div>
          </FadeSection>

        </div>
      </section>

      {/* ── FOOTER ── */}
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