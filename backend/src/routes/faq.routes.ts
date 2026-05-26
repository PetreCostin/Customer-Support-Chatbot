import { Router } from 'express';
import { body } from 'express-validator';
import { getFAQs, getFAQ, createFAQ, updateFAQ, deleteFAQ } from '../controllers/faq.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getFAQs);
router.get('/:id', getFAQ);
router.post('/', authenticate, requireAdmin, [
  body('question').trim().notEmpty(),
  body('answer').trim().notEmpty(),
  body('category').optional().trim(),
], createFAQ);
router.put('/:id', authenticate, requireAdmin, [
  body('question').optional().trim().notEmpty(),
  body('answer').optional().trim().notEmpty(),
], updateFAQ);
router.delete('/:id', authenticate, requireAdmin, deleteFAQ);

export default router;
