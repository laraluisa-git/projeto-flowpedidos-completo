import express from 'express';
import { z } from 'zod';
import supabase from '../config/supabase.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Front usa: { name, category, stockQty, minStockQty, unitPrice, isActive }
// Banco usa: { nome, categoria, stockQty, minStockQty, unitPrice, isActive, user_id, criadoEm, atualizadoEm }
const produtoSchema = z.object({
  name: z.string().min(2).optional(),
  nome: z.string().min(2).optional(),
  category: z.string().optional(),
  categoria: z.string().optional(),
  unitPrice: z.coerce.number().positive(),
  stockQty: z.coerce.number().int().min(0),
  minStockQty: z.coerce.number().int().min(0),
  isActive: z.coerce.boolean().optional(),
}).refine(v => (v.name || v.nome), { message: 'Campo obrigatório: name/nome' });

function mapProduto(body) {
  return {
    nome: body.nome ?? body.name,
    categoria: body.categoria ?? body.category ?? null,
    unitPrice: body.unitPrice,
    stockQty: body.stockQty,
    minStockQty: body.minStockQty,
    isActive: typeof body.isActive === 'boolean' ? body.isActive : true,
  };
}

// GET /api/produtos
router.get('/', verificarToken, async (req, res) => {
  try {
    let query = supabase.from('produtos').select('*');

    // Mudança para req.user para evitar o erro de undefined
    if (req.user.role !== 'admin') {
      query = query.eq('user_id', req.user.id);
    }

    const { data, error } = await query.order('nome');
    if (error) throw error;
    res.status(200).json(data ?? []);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos', message: error.message });
  }
});

// POST /api/produtos
router.post('/', verificarToken, async (req, res) => {
  try {
    const validated = produtoSchema.parse(req.body);
    const mapped = mapProduto(validated);

    const { data, error } = await supabase
      .from('produtos')
      .insert([{
        ...mapped,
        user_id: req.user.id, // Corrigido para req.user
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      }])
      .select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map(e => e.message) });
    }
    res.status(500).json({ error: 'Erro ao criar produto', message: error.message });
  }
});

// PUT /api/produtos/:id (editar)
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const validated = produtoSchema.partial().parse(req.body);
    const mapped = mapProduto(validated);

    // isolamento (admin vê todos)
    let q = supabase.from('produtos').update({ ...mapped, atualizadoEm: new Date().toISOString() }).eq('id', id);
    if (req.user.role !== 'admin') q = q.eq('user_id', req.user.id);

    const { data, error } = await q.select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Produto não encontrado.' });
    res.status(200).json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map(e => e.message) });
    }
    res.status(500).json({ error: 'Erro ao editar produto', message: error.message });
  }
});

// DELETE /api/produtos/:id
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    let q = supabase.from('produtos').delete().eq('id', id);
    if (req.user.role !== 'admin') q = q.eq('user_id', req.user.id);

    const { data, error } = await q.select();
    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ error: 'Produto não encontrado.' });
    res.status(200).json({ mensagem: 'Produto removido.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover produto', message: error.message });
  }
});

export default router;