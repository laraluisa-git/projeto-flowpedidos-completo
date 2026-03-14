# 📦 FlowPedidos — Sistema de Gerenciamento de Pedidos

O FlowPedidos é uma aplicação moderna voltada para o gerenciamento e fluxo de pedidos. O sistema foi desenvolvido para oferecer agilidade no acompanhamento de status, organização de itens e integração com banco de dados em tempo real.

---

## 🚀 Tecnologias Utilizadas

Este projeto utiliza o que há de mais moderno no ecossistema JavaScript para garantir performance e escalabilidade:

- **Frontend:** Vite.js + React 19 + JavaScript (ES6+)
- **Estilização:** Tailwind CSS (Design responsivo e utilitário)
- **Backend:** Node.js com Express 5
- **Banco de Dados & Autenticação:** Supabase (PostgreSQL)
- **Documentação da API:** Swagger UI (swagger-ui-express + swagger-jsdoc)
- **Qualidade de Código:** ESLint
- **Build Tool:** PostCSS + Vite

---

## 🛠️ Estrutura do Projeto

O repositório está organizado de forma modular para facilitar a manutenção:

```
/config         → Configurações de ambiente, Supabase e Swagger
/middlewares    → Funções intermediárias (autenticação JWT, validação de admin)
/public         → Ativos estáticos (imagens, ícones, etc.)
/routes         → Definição das rotas da API
/scripts        → Scripts utilitários (ex: geração de hash admin)
/src            → Código fonte do front-end (React)
/supabase       → Migrations e seed do banco de dados
server.js       → Ponto de entrada do servidor Node.js
```

---

## ⚙️ Como rodar localmente

### Pré-requisitos

