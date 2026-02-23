import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Auth() {
  const nav = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    accountType: "pf",
    companyName: "",
  });

  function onChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        if (!form.name || !form.email || !form.password || !form.address) {
          throw new Error("Preencha todos os campos obrigatórios.");
        }
        if (form.accountType === "empresa" && !form.companyName) {
          throw new Error("Informe o nome da empresa.");
        }

        await register({
          nome: form.name,
          email: form.email,
          senha: form.password,
          endereco: form.address,
          tipoConta: form.accountType,
          nomeEmpresa: form.accountType === "empresa" ? form.companyName : "",
        });
      }

      nav("/dashboard");
    } catch (err) {
      setError(err.message ?? "Erro.");
    }
  }

  return (
    <div
      translate="no"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f5f7fc", minHeight: "100vh" }}
    >
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

        /* mesh background */
        .auth-mesh {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
        }
        .auth-mesh::before {
          content:'';
          position: absolute;
          top: -160px; left: -120px;
          width: 600px; height: 600px;
          background: radial-gradient(ellipse at center, rgba(59,110,245,.16) 0%, transparent 70%);
          border-radius: 50%;
          animation: authPulse 7s ease-in-out infinite alternate;
        }
        .auth-mesh::after {
          content:'';
          position: absolute;
          bottom: -100px; right: -100px;
          width: 480px; height: 480px;
          background: radial-gradient(ellipse at center, rgba(99,144,249,.12) 0%, transparent 70%);
          border-radius: 50%;
          animation: authPulse 9s ease-in-out infinite alternate-reverse;
        }
        @keyframes authPulse { from{transform:scale(1)} to{transform:scale(1.1)} }
        @keyframes authFadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

        /* nav */
        .auth-nav-link {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 16px;
          border-radius: 10px;
          font-size: 13px; font-weight: 500;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-2);
          text-decoration: none;
          transition: background .18s, box-shadow .18s, transform .18s;
        }
        .auth-nav-link:hover { background: var(--blue-50); transform: translateY(-1px); box-shadow: 0 2px 12px rgba(59,110,245,.1); }

        /* card */
        .auth-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 36px;
          box-shadow: 0 24px 64px rgba(59,110,245,.1);
          animation: authFadeUp .6s .15s both;
        }

        /* tab switcher */
        .auth-tabs {
          display: flex;
          gap: 4px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 5px;
          margin-top: 24px;
        }
        .auth-tab {
          flex: 1;
          padding: 10px;
          border-radius: 10px;
          border: none;
          font-size: 14px; font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background .2s, color .2s, box-shadow .2s;
          background: transparent;
          color: var(--text-3);
        }
        .auth-tab.active {
          background: var(--surface);
          color: var(--text-1);
          box-shadow: 0 2px 10px rgba(59,110,245,.1);
        }

        /* input */
        .auth-input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg);
          padding: 12px 14px;
          font-size: 14px;
          font-family: inherit;
          color: var(--text-1);
          outline: none;
          transition: border-color .2s, box-shadow .2s;
          box-sizing: border-box;
        }
        .auth-input:focus { border-color: var(--blue-500); box-shadow: 0 0 0 3px rgba(59,110,245,.12); }
        .auth-input::placeholder { color: var(--text-3); }

        /* select */
        .auth-select {
          width: 100%;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg);
          padding: 12px 14px;
          font-size: 14px;
          font-family: inherit;
          color: var(--text-1);
          outline: none;
          appearance: none;
          cursor: pointer;
          transition: border-color .2s, box-shadow .2s;
          box-sizing: border-box;
        }
        .auth-select:focus { border-color: var(--blue-500); box-shadow: 0 0 0 3px rgba(59,110,245,.12); }

        /* label */
        .auth-label {
          display: block;
          font-size: 12px; font-weight: 600;
          color: var(--text-2);
          margin-bottom: 6px;
          letter-spacing: .02em;
        }

        /* field group */
        .auth-field { display: flex; flex-direction: column; }

        /* submit btn */
        .auth-btn-submit {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, var(--blue-600), var(--blue-500));
          color: #fff;
          font-size: 15px; font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(59,110,245,.35);
          transition: transform .2s, box-shadow .2s;
        }
        .auth-btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(59,110,245,.45); }
        .auth-btn-submit:active { transform: translateY(0); }

        /* demo card */
        .auth-demo {
          background: var(--blue-50);
          border: 1px solid var(--blue-100);
          border-radius: 16px;
          padding: 18px 20px;
        }

        /* demo fill btn */
        .auth-btn-demo {
          padding: 10px 18px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--blue-700);
          font-size: 13px; font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background .18s, transform .18s, box-shadow .18s;
        }
        .auth-btn-demo:hover { background: var(--blue-50); transform: translateY(-1px); box-shadow: 0 2px 12px rgba(59,110,245,.1); }

        /* error */
        .auth-error {
          background: #fff5f5;
          border: 1px solid rgba(220,38,38,.2);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 13.5px;
          color: #b91c1c;
          margin-top: 16px;
        }

        /* badge */
        .auth-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px;
          border-radius: 99px;
          font-size: 12px; font-weight: 600;
          background: var(--blue-50);
          color: var(--blue-600);
          border: 1px solid var(--blue-100);
          letter-spacing: .03em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .auth-badge-dot { width:7px; height:7px; border-radius:50%; background:var(--blue-500); animation: authBlink 2s infinite; }
        @keyframes authBlink { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>

      {/* mesh */}
      <div className="auth-mesh" />

      {/* nav */}
      <nav style={{ position: "relative", zIndex: 10, borderBottom: "1px solid var(--border)", background: "rgba(245,247,252,.88)", backdropFilter: "blur(16px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,var(--blue-700),var(--blue-500))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><rect x="2" y="2" width="6" height="6" rx="2" fill="#fff" /><rect x="9" y="2" width="6" height="6" rx="2" fill="rgba(255,255,255,.5)" /><rect x="2" y="9" width="6" height="6" rx="2" fill="rgba(255,255,255,.5)" /><rect x="9" y="9" width="6" height="6" rx="2" fill="#fff" /></svg>
            </div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 17, color: "var(--blue-700)", letterSpacing: "-.02em" }}>FlowPedidos</span>
          </div>
          <Link to="/" className="auth-nav-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            <span>Voltar</span>
          </Link>
        </div>
      </nav>

      {/* content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "56px 24px 80px" }}>

        {/* header text */}
        <div style={{ textAlign: "center", marginBottom: 32, opacity: 0, animation: "authFadeUp .55s .05s both" }}>
          <div className="auth-badge" style={{ margin: "0 auto 16px" }}>
            <span className="auth-badge-dot" /> Acesso ao sistema
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "clamp(26px,5vw,36px)", color: "var(--text-1)", letterSpacing: "-.03em", lineHeight: 1.15 }}>
            {mode === "login" ? (
              <>Sinta-se na sua<span style={{ background: "linear-gradient(135deg,var(--blue-700),var(--blue-400))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}> empresa!</span></>
            ) : (
              <>Crie sua <span style={{ background: "linear-gradient(135deg,var(--blue-700),var(--blue-400))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>conta</span></>
            )}
          </h1>
          <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-2)" }}>
            {mode === "login" ? "Entre com suas credenciais para acessar o painel." : "Preencha os dados abaixo para criar seu acesso."}
          </p>
        </div>

        {/* card */}
        <div className="auth-card">

          {/* tabs */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab${mode === "login" ? " active" : ""}`}
              onClick={() => { setMode("login"); setError(""); }}
            >
              <span>Login</span>
            </button>
            <button
              type="button"
              className={`auth-tab${mode === "register" ? " active" : ""}`}
              onClick={() => { setMode("register"); setError(""); }}
            >
              <span>Cadastro</span>
            </button>
          </div>

          {/* error */}
          {error && <div className="auth-error">{error}</div>}

          {/* form */}
          <form onSubmit={onSubmit} style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>

            {mode === "register" && (
              <>
                <div className="auth-field">
                  <label className="auth-label">Nome</label>
                  <input className="auth-input" placeholder="Seu nome" name="name" value={form.name} onChange={onChange} autoComplete="name" />
                </div>

                <div className="auth-field">
                  <label className="auth-label">Endereço</label>
                  <input className="auth-input" placeholder="Rua, número, bairro..." name="address" value={form.address} onChange={onChange} autoComplete="street-address" />
                </div>

                <div className="auth-field">
                  <label className="auth-label">Tipo de Conta</label>
                  <div style={{ position: "relative" }}>
                    <select className="auth-select" name="accountType" value={form.accountType} onChange={onChange}>
                      <option value="pf">Pessoa Física</option>
                      <option value="empresa">Empresa</option>
                    </select>
                    <svg style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-3)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                  </div>
                </div>

                {form.accountType === "empresa" && (
                  <div className="auth-field">
                    <label className="auth-label">Nome da Empresa</label>
                    <input className="auth-input" placeholder="Ex: FlowPedidos LTDA" name="companyName" value={form.companyName} onChange={onChange} />
                  </div>
                )}
              </>
            )}

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input className="auth-input" placeholder="seuemail@exemplo.com" name="email" value={form.email} onChange={onChange} autoComplete="email" />
            </div>

            <div className="auth-field">
              <label className="auth-label">Senha</label>
              <input className="auth-input" placeholder="••••••••" type="password" name="password" value={form.password} onChange={onChange} autoComplete={mode === "login" ? "current-password" : "new-password"} />
            </div>

            <button className="auth-btn-submit" style={{ marginTop: 4 }}>
              <span>{mode === "login" ? "Entrar" : "Cadastrar"}</span>
            </button>

            {/* demo access */}
            <div className="auth-demo">
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--blue-700)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Acesso de teste</p>
              <p style={{ fontSize: 13, color: "var(--text-2)" }}>
                Email: <code style={{ fontFamily: "monospace", background: "#fff", padding: "2px 6px", borderRadius: 6, color: "var(--blue-700)" }}>admin@demo.com</code>
              </p>
              <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}>
                Senha: <code style={{ fontFamily: "monospace", background: "#fff", padding: "2px 6px", borderRadius: 6, color: "var(--blue-700)" }}>admin123</code>
              </p>
              <button
                type="button"
                className="auth-btn-demo"
                style={{ marginTop: 12 }}
                onClick={() => {
                  setForm((p) => ({ ...p, email: "admin@demo.com", password: "admin123" }));
                  setMode("login");
                  setError("");
                }}
              >
                Preencher dados de teste
              </button>
            </div>

          </form>
        </div>

        {/* footer */}
        <p style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: "var(--text-3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
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
            <img src="https://cdn.simpleicons.org/github/718096" alt="GitHub" width={16} height={16} style={{ display: "block" }} />
          </a>
        </p>
      </div>
    </div>
  );
}