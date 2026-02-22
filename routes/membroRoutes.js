// routes/membroRoutes.js
import express from 'express';
import { z } from 'zod';
import supabase from '../config/supabase.js';
import { verificarToken, verificarAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Esquema de validação para Membro da Equipe
const membroSchema = z.object({
  nome: z.string().min(2, { message: 'O nome é obrigatório e deve ter no mínimo 2 caracteres' }),
  funcao: z.string().min(2, { message: 'A função/cargo é obrigatória' }),
  links: z.string().optional() // Pode ser o link do LinkedIn ou GitHub
});

// GET /membros - Listar todos os membros (Qualquer usuário logado pode ver)
router.get('/', verificarToken, async (req, res) => {
  try {
    const { data: membros, error } = await supabase
      .from('membros_equipe')
      .select('*')
      .order('criadoEm', { ascending: true });

    if (error) throw error;
    res.status(200).json(membros);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar membros da equipe', details: error.message });
  }
});

// POST /membros - Adicionar um novo membro (APENAS ADMIN)
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const validatedData = membroSchema.parse(req.body);

    const { data: novoMembro, error } = await supabase
      .from('membros_equipe')
      .insert([validatedData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ membro: novoMembro });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues.map(e => e.message) });
    res.status(500).json({ error: 'Erro ao adicionar membro', details: error.message });
  }
});

// PUT /membros/:id - Editar um membro (APENAS ADMIN)
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const editarMembroSchema = membroSchema.partial();
    const validatedData = editarMembroSchema.parse(req.body);

    const { data: membroAtualizado, error } = await supabase
      .from('membros_equipe')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!membroAtualizado) return res.status(404).json({ error: 'Membro não encontrado.' });

    res.status(200).json({ membro: membroAtualizado });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues.map(e => e.message) });
    res.status(500).json({ error: 'Erro ao editar membro', details: error.message });
  }
});

// DELETE /membros/:id - Remover um membro (APENAS ADMIN)
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Adicionamos o .select() para ver o que foi deletado
    const { data, error } = await supabase
      .from('membros_equipe')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;

    // Se o array voltar vazio, o ID não existia
    if (data.length === 0) {
      return res.status(404).json({ error: 'Membro não encontrado.' });
    }

    res.status(200).json({ mensagem: 'Membro removido.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover membro', details: error.message });
  }
});

export default router;