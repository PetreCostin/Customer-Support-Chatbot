import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { createError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

export const createTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { subject, description, email, priority } = req.body;
    const userId = (req as AuthRequest).user?.id;
    const ticket = await prisma.ticket.create({
      data: { subject, description, email, priority: priority || 'MEDIUM', userId },
    });
    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
};

export const getTickets = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, priority } = req.query;
    const isAdmin = req.user?.role === 'ADMIN';
    const tickets = await prisma.ticket.findMany({
      where: {
        ...(!isAdmin && { userId: req.user!.id }),
        ...(status && { status: String(status) as any }),
        ...(priority && { priority: String(priority) as any }),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tickets);
  } catch (err) {
    next(err);
  }
};

export const getTicket = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!ticket) return next(createError('Ticket not found', 404));
    if (req.user?.role !== 'ADMIN' && ticket.userId !== req.user?.id) {
      return next(createError('Access denied', 403));
    }
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

export const updateTicketStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};
