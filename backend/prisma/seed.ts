import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
  console.log('Created admin:', admin.email);

  // Create sample FAQs
  const faqs = [
    { question: 'How do I reset my password?', answer: 'Go to the login page and click "Forgot Password". Enter your email and follow the instructions sent to you.', category: 'account' },
    { question: 'How can I track my order?', answer: 'Log in to your account and visit the Orders section. You will see the status and tracking information for all your orders.', category: 'orders' },
    { question: 'What is your return policy?', answer: 'We accept returns within 30 days of purchase. Items must be in original condition. Contact support to initiate a return.', category: 'returns' },
    { question: 'How do I contact support?', answer: 'You can chat with our AI assistant, submit a support ticket, or email us at support@example.com.', category: 'support' },
    { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and bank transfers.', category: 'billing' },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.upsert({
      where: { id: faq.question.slice(0, 25) },
      update: {},
      create: faq,
    });
  }
  console.log(`Created ${faqs.length} FAQs`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
