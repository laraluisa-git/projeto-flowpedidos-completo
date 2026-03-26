# 📦 FlowPedidos

Sistema de gerenciamento de pedidos com controle de estoque, autenticação JWT e dashboard em tempo real. Desenvolvido com React 19 no front-end e Node.js + Express no back-end, integrado ao Supabase (PostgreSQL).

**ACESSO AO SISTEMA:** https://projeto-flowpedidos.vercel.app/

---

## 🚀 Stack

| Camada | Tecnologia |
|---|---|
| **Front-end** | React 19, React Router v7, Recharts, Tailwind CSS v4, Vite 7 |
| **Back-end** | Node.js 20+, Express 5 |
| **Banco de dados** | Supabase (PostgreSQL) |
| **Autenticação** | JWT (`jsonwebtoken`) + bcrypt |
| **Validação** | Zod |
| **Deploy** | Docker + Render (CI/CD via GitHub Actions) |

---

## 📁 Estrutura do Projeto

```
projeto-flowpedidos/
├── config/                  # Clientes Supabase
├── middlewares/
│   └── authMiddleware.js    # Verificação JWT e controle de admin
├── routes/
│   ├── authRoutes.js        # Login e cadastro
│   ├── pedidoRoutes.js      # CRUD de pedidos + baixa/estorno de estoque
│   ├── produtoRoutes.js     # CRUD de produtos
│   ├── dashboardRoutes.js   # Métricas consolidadas
│   ├── auditRoutes.js       # Log de auditoria
│   └── membroRoutes.js      # Membros da equipe (página "Quem somos")
├── scripts/
│   └── generate_admin_hash.mjs  # Geração de hash para senha admin
├── src/
│   ├── auth/                # AuthContext e ProtectedRoute
│   ├── components/          # Layout, Sidebar, Card, Table, Modal
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Auth.jsx         # Login / Cadastro
│   │   ├── WhoWeAre.jsx
│   │   └── Dashboard/
│   │       ├── Overview.jsx   # Visão geral e métricas
│   │       ├── Orders.jsx     # Gerenciamento de pedidos
│   │       ├── Inventory.jsx  # Controle de estoque
│   │       ├── Status.jsx     # Acompanhamento de status
│   │       └── History.jsx    # Histórico e auditoria
│   └── services/            # Camada de acesso à API (fetch)
├── supabase/
│   ├── migrations/          # Schema SQL do banco
│   └── seed.sql
├── server.js                # Entry point do back-end
├── Dockerfile
└── .github/workflows/       # CI/CD para deploy no Render
```

---

## ⚙️ Instalação e execução local

### Pré-requisitos

