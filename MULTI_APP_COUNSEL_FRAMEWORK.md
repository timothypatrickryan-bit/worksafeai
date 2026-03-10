# Multi-App Counsel Framework

> Strategic analysis of WorkSafeAI + Super Admin as templates for building 10+ apps.
> Generated: 2026-03-08

---

## Executive Summary

Tim has built two solid applications — WorkSafeAI (a full SaaS with frontend + backend) and Super Admin (an internal management console). Together, they form a surprisingly complete template for multi-tenant B2B SaaS. The architecture is clean, security-conscious, and production-ready. The main gap is **extraction** — the patterns exist but are duplicated rather than shared.

**Bottom line:** ~70% of what Tim needs for future apps already exists. The work is packaging it for reuse, not building from scratch.

---

## 1. What's Working Well (Standardize These)

### Authentication & Security ✅
- **JWT with refresh token rotation** — Best practice. WorkSafeAI's `authService.js` handles access + refresh tokens with separate secrets, algorithm pinning (`HS256`), and PII-minimal payloads.
- **Rate limiting** — Thoughtful per-endpoint rate limits (auth brute force, AI cost explosion, email enumeration, data reconnaissance). This is better than most startups.
- **CSRF/Origin validation** — Production origin whitelisting with proper URL parsing.
- **Helmet + CORS** — Standard security headers.
- **Password policy** — Zod-enforced: 12+ chars, uppercase, lowercase, number, special char. Bcrypt with 12 rounds.
- **Email verification flow** — Token-based with hashed storage, expiry, and single-use enforcement.

### API Architecture ✅
- **Express + Supabase** — Simple, effective. No over-engineering.
- **Middleware stack** — Clean separation: `requestId → structuredLogger → auth → validation → companyAccess → route handler → errorHandler`.
- **Zod validation middleware** — `validateBody()` and `validateQuery()` with detailed error extraction. Works with both Zod v3 and v4.
- **Structured error handling** — Correlation IDs, sanitized production messages, proper HTTP status code mapping from Postgres error codes.
- **Audit logging** — Non-blocking, fire-and-forget with failure logging. Won't break requests if audit table is down.

### Frontend Architecture ✅
- **Zustand + persist** — Lightweight state management. Auth store pattern is clean.
- **Axios interceptors** — Token injection, 401 handling with refresh, retry guard against infinite loops.
- **Lucide icons** — Consistent, tree-shakeable icon library.
- **Tailwind + glassmorphism design** — Dark theme with `bg-white/10 backdrop-blur-md` pattern. Consistent gradient branding.
- **React Router** — Protected routes with auth checks, onboarding gates.

### Developer Experience ✅
- **Vite** — Fast dev server for all frontends.
- **Jest** — Backend tests with reasonable structure.
- **Environment validation** — `assertEnv()` at startup prevents running with missing config.

---

## 2. What Needs Improvement

### Duplication Between Apps 🔴
- **Auth stores** are reimplemented in both apps with slight differences (cookie-based vs localStorage, token expiry checking logic).
- **API clients** are duplicated (both use Axios with interceptors, but configured differently).
- **Layout components** share the same glassmorphism design language but are separate implementations.
- **Protected route patterns** are copy-pasted.

### Inconsistencies 🟡
- **WorkSafeAI frontend uses `.jsx`** files with no TypeScript. **Super Admin also uses `.jsx`**. Neither uses TypeScript — this is a scaling risk for 10+ apps.
- **WorkSafeAI auth store uses `js-cookie`** for token storage. **Super Admin persists tokens directly to localStorage** via Zustand persist. These are fundamentally different security models.
- **React version mismatch**: WorkSafeAI uses React 19, Super Admin uses React 18.
- **Package naming inconsistency**: `worksafeai-frontend` vs `super-admin-console` vs `jtsa-backend`.

### Missing Patterns 🟡
- **No shared component library** — Every app rebuilds DataTable, Modal, Toast, Pagination from scratch.
- **No shared types/contracts** — API response shapes are implicitly agreed upon, not enforced.
- **No error boundary in WorkSafeAI** — Super Admin has one, WorkSafeAI doesn't.
- **No notification store in WorkSafeAI** — Super Admin has a clean one; WorkSafeAI uses a simpler `ErrorToast`.
- **No `useFetch` or `useForm` hooks in WorkSafeAI** — Super Admin has them.
- **No loading skeleton in Super Admin** — WorkSafeAI has `SkeletonLoader`.

