import { Router, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { RegisterDto, LoginDto } from '../models/user.model';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const dto: RegisterDto = req.body;

    if (!dto.email || !dto.password || !dto.name) {
      res.status(400).json({ error: 'Email, contraseña y nombre son obligatorios' });
      return;
    }
    if (dto.password.length < 6) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    const result = await authService.register(dto);
    res.status(201).json(result);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error en el registro';
    res.status(400).json({ error: message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const dto: LoginDto = req.body;

    if (!dto.email || !dto.password) {
      res.status(400).json({ error: 'Email y contraseña son obligatorios' });
      return;
    }

    const result = await authService.login(dto);
    res.json(result);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error en el login';
    res.status(401).json({ error: message });
  }
});

router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }
  try {
    const token = authHeader.split(' ')[1];
    const user  = authService.verifyToken(token);
    res.json({ user });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

export default router;