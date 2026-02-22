// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

// Middleware 1: Verifica se o usuário está logado (Token Válido)
export const verificarToken = (req, res, next) => {
  // Pega o token do cabeçalho da requisição
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  // O formato esperado é "Bearer <token>", então separamos pelo espaço
  const [, token] = authHeader.split(' ');

  try {
    // Verifica se o token foi gerado pela nossa API e se não expirou
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Salva os dados do usuário (id, role) dentro do objeto req para as próximas rotas usarem
    req.user = decoded;

    // Tudo certo! Pode seguir para a rota solicitada.
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

// Middleware 2: Verifica se o usuário tem permissão de Admin
export const verificarAdmin = (req, res, next) => {
  // Como o verificarToken roda antes, nós já temos o req.user aqui
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Requer privilégios de administrador.' });
  }
  
  // Tudo certo! É um admin. Pode seguir.
  next();
};