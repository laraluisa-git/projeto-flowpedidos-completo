import React, { useMemo, useState } from "react";
import { DB } from "../../storage/db";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Modal from "../../components/Modal";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

const priorityStyle = (p) => {
  if (p === "alta")  return { background:"rgba(220,38,38,.08)",  color:"#b91c1c", border:"1px solid rgba(220,38,38,.18)"  };
  if (p === "media") return { background:"rgba(245,158,11,.08)", color:"#b45309", border:"1px solid rgba(245,158,11,.18)" };
  return                    { background:"rgba(34,197,94,.08)",  color:"#15803d", border:"1px solid rgba(34,197,94,.18)"  };
};

function labelPriority(v) {
  if (v === "alta") return "Alta";
  if (v === "media") return "Média";
  if (v === "baixa") return "Baixa";
  return v;
}

const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
    <path d="M3.51 9a9 9 0 0114.36-3.36L23 10M1 14l5.13 4.36A9 9 0 0020.49 15"/>
  </svg>
);
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export default function Orders() {
  const [refresh, setRefresh] = useState(0);
  const [open, setOpen]       = useState(false);
  const [editingId, setEditingId] = useState(null);

  const snapshot = useMemo(() => DB.read(), [refresh]);
  const { orders, products } = snapshot;

  const prodById = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const defaultForm = {
    orderId: "", customerName: "", deliveryAddress: "",
    productId: products[0]?.id || "", quantity: 1,
    priority: "media", status: "confirmado",
  };

  const [form, setForm] = useState(defaultForm);

  const totalOrders   = orders.length;
  const inProgress    = orders.filter((o) => o.status === "em_andamento").length;
  const deliveredToday = orders.filter(
    (o) => o.status === "entregue" && o.deliveredAt && dayKey(o.deliveredAt) === todayKey()
  ).length;

  function resetModal() { setEditingId(null); setForm({ ...defaultForm, productId: products[0]?.id || "" }); }
  function openCreate() { resetModal(); setOpen(true); }
  function openEdit(order) {
    setEditingId(order.id);
    setForm({ orderId: order.id, customerName: order.customerName, deliveryAddress: order.deliveryAddress, productId: order.productId, quantity: order.quantity, priority: order.priority, status: order.status });
    setOpen(true);
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === "quantity" ? Number(value) : value }));
  }

  function saveOrder() {
    if (!form.customerName || !form.deliveryAddress || !form.productId) { alert("Preencha cliente, endereço e produto."); return; }
    if (!form.quantity || form.quantity <= 0) { alert("Quantidade deve ser maior que zero."); return; }

    DB.write((d, audit) => {
      const prod = d.products.find((p) => p.id === form.productId);
      if (!prod) throw new Error("Produto não encontrado.");

      if (!editingId) {
        const customId = String(form.orderId || "").trim();
        if (customId && d.orders.some((o) => o.id === customId)) { alert("Já existe um pedido com este ID."); return d; }
        if (prod.stockQty < form.quantity) { alert("Estoque insuficiente para este produto."); return d; }
        prod.stockQty -= form.quantity;
        const o = { id: customId || DB.uid("o"), customerName: form.customerName, deliveryAddress: form.deliveryAddress, productId: form.productId, quantity: form.quantity, priority: form.priority, status: form.status, createdAt: Date.now(), deliveredAt: form.status === "entregue" ? Date.now() : null };
        d.orders.unshift(o);
        audit("CREATE", "order", o.id, `Pedido criado para ${o.customerName}`);
        return d;
      }

      const idx = d.orders.findIndex((o) => o.id === editingId);
      if (idx === -1) return d;
      const old = d.orders[idx];
      const oldProd = d.products.find((p) => p.id === old.productId);
      if (oldProd) oldProd.stockQty += old.quantity;
      const newProd = d.products.find((p) => p.id === form.productId);
      if (!newProd) { alert("Produto não encontrado."); return d; }
      if (newProd.stockQty < form.quantity) { if (oldProd) oldProd.stockQty -= old.quantity; alert("Estoque insuficiente para a nova quantidade/produto."); return d; }
      newProd.stockQty -= form.quantity;
      const updated = { ...old, customerName: form.customerName, deliveryAddress: form.deliveryAddress, productId: form.productId, quantity: form.quantity, priority: form.priority, status: form.status, deliveredAt: form.status === "entregue" ? (old.deliveredAt ?? Date.now()) : null };
      d.orders[idx] = updated;
      audit("UPDATE", "order", updated.id, `Pedido atualizado (${updated.status})`);
      return d;
    });

    setOpen(false); resetModal(); setRefresh((n) => n + 1);
  }

  function deleteOrder(id) {
    if (!confirm("Deseja excluir este pedido? (O estoque será devolvido)")) return;
    DB.write((d, audit) => {
      const idx = d.orders.findIndex((o) => o.id === id);
      if (idx === -1) return d;
      const o = d.orders[idx];
      const prod = d.products.find((p) => p.id === o.productId);
      if (prod) prod.stockQty += o.quantity;
      d.orders.splice(idx, 1);
      audit("DELETE", "order", id, `Pedido excluído (${o.customerName})`);
      return d;
    });
    setRefresh((n) => n + 1);
  }

  function setStatus(id, status) {
    DB.write((d, audit) => {
      const idx = d.orders.findIndex((o) => o.id === id);
      if (idx === -1) return d;
      const o = d.orders[idx];
      d.orders[idx] = { ...o, status, deliveredAt: status === "entregue" ? (o.deliveredAt ?? Date.now()) : null };
      audit("UPDATE", "order", id, `Status alterado para ${status}`);
      return d;
    });
    setRefresh((n) => n + 1);
  }

  const rows = orders.map((o) => ({ ...o, productName: prodById.get(o.productId)?.name ?? "(produto removido)" }));

  return (
    <div translate="no" style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", display:"flex", flexDirection:"column", gap:24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
        :root {
          --blue-700:#1a3a9e; --blue-600:#2350d8; --blue-500:#3b6ef5;
          --blue-400:#6390f9; --blue-100:#dce9ff; --blue-50:#eef4ff;
          --surface:#fff; --bg:#f5f7fc;
          --text-1:#0e1726; --text-2:#4a5568; --text-3:#718096;
          --border:rgba(59,110,245,.14);
        }
        .ord-btn {
          display:inline-flex; align-items:center; gap:6px;
          padding:10px 18px; border-radius:10px;
          border:1px solid var(--border); background:var(--surface);
          font-size:13px; font-weight:600; font-family:inherit;
          color:var(--blue-600); cursor:pointer;
          transition:background .18s, transform .18s, box-shadow .18s;
        }
        .ord-btn:hover { background:var(--blue-50); transform:translateY(-1px); box-shadow:0 2px 12px rgba(59,110,245,.1); }
        .ord-btn:active { transform:translateY(0); }

        .ord-btn-primary {
          display:inline-flex; align-items:center; gap:6px;
          padding:10px 18px; border-radius:10px; border:none;
          background:linear-gradient(135deg,var(--blue-600),var(--blue-500));
          color:#fff; font-size:13px; font-weight:600; font-family:inherit;
          cursor:pointer; box-shadow:0 4px 16px rgba(59,110,245,.3);
          transition:transform .2s, box-shadow .2s;
        }
        .ord-btn-primary:hover { transform:translateY(-1px); box-shadow:0 6px 22px rgba(59,110,245,.4); }
        .ord-btn-primary:active { transform:translateY(0); }

        .ord-edit-btn {
          padding:6px 14px; border-radius:8px;
          border:1px solid var(--border); background:var(--bg);
          font-size:12px; font-weight:600; font-family:inherit;
          color:var(--text-2); cursor:pointer;
          transition:background .18s, transform .18s;
        }
        .ord-edit-btn:hover { background:var(--blue-50); color:var(--blue-600); transform:translateY(-1px); }

        .ord-del-btn {
          padding:6px 14px; border-radius:8px;
          border:1px solid rgba(220,38,38,.2); background:rgba(254,242,242,1);
          font-size:12px; font-weight:600; font-family:inherit;
          color:#b91c1c; cursor:pointer;
          transition:background .18s, transform .18s;
        }
        .ord-del-btn:hover { background:#fee2e2; transform:translateY(-1px); }

        .ord-status-select {
          border-radius:8px; border:1px solid var(--border);
          background:var(--bg); padding:6px 10px;
          font-size:12px; font-weight:600; font-family:inherit;
          color:var(--text-2); cursor:pointer; outline:none;
          transition:border-color .2s, box-shadow .2s;
        }
        .ord-status-select:focus { border-color:var(--blue-500); box-shadow:0 0 0 3px rgba(59,110,245,.12); }

        .ord-input {
          width:100%; border-radius:12px;
          border:1px solid var(--border); background:var(--bg);
          padding:11px 14px; font-size:14px; font-family:inherit;
          color:var(--text-1); outline:none;
          transition:border-color .2s, box-shadow .2s; box-sizing:border-box;
        }
        .ord-input:focus { border-color:var(--blue-500); box-shadow:0 0 0 3px rgba(59,110,245,.12); }
        .ord-input::placeholder { color:var(--text-3); }

        .ord-select {
          width:100%; border-radius:12px;
          border:1px solid var(--border); background:var(--bg);
          padding:11px 14px; font-size:14px; font-family:inherit;
          color:var(--text-1); outline:none; appearance:none; cursor:pointer;
          transition:border-color .2s, box-shadow .2s; box-sizing:border-box;
        }
        .ord-select:focus { border-color:var(--blue-500); box-shadow:0 0 0 3px rgba(59,110,245,.12); }

        .ord-label { display:block; font-size:12px; font-weight:600; color:var(--text-2); margin-bottom:6px; letter-spacing:.02em; }

        .ord-save-btn {
          width:100%; padding:13px; border-radius:12px; border:none;
          background:linear-gradient(135deg,var(--blue-600),var(--blue-500));
          color:#fff; font-size:14px; font-weight:600; font-family:inherit;
          cursor:pointer; box-shadow:0 4px 20px rgba(59,110,245,.3);
          transition:transform .2s, box-shadow .2s; margin-top:8px;
        }
        .ord-save-btn:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(59,110,245,.4); }
        .ord-save-btn:active { transform:translateY(0); }

        .ord-badge {
          display:inline-flex; align-items:center;
          padding:3px 10px; border-radius:99px;
          font-size:11px; font-weight:700; letter-spacing:.03em;
        }
      `}</style>

      {/* ── header ── */}
      <div style={{ display:"flex", flexWrap:"wrap", alignItems:"flex-end", justifyContent:"space-between", gap:16 }}>
        <div>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:"var(--blue-600)", marginBottom:4 }}>Gestão</p>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"clamp(20px,3vw,26px)", color:"var(--text-1)", letterSpacing:"-.02em" }}>Pedidos</h1>
          <p style={{ marginTop:4, fontSize:13.5, color:"var(--text-3)" }}>Crie, edite e acompanhe pedidos.</p>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <button className="ord-btn" onClick={() => setRefresh((n) => n + 1)}>
            <IconRefresh /> <span>Atualizar</span>
          </button>
          <button className="ord-btn-primary" onClick={openCreate}>
            <IconPlus /> <span>Cadastrar pedido</span>
          </button>
        </div>
      </div>

      {/* ── cards ── */}
      <div style={{ display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))" }}>
        <Card title="Total de pedidos" value={totalOrders} />
        <Card title="Em andamento" value={inProgress} highlight />
        <Card title="Entregues hoje" value={deliveredToday} />
      </div>

      {/* ── table ── */}
      <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:20, overflow:"hidden", boxShadow:"0 4px 20px rgba(59,110,245,.07)" }}>
        <Table
          columns={[
            {
              key:"id", header:"ID",
              render:(r) => (
                <span style={{ fontFamily:"monospace", fontSize:11, color:"var(--text-3)", background:"var(--bg)", padding:"2px 8px", borderRadius:6, border:"1px solid var(--border)" }}>
                  {r.id}
                </span>
              ),
            },
            {
              key:"customerName", header:"Cliente",
              render:(r) => <span style={{ fontWeight:600, color:"var(--text-1)", fontSize:13.5 }}>{r.customerName}</span>,
            },
            { key:"productName", header:"Produto" },
            { key:"deliveryAddress", header:"Endereço" },
            {
              key:"priority", header:"Prioridade",
              render:(r) => (
                <span className="ord-badge" style={priorityStyle(r.priority)}>
                  {labelPriority(r.priority)}
                </span>
              ),
            },
            {
              key:"status", header:"Estado",
              render:(r) => (
                <select
                  value={r.status}
                  onChange={(e) => setStatus(r.id, e.target.value)}
                  className="ord-status-select"
                >
                  <option value="confirmado">Confirmado</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="entregue">Entregue</option>
                </select>
              ),
            },
            {
              key:"actions", header:"Ações",
              render:(r) => (
                <div style={{ display:"flex", gap:8 }}>
                  <button className="ord-edit-btn" onClick={() => openEdit(r)}>Editar</button>
                  <button className="ord-del-btn" onClick={() => deleteOrder(r.id)}>Excluir</button>
                </div>
              ),
            },
          ]}
          rows={rows}
          emptyText="Nenhum pedido cadastrado."
        />
      </div>

      {/* ── modal ── */}
      <Modal
        open={open}
        title={editingId ? "Editar pedido" : "Cadastrar novo pedido"}
        onClose={() => { setOpen(false); resetModal(); }}
      >
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {!editingId && (
            <div>
              <label className="ord-label">ID do pedido (opcional)</label>
              <input className="ord-input" name="orderId" value={form.orderId} onChange={onChange} placeholder="Ex: PED-0001" />
              <p style={{ fontSize:12, color:"var(--text-3)", marginTop:6 }}>Se você deixar vazio, o sistema gera automaticamente.</p>
            </div>
          )}

          <div>
            <label className="ord-label">Nome do cliente</label>
            <input className="ord-input" name="customerName" value={form.customerName} onChange={onChange} placeholder="Ex: Maria Silva" />
          </div>

          <div>
            <label className="ord-label">Endereço</label>
            <input className="ord-input" name="deliveryAddress" value={form.deliveryAddress} onChange={onChange} placeholder="Ex: Rua X, 123" />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div>
              <label className="ord-label">Produto</label>
              <div style={{ position:"relative" }}>
                <select className="ord-select" name="productId" value={form.productId} onChange={onChange}>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (estoque: {p.stockQty})</option>
                  ))}
                </select>
                <svg style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"var(--text-3)" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
            <div>
              <label className="ord-label">Quantidade</label>
              <input type="number" min="1" className="ord-input" name="quantity" value={form.quantity} onChange={onChange} />
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div>
              <label className="ord-label">Prioridade</label>
              <div style={{ position:"relative" }}>
                <select className="ord-select" name="priority" value={form.priority} onChange={onChange}>
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
                <svg style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"var(--text-3)" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
            <div>
              <label className="ord-label">Estado</label>
              <div style={{ position:"relative" }}>
                <select className="ord-select" name="status" value={form.status} onChange={onChange}>
                  <option value="confirmado">Confirmado</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="entregue">Entregue</option>
                </select>
                <svg style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"var(--text-3)" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <button className="ord-save-btn" onClick={saveOrder}>
            <span>{editingId ? "Salvar alterações" : "Cadastrar pedido"}</span>
          </button>

          <p style={{ fontSize:12, color:"var(--text-3)", marginTop:-8 }}>
            Obs: ao criar/editar um pedido, o estoque do produto é ajustado automaticamente.
          </p>
        </div>
      </Modal>
    </div>
  );
}