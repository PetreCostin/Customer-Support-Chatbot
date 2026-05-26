import request from 'supertest';
import app from '../app';

jest.mock('../config/database', () => ({
  prisma: {
    fAQ: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { prisma } from '../config/database';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const mockFAQs = [
  { id: '1', question: 'How to reset password?', answer: 'Click forgot password.', category: 'account', isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

describe('FAQ Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/faqs should return list of FAQs', async () => {
    (mockPrisma.fAQ.findMany as jest.Mock).mockResolvedValue(mockFAQs);
    const res = await request(app).get('/api/faqs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/faqs/:id should return 404 for non-existent FAQ', async () => {
    (mockPrisma.fAQ.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/faqs/nonexistent');
    expect(res.status).toBe(404);
  });
});
