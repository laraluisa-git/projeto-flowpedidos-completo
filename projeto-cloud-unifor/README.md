# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## Backend + Supabase (integração sem mexer no código do Front)

### O que foi ajustado
- As rotas do backend agora aceitam os mesmos campos que o Front usa (ex.: `name`, `category`, etc).
- O middleware de auth está em **modo demo**: se não vier `Authorization`, ele deixa passar como admin (porque o Front atual não envia token).
- Foi adicionado proxy do Vite para `/api` → `http://localhost:3000`.
- Foi removido um erro que quebrava `/api/pedidos` (restos de `[cite, ...]`).

### Como rodar (dev)
1) Crie `.env` a partir de `.env.example` e preencha suas chaves do Supabase.
2) Instale dependências:
```bash
npm install
```
3) Rode front + back juntos:
```bash
npm run dev
```

### Criar o banco no Supabase
- Abra o Supabase → **SQL Editor** → cole e execute `supabase_schema.sql`.
- Para gerar o hash do admin:
```bash
node scripts/generate_admin_hash.mjs admin123
```
Depois, insira o usuário admin na tabela `usuarios` com esse hash.

> Observação: o Front atual ainda usa **localStorage** e não chama a API.  
> O backend está pronto/compatível para integrar depois, sem quebrar o que já funciona no Front.
