# FlowPedidos — Sistema de Gestão com Isolamento de Dados

Plataforma de gestão de pedidos e estoque desenvolvida com **React + Vite** no frontend e **Node.js + Supabase** no backend.

---

## 🚀 Funcionalidades Principais

- **Isolamento de Dados (Multi-tenancy):** Cada usuário possui sua própria gestão individual de produtos e pedidos — um usuário nunca acessa os dados de outro.
- **Gestão de Estoque em Tempo Real:** A criação de pedidos valida a disponibilidade e abate automaticamente a quantidade do estoque.
- **Níveis de Acesso (RBAC):**
  - **User:** Gerencia apenas seus próprios dados.
  - **Admin:** Possui visão global de todos os produtos e pedidos da plataforma.
- **Dashboard Dinâmico:** Métricas financeiras e de volume calculadas em tempo real com base no perfil do usuário logado.

---

## 🛠️ Tecnologias

| Camada   | Tecnologias                                       |
| -------- | ------------------------------------------------- |
| Backend  | Node.js, Express, Supabase (PostgreSQL), Zod, JWT |
| Frontend | React, Vite, Tailwind CSS                         |

---

## 🏁 Como Rodar o Projeto

### 1. Configuração do Ambiente

Renomeie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

Variáveis necessárias no `.env`:

```env
SUPABASE_URL=sua_url_aqui
SUPABASE_KEY=sua_chave_aqui
JWT_SECRET=seu_segredo_aqui
```

### 2. Instalação

```bash
npm install
```

### 3. Execução (Dev)

```bash
npm run dev
```

> O comando iniciará o backend (porta **3000**) e o frontend (porta **5173**) simultaneamente.

---

## 📊 Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas no Supabase:

| Tabela           | Descrição                                                      |
| ---------------- | -------------------------------------------------------------- |
| `usuarios`       | Cadastro de perfis e roles.                                    |
| `produtos`       | Inventário individualizado por `user_id`.                      |
| `pedidos`        | Histórico de vendas com vínculo ao produto e ao dono da conta. |
| `membros_equipe` | Listagem institucional da equipe.                              |
