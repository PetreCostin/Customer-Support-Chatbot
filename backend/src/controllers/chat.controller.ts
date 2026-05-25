import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import OpenAI from 'openai';
import { prisma } from '../config/database';
import { config } from '../config/env';
import { createError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

const getOpenAIClient = () => {
  if (!config.openaiApiKey) {
    throw createError('OpenAI API key not configured', 503);
  }
  return new OpenAI({ apiKey: config.openaiApiKey });
};

const SYSTEM_PROMPT = `You are a helpful customer support assistant. Your role is to:
1. Answer customer questions clearly and professionally
2. Help troubleshoot common issues
3. Direct customers to appropriate resources when needed
4. If you cannot resolve an issue, offer to create a support ticket

Be concise, friendly, and professional. If asked about something outside your knowledge, suggest creating a support ticket.`;

export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { message, sessionId } = req.body;
    const userId = (req as AuthRequest).user?.id;

    // Get or create chat session
    let session;
    if (sessionId) {
      session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } },
      });
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: { userId },
        include: { messages: true },
      });
    }

    // Check FAQs first
    const faqs = await prisma.fAQ.findMany({ where: { isActive: true } });
    const faqContext = faqs.length > 0
      ? `\n\nKnowledge Base:\n${faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}`
      : '';

    // Build message history
    const history = session.messages.map(m => ({
      role: m.role.toLowerCase() as 'user' | 'assistant',
      content: m.content,
    }));

    // Save user message
    await prisma.message.create({
      data: { sessionId: session.id, role: 'USER', content: message },
    });

    // Call OpenAI
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: config.openaiModel,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + faqContext },
        ...history,
        { role: 'user', content: message },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, I could not process your request.';

    // Save assistant message
    await prisma.message.create({
      data: { sessionId: session.id, role: 'ASSISTANT', content: assistantMessage },
    });

    res.json({
      sessionId: session.id,
      message: assistantMessage,
      usage: completion.usage,
    });
  } catch (err) {
    next(err);
  }
};

export const getSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session) {
      return next(createError('Session not found', 404));
    }
    res.json(session);
  } catch (err) {
    next(err);
  }
};

export const getSessions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: { userId: req.user!.id },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(sessions);
  } catch (err) {
    next(err);
  }
};
