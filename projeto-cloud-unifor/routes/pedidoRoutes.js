// routes/pedidoRoutes.js
import express from 'express';
import { z } from 'zod';
import supabase from '../config/supabase.js';
import { verificarToken, verificarAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * Schema de validação para pedidos
 */
const pedidoSchema = z.object({
  customerName: z.string().min(2),
  deliveryAddress: z.string().min(5),
  productId: z.string().uuid("ID do produto deve ser um UUID válido"),
  quantity: z.coerce.number().int().min(1),
  priority: z.enum(['baixa', 'media', 'alta']).default('media'),
  status: z.enum(['confirmado', 'em_andamento', 'entregue']).default('confirmado'),
});

/**
 * Mapeia os dados para o formato do Supabase
 */
function mapPedidoInsert(body, userId) {
  return {
    customerName: body.customerName,
    deliveryAddress: body.deliveryAddress,
    productId: body.productId,
    quantity: body.quantity,
    priority: body.priority ?? 'media',
    status: body.status ?? 'confirmado',
    user_id: userId, // Vínculo de isolamento
    createdAt: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(), // Nome real da coluna no seu banco
    deliveredAt: body.status === 'entregue' ? new Date().toISOString() : null,
  };
}

// GET /api/pedidos - LISTAGEM COM ISOLAMENTO
router.get('/', verificarToken, async (req, res) => {
  try {
    // Usamos req.user para bater com o seu authMiddleware
    const { id: userId, role } = req.user;

    // Buscamos o pedido e trazemos o nome do produto via join
    let query = supabase
      .from('pedidos')
      .select('*, produtos(nome)');

    // Se NÃO for admin, filtra apenas os pedidos do usuário logado
    if (role !== 'admin') {
      query = query.eq('user_id', userId);
    }

    const { data: pedidos, error } = await query.order('createdAt', { ascending: false });

    if (error) throw error;
    res.status(200).json(pedidos ?? []);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos', details: error.message });
  }
});

// POST /api/pedidos - CRIAÇÃO COM ATUALIZAÇÃO DE ESTOQUE
router.post('/', verificarToken, async (req, res) => {
  try {
    const validated = pedidoSchema.parse(req.body);
    const payload = mapPedidoInsert(validated, req.user.id);

    // 1) Busca o produto para checar estoque e preço
    const { data: produto, error: produtoError } = await supabase
      .from('produtos')
      .select('id, stockQty, unitPrice')
      .eq('id', payload.productId)
      .maybeSingle();

    if (produtoError) throw produtoError;
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado no estoque.' });

    // 2) Verifica se há estoque suficiente
    if (produto.stockQty < payload.quantity) {
      return res.status(422).json({ 
        error: `Estoque insuficiente. Disponível: ${produto.stockQty}` 
      });
    }

    // 3) Insere o pedido
    const { data: novoPedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert([payload])
      .select()
      .single();

    if (pedidoError) throw pedidoError;

    // 4) Deduz a quantidade do estoque do produto
    const novoEstoque = produto.stockQty - payload.quantity;
    const { error: estoqueError } = await supabase
      .from('produtos')
      .update({ 
        stockQty: novoEstoque, 
        atualizadoEm: new Date().toISOString() 
      })
      .eq('id', payload.productId);

    if (estoqueError) throw estoqueError;

    res.status(201).json({ pedido: novoPedido });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map(e => e.message) });
    }
    res.status(500).json({ error: 'Erro ao processar pedido', details: error.message });
  }
});

// PUT /api/pedidos/:id (atualiza status / prioridade / endereço etc.)
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const patchSchema = pedidoSchema.partial();
    const validated = patchSchema.parse(req.body);

    const patch = {
      ...validated,
      atualizadoEm: new Date().toISOString(),
    };
    if (validated.status === 'entregue') {
      patch.deliveredAt = new Date().toISOString();
    }

    let q = supabase.from('pedidos').update(patch).eq('id', id);
    if (req.user.role !== 'admin') q = q.eq('user_id', req.user.id);

    const { data, error } = await q.select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Pedido não encontrado.' });
    res.status(200).json({ pedido: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map(e => e.message) });
    }
    res.status(500).json({ error: 'Erro ao atualizar pedido', details: error.message });
  }
});

// DELETE /api/pedidos/:id
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    let q = supabase.from('pedidos').delete().eq('id', id);
    if (req.user.role !== 'admin') q = q.eq('user_id', req.user.id);

    const { data, error } = await q.select();
    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ error: 'Pedido não encontrado.' });
    res.status(200).json({ mensagem: 'Pedido removido.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover pedido', details: error.message });
  }
});

export default router;