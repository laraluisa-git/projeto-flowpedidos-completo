// routes/pedidoRoutes.js
import express from 'express';
import { z } from 'zod';
import supabase from '../config/supabase.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

const pedidoSchema = z.object({
  customerName: z.string().min(2),
  deliveryAddress: z.string().min(5),
  productId: z.string().uuid("ID do produto deve ser um UUID válido"),
  quantity: z.coerce.number().int().min(1),
  priority: z.enum(['baixa', 'media', 'alta']).default('media'),
  status: z.enum(['confirmado', 'em_andamento', 'entregue']).default('confirmado'),
});

function mapPedidoInsert(body, userId) {
  const agora = Date.now();
  return {
    cliente_nome: body.customerName,
    endereco_entrega: body.deliveryAddress,
    produto_id: body.productId,
    quantidade: body.quantity,
    priority: body.priority ?? 'media',
    status: body.status ?? 'confirmado',
    user_id: userId,
    criadoEm: agora,
    atualizadoEm: agora,
    entrega_em: body.status === 'entregue' ? agora : null,
  };
}

// GET /api/pedidos
router.get('/', verificarToken, async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    
    // Join com a tabela produtos (usando o nome da coluna que definimos no mapeamento)
    let query = supabase
      .from('pedidos')
      .select('*, produtos(nome)');

    if (role !== 'admin') {
      query = query.eq('user_id', userId);
    }

    const { data: pedidos, error } = await query.order('criadoEm', { ascending: false });

    if (error) throw error;

    // Mapeia snake_case (banco) para camelCase (frontend)
    const pedidosFormatados = (pedidos ?? []).map(p => ({
      id: p.id,
      customerName: p.cliente_nome,
      deliveryAddress: p.endereco_entrega,
      productId: p.produto_id,
      productName: p.produtos?.nome,
      quantity: p.quantidade,
      priority: p.priority,
      status: p.status,
      criadoEm: p.criadoEm,
      entregaEm: p.entrega_em
    }));

    res.status(200).json(pedidosFormatados);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos', details: error.message });
  }
});

// POST /api/pedidos - COM BAIXA DE ESTOQUE
router.post('/', verificarToken, async (req, res) => {
  try {
    const validated = pedidoSchema.parse(req.body);
    const payload = mapPedidoInsert(validated, req.user.id);

    // 1) Busca o produto (atenção aos nomes das colunas unit_price e stock_qty)
    const { data: produto, error: produtoError } = await supabase
      .from('produtos')
      .select('id, stock_qty, unit_price')
      .eq('id', payload.produto_id)
      .maybeSingle();

    if (produtoError) throw produtoError;
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado.' });

    // 2) Verifica estoque
    if (produto.stock_qty < payload.quantidade) {
      return res.status(422).json({ 
        error: `Estoque insuficiente. Disponível: ${produto.stock_qty}` 
      });
    }

    // 3) Insere o pedido
    const { data: novoPedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert([payload])
      .select()
      .single();

    if (pedidoError) throw pedidoError;

    // 4) Atualiza estoque do produto (snake_case)
    const { error: estoqueError } = await supabase
      .from('produtos')
      .update({ 
        stock_qty: produto.stock_qty - payload.quantidade, 
        atualizadoEm: Date.now() 
      })
      .eq('id', payload.produto_id);

    if (estoqueError) throw estoqueError;

    res.status(201).json({ pedido: novoPedido });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map(e => e.message) });
    }
    res.status(500).json({ error: 'Erro ao processar pedido', details: error.message });
  }
});

export default router;