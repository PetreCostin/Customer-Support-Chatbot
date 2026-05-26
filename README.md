# 🤖 Customer Support Chatbot

An AI-powered customer support platform built with **Next.js**, **Node.js**, **PostgreSQL**, and **OpenAI**. Features a real-time chat interface, FAQ knowledge base, ticket management, and an admin dashboard.

![CI](https://github.com/PetreCostin/Customer-Support-Chatbot/actions/workflows/ci.yml/badge.svg)

## ✨ Features

- 💬 **AI Chat** — Powered by OpenAI GPT with FAQ-grounded responses
- 🔐 **Authentication** — JWT-based login/register for users and admins
- 📋 **FAQ Management** — Admin can add, edit, and delete knowledge base entries
- 🎫 **Support Tickets** — Users can escalate to human support; admins manage tickets
- 📊 **Admin Dashboard** — Overview of users, tickets, and chat sessions
- 🐳 **Docker** — One-command local setup with Docker Compose
- 🧪 **Tests** — Backend and frontend unit tests included
- ⚡ **CI/CD** — GitHub Actions for automated build and test on every push

## 🏗️ Architecture

```text
customer-support-chatbot/
├── frontend/               # Next.js 14 + Tailwind CSS
│   ├── src/app/            # App Router pages
│   │   ├── chat/           # Chat interface
│   │   ├── login/          # Authentication
│   │   ├── register/
│   │   ├── faqs/           # Browse FAQs
│   │   └── admin/          # Admin dashboard
│   ├── src/components/     # Shared UI components
│   └── src/lib/            # API client, auth utilities
│
├── backend/                # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/         # API route definitions
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, error handling
│   │   └── config/         # Env, DB config
│   ├── prisma/             # Database schema & migrations
│   └── src/__tests__/      # Unit tests
│
├── docker-compose.yml      # Production Docker setup
├── docker-compose.dev.yml  # Dev DB only
└── .github/workflows/      # CI pipeline
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or Docker)
- OpenAI API key

### Option A: Docker (recommended)

```bash
# 1. Clone the repository
git clone https://github.com/PetreCostin/Customer-Support-Chatbot.git
cd Customer-Support-Chatbot

# 2. Create environment file
cp .env.example .env
# Edit .env and set OPENAI_API_KEY

# 3. Start all services
docker compose up --build

# 4. Run database migrations (first time only)
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx ts-node prisma/seed.ts
```

Open http://localhost:3000

### Option B: Local Development

**1. Start the database**
```bash
docker compose -f docker-compose.dev.yml up -d
```

**2. Set up the backend**
```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL and OPENAI_API_KEY
npm install
npx prisma migrate dev
npx ts-node prisma/seed.ts  # seeds admin user and sample FAQs
npm run dev
# Backend runs at http://localhost:4000
```

**3. Set up the frontend**
```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev
# Frontend runs at http://localhost:3000
```

### Default Admin Credentials (after seeding)
| Field    | Value              |
|----------|--------------------|
| Email    | admin@example.com  |
| Password | admin123!          |

> ⚠️ Change these immediately in production.

## 📡 API Reference

### Authentication
| Method | Endpoint              | Description         | Auth |
|--------|-----------------------|---------------------|------|
| POST   | /api/auth/register    | Create account      | No   |
| POST   | /api/auth/login       | Login               | No   |
| GET    | /api/auth/profile     | Get own profile     | Yes  |

### Chat
| Method | Endpoint                    | Description          | Auth     |
|--------|-----------------------------|----------------------|----------|
| POST   | /api/chat/message           | Send a message       | Optional |
| GET    | /api/chat/sessions          | List own sessions    | Yes      |
| GET    | /api/chat/sessions/:id      | Get session history  | No       |

### FAQs
| Method | Endpoint       | Description    | Auth  |
|--------|----------------|----------------|-------|
| GET    | /api/faqs      | List FAQs      | No    |
| GET    | /api/faqs/:id  | Get FAQ        | No    |
| POST   | /api/faqs      | Create FAQ     | Admin |
| PUT    | /api/faqs/:id  | Update FAQ     | Admin |
| DELETE | /api/faqs/:id  | Delete FAQ     | Admin |

### Tickets
| Method | Endpoint                    | Description       | Auth  |
|--------|-----------------------------|-------------------|-------|
| POST   | /api/tickets                | Create ticket     | No    |
| GET    | /api/tickets                | List all tickets  | Admin |
| GET    | /api/tickets/:id            | Get ticket        | Yes   |
| PATCH  | /api/tickets/:id/status     | Update status     | Admin |

### Admin
| Method | Endpoint                      | Description      | Auth  |
|--------|-------------------------------|------------------|-------|
| GET    | /api/admin/stats              | Dashboard stats  | Admin |
| GET    | /api/admin/users              | List users       | Admin |
| PATCH  | /api/admin/users/:id/role     | Update user role | Admin |

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Backend test coverage
cd backend && npm run test:coverage

# Frontend tests
cd frontend && npm test
```

## ⚙️ Environment Variables

| Variable              | Description                          | Default              |
|-----------------------|--------------------------------------|----------------------|
| `NODE_ENV`            | Environment (development/production) | development          |
| `PORT`                | Backend server port                  | 4000                 |
| `DATABASE_URL`        | PostgreSQL connection string         | Required             |
| `JWT_SECRET`          | JWT signing secret (min 32 chars)    | Required             |
| `JWT_EXPIRES_IN`      | Token expiry                         | 7d                   |
| `OPENAI_API_KEY`      | Your OpenAI API key                  | Required for AI chat |
| `OPENAI_MODEL`        | GPT model to use                     | gpt-3.5-turbo        |
| `FRONTEND_URL`        | Frontend origin (for CORS)           | http://localhost:3000|
| `NEXT_PUBLIC_API_URL` | Backend URL from frontend            | http://localhost:4000|

## 🛣️ Roadmap

- [ ] Real-time streaming chat responses
- [ ] Email notifications for ticket updates
- [ ] Multi-language support
- [ ] Analytics dashboard with charts
- [ ] OAuth2 (Google, GitHub) login
- [ ] Webhook integrations (Slack, Teams)
- [ ] Mobile app (React Native)
- [ ] Vector-based semantic FAQ search
- [ ] Rate limiting per user

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT © [PetreCostin](https://github.com/PetreCostin)
