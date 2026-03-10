# Shared Services Architecture

> How to structure shared packages and services across 10+ apps.
> Generated: 2026-03-08

---

## Monorepo Structure

```
elevationai/
├── apps/
│   ├── worksafeai/
│   │   ├── api/          # Express backend
│   │   ├── web/          # Vite + React frontend
│   │   └── README.md
│   ├── super-admin/      # Vite + React admin console
│   ├── app-two/
│   │   ├── api/
│   │   └── web/
│   └── app-three/
│       ├── api/
│       └── web/
├── packages/
│   ├── ui/               # Shared React components
│   ├── auth/             # Auth store, API client, protected routes
│   ├── hooks/            # useFetch, useForm, etc.
│   ├── api-core/         # Express middleware, services, patterns
│   ├── tailwind-config/  # Shared Tailwind preset
│   ├── validation/       # Shared Zod schemas
│   └── email-templates/  # React Email or MJML templates
├── templates/
│   ├── app-frontend/     # Cookiecutter for new frontend
│   └── app-backend/      # Cookiecutter for new backend
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

---

## Package Details

### `packages/ui` — Shared UI Components

```json
{
  "name": "@elevationai/ui",
  "exports": {
    "./DataTable": "./src/DataTable.jsx",
    "./Modal": "./src/Modal.jsx",
    "./Toast": "./src/Toast.jsx",
    "./Pagination": "./src/Pagination.jsx",
    "./ErrorBoundary": "./src/ErrorBoundary.jsx",
    "./SkeletonLoader": "./src/SkeletonLoader.jsx",
    "./AppShell": "./src/AppShell.jsx",
    "./StatusBadge": "./src/StatusBadge.jsx",
    "./EmptyState": "./src/EmptyState.jsx",
    "./ConfirmDialog": "./src/ConfirmDialog.jsx",
    "./SearchInput": "./src/SearchInput.jsx",
    "./StatCard": "./src/StatCard.jsx"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "lucide-react": "^0.500.0"
  }
}
```

**Usage in apps:**
```jsx
import { DataTable } from '@elevationai/ui/DataTable';
import { Modal } from '@elevationai/ui/Modal';
import { useNotifications } from '@elevationai/ui/Toast';
```

### `packages/auth` — Authentication Package

```
packages/auth/
├── src/
│   ├── authStore.js       # Zustand store factory
│   ├── apiClient.js       # Axios instance factory
│   ├── ProtectedRoute.jsx # Route guard component
│   ├── OnboardingGate.jsx # Onboarding check wrapper
│   └── tokenUtils.js      # JWT decode, expiry check
├── package.json
└── README.md
```

**Key design decision:** Factory functions, not singletons.

```js
// packages/auth/src/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export function createAuthStore(options = {}) {
  const {
    name = 'auth-store',
    tokenStorage = 'zustand',  // 'zustand' | 'cookie'
    loginUrl = '/api/auth/login',
    refreshUrl = '/api/auth/refresh-token',
    onLogout = () => {},
    roleGate = null,  // e.g., ['admin', 'owner'] for super-admin
  } = options;

  return create(persist((set, get) => ({
    // ... standard auth store with configurable behavior
  }), { name }));
}
```

**Usage:**
```js
// In worksafeai/web
const useAuthStore = createAuthStore({
  tokenStorage: 'cookie',
  loginUrl: '/api/auth/login',
});

