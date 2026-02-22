// routes/authRoutes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import supabase from '../config/supabase.js';

const router = express.Router();

// 1. Esquemas de Validação (Zod)
const registerSchema = z.object({
  nome: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres' }),
  email: z.email({ message: 'Formato de e-mail inválido' }),
  senha: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
  endereco: z.string().min(5, { message: 'Endereço é obrigatório' }),
  tipoConta: z.enum(['pf', 'empresa']),
  nomeEmpresa: z.string().optional()
});

const loginSchema = z.object({
  email: z.email({ message: 'Formato de e-mail inválido' }),
  senha: z.string().min(1, { message: 'A senha é obrigatória' })
});

// 2. Rota de Cadastro (Register)
router.post('/register', async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    // Verifica se o e-mail já existe
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('email')
      .eq('email', validatedData.email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Este e-mail já está em uso.' });
    }

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.senha, salt);

    // Salva no banco (atenção aos nomes das colunas com aspas que criamos no SQL)
    const { data: newUser, error } = await supabase
      .from('usuarios')
      .insert([
        {
          nome: validatedData.nome,
          email: validatedData.email,
          senhaHash: hashedPassword,
          endereco: validatedData.endereco,
          tipoConta: validatedData.tipoConta,
          nomeEmpresa: validatedData.nomeEmpresa
        }
      ])
      .select('id, nome, email, role')
      .single();

    if (error) throw error;

    // Gera o token JWT para já logar o usuário recém-criado
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Retorna exatamente o formato que o Frontend espera
    res.status(201).json({
      token: token,
      usuario: newUser
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
});

// 3. Rota de Login
router.post('/login', async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Busca o usuário pelo e-mail
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', validatedData.email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    // Compara a senha
    const isValidPassword = await bcrypt.compare(validatedData.senha, user.senhaHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Retorna exatamente o formato que o Frontend espera
    res.status(200).json({
      token: token,
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
});

export default router;