import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

// Extiende Request para incluir el usuario autenticado
export interface AuthRequest extends Request {
  user?: { id: number; email: string; name: string };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = authService.verifyToken(token);
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}