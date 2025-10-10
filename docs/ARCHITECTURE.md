# Faro Architecture

## 📚 Stack

**Frontend (Multi-platform)**
- Web: Next.js 15 (App Router) + React 19
- Mobile: React Native / Expo (planned)
- Styling: Tailwind CSS + shadcn/ui
- State: Zustand

**Backend**
- API: Next.js API Routes
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth
- Vector: pgvector

**AI**
- Chat: Gemini 2.0 Flash
- Embeddings: Gemini text-embedding-004

**Infrastructure**
- Monorepo: Turborepo + pnpm
- Deployment: Vercel + Supabase Cloud

---

## 🏗️ Monorepo Structure

```
faro/
├── apps/
│   ├── web/              # Next.js 15 (current)
│   └── mobile/           # React Native (future)
│
├── packages/
│   ├── core/             # Business logic (DDD)
│   ├── infrastructure/   # External services
│   ├── ui/               # Design system
│   ├── shared/           # Utils & types
│   └── ai-agent/         # AI agents
│
└── supabase/             # Database migrations
```

---

## 🔄 Architecture Pattern

**Clean Architecture + DDD**

```
apps/web (UI Layer)
    ↓
@faro/core (Business Logic)
    ↓
@faro/infrastructure (External Services)
```

**Dependency Rules:**
- `@faro/core` - Zero dependencies (pure logic)
- `@faro/infrastructure` - Depends only on core
- Apps import from `@faro/*` aliases

---

## 🚀 Commands

```bash
pnpm dev          # Start dev server (all packages)
pnpm build        # Build for production
pnpm type-check   # TypeScript validation
pnpm test         # Run tests
pnpm clean        # Clean build artifacts
```

---

## 📱 Multi-platform Strategy

### Phase 1: Web MVP ✅
- Next.js 15 web app
- Clean Architecture foundation
- Monorepo setup complete

### Phase 2: Mobile Launch 🔜
- `apps/mobile/` with React Native
- Reuse `packages/core/` logic
- Share `packages/ui/` design tokens
- Unified Supabase backend

### Phase 3: Feature Expansion 🚀
- Bank integration (Plaid)
- Investment tracking
- Tax automation
- Real-time sync

---

## 🔐 Security

- Row-Level Security (RLS) on Supabase
- Environment variables for secrets
- Supabase Auth for authentication
- No credentials in codebase

---

**Last Updated:** 2025-10-10
