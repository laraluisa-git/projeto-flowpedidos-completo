import express from 'express';
import supabase from '../config/supabase.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/auditoria
router.get('/', verificarToken, async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    let q = supabase.from('auditoria').select('*');
    if (role !== 'admin') q = q.eq('user_id', userId);

    const { data, error } = await q.order('criadoEm', { ascending: false }).limit(200);
    if (error) throw error;

    res.status(200).json(data ?? []);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar auditoria', details: error.message });
  }
});

export default router;