// In super-admin
const useAuthStore = createAuthStore({
  tokenStorage: 'zustand',
  roleGate: ['admin', 'owner'],
});
```

### `packages/hooks` — Shared Hooks

```
packages/hooks/
├── src/
│   ├── useFetch.js
│   ├── useForm.js
│   ├── useDebounce.js
│   ├── useLocalStorage.js
│   ├── useMediaQuery.js
│   └── useClickOutside.js
└── package.json
```

### `packages/api-core` — Backend Core

```
packages/api-core/
├── src/
│   ├── middleware/
│   │   ├── auth.js          # authenticateToken, authorizeRole
│   │   ├── validation.js    # validateBody, validateQuery
│   │   ├── errorHandler.js  # errorHandler, requestId, structuredLogger
│   │   ├── rateLimiter.js   # Standard rate limit configs
│   │   └── csrf.js          # Origin validation
│   ├── services/
│   │   ├── auditService.js
│   │   ├── cacheService.js
│   │   ├── emailService.js  # Transport only (templates per-app)
│   │   └── authService.js   # JWT generation, password hashing
│   ├── validation/
│   │   ├── common.js        # passwordSchema, paginationSchema, etc.
│   │   └── index.js
│   ├── bootstrap.js         # Server startup sequence
│   └── index.js
└── package.json
```

**Usage:**
```js
// In any app's server.js
const { bootstrap } = require('@elevationai/api-core');
const { authenticateToken, authorizeRole } = require('@elevationai/api-core/middleware/auth');
const { validateBody } = require('@elevationai/api-core/middleware/validation');
const { auditService } = require('@elevationai/api-core/services');
```

### `packages/tailwind-config` — Design System

```js
// packages/tailwind-config/preset.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfeff',
          500: '#06b6d4',  // cyan-500
          600: '#0891b2',
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          from: { transform: 'translateY(10px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
      },
      backdropBlur: {
        md: '12px',
      },
    },
  },
  plugins: [],
};
```

**Usage in app's tailwind.config.js:**
```js
const sharedPreset = require('@elevationai/tailwind-config/preset');

module.exports = {
  presets: [sharedPreset],
  content: ['./src/**/*.{js,jsx}', '../../packages/ui/src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // App-specific overrides
    },
  },
};
```

### `packages/validation` — Shared Zod Schemas

```js
// Common schemas used across all apps
export const passwordSchema = z.string()
  .min(12).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[!@#$%^&*()_+\-=...]/);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export const uuidParam = z.string().uuid();
```

---

## Shared Database Patterns

### Per-App Supabase Projects vs Shared
**Recommendation:** Shared Supabase project with schema isolation.

```sql
-- Each app gets its own schema prefix
-- worksafeai: wsai_users, wsai_companies, wsai_jtsas
-- app-two:    at_users, at_companies, at_items

-- OR use Postgres schemas:
CREATE SCHEMA worksafeai;
CREATE SCHEMA app_two;
```

### Common Tables (shared across apps)
```sql
-- These exist in every app with the same structure:
users (id, email, password_hash, full_name, role, company_id, is_active, email_verified, ...)
companies (id, name, industry, subscription_tier, ...)
subscriptions (id, company_id, tier, status, ...)
audit_logs (id, company_id, user_id, action, resource_type, ...)
email_verification_tokens (id, user_id, token_hash, expires_at, ...)
password_reset_tokens (id, user_id, token_hash, expires_at, ...)
```

### Migration Pattern
- **Source:** WorkSafeAI's `migrationService.js` + `databaseMigrator.js`
- **Pattern:** Numbered SQL files, migration tracking table, rollback support
- **Shared:** Migration runner; Per-app: migration files

---

## Service Communication

For 10+ apps, eventually need:
1. **Shared auth service** — Single sign-on across apps (JWT with shared secret or OAuth2)
2. **Shared billing service** — Stripe integration in one place
3. **Shared email service** — Queue-based email sending
4. **Event bus** — For cross-app notifications (start simple: shared Supabase realtime or webhooks)

**But not yet.** For the first 5 apps, keep it simple:
- Shared packages (code reuse, not service reuse)
- Per-app databases
- Per-app auth (with same JWT structure for potential SSO later)
- Per-app deploys to Vercel

---

## Deployment Architecture

```
                    ┌─────────────────┐
                    │   Cloudflare    │
                    │   DNS/CDN       │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
    ┌─────────▼──────┐  ┌───▼────────┐  ┌──▼──────────┐
    │ worksafeai.     │  │ app2.      │  │ superadmin. │
    │ elevationai.com │  │ elevationai│  │ elevationai │
    │ (Vercel)        │  │ (Vercel)   │  │ (Vercel)    │
    └─────────┬──────┘  └───┬────────┘  └─────────────┘
              │              │
    ┌─────────▼──────┐  ┌───▼────────┐
    │ worksafeai-api  │  │ app2-api   │  
    │ (Vercel/Render) │  │ (Vercel)   │
    └─────────┬──────┘  └───┬────────┘
              │              │
              └──────┬───────┘
                     │
            ┌────────▼────────┐
            │    Supabase     │
            │  (shared or     │
            │   per-app)      │
            └─────────────────┘
```
