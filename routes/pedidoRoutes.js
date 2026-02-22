// routes/pedidoRoutes.js
import express from 'express';
import { z } from 'zod';
import supabase from '../config/supabase.js';
import { verificarToken, verificarAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Esquema de validação para Criar Pedido
const pedidoSchema = z.object({
  customerName: z.string().min(2, { message: 'Nome do cliente é obrigatório' }),
  deliveryAddress: z.string().min(5, { message: 'Endereço de entrega é obrigatório' }),
  productId: z.string().uuid({ message: 'ID do produto inválido' }),
  quantity: z.number().int().min(1, { message: 'A quantidade deve ser maior que zero' }),
  priority: z.enum(['baixa', 'media', 'alta']).default('media'),
  status: z.enum(['confirmado', 'em_andamento', 'entregue']).default('confirmado')
});

// GET /pedidos - Lista todos os pedidos 
router.get('/', verificarToken, async (req, res) => {
  try {
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('*, produto:produtos(nome)') // Traz o nome do produto junto com o pedido
      .order('createdAt', { ascending: false });

    if (error) throw error;
    res.status(200).json(pedidos); [cite, 92]
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos', details: error.message });
  }
});

// POST /pedidos - Cria novo pedido e deduz estoque 
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const validatedData = pedidoSchema.parse(req.body);

    // 1. Busca o produto para verificar se ele existe e checar o estoque atual
    const { data: produto, error: produtoError } = await supabase
      .from('produtos')
      .select('stockQty')
      .eq('id', validatedData.productId)
      .single();

    if (produtoError || !produto) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    // 2. Regra de Negócio: Bloquear se estoque for insuficiente [cite: 98, 157]
    if (produto.stockQty < validatedData.quantity) {
      return res.status(422).json({ error: 'Estoque insuficiente para a quantidade solicitada.' }); [cite, 98]
    }

    // 3. Cria o pedido no banco
    const { data: novoPedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert([validatedData])
      .select()
      .single();

    if (pedidoError) throw pedidoError;

    // 4. Regra de Negócio: Deduzir a quantidade do estoque do produto [cite: 157]
    const novoEstoque = produto.stockQty - validatedData.quantity;
    
    await supabase
      .from('produtos')
      .update({ stockQty: novoEstoque })
      .eq('id', validatedData.productId);

    res.status(201).json({ pedido: novoPedido }); [cite, 97]

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map(e => e.message) });
    }
    res.status(500).json({ error: 'Erro ao criar pedido', details: error.message });
  }
});

// PUT /pedidos/:id - Editar pedido e reajustar estoque (APENAS ADMIN)
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const editarPedidoSchema = pedidoSchema.partial();
    const validatedData = editarPedidoSchema.parse(req.body);
    validatedData.atualizadoEm = new Date().toISOString();

    // 1. Busca o pedido antigo para saber a quantidade e o produto originais
    const { data: pedidoAntigo, error: erroBusca } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .single();

    if (erroBusca || !pedidoAntigo) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    const oldProductId = pedidoAntigo.productId;
    const oldQuantity = pedidoAntigo.quantity;
    const newProductId = validatedData.productId || oldProductId;
    const newQuantity = validatedData.quantity || oldQuantity;

    // 2. Lógica de reajuste de estoque se o produto ou quantidade mudaram
    if (oldProductId !== newProductId || oldQuantity !== newQuantity) {
      // Devolve o estoque do produto antigo
      const { data: oldProduct } = await supabase.from('produtos').select('stockQty').eq('id', oldProductId).single();
      await supabase.from('produtos').update({ stockQty: oldProduct.stockQty + oldQuantity }).eq('id', oldProductId);

      // Verifica se o novo produto tem estoque suficiente
      const { data: newProduct } = await supabase.from('produtos').select('stockQty').eq('id', newProductId).single();
      if (newProduct.stockQty < newQuantity) {
        // Se não tiver, desfaz a devolução para evitar falhas no banco
        await supabase.from('produtos').update({ stockQty: oldProduct.stockQty }).eq('id', oldProductId);
        return res.status(422).json({ error: 'Estoque insuficiente para a nova quantidade/produto.' });
      }
      
      // Deduz do novo produto
      await supabase.from('produtos').update({ stockQty: newProduct.stockQty - newQuantity }).eq('id', newProductId);
    }

    // 3. Atualiza os dados do pedido no banco
    const { data: pedidoAtualizado, error } = await supabase
      .from('pedidos')
      .update(validatedData)
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

// PATCH /pedidos/:id/status - Atualizar apenas o status (APENAS ADMIN)
const statusSchema = z.object({
  status: z.enum(['confirmado', 'em_andamento', 'entregue'])
});

router.patch('/:id/status', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = statusSchema.parse(req.body);

    // Lógica do deliveredAt: preenche se for entregue, zera se for outro status
    let deliveredAt = null;
    if (status === 'entregue') {
      deliveredAt = new Date().toISOString();
    }

    const { data: pedidoAtualizado, error } = await supabase
      .from('pedidos')
      .update({ status, deliveredAt, atualizadoEm: new Date().toISOString() })
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

// DELETE /pedidos/:id - Excluir pedido e devolver estoque (APENAS ADMIN)
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Busca o pedido para saber qual produto e quantidade devolver
    const { data: pedido, error: erroBusca } = await supabase
      .from('pedidos')
      .select('productId, quantity')
      .eq('id', id)
      .single();

    if (erroBusca || !pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });

    // 2. Exclui o pedido
    const { error: erroDelete } = await supabase.from('pedidos').delete().eq('id', id);
    if (erroDelete) throw erroDelete;

    // 3. Devolve a quantidade ao estoque do produto
    const { data: produto } = await supabase.from('produtos').select('stockQty').eq('id', pedido.productId).single();
    if (produto) {
      await supabase.from('produtos').update({ stockQty: produto.stockQty + pedido.quantity }).eq('id', pedido.productId);
    }

    res.status(200).json({ mensagem: 'Pedido excluído.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir pedido', details: error.message });
  }
});

export default router;