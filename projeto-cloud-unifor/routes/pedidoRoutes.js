// routes/pedidoRoutes.js
import express from 'express';
import { z } from 'zod';
import supabase from '../config/supabase.js';
import { verificarToken, verificarAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * Front-end usa orders:
 *  { id, customerName, deliveryAddress, productId, quantity, priority, status, createdAt, deliveredAt }
 *
 * IDs no front não são UUID. No Supabase schema deste projeto usamos TEXT como PK.
 */
const pedidoSchema = z.object({
  customerName: z.string().min(2),
  deliveryAddress: z.string().min(5),
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  priority: z.enum(['baixa', 'media', 'alta']).default('media'),
  status: z.enum(['confirmado', 'em_andamento', 'entregue']).default('confirmado'),
});

function mapPedidoInsert(body) {
  const createdAt = body.createdAt ?? Date.now();
  const status = body.status ?? 'confirmado';
  const deliveredAt = status === 'entregue'
    ? (body.deliveredAt ?? Date.now())
    : null;

  return {
    id: body.id ?? `o_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`,
    customerName: body.customerName,
    deliveryAddress: body.deliveryAddress,
    productId: body.productId,
    quantity: body.quantity,
    priority: body.priority ?? 'media',
    status,
    createdAt,
    deliveredAt,
    updatedAt: Date.now(),
  };
}

// GET /api/pedidos
router.get('/', verificarToken, async (req, res) => {
  try {
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    res.status(200).json(pedidos ?? []);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos', details: error.message });
  }
});

// POST /api/pedidos (admin)
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const validated = pedidoSchema.parse(req.body);
    const payload = mapPedidoInsert(req.body);

    // 1) checa estoque
    const { data: produto, error: produtoError } = await supabase
      .from('produtos')
      .select('id, stockQty')
      .eq('id', payload.productId)
      .maybeSingle();

    if (produtoError) throw produtoError;
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado.' });

    if (produto.stockQty < payload.quantity) {
      return res.status(422).json({ error: 'Estoque insuficiente para a quantidade solicitada.' });
    }

    // 2) cria pedido
    const { data: novoPedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert([payload])
      .select()
      .single();

    if (pedidoError) throw pedidoError;

    // 3) deduz estoque
    const novoEstoque = produto.stockQty - payload.quantity;
    const { error: estoqueError } = await supabase
      .from('produtos')
      .update({ stockQty: novoEstoque, updatedAt: Date.now() })
      .eq('id', payload.productId);

    if (estoqueError) throw estoqueError;

    res.status(201).json({ pedido: novoPedido });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map(e => e.message) });
    }
    res.status(500).json({ error: 'Erro ao criar pedido', details: error.message });
  }
});

// PUT /api/pedidos/:id (admin)
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const editarSchema = pedidoSchema.partial();
    const validated = editarSchema.parse(req.body);

    const { data: pedidoAntigo, error: erroBusca } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (erroBusca) throw erroBusca;
    if (!pedidoAntigo) return res.status(404).json({ error: 'Pedido não encontrado.' });

    const oldProductId = pedidoAntigo.productId;
    const oldQuantity = pedidoAntigo.quantity;
    const newProductId = validated.productId ?? oldProductId;
    const newQuantity = validated.quantity ?? oldQuantity;

    // reajuste de estoque se produto/quantidade mudaram
    if (oldProductId !== newProductId || oldQuantity !== newQuantity) {
      // devolve no antigo
      const { data: oldProduct, error: oldErr } = await supabase
        .from('produtos').select('stockQty').eq('id', oldProductId).maybeSingle();
      if (oldErr) throw oldErr;
      if (oldProduct) {
        await supabase.from('produtos').update({ stockQty: oldProduct.stockQty + oldQuantity, updatedAt: Date.now() }).eq('id', oldProductId);
      }

      // checa no novo
      const { data: newProduct, error: newErr } = await supabase
        .from('produtos').select('stockQty').eq('id', newProductId).maybeSingle();
      if (newErr) throw newErr;
      if (!newProduct) return res.status(404).json({ error: 'Novo produto não encontrado.' });

      if (newProduct.stockQty < newQuantity) {
        // desfaz devolução
        if (oldProduct) {
          await supabase.from('produtos').update({ stockQty: oldProduct.stockQty, updatedAt: Date.now() }).eq('id', oldProductId);
        }
        return res.status(422).json({ error: 'Estoque insuficiente para a nova quantidade/produto.' });
      }

      await supabase.from('produtos').update({ stockQty: newProduct.stockQty - newQuantity, updatedAt: Date.now() }).eq('id', newProductId);
    }

    // deliveredAt coerente
    const patch = { ...validated, updatedAt: Date.now() };
    if (validated.status) {
      patch.deliveredAt = validated.status === 'entregue' ? Date.now() : null;
    }

    const { data: pedidoAtualizado, error } = await supabase
      .from('pedidos')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ pedido: pedidoAtualizado });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues.map(e => e.message) });
    res.status(500).json({ error: 'Erro ao editar pedido', details: error.message });
  }
});

// PATCH /api/pedidos/:id/status (admin)
const statusSchema = z.object({ status: z.enum(['confirmado', 'em_andamento', 'entregue']) });

router.patch('/:id/status', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = statusSchema.parse(req.body);

    const deliveredAt = status === 'entregue' ? Date.now() : null;

    const { data: pedidoAtualizado, error } = await supabase
      .from('pedidos')
      .update({ status, deliveredAt, updatedAt: Date.now() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!pedidoAtualizado) return res.status(404).json({ error: 'Pedido não encontrado.' });

    res.status(200).json({ pedido: pedidoAtualizado });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues.map(e => e.message) });
    res.status(500).json({ error: 'Erro ao atualizar status', details: error.message });
  }
});

// DELETE /api/pedidos/:id (admin)
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: pedido, error: erroBusca } = await supabase
      .from('pedidos')
      .select('productId, quantity')
      .eq('id', id)
      .maybeSingle();

    if (erroBusca) throw erroBusca;
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });

    const { error: erroDelete } = await supabase.from('pedidos').delete().eq('id', id);
    if (erroDelete) throw erroDelete;

    const { data: produto, error: prodErr } = await supabase
      .from('produtos').select('stockQty').eq('id', pedido.productId).maybeSingle();
    if (prodErr) throw prodErr;

    if (produto) {
      await supabase
        .from('produtos')
        .update({ stockQty: produto.stockQty + pedido.quantity, updatedAt: Date.now() })
        .eq('id', pedido.productId);
    }

    res.status(200).json({ mensagem: 'Pedido excluído.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir pedido', details: error.message });
  }
});

export default router;
