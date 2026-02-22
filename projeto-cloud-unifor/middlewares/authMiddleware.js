// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

/**
 * Este projeto foi entregue com Front-end sem chamadas à API (usa localStorage).
 * Para permitir integração futura SEM alterar o Front, este middleware aceita requisições
 * SEM Authorization e assume um "usuário demo" admin.
 *
 * Quando houver integração real, basta exigir o token (remover o modo demo).
 */
export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // MODO DEMO: se não houver token, deixa passar como admin.
  if (!authHeader) {
    req.user = { id: 'u_admin', role: 'admin', demo: true };
    return next();
  }

  const [, token] = authHeader.split(' ');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

export const verificarAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Requer privilégios de administrador.' });
  }
  return next();
};
