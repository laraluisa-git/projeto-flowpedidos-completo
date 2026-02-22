// routes/produtoRoutes.js
import express from 'express';
import { z } from 'zod';
import supabase from '../config/supabase.js';
import { verificarToken, verificarAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Esquema de validação para Criar/Editar Produto
const produtoSchema = z.object({
  nome: z.string().min(2, { message: 'Nome do produto é obrigatório' }),
  categoria: z.string().min(2, { message: 'Categoria é obrigatória' }),
  stockQty: z.number().int().min(0).default(0),
  minStockQty: z.number().int().min(0).default(5),
  unitPrice: z.number().min(0, { message: 'O preço não pode ser negativo' }),
  isActive: z.boolean().default(true)
});

// GET /produtos - Listar todos os produtos (Qualquer usuário logado)
router.get('/', verificarToken, async (req, res) => {
  try {
    const { data: produtos, error } = await supabase
      .from('produtos')
      .select('*')
      .order('criadoEm', { ascending: false });

    if (error) throw error;
    res.status(200).json(produtos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos', details: error.message });
  }
});

// POST /produtos - Criar novo produto (APENAS ADMIN)
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    // Valida os dados que chegaram
    const validatedData = produtoSchema.parse(req.body);

    // Salva no Supabase
    const { data: novoProduto, error } = await supabase
      .from('produtos')
      .insert([validatedData])
      .select()
      .single();

    if (error) throw error;

    // A especificação pede para retornar dentro de um objeto { produto: { ... } }
    res.status(201).json({ produto: novoProduto });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ error: 'Erro ao criar produto', details: error.message });
  }
});

// PUT /produtos/:id - Editar produto existente (APENAS ADMIN)
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // O .partial() do Zod torna todos os campos opcionais (podemos atualizar só o preço, por exemplo)
    const editarProdutoSchema = produtoSchema.partial();
    const validatedData = editarProdutoSchema.parse(req.body);

    // Atualiza a data de modificação
    validatedData.atualizadoEm = new Date().toISOString();

    const { data: produtoAtualizado, error } = await supabase
      .from('produtos')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!produtoAtualizado) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    res.status(200).json({ produto: produtoAtualizado });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ error: 'Erro ao atualizar produto', details: error.message });
  }
});

// DELETE /produtos/:id - Excluir produto (APENAS ADMIN)
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Adicionado o .select()
    const { data, error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      if (error.code === '23503') {
        return res.status(409).json({ error: 'Não é possível excluir um produto vinculado a um pedido. Desative-o.' });
      }
      throw error;
    }

    // Se o array vier vazio, o produto não existia
    if (data.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    res.status(200).json({ mensagem: 'Produto excluído.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir produto', details: error.message });
  }
});

export default router;