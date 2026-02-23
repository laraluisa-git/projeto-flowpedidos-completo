const KEY = "flowpedidos_db_v1";

const seed = {
  users: [
    {
      id: "u_admin",
      name: "Admin",
      email: "admin@demo.com",
      password: "admin123",
      address: "Rua Exemplo, 123",
      accountType: "empresa",
      companyName: "FlowPedidos LTDA",
      role: "admin",
    },
  ],
  products: [
    { id: "p1", name: "Cadeira", category: "moveis", stockQty: 12, minStockQty: 5, unitPrice: 199.9, isActive: true },
    { id: "p2", name: "Detergente", category: "limpeza", stockQty: 3, minStockQty: 5, unitPrice: 6.5, isActive: true },
  ],
  orders: [
    {
      id: "o1",
      customerName: "Maria",
      deliveryAddress: "Av. Central, 1000",
      productId: "p1",
      quantity: 1,
      priority: "media",
      status: "confirmado",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      deliveredAt: null,
    },
    {
      id: "o2",
      customerName: "João",
      deliveryAddress: "Rua das Flores, 45",
      productId: "p2",
      quantity: 4,
      priority: "alta",
      status: "em_andamento",
      createdAt: Date.now() - 1000 * 60 * 60 * 10,
      deliveredAt: null,
    },
  ],
  teamMembers: [
    { id: "t1", name: "Aluno 1", role: "Front-end", links: "" },
    { id: "t2", name: "Aluno 2", role: "Banco/Modelagem", links: "" },
  ],
  audit: [], // histórico (log)
};

function load() {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return structuredClone(seed);
  }
  return JSON.parse(raw);
}
function save(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}
function uid(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}
function log(db, action, entity, entityId, details) {
  db.audit.unshift({
    id: uid("a"),
    at: Date.now(),
    action,
    entity,
    entityId,
    details,
  });
  db.audit = db.audit.slice(0, 200);
}

export const DB = {
  read: () => load(),
  write: (mutator) => {
    const db = load();
    const next = mutator(db, (action, entity, entityId, details) =>
      log(db, action, entity, entityId, details)
    ) ?? db;
    save(next);
    return next;
  },
  uid,
};