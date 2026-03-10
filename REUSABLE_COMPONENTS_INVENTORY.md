# Reusable Components Inventory

> Every component and pattern from WorkSafeAI + Super Admin ready for extraction into shared packages.
> Generated: 2026-03-08

---

## UI Components (→ `packages/ui/`)

### 1. DataTable ⭐ CRITICAL
- **Source:** `super-admin/src/components/DataTable.jsx`
- **Features:** Column config, sortable headers (with aria-sort), custom render functions, edit/delete actions, loading skeleton, empty state
- **Extraction effort:** Low — already well-abstracted with JSDoc props
- **Improvements needed:** Add row selection, bulk actions, responsive mobile view, column resize

### 2. Modal ⭐ CRITICAL
- **Source:** `super-admin/src/components/Modal.jsx`
- **Features:** Escape key handler, backdrop click-to-close, size variants (sm/md/lg/xl), primary/secondary action buttons with loading state, aria-modal
- **Extraction effort:** Low — clean, self-contained
- **Improvements needed:** Focus trap, portal rendering, animation transitions

### 3. Toast / Notification System ⭐ CRITICAL
- **Source:** `super-admin/src/components/Toast.jsx` + `super-admin/src/stores/notificationStore.js`
- **Features:** 4 types (success/error/warning/info), auto-dismiss with configurable duration, manual dismiss, convenience methods (`.success()`, `.error()`)
- **Extraction effort:** Low — store + component pair
- **Improvements needed:** Stack positioning, max visible count, action buttons within toasts

### 4. ErrorBoundary ⭐ CRITICAL
- **Source:** `super-admin/src/components/ErrorBoundary.jsx`
- **Features:** Catches render errors, dev-only error details, reset button, styled error UI
- **Extraction effort:** Very low — drop-in
- **Improvements needed:** Sentry integration hook, custom fallback support

### 5. Pagination ⭐ HIGH
- **Source:** `super-admin/src/components/Pagination.jsx`
- **Features:** Page numbers with ellipsis, page size selector (10/20/50/100), prev/next, item count display
- **Extraction effort:** Low
- **Improvements needed:** URL sync (query params), keyboard navigation

### 6. SkeletonLoader
- **Source:** `worksafeai/web/src/components/SkeletonLoader.jsx`
- **Extraction effort:** Low
- **Improvements needed:** More variants (table rows, cards, text blocks)

### 7. Layout Shells ⭐ HIGH
- **Source:** `worksafeai/web/src/components/Layout.jsx` (sidebar + header), `super-admin/src/components/AdminLayout.jsx` (collapsible sidebar)
- **Pattern:** Both use glassmorphism dark theme, icon-driven nav, responsive mobile sidebar
- **Extraction:** Create a configurable `<AppShell>` that accepts nav items, branding, and user info
- **Key differences:** WorkSafeAI has mobile hamburger overlay; Super Admin has collapsible sidebar with tooltip labels

### 8. Badge Components
- **Source:** `worksafeai/web/src/components/MitigationStatusBadge.jsx`, `HazardSeverityBadge.jsx`
- **Pattern:** Color-coded status indicators
- **Extraction:** Create generic `<StatusBadge variant="success|warning|danger|info" />`

---

## Hooks (→ `packages/hooks/`)

### 1. useFetch ⭐ CRITICAL
- **Source:** `super-admin/src/hooks/useFetch.js`
- **Features:** Loading/error/data states, auto-fetch on mount, dependency-based refetch, skip option, stable fetchFn ref, mounted guard
- **Extraction effort:** Very low — already generic
- **Improvements needed:** Caching (SWR-like), optimistic updates, pagination support

### 2. useForm ⭐ CRITICAL
- **Source:** `super-admin/src/hooks/useForm.js`
- **Features:** Values/errors/touched tracking, field-level error clearing, `getFieldProps()` helper, validation function support, submit with loading state
- **Extraction effort:** Very low
- **Improvements needed:** Async validation, field arrays, nested object support

---

## Auth Package (→ `packages/auth/`)