- Node.js 20+
- Conta no [Supabase](https://supabase.com) com um projeto criado

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
PORT=3000
SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
SUPABASE_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
JWT_SECRET=crie_uma_string_aleatoria_aqui
```

> As chaves estão disponíveis em **Supabase → Project Settings → API**.  
> Use obrigatoriamente a `SERVICE_ROLE_KEY` no back-end — ela ignora as regras de RLS e permite que o servidor execute inserts/updates corretamente.

### 3. Criar o banco de dados

No painel do Supabase, abra o **SQL Editor** e execute o arquivo:

```
supabase/migrations/20260224000000_supabase_schema.sql
```

### 4. Rodar o projeto

```bash
npm run dev
```

O comando `dev` sobe o back-end e o front-end em paralelo via `concurrently`.

| URL | Descrição |
|---|---|
| `http://localhost:5173` | Aplicação React |
| `http://localhost:3000/api/status` | Health check da API |

---

## 🗄️ Banco de Dados

### Tabelas

| Tabela | Descrição |
|---|---|
| `usuarios` | Usuários com role `user` ou `admin`, senha armazenada como hash bcrypt |
| `produtos` | Catálogo com controle de estoque (`stock_qty`, `min_stock_qty`) e preço unitário |
| `pedidos` | Pedidos vinculados a produto e usuário; status: `confirmado`, `em_andamento`, `entregue` |
| `membros_equipe` | Integrantes exibidos na página "Quem somos" |
| `auditoria` | Log de ações do sistema (acessível via `/api/auditoria`) |

### Fluxo de estoque

- **Criação de pedido (`POST /api/pedidos`):** verifica disponibilidade e desconta `quantity` de `stock_qty`.
- **Atualização de quantidade (`PUT /api/pedidos/:id`):** calcula a diferença e ajusta o estoque proporcionalmente.
- **Exclusão de pedido (`DELETE /api/pedidos/:id`):** estorna a quantidade ao estoque do produto.

---

## 🔌 API

### Autenticação

Todas as rotas (exceto `/api/auth/*`) exigem o header:

```
Authorization: Bearer <token>
```

O token JWT é obtido via login e tem validade de **1 dia**. Tokens gerados no cadastro têm validade de **2 horas**.

### Endpoints

| Grupo | Método | Rota | Descrição | Auth |
|---|---|---|---|---|
| Auth | POST | `/api/auth/register` | Cadastrar usuário | ❌ |
| Auth | POST | `/api/auth/login` | Autenticar e receber token | ❌ |
| Produtos | GET | `/api/produtos` | Listar produtos | ✅ |
| Produtos | POST | `/api/produtos` | Cadastrar produto | ✅ |
| Produtos | PUT | `/api/produtos/:id` | Atualizar produto | ✅ |
| Produtos | DELETE | `/api/produtos/:id` | Remover produto | ✅ |
| Pedidos | GET | `/api/pedidos` | Listar pedidos (admin vê todos; user vê os próprios) | ✅ |
| Pedidos | POST | `/api/pedidos` | Criar pedido com baixa de estoque | ✅ |
| Pedidos | PUT | `/api/pedidos/:id` | Atualizar pedido com ajuste de estoque | ✅ |
| Pedidos | DELETE | `/api/pedidos/:id` | Excluir pedido com estorno de estoque | ✅ |
| Dashboard | GET | `/api/dashboard` | Métricas consolidadas (pedidos, estoque, valor) | ✅ |
| Auditoria | GET | `/api/auditoria` | Log de ações (últimas 200 entradas) | ✅ |
| Membros | GET | `/api/membros` | Listar membros da equipe | ✅ |

#### Exemplo: criar pedido

```json
POST /api/pedidos
{
  "customerName": "João Silva",
  "deliveryAddress": "Rua das Flores, 123",
  "productId": "uuid-do-produto",
  "quantity": 2,
  "priority": "alta",
  "status": "confirmado"
}
```

Retorna `422` se o estoque for insuficiente.

#### Exemplo: login

```json
POST /api/auth/login
{
  "email": "admin@demo.com",
  "senha": "admin123"
}
```

Resposta:
```json
{
  "token": "eyJhbGci...",
  "usuario": { "id": "...", "name": "Admin", "email": "admin@demo.com", "role": "admin" }
}
```

> Os campos `email`/`senha` também são aceitos em inglês (`email`/`password`). O mesmo vale para o cadastro (`name`/`nome`, `address`/`endereco`, etc.).

---

## 🖥️ Front-end

A SPA possui as seguintes páginas:

| Rota | Componente | Acesso |
|---|---|---|
| `/` | Home | Público |
| `/login` | Auth (login/cadastro) | Público |
| `/quem-somos` | WhoWeAre | Público |
| `/dashboard` | Overview | 🔒 Autenticado |
| `/dashboard/pedidos` | Orders | 🔒 Autenticado |
| `/dashboard/estoque` | Inventory | 🔒 Autenticado |
| `/dashboard/status` | Status | 🔒 Autenticado |
| `/dashboard/historico` | History | 🔒 Autenticado |

Rotas do dashboard são protegidas por `ProtectedRoute`, que verifica o `AuthContext`. Qualquer rota não mapeada redireciona para `/`.

---

## 🐳 Docker

Para rodar apenas o back-end em container:

```bash
docker build -t flowpedidos-api .
docker run -p 3000:3000 --env-file .env flowpedidos-api
```

A imagem usa `node:20-alpine` e instala apenas dependências de produção (`npm install --production`).

---

## 🚢 Deploy (CI/CD)

O repositório inclui um workflow em `.github/workflows/deploy-backend.yml` que:

1. Em qualquer push para `main`: instala dependências e valida o build.
2. Aciona o deploy no **Render** apenas quando a mensagem do commit contém `api-` (convenção para identificar PRs de back-end).

Variáveis necessárias no GitHub Actions:

| Secret | Descrição |
|---|---|
| `RENDER_SERVICE_ID` | ID do serviço no Render |
| `RENDER_API_KEY` | Chave de API do Render |

---

## 🔐 Acesso de teste

| Campo | Valor |
|---|---|
| Email | `admin@demo.com` |
| Senha | `admin123` |

Este acesso possui role `admin` e visualiza todos os pedidos, produtos e logs de auditoria do sistema.

---

## 📝 Funcionalidades

- [x] Autenticação JWT com roles (`admin` / `user`)
- [x] CRUD completo de pedidos com baixa/estorno automático de estoque
- [x] CRUD de produtos com controle de estoque mínimo
- [x] Dashboard com métricas em tempo real
- [x] Log de auditoria de ações
- [x] Validação de entrada com Zod
- [x] CI/CD com GitHub Actions + deploy no Render
- [x] Containerização via Docker
- [ ] Relatórios de vendas (em desenvolvimento)

---

## 🌐 Acesse online

| | URL |
|---|---|
| **Sistema** | https://projeto-flowpedidos.vercel.app/ |

---

*© 2026 FlowPedidos — Projeto acadêmico · Grupo 8 · Análise e Desenvolvimento de Sistemas · Universidade de Fortaleza.*
