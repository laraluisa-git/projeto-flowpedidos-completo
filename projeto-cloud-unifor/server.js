// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import produtoRoutes from './routes/produtoRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';
import membroRoutes from './routes/membroRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();

// =========================
// Middlewares
// =========================
app.use(cors());
app.use(express.json());

// =========================
// Rotas API
// =========================
app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/membros', membroRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/status', (req, res) => {
  res.json({ status: 'success', message: 'API rodando!' });
});

// =========================
// Servir build do frontend
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

app.use(express.static(distPath));

// Catch-all SPA (NÃO intercepta /api)
app.get(/^\/(?!api).*/, (req, res) => {
  return res.sendFile(path.join(distPath, 'index.html'));
});

// =========================
// Inicialização do servidor
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});