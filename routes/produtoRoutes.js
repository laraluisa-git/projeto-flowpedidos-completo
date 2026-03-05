import express from 'express';
import { z } from 'zod';
import supabase from '../config/supabase.js';
import { verificarToken } from '../middlewares/authMiddleware.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Schema de Validação (Zod)
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

// Função de Mapeamento (Adapta Front-end -> Banco de Dados)
function mapProduto(body) {
  return {
    nome: body.nome ?? body.name,
    categoria: body.categoria ?? body.category ?? null,
    unit_price: Number(body.unitPrice), 
    stock_qty: Number(body.stockQty),   
    min_stock_qty: Number(body.minStockQty),
    is_active: typeof body.isActive === 'boolean' ? body.isActive : true,
  };
}

// GET /api/produtos
router.get('/', verificarToken, async (req, res) => {
  try {
    let query = supabase.from('produtos').select('*');

    // Admin vê tudo, usuário comum vê apenas o que criou
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
    const agora = Date.now();

    const { data, error } = await supabase
      .from('produtos')
      .insert([{
        id: uuidv4(),
        ...mapped,
        user_id: req.user.id,
        criadoEm: agora,
        atualizadoEm: agora,
      }])
      .select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map(e => e.message) });
    }
    console.error('Erro ao criar produto:', error.message);
    res.status(500).json({ error: 'Erro ao criar produto', message: error.message });
  }
});

// PUT /api/produtos/:id
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const validated = produtoSchema.partial().parse(req.body);
    const mapped = mapProduto(validated);

    let q = supabase
      .from('produtos')
      .update({ 
        ...mapped, 
        atualizadoEm: Date.now() // Mantendo o padrão bigint/ms
      })
      .eq('id', id);

    if (req.user.role !== 'admin') {
      q = q.eq('user_id', req.user.id);
    }

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

    if (req.user.role !== 'admin') {
      q = q.eq('user_id', req.user.id);
    }

    const { data, error } = await q.select();
    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ error: 'Produto não encontrado ou sem permissão.' });
    
    res.status(200).json({ mensagem: 'Produto removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover produto', message: error.message });
  }
});

export default router;