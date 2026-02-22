// routes/dashboardRoutes.js
import express from 'express';
import supabase from '../config/supabase.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /dashboard - Retorna as estatísticas unificadas para a tela inicial
router.get('/', verificarToken, async (req, res) => {
  try {
    // 1. Busca todos os produtos para fazer os cálculos financeiros e de estoque
    const { data: produtos, error: erroProdutos } = await supabase
      .from('produtos')
      .select('*');

    if (erroProdutos) throw erroProdutos;

    // Lógica matemática do Dashboard
    const totalProdutos = produtos.length;
    
    // Soma o (preço * quantidade) de todos os itens usando o .reduce() do JavaScript
    const somaEstoque = produtos.reduce((acc, prod) => acc + (prod.stockQty * prod.unitPrice), 0);
    const valorTotalEstoque = Number(somaEstoque.toFixed(2));
    
    // Filtra apenas os produtos onde a quantidade atual é menor que o estoque mínimo
    const produtosBaixoEstoque = produtos.filter(prod => prod.stockQty < prod.minStockQty).length;

    // 2. Conta quantos pedidos ainda não foram entregues
    const { count: pedidosPendentes, error: erroPedidosCount } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'entregue'); // .neq significa "Not Equal" (Diferente de)

    if (erroPedidosCount) throw erroPedidosCount;

    // 3. Busca apenas os 5 pedidos mais recentes para a tabelinha inicial
    const { data: ultimosPedidos, error: erroUltimos } = await supabase
      .from('pedidos')
      .select('*, produto:produtos(nome)')
      .order('createdAt', { ascending: false })
      .limit(5);

    if (erroUltimos) throw erroUltimos;

    // 4. Devolve tudo empacotado em um JSON perfeito para os gráficos da Lara
    res.status(200).json({
      estatisticas: {
        totalProdutos,
        valorTotalEstoque,
        produtosBaixoEstoque,
        pedidosPendentes
      },
      ultimosPedidos
    });

  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar dashboard', details: error.message });
  }
});

export default router;