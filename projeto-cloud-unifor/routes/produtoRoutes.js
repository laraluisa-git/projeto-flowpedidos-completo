// routes/produtoRoutes.js
import express from 'express';
import { z } from 'zod';
import supabase from '../config/supabase.js';
import { verificarToken, verificarAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * Front-end usa:
 *  { id, name, category, stockQty, minStockQty, unitPrice, isActive }
 * Esta API aceita também { nome, categoria } por compatibilidade.
 */

const produtoSchema = z.object({
  name: z.string().min(2).optional(),
  nome: z.string().min(2).optional(),

  category: z.string().min(2).optional(),
  categoria: z.string().min(2).optional(),

  stockQty: z.number().int().min(0).default(0),
  minStockQty: z.number().int().min(0).default(5),
  unitPrice: z.number().min(0),
  isActive: z.boolean().default(true),
}).refine(v => (v.name || v.nome) && (v.category || v.categoria), { message: 'Campos obrigatórios: name e category.' });

function mapProduto(body) {
  const now = Date.now();
  return {
    id: body.id ?? `p_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`,
    nome: body.name ?? body.nome,
    categoria: body.category ?? body.categoria,
    stockQty: body.stockQty ?? 0,
    minStockQty: body.minStockQty ?? 5,
    unitPrice: body.unitPrice ?? 0,
    isActive: body.isActive ?? true,

    // Mantém compatibilidade com bancos que usam camelCase
    createdAt: body.createdAt ?? now,
    updatedAt: now,

    // Também suporta bancos com snake_case (se existirem colunas)
    // Se não existirem, o Postgres ignora? Não — ele dá erro na insert.
    // Então só enviaremos snake_case se o cliente mandar explicitamente.
    // created_at / updated_at serão tratados no retorno do GET.
  };
}

function mapProdutoToFront(p) {
  // Suporta tanto camelCase quanto snake_case vindos do banco
  const created = p.createdAt ?? p.created_at ?? null;
  const updated = p.updatedAt ?? p.updated_at ?? null;

  return {
    id: p.id,
    name: p.nome,
    category: p.categoria,
    stockQty: p.stockQty,
    minStockQty: p.minStockQty,
    unitPrice: p.unitPrice,
    isActive: p.isActive,
    createdAt: created,
    updatedAt: updated,
  };
}

// GET /api/produtos
router.get('/', verificarToken, async (req, res) => {
  try {
    // Tentativa 1: createdAt
    let query = supabase.from('produtos').select('*');
    let { data: produtos, error } = await query.order('createdAt', { ascending: false });

    // Se a coluna não existe, tenta created_at
    if (error && /createdAt/i.test(error.message)) {
      const resp2 = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false });

      produtos = resp2.data;
      error = resp2.error;
    }

    // Se ainda falhar (ex: nenhuma das colunas existe), retorna sem ordenar
    if (error && /(created_at|createdAt)/i.test(error.message)) {
      const resp3 = await supabase.from('produtos').select('*');
      produtos = resp3.data;
      error = resp3.error;
    }

    if (error) throw error;

    const mapped = (produtos ?? []).map(mapProdutoToFront);
    res.status(200).json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos', details: error.message });
  }
});

// POST /api/produtos (admin)
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    produtoSchema.parse(req.body);
    const payload = mapProduto(req.body);

    const { data: novoProduto, error } = await supabase
      .from('produtos')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ produto: mapProdutoToFront(novoProduto) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map(e => e.message) });
    }
    res.status(500).json({ error: 'Erro ao criar produto', details: error.message });
  }
});

// PUT /api/produtos/:id (admin)
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const editarSchema = produtoSchema.partial();
    const validated = editarSchema.parse(req.body);

    const patch = {};
    if (validated.name || validated.nome) patch.nome = validated.name ?? validated.nome;
    if (validated.category || validated.categoria) patch.categoria = validated.category ?? validated.categoria;
    if (typeof validated.stockQty === 'number') patch.stockQty = validated.stockQty;
    if (typeof validated.minStockQty === 'number') patch.minStockQty = validated.minStockQty;
    if (typeof validated.unitPrice === 'number') patch.unitPrice = validated.unitPrice;
    if (typeof validated.isActive === 'boolean') patch.isActive = validated.isActive;

    patch.updatedAt = Date.now();

    const { data: produtoAtualizado, error } = await supabase
      .from('produtos')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!produtoAtualizado) return res.status(404).json({ error: 'Produto não encontrado.' });

    res.status(200).json({ produto: mapProdutoToFront(produtoAtualizado) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map(e => e.message) });
    }
    res.status(500).json({ error: 'Erro ao atualizar produto', details: error.message });
  }
});

// DELETE /api/produtos/:id (admin)
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ error: 'Produto não encontrado.' });

    res.status(200).json({ mensagem: 'Produto excluído.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir produto', details: error.message });
  }
});

export default router;