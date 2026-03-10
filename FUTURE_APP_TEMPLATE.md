# Future App Template

> What to copy, what to customize, and what to build fresh for every new app.
> Generated: 2026-03-08

---

## New App Scaffolding

When Tim starts a new app, here's exactly what happens:

### Step 1: Create Directory Structure

```
apps/new-app/
├── api/
│   ├── src/
│   │   ├── middleware/     # Import from @elevationai/api-core (don't copy)
│   │   ├── routes/
│   │   │   ├── auth.js     # Copy from template, minimal customization
│   │   │   ├── health.js   # Copy as-is
│   │   │   └── [domain].js # Build fresh
│   │   ├── services/
│   │   │   ├── authService.js  # Import from shared
│   │   │   └── [domain]Service.js  # Build fresh
│   │   ├── validation/
│   │   │   └── schemas.js  # Import common + add domain schemas
│   │   ├── config/
│   │   │   └── envValidation.js  # Copy + modify required vars
│   │   └── server.js       # Copy from template, update routes
│   ├── migrations/          # Build fresh
│   ├── package.json         # Copy template, update name
│   ├── .env.example         # Copy + modify
│   └── Dockerfile           # Copy as-is
├── web/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js   # Import from @elevationai/auth
│   │   ├── stores/
│   │   │   └── authStore.js # Factory from @elevationai/auth
│   │   ├── components/      # Import from @elevationai/ui
│   │   ├── hooks/           # Import from @elevationai/hooks
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx      # Copy template, customize branding
│   │   │   ├── RegisterPage.jsx   # Copy template, customize fields
│   │   │   ├── LandingPage.jsx    # Copy template, customize content
│   │   │   ├── DashboardPage.jsx  # Build fresh
│   │   │   └── [domain]/         # Build fresh
│   │   ├── App.jsx          # Copy template, update routes
│   │   └── main.jsx         # Copy as-is
│   ├── public/
│   │   └── [app-icon].jpg   # New per app
│   ├── tailwind.config.js   # Extend shared preset
│   ├── vite.config.js       # Copy as-is
│   ├── package.json         # Copy template, update name
│   └── index.html           # Copy, update title
└── README.md
```

---

## Copy vs Import vs Build Matrix

| Item | Strategy | Effort |
|------|----------|--------|
| **Auth middleware** | Import from `@elevationai/api-core` | None |
| **Validation middleware** | Import from `@elevationai/api-core` | None |
| **Error handler** | Import from `@elevationai/api-core` | None |
| **Rate limiter configs** | Import from `@elevationai/api-core` | None |
| **Audit service** | Import from `@elevationai/api-core` | None |
| **Cache service** | Import from `@elevationai/api-core` | None |
| **DataTable, Modal, Toast** | Import from `@elevationai/ui` | None |
| **useFetch, useForm** | Import from `@elevationai/hooks` | None |
| **Auth store** | Factory from `@elevationai/auth` | Config only |
| **API client** | Factory from `@elevationai/auth` | Config only |
| **ProtectedRoute** | Import from `@elevationai/auth` | None |
| **Tailwind config** | Extend `@elevationai/tailwind-config` | Config only |
| **Password schema** | Import from `@elevationai/validation` | None |
| **Login schema** | Import from `@elevationai/validation` | None |
| **server.js** | Copy template + modify routes | 30 min |
| **LoginPage.jsx** | Copy template + rebrand | 15 min |
| **RegisterPage.jsx** | Copy template + customize fields | 30 min |
| **LandingPage.jsx** | Copy template + rewrite content | 2 hrs |
| **Layout** | Import `<AppShell>` + configure nav | 30 min |
| **Domain routes** | Build fresh | Varies |
| **Domain schemas** | Build fresh | Varies |
| **Domain pages** | Build fresh | Varies |
| **Database migrations** | Build fresh | Varies |
| **Email templates** | Copy + customize content | 1 hr |
| **env vars** | Copy `.env.example` + fill | 15 min |

**Time to first working app with auth + landing + dashboard: ~4 hours**
(vs ~40 hours building from scratch)

---

## Template Files

### `server.js` Template

```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createClient } = require('@supabase/supabase-js');
const {
  errorHandler, requestIdMiddleware, structuredLogger
} = require('@elevationai/api-core/middleware/errorHandler');
const { assertEnv } = require('./config/envValidation');

assertEnv();
const app = express();

// Security
app.use(helmet());
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Core middleware
app.use(requestIdMiddleware);
app.use(structuredLogger);
app.use(express.json({ limit: '1mb' }));

// Rate limiting (import standard configs)
const { authLimiter, apiLimiter } = require('@elevationai/api-core/middleware/rateLimiter');
app.use('/api/auth/login', authLimiter);

// CSRF
const { validateOrigin } = require('@elevationai/api-core/middleware/csrf');
app.use(validateOrigin);

// Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
app.locals.supabase = supabase;

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/[domain]'));
app.use('/health', require('./routes/health'));

// Error handling
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));
module.exports = app;
```

### `App.jsx` Template

```jsx
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@elevationai/auth';
import { ErrorBoundary } from '@elevationai/ui/ErrorBoundary';
import { Toast } from '@elevationai/ui/Toast';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import AppShell from './components/AppShell';

function App() {
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initializeAuth();
    setInitialized(true);
  }, []);

  if (!initialized) return <LoadingScreen />;

  return (
    <ErrorBoundary>
      <Toast />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AppShell navItems={NAV_ITEMS}>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  {/* Domain routes here */}
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          } />
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />
          } />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
```

### `.env.example` Template

```bash
# App
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Database
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=

# Auth
JWT_SECRET=            # Generate: openssl rand -hex 64
JWT_REFRESH_SECRET=    # Generate: openssl rand -hex 64
JWT_EXPIRY=3600
JWT_REFRESH_EXPIRY=604800

# Email
EMAIL_PROVIDER=smtp
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@elevationaiwork.com

# Cache (optional)
REDIS_URL=

# Billing (optional)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Frontend
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=MyApp
```

---

## Customization Checklist for New Apps

- [ ] Update `package.json` name and description
- [ ] Update `index.html` title and meta tags
- [ ] Add app icon to `public/`
- [ ] Configure nav items in AppShell
- [ ] Set up `.env` with app-specific values
- [ ] Create domain-specific routes
- [ ] Create domain-specific Zod schemas
- [ ] Create database migrations
- [ ] Write landing page content
- [ ] Configure Vercel project
- [ ] Add Cloudflare subdomain
- [ ] Update Super Admin to monitor new app
