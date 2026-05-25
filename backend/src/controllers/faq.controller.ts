import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { createError } from '../middleware/error.middleware';

export const getFAQs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, search } = req.query;
    const faqs = await prisma.fAQ.findMany({
      where: {
        isActive: true,
        ...(category && { category: String(category) }),
        ...(search && {
          OR: [
            { question: { contains: String(search), mode: 'insensitive' } },
            { answer: { contains: String(search), mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(faqs);
  } catch (err) {
    next(err);
  }
};

export const getFAQ = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const faq = await prisma.fAQ.findUnique({ where: { id: req.params.id } });
    if (!faq) return next(createError('FAQ not found', 404));
    res.json(faq);
  } catch (err) {
    next(err);
  }
};

export const createFAQ = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { question, answer, category } = req.body;
    const faq = await prisma.fAQ.create({ data: { question, answer, category: category || 'general' } });
    res.status(201).json(faq);
  } catch (err) {
    next(err);
  }
};

export const updateFAQ = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { question, answer, category, isActive } = req.body;
    const faq = await prisma.fAQ.update({
      where: { id: req.params.id },
      data: {
        ...(question !== undefined && { question }),
        ...(answer !== undefined && { answer }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json(faq);
  } catch (err) {
    next(err);
  }
};

export const deleteFAQ = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.fAQ.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
