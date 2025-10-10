# Faro - AI-Powered Personal CFO

## 🎯 Mission & Vision

**Service Name:** Faro (Spanish: "Lighthouse")
A lighthouse illuminates the surroundings so ships can safely navigate treacherous seas. Faro aims to be that guiding light for people's financial journeys.

**Mission:** "Increase humanity's financial wellbeing"
**Vision:** "Your lifelong financial thinking partner"

---

## 💎 Core Values

1. **Context is everything** - Personalization is paramount
2. **Intelligence, not automation** - Expand thinking, not just efficiency
3. **Accessible excellence** - Democratize expert-level financial advice
4. **Privacy first** - Fundamental requirement for financial data

---

## 🏗️ Architecture

### Tech Stack

**Frontend (Multi-platform)**
- Next.js 15 (App Router) - Web application
- React 19
- Tailwind CSS + shadcn/ui
- Zustand (State Management)
- TypeScript 5

**Backend**
- Next.js API Routes
- Supabase (PostgreSQL + Auth)
- pgvector (Vector search)

**AI**
- Gemini 2.0 Flash (Chat)
- Gemini Embeddings (text-embedding-004)

**Infrastructure**
- Monorepo: Turborepo + pnpm
- Clean Architecture + DDD
- Deployment: Vercel + Supabase Cloud

---

## 📦 Project Structure

```
faro/
├── apps/
│   ├── web/                    # Next.js 15 web app
│   │   ├── app/                # App Router
│   │   │   ├── api/            # Backend API routes
│   │   │   ├── (app)/          # Protected pages (auth required)
│   │   │   ├── (auth)/         # Login/Signup
│   │   │   ├── (legal)/        # Terms, Privacy
│   │   │   └── (marketing)/    # Landing page
│   │   ├── components/         # UI components
│   │   ├── lib/                # App-specific logic
│   │   └── types/              # Type definitions
│   │
│   └── mobile/                 # React Native (planned)
│
├── packages/
│   ├── core/                   # Business logic (DDD)
│   │   ├── domain/             # Entities, Value Objects, Events
│   │   ├── usecases/           # Use Cases
│   │   └── interfaces/         # Repository/Service interfaces
│   │
│   ├── infrastructure/         # External services integration
│   │   ├── database/           # Supabase repositories
│   │   ├── ai/                 # Gemini integration
│   │   └── vector/             # pgvector
│   │
│   ├── ui/                     # Design system (web/mobile shared)
│   │   └── design-system/      # Tokens (colors, spacing, typography)
│   │
│   ├── shared/                 # Shared utilities
│   │   ├── utils/              # Currency, Date, Validation
│   │   ├── types/              # Common types
│   │   └── constants/          # App constants
│   │
│   └── ai-agent/               # AI agents
│       ├── agents/             # FinancialAdvisor, TaxAdvisor
│       ├── prompts/            # Prompt templates
│       └── tools/              # Agent tools
│
├── supabase/
│   └── migrations/             # Database schema
│
├── docs/
│   └── ARCHITECTURE.md         # Architecture overview
│
├── scripts/                    # Development scripts
├── pnpm-workspace.yaml         # Monorepo config
├── turbo.json                  # Build pipeline
└── CLAUDE.md                   # This file (AI instructions)
```

---

## 🎨 UI/UX Philosophy

World-class modern design with accessibility at its core.

---

## 🚀 Features

### Core Functionality
- **AI Chat**: Natural language financial consultation (Gemini 2.0)
- **Notes**: Notion-style documentation (AI-enhanced)
- **Kakeibo**: AI-powered household budgeting
- **Workspace**: Integrated 3-panel workspace

### Route Structure

**Public Routes**
- `/` - Landing page
- `/auth/login` - Login
- `/auth/signup` - Signup
- `/terms`, `/privacy`, `/refund` - Legal pages

**Protected Routes** (Auth required via `(app)` group)
- `/chat` - Main chat interface
- `/workspace` - Integrated workspace
- `/faro` - Simple mobile chat
- `/kakeibo` - AI household budget

---

## 🔧 Development

### Commands

```bash
pnpm dev          # Start all packages in dev mode (Turbopack)
pnpm build        # Build all packages
pnpm lint         # Lint all packages
pnpm type-check   # TypeScript type checking
pnpm test         # Run all tests
pnpm clean        # Clean build artifacts
```

### Package Dependencies

```
apps/web
  ↓ imports
@faro/ui, @faro/shared, @faro/ai-agent
  ↓ imports
@faro/core
  ↓ imports
@faro/infrastructure
```

**Dependency Rules:**
- `@faro/core` - Zero external dependencies (pure business logic)
- `@faro/infrastructure` - Depends only on `@faro/core`
- Apps/packages import from `@faro/*` aliases

---

## 📱 Mobile Expansion (Planned)

### Phase 1: Web MVP ✅ (Current)
- Next.js 15 web application
- Clean Architecture foundation
- Monorepo setup complete

### Phase 2: Mobile Launch 🔜
- React Native / Expo in `apps/mobile/`
- Reuse `packages/core/` business logic
- Share `packages/ui/` design tokens
- Unified Supabase backend

### Phase 3: Feature Expansion 🚀
- Bank integration (Plaid)
- Investment portfolio tracking
- Tax filing automation
- Real-time notifications

---

## ⚙️ Environment Setup

Required environment variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Gemini AI
GEMINI_API_KEY=

# Optional
SENTRY_DSN=
ENVIRONMENT=development
```

---

## 🎯 Absolute Rules

1. **Prioritize future scalability** - Don't be constrained by current design
2. **Never compromise on quality** - Always aim for world-class standards
3. **Stay technology-agnostic** - Adopt better solutions without hesitation
4. **Clean Architecture** - Separate business logic from infrastructure
5. **Mobile-first mindset** - Design for multi-platform from day one

---

## 🔐 Security Principles

- Row-Level Security (RLS) on Supabase
- Secure authentication via Supabase Auth
- Environment variables for sensitive data
- No credentials in codebase

---

## 📈 Success Metrics

- User financial wellbeing improvement
- AI accuracy and relevance
- User engagement and retention
- Platform scalability (web → mobile → ecosystem)

---

**Last Updated:** 2025-10-10
**Version:** 2.0 (Monorepo + Mobile-ready)
