import { Router, Request, Response } from 'express';
import { sendToClaudeService } from '../services/claude.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Aplica el middleware de auth a todas las rutas del chat
router.use(authMiddleware);

router.post('/', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'El campo messages es obligatorio' });
      return;
    }

    const content = await sendToClaudeService(messages);
    res.json({ content });

  } catch (error) {
    console.error('Error en /api/chat:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;