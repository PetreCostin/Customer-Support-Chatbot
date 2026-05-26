import { Router } from 'express';
import { body } from 'express-validator';
import { sendMessage, getSession, getSessions } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post(
  '/message',
  [
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('sessionId').optional().isString(),
  ],
  sendMessage
);

router.get('/sessions', authenticate, getSessions);
router.get('/sessions/:sessionId', getSession);

export default router;