- Node.js 20+
- Conta no [Supabase](https://supabase.com) com projeto criado

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais do Supabase:

```bash
cp .env.example .env
```

Edite o `.env`:

```env
PORT=3000
SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
SUPABASE_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
JWT_SECRET=crie_uma_string_aleatoria_aqui
```

> As chaves estão disponíveis em **Supabase → Project Settings → API**.

### 3. Configurar o banco de dados

No painel do Supabase, acesse **SQL Editor** e execute o conteúdo do arquivo:

```
supabase/migrations/20260224000000_supabase_schema.sql
```

### 4. Rodar o projeto

```bash
npm run dev
```

Isso inicia o **backend** (porta 3000) e o **frontend** (porta 5173) simultaneamente.

| Endereço | Descrição |
|---|---|
| `http://localhost:5173` | Interface web (React) |
| `http://localhost:3000/api/status` | Verificar se a API está rodando |
| `http://localhost:3000/api-docs` | Documentação interativa (Swagger) |

---

## 📖 Documentação da API (Swagger)

A documentação interativa da API está disponível em:

```
http://localhost:3000/api-docs
```

### Como autenticar no Swagger

Todas as rotas (exceto login e cadastro) exigem um token JWT. Siga os passos abaixo para autenticar:

**Passo 1 — Obter o token**

Na seção **Auth**, expanda o endpoint `POST /api/auth/login` e clique em **Try it out**. Preencha o body com as credenciais de teste:

```json
{
  "email": "admin@demo.com",
  "senha": "admin123"
}
```

Clique em **Execute** e copie o valor do campo `token` na resposta.

**Passo 2 — Autenticar**

Clique no botão 🔒 **Authorize** (canto superior direito da página do Swagger).

No campo **Value**, insira o token no formato:

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Clique em **Authorize** e depois em **Close**.

**Passo 3 — Testar os endpoints**

Agora todos os endpoints protegidos aceitarão suas requisições. O cadeado 🔒 aparecerá fechado nos endpoints autenticados.

---

### Rotas documentadas

| Grupo | Método | Rota | Descrição | Auth |
|---|---|---|---|---|
| **Auth** | POST | `/api/auth/login` | Autenticar usuário | ❌ |
| **Auth** | POST | `/api/auth/register` | Cadastrar novo usuário | ❌ |
| **Produtos** | GET | `/api/produtos` | Listar produtos | ✅ |
| **Produtos** | POST | `/api/produtos` | Cadastrar produto | ✅ |
| **Produtos** | PUT | `/api/produtos/{id}` | Atualizar produto | ✅ |
| **Produtos** | DELETE | `/api/produtos/{id}` | Remover produto | ✅ |
| **Pedidos** | GET | `/api/pedidos` | Listar pedidos | ✅ |
| **Pedidos** | POST | `/api/pedidos` | Criar pedido (deduz estoque) | ✅ |
| **Pedidos** | PUT | `/api/pedidos/{id}` | Atualizar pedido | ✅ |
| **Pedidos** | DELETE | `/api/pedidos/{id}` | Excluir pedido (estorna estoque) | ✅ |

---

## 🗄️ Banco de Dados

Para configurar o banco de dados, utilize o arquivo presente em `supabase/migrations/`. Copie o conteúdo e execute no **SQL Editor** do seu painel do Supabase para criar as tabelas e relacionamentos necessários.

### Tabelas

| Tabela | Descrição |
|---|---|
| `usuarios` | Usuários do sistema (com role `user` ou `admin`) |
| `produtos` | Catálogo de produtos com controle de estoque |
| `pedidos` | Pedidos vinculados a produtos e usuários |
| `membros_equipe` | Integrantes exibidos na página "Quem somos" |

---

## 📝 Funcionalidades

- [x] Criação e gerenciamento de pedidos
- [x] Listagem em tempo real
- [x] Atualização de status de pedidos
- [x] Controle de estoque com baixa automática
- [x] Login e controle de acesso por role (admin/user)
- [x] Documentação interativa da API (Swagger)
- [ ] Relatórios de vendas (em desenvolvimento)

---

## 💻 Detalhamento do Front-end

A interface foi concebida para ser uma Single Page Application (SPA) de alta performance, utilizando Vite.js para um build instantâneo e Tailwind CSS para um design responsivo.

### 1. Dashboard (Painel de Controle)
- **Visualização Centralizada:** Exibição clara de todos os pedidos ativos em uma grade dinâmica.
- **Métricas em Tempo Real:** Renderização de dados diretamente do banco de dados, exibindo número do pedido, identificação do cliente e carimbo de data/hora.
- **Cálculo Dinâmico:** O front-end processa os valores unitários e quantidades para exibir o valor total de cada pedido instantaneamente.

### 2. Gestão de Ciclo de Vida (Status)
- **Controle de Fluxo:** Interface para transição entre estados críticos como "Confirmado", "Em Andamento" e "Entregue".
- **Comunicação Assíncrona:** Requisições fetch para atualizar o banco de dados sem necessidade de recarregar a página.

### 3. Sistema de Cadastro Inteligente
- **Formulários Validados:** Lógica que impede campos vazios ou formatos inválidos antes do envio ao servidor.
- **UX Otimizada:** Interface de seleção de itens facilitada para acelerar a entrada de novos pedidos.

### 4. Integração Técnica e Segurança
- **Consumo de API:** GET automático ao carregar o componente para garantir dados sempre atualizados.
- **Tratamento de Exceções:** Feedback visual ao usuário em caso de falhas na rede ou erro no servidor.
- **Variáveis de Ambiente:** Sincronização segura com o Supabase através de arquivos `.env`, protegendo chaves sensíveis.

---

## 🔐 Acesso de teste

| Campo | Valor |
|---|---|
| Email | `admin@demo.com` |
| Senha | `admin123` |

> Este acesso possui perfil **admin** e visualiza todos os dados do sistema.

---

*© 2026 FlowPedidos. Projeto acadêmico — Grupo 8 · Análise e Desenvolvimento de Sistemas · Universidade de Fortaleza.*