### 1. Auth Store (Zustand)
- **Sources:** `worksafeai/web/src/stores/authStore.js`, `super-admin/src/stores/authStore.js`
- **Unified version should support:**
  - Login/register/logout
  - Token refresh (configurable: cookie vs localStorage)
  - JWT decode for user info
  - Token expiry checking (Super Admin's approach is better)
  - Persist middleware with partialize
  - `initializeAuth()` for hydration

### 2. API Client (Axios)
- **Sources:** `worksafeai/web/src/api/client.js`, `super-admin/src/api/client.js`
- **Unified version should support:**
  - Bearer token injection from auth store
  - 401 → refresh token → retry (WorkSafeAI's approach)
  - 401 → logout + event dispatch (Super Admin's approach)
  - Configurable base URL
  - Dev logging
  - Request/response typing (when TypeScript)

### 3. ProtectedRoute Component
- **Sources:** Both `App.jsx` files
- **Pattern:** `isAuthenticated ? children : <Navigate to="/login" />`
- **Extraction:** Generic `<ProtectedRoute>` and `<OnboardingGate>` components

### 4. Endpoint Registry
- **Source:** `super-admin/src/api/endpoints.js`
- **Pattern:** Centralized endpoint constants with parameterized URL builders
- **Extraction:** Per-app endpoint files, but the pattern should be standard

---

## Backend Patterns (→ `packages/api-core/`)

### 1. Middleware Stack ⭐ CRITICAL
| Middleware | Source | Reusable? |
|-----------|--------|-----------|
| `requestIdMiddleware` | `errorHandler.js` | ✅ As-is |
| `structuredLogger` | `errorHandler.js` | ✅ As-is |
| `authenticateToken` | `auth.js` | ✅ As-is |
| `authorizeRole` | `auth.js` | ✅ As-is |
| `validateBody` / `validateQuery` | `validation.js` | ✅ As-is |
| `verifyCompanyAccess` | `companyAccess.js` | ✅ With minor generalization |
| `errorHandler` | `errorHandler.js` | ✅ As-is |
| `validateOrigin` (CSRF) | `server.js` | ✅ Extract to middleware file |

### 2. Services ⭐ HIGH
| Service | Source | Reusable? |
|---------|--------|-----------|
| `authService` | JWT generation, register, login | ✅ ~90% reusable |
| `auditService` | Structured audit logging | ✅ 100% reusable |
| `emailService` | Transporter + templates | ✅ Transport layer reusable; templates per-app |
| `cacheService` | Redis with graceful degradation | ✅ 100% reusable |
| `pdfService` | PDFKit generation | 🟡 Pattern reusable, content per-app |
| `stripeService` | Billing integration | 🟡 If billing is cross-app |

### 3. Validation Patterns ⭐ HIGH
- **Shared schemas:** `loginSchema`, `passwordSchema`, `paginationSchema`
- **Per-app schemas:** Everything domain-specific
- **Pattern:** Zod schema → `validateBody(schema)` middleware → `req.validatedBody`

### 4. Rate Limiting Patterns
- **Source:** `server.js` — per-endpoint rate limiters
- **Extraction:** Standard rate limit configs for auth (10/15min), AI (100/15min), enumeration (100/15min), email (20/hr)

### 5. Server Bootstrap Pattern
- **Source:** `server.js`
- **Pattern:** env validation → security headers → webhook raw body → JSON parsing → rate limiting → CSRF → routes → 404 → error handler → migrations → cache init → listen → graceful shutdown
- **This entire startup sequence should be a template.**

---

## Design Tokens (→ `packages/tailwind-config/`)

### Colors (from both apps)
```css
/* Primary gradient */
from-blue-600 to-cyan-500

/* Background */
from-slate-900 via-slate-800 to-slate-900

/* Glassmorphism */
bg-white/10 backdrop-blur-md border-white/20

/* Status colors */
success: emerald-500
error: red-500
warning: amber-500
info: blue-500

/* Text */
primary: slate-100
secondary: slate-300
muted: slate-400
```

### Common Tailwind Classes (extract to utilities)
```css
/* Card */
.card: bg-white/5 border border-white/10 rounded-2xl

/* Glass card */
.glass: bg-white/10 backdrop-blur-md border border-white/20

/* Gradient text */
.gradient-text: bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent

/* Button primary */
.btn-primary: bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold

/* Animated background blob */
.bg-blob: rounded-full blur-3xl animate-float
```

---

## Landing Page Template ⭐ HIGH
- **Source:** `worksafeai/web/src/pages/LandingPage.jsx`
- **Sections:** Nav → Hero (with stats) → Features (3-col grid) → Benefits (2-col with icons) → How It Works (4-step) → Pricing (3-tier) → CTA → Footer
- **Extraction:** Parameterize: app name, tagline, features list, pricing tiers, stats, CTA text
- **This is a ~400-line component that's 90% reusable across SaaS apps.**

---

## Login/Register Page Templates ⭐ HIGH
- **Sources:** Both apps have `LoginPage.jsx`; WorkSafeAI has `RegisterPage.jsx`
- **Pattern:** Centered card on dark gradient background, form with validation, error display, link to alternate page
- **Extraction:** `<AuthPage type="login|register" fields={[...]} onSubmit={...} />`
