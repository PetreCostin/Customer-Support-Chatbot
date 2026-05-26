import { Router } from 'express';
import { body } from 'express-validator';
import { createTicket, getTickets, getTicket, updateTicketStatus } from '../controllers/ticket.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', [
  body('subject').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
], createTicket);

router.get('/', authenticate, requireAdmin, getTickets);
router.get('/my', authenticate, getTickets); // user's own tickets
router.get('/:id', authenticate, getTicket);
router.patch('/:id/status', authenticate, requireAdmin, [
  body('status').isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
], updateTicketStatus);

export default router;
