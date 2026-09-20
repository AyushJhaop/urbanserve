import { Router } from 'express';
import { aiController } from './ai.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Chat endpoint (optional auth or authenticated)
router.post('/chat', (req, res, next) => {
  if (req.headers.authorization) {
    return authenticate(req as any, res, () => aiController.chat(req as any, res));
  }
  return aiController.chat(req as any, res);
});

// Conversation history (authenticated)
router.get('/conversations', authenticate, (req, res) => aiController.getHistory(req, res));

export default router;
