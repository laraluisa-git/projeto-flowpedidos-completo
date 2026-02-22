-- Supabase schema para o FlowPedidos (compatível com o Front desta pasta)
-- Observação: IDs são TEXT (o Front usa "p1", "o1", etc.)

-- Opcional: habilitar extensão para gen_random_uuid caso você prefira UUID em outro projeto
-- create extension if not exists pgcrypto;

create table if not exists usuarios (
  id text primary key,
  nome text not null,
  email text unique not null,
  "senhaHash" text not null,
  endereco text not null,
  "tipoConta" text not null check ("tipoConta" in ('pf','empresa')),
  "nomeEmpresa" text not null default '',
  role text not null default 'user',
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create table if not exists produtos (
  id text primary key,
  nome text not null,
  categoria text not null,
  "stockQty" integer not null default 0,
  "minStockQty" integer not null default 5,
  "unitPrice" numeric not null default 0,
  "isActive" boolean not null default true,
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint,
  "updatedAt" bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create table if not exists pedidos (
  id text primary key,
  "customerName" text not null,
  "deliveryAddress" text not null,
  "productId" text not null references produtos(id) on update cascade,
  quantity integer not null check (quantity > 0),
  priority text not null default 'media' check (priority in ('baixa','media','alta')),
  status text not null default 'confirmado' check (status in ('confirmado','em_andamento','entregue')),
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint,
  "deliveredAt" bigint null,
  "updatedAt" bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create index if not exists pedidos_createdat_idx on pedidos("createdAt" desc);

create table if not exists membros_equipe (
  id text primary key,
  nome text not null,
  funcao text not null,
  links text not null default '',
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint
);

-- Seed (ADMIN + exemplos do front)
-- Senha do admin no front: admin123
-- Gere o hash com bcrypt e substitua abaixo, ou use o script de seed que eu deixei no README.
-- Aqui vai um hash bcrypt de exemplo para "admin123" (pode variar):
-- $2a$10$5KQm8t8a6X0e4tFZr3LkOeG5pK4c3h0W8cQ1rC5xTzKxvZb5xgEoW
-- Recomendo gerar novamente no seu ambiente.

