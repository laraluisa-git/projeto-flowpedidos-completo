import React, { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import { listProducts, createProduct, updateProduct, deleteProduct as apiDeleteProduct } from "../../services/productService";
import { listOrders } from "../../services/orderService";

function money(n) {
  return (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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

export default function Inventory() {
  const [refresh, setRefresh] = useState(0);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState("todos");

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  async function loadAll() {
    setLoading(true);
    try {
      const [p, o] = await Promise.all([listProducts(), listOrders()]);
      setProducts(p);
      setOrders(o ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll().catch((e) => alert(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["todos", ...Array.from(set).sort()];
  }, [products]);

  const labelCategory = (c) => (c === "todos" ? "Todos" : c);

  const filtered = useMemo(() => {
    if (filterCategory === "todos") return products;
    return products.filter((p) => p.category === filterCategory);
  }, [products, filterCategory]);

  const totalProducts = products.filter((p) => p.isActive).length;
  const lowStockCount = products.filter((p) => p.isActive && p.stockQty <= p.minStockQty).length;
  const totalQty = products.reduce((acc, p) => acc + (p.stockQty || 0), 0);
  const totalValue = products.reduce((acc, p) => acc + (p.stockQty || 0) * (p.unitPrice || 0), 0);

  const defaultForm = { productId: "", name: "", category: "", stockQty: 0, minStockQty: 5, unitPrice: 0, isActive: true };
  const [form, setForm] = useState(defaultForm);

  function resetModal() { setEditingId(null); setForm(defaultForm); }
  function openCreate() { resetModal(); setOpen(true); }
  function openEdit(p) {
    setEditingId(p.id);
    setForm({ name: p.name, category: p.category, stockQty: p.stockQty, minStockQty: p.minStockQty, unitPrice: p.unitPrice, isActive: !!p.isActive });
    setOpen(true);
  }

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      if (type === "checkbox") return { ...prev, [name]: checked };
      if (["stockQty", "minStockQty", "unitPrice"].includes(name)) return { ...prev, [name]: Number(value) };
      return { ...prev, [name]: value };
    });
  }

  function saveProduct() {
    if (!form.name || !form.category) { alert("Preencha nome e categoria."); return; }
    if (form.stockQty < 0 || form.minStockQty < 0 || form.unitPrice < 0) { alert("Valores não podem ser negativos."); return; }

    const payload = {
      name: form.name,
      category: form.category,
      stockQty: form.stockQty,
      minStockQty: form.minStockQty,
      unitPrice: form.unitPrice,
      isActive: form.isActive,
    };

    (async () => {
      try {
        if (!editingId) {
          await createProduct(payload);
        } else {
          await updateProduct(editingId, payload);
        }
        setOpen(false);
        resetModal();
        setRefresh((n) => n + 1);
      } catch (e) {
        alert(e.message);
      }
    })();
  }

  function deleteProduct(id) {
    const used = orders.some((o) => o.productId === id);
    if (used) { alert("Não é possível excluir: existe pedido vinculado a este produto. Você pode desativar o produto (ativo=false)."); return; }
    const ok = confirm("Deseja excluir este produto?");
    if (!ok) return;
    (async () => {
      try {
        await apiDeleteProduct(id);
        setRefresh((n) => n + 1);
      } catch (e) {
        alert(e.message);
      }
    })();
  }

  return (
    <div translate="no" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
        :root {
          --blue-700:#1a3a9e; --blue-600:#2350d8; --blue-500:#3b6ef5;
          --blue-400:#6390f9; --blue-100:#dce9ff; --blue-50:#eef4ff;
          --surface:#fff; --bg:#f5f7fc;
          --text-1:#0e1726; --text-2:#4a5568; --text-3:#718096;
          --border:rgba(59,110,245,.14);
        }
        .inv-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 18px; border-radius: 10px;
          border: 1px solid var(--border); background: var(--surface);
          font-size: 13px; font-weight: 600; font-family: inherit;
          color: var(--blue-600); cursor: pointer;
          transition: background .18s, transform .18s, box-shadow .18s;
        }
        .inv-btn:hover { background: var(--blue-50); transform: translateY(-1px); box-shadow: 0 2px 12px rgba(59,110,245,.1); }
        .inv-btn:active { transform: translateY(0); }

        .inv-btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 18px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, var(--blue-600), var(--blue-500));
          color: #fff; font-size: 13px; font-weight: 600; font-family: inherit;
          cursor: pointer; box-shadow: 0 4px 16px rgba(59,110,245,.3);
          transition: transform .2s, box-shadow .2s;
        }
        .inv-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(59,110,245,.4); }
        .inv-btn-primary:active { transform: translateY(0); }

        .inv-filter-btn {
          padding: 8px 16px; border-radius: 99px;
          font-size: 12px; font-weight: 600; font-family: inherit;
          cursor: pointer; border: 1px solid var(--border);
          transition: background .18s, transform .18s, color .18s, border-color .18s;
        }
        .inv-filter-btn:hover { transform: translateY(-1px); }

        .inv-edit-btn {
          padding: 6px 14px; border-radius: 8px;
          border: 1px solid var(--border); background: var(--bg);
          font-size: 12px; font-weight: 600; font-family: inherit;
          color: var(--text-2); cursor: pointer;
          transition: background .18s, transform .18s;
        }
        .inv-edit-btn:hover { background: var(--blue-50); color: var(--blue-600); transform: translateY(-1px); }

        .inv-del-btn {
          padding: 6px 14px; border-radius: 8px;
          border: 1px solid rgba(220,38,38,.2); background: rgba(254,242,242,1);
          font-size: 12px; font-weight: 600; font-family: inherit;
          color: #b91c1c; cursor: pointer;
          transition: background .18s, transform .18s;
        }
        .inv-del-btn:hover { background: #fee2e2; transform: translateY(-1px); }

        .inv-input {
          width: 100%; border-radius: 12px;
          border: 1px solid var(--border); background: var(--bg);
          padding: 11px 14px; font-size: 14px; font-family: inherit;
          color: var(--text-1); outline: none;
          transition: border-color .2s, box-shadow .2s; box-sizing: border-box;
        }
        .inv-input:focus { border-color: var(--blue-500); box-shadow: 0 0 0 3px rgba(59,110,245,.12); }
        .inv-input::placeholder { color: var(--text-3); }
        .inv-label { display: block; font-size: 12px; font-weight: 600; color: var(--text-2); margin-bottom: 6px; letter-spacing:.02em; }

        .inv-save-btn {
          width: 100%; padding: 13px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, var(--blue-600), var(--blue-500));
          color: #fff; font-size: 14px; font-weight: 600; font-family: inherit;
          cursor: pointer; box-shadow: 0 4px 20px rgba(59,110,245,.3);
          transition: transform .2s, box-shadow .2s; margin-top: 8px;
        }
        .inv-save-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(59,110,245,.4); }
        .inv-save-btn:active { transform: translateY(0); }
      `}</style>

      {/* ── header ── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--blue-600)", marginBottom: 4 }}>Produtos</p>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(20px,3vw,26px)", color: "var(--text-1)", letterSpacing: "-.02em" }}>Estoque</h1>
          <p style={{ marginTop: 4, fontSize: 13.5, color: "var(--text-3)" }}>Cadastre produtos e acompanhe quantidades e valores.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="inv-btn" onClick={() => setRefresh((n) => n + 1)}>
            <IconRefresh /> <span>Atualizar</span>
          </button>
          <button className="inv-btn-primary" onClick={openCreate}>
            <IconPlus /> <span>Cadastrar produto</span>
          </button>
        </div>
      </div>

      {/* ── cards ── */}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
        <Card title="Estoque baixo" value={lowStockCount} subtitle="Qtd de categorias abaixo do mínimo" />
        <Card title="Total de Produtos" value={totalQty} subtitle="Qtd total de todas as categorias" />
        <Card title="Valor de Estoque" value={money(totalValue)} subtitle="Valor total investido em reais" highlight />
        <Card title="Categorias" value={categories.length - 1} subtitle="Tipos cadastrados" />
        <Card title="Atenção" subtitle="Um produto será considerado com estoque baixo quando estiver abaixo do mínimo (padrão: 5 itens)." />
      </div>

      {/* ── filter + table ── */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(59,110,245,.07)" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", marginBottom: 12 }}>Filtro por tipo de produto</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {categories.map((c) => (
            <button
              key={c}
              className="inv-filter-btn"
              onClick={() => setFilterCategory(c)}
              style={{
                background: filterCategory === c ? "var(--blue-50)" : "var(--surface)",
                color: filterCategory === c ? "var(--blue-600)" : "var(--text-2)",
                borderColor: filterCategory === c ? "rgba(59,110,245,.3)" : "var(--border)",
              }}
            >
              {labelCategory(c)}
            </button>
          ))}
        </div>

        <Table
          columns={[
            { key: "id", header: "ID" },
            { key: "name", header: "Produto" },
            { key: "category", header: "Categoria" },
            { key: "stockQty", header: "Estoque" },
            { key: "unitPrice", header: "Valor", render: (r) => money(r.unitPrice) },
            { key: "minStockQty", header: "Mínimo" },
            {
              key: "isActive", header: "Ativo",
              render: (r) => (
                <span style={{
                  display: "inline-flex", padding: "3px 10px", borderRadius: 99,
                  fontSize: 11, fontWeight: 700,
                  background: r.isActive ? "rgba(34,197,94,.08)" : "rgba(113,128,150,.08)",
                  color: r.isActive ? "#15803d" : "#718096",
                  border: r.isActive ? "1px solid rgba(34,197,94,.2)" : "1px solid rgba(113,128,150,.2)",
                }}>
                  {r.isActive ? "Sim" : "Não"}
                </span>
              ),
            },
            {
              key: "actions", header: "Ações",
              render: (r) => (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="inv-edit-btn" onClick={() => openEdit(r)}>Editar</button>
                  <button className="inv-del-btn" onClick={() => deleteProduct(r.id)}>Excluir</button>
                </div>
              ),
            },
          ]}
          rows={filtered}
          emptyText="Nenhum produto nesta categoria."
        />
      </div>

      {/* ── modal ── */}
      <Modal open={open} title={editingId ? "Editar produto" : "Cadastrar novo produto"} onClose={() => { setOpen(false); resetModal(); }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!editingId && (
            <div>
              <label className="inv-label">ID do produto (opcional)</label>
              <input className="inv-input" name="productId" value={form.productId} onChange={onChange} placeholder="Ex: PROD-001" />
              <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>Se deixar vazio, o sistema gera automaticamente.</p>
            </div>
          )}
          <div>
            <label className="inv-label">Produto</label>
            <input className="inv-input" name="name" value={form.name} onChange={onChange} placeholder="Ex: Cadeira" />
          </div>
          <div>
            <label className="inv-label">Categoria / Tipo</label>
            <input className="inv-input" name="category" value={form.category} onChange={onChange} placeholder="Ex: moveis, limpeza..." />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label className="inv-label">Quantidade em estoque</label>
              <input type="number" min="0" className="inv-input" name="stockQty" value={form.stockQty} onChange={onChange} />
            </div>
            <div>
              <label className="inv-label">Estoque mínimo</label>
              <input type="number" min="0" className="inv-input" name="minStockQty" value={form.minStockQty} onChange={onChange} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label className="inv-label">Valor unitário (R$)</label>
              <input type="number" step="0.01" min="0" className="inv-input" name="unitPrice" value={form.unitPrice} onChange={onChange} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 28 }}>
              <input id="isActive" type="checkbox" name="isActive" checked={form.isActive} onChange={onChange} style={{ width: 16, height: 16, accentColor: "var(--blue-500)", cursor: "pointer" }} />
              <label htmlFor="isActive" style={{ fontSize: 14, color: "var(--text-2)", cursor: "pointer", fontWeight: 500 }}>Produto ativo</label>
            </div>
          </div>
          <button className="inv-save-btn" onClick={saveProduct}>
            <span>{editingId ? "Salvar alterações" : "Cadastrar produto"}</span>
          </button>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: -8 }}>
            Dica: se não puder excluir por existir pedido vinculado, desative o produto (ativo = não).
          </p>
        </div>
      </Modal>
    </div>
  );
}