### Architecture Gaps 🔴
- **No monorepo tooling** — Apps live under `apps/` but there's no workspace management (no pnpm workspaces, no turborepo, no shared packages).
- **No CI/CD pipeline** — Manual deploys to Vercel.
- **No shared database utilities** — Supabase client is initialized per-app.
- **Backend is pure JavaScript** — No TypeScript means no compile-time safety for API contracts.
- **No API versioning** — Endpoints are unversioned (`/api/auth/login` not `/api/v1/auth/login`).
- **Email templates are inline HTML strings** — Not reusable, not branded, hard to maintain.

---

## 3. Strategic Recommendations

### Phase 1: Extract & Package (Week 1-2)
1. Create `packages/ui/` — Extract DataTable, Modal, Toast, Pagination, ErrorBoundary, SkeletonLoader
2. Create `packages/auth/` — Unified auth store, API client, protected route components
3. Create `packages/hooks/` — useFetch, useForm, useDebounce
4. Set up pnpm workspaces or turborepo for monorepo management

### Phase 2: Standardize (Week 3-4)
1. Adopt TypeScript across all new apps (can be gradual for existing)
2. Standardize on one React version (19)
3. Create app template generator (CLI or cookiecutter)
4. Standardize token storage strategy (cookies for SaaS, localStorage for admin tools)
5. Create email template library with React Email or MJML

### Phase 3: Scale Infrastructure (Month 2)
1. Add CI/CD (GitHub Actions → Vercel)
2. Add error tracking (Sentry)
3. Add API versioning strategy
4. Create shared Supabase migration patterns
5. Add monitoring (Vercel Analytics + custom health checks)

---

## 4. The 80/20 Rule for New Apps

**Same across ALL apps (80%):**
- Auth flow (JWT + refresh tokens)
- API client with interceptors
- Layout shell (sidebar + header + content area)
- Toast/notification system
- Error boundary
- Loading states (skeleton loaders)
- Data table with sort/filter/paginate
- Modal/dialog system
- Form handling (useForm hook)
- Data fetching (useFetch hook)
- Zod validation (shared schemas for common patterns)
- Tailwind config (colors, gradients, glassmorphism)
- Rate limiting patterns
- Audit logging
- Environment validation
- Structured error handling

**Different per app (20%):**
- Domain-specific routes and pages
- Domain-specific Zod schemas
- Domain-specific database tables
- Business logic services
- AI integrations (if any)
- Pricing/billing specifics
- Landing page copy and features list
- Email notification triggers and content

---

## 5. How Lucy Enforces Consistency

### On Every New App:
1. **Generate from template** — `lucy new-app <name>` should scaffold the standard structure
2. **Review against checklist** — Lucy checks that standard patterns are used, not reimplemented
3. **Flag divergence** — If a dev creates a new Toast component instead of importing from `packages/ui`, Lucy flags it
4. **Update shared packages** — When a pattern improves in one app, Lucy proposes the update to the shared package

### Ongoing:
- **Periodic architecture reviews** — Lucy scans all apps for pattern drift
- **Dependency audits** — Keep versions aligned across apps
- **Security reviews** — Ensure rate limiting, auth, and validation patterns are present
- **Documentation** — Lucy keeps `ARCHITECTURE.md` current per-app

---

## 6. Risk Assessment for 10+ Apps

| Risk | Severity | Mitigation |
|------|----------|------------|
| Dependency drift (different React/lib versions) | High | Monorepo with shared deps |
| Pattern divergence (reimplemented wheels) | High | Shared packages + Lucy reviews |
| Database schema conflicts | Medium | Per-app schemas with shared migrations pattern |
| Deploy complexity | Medium | CI/CD pipeline with per-app builds |
| Secret management at scale | Medium | Centralized env management (Vercel + 1Password) |
| Single point of failure (Supabase) | Low | Supabase handles this well at scale |
| Developer onboarding | Medium | Template + documentation + Lucy guidance |
