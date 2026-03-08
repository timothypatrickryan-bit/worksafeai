# App Development Template — Tim's Workflow

Reusable template for building and deploying new apps. Based on WorkSafeAI (2026-03-08).

---

## 🏗️ Project Structure

```
apps/
├── [app-name]/
│   ├── api/                 # Express backend
│   │   ├── src/
│   │   │   ├── server.js
│   │   │   ├── routes/      # API endpoints
│   │   │   ├── middleware/  # auth, validation, etc.
│   │   │   ├── services/    # business logic
│   │   │   └── db/          # schema, migrations
│   │   ├── package.json
│   │   ├── .env
│   │   ├── vercel.json      # Vercel config
│   │   └── .gitignore
│   │
│   └── web/                 # React/Vite frontend
│       ├── src/
│       │   ├── App.jsx
│       │   ├── components/
│       │   ├── pages/
│       │   └── stores/      # Zustand state
│       ├── package.json
│       ├── vite.config.js
│       ├── .env
│       └── index.html
├── [other-app]/
├── shared/                  # Shared utilities
├── tools/                   # Scripts, configs
└── docs/                    # Shared documentation
```

---

## 🛠️ Tech Stack (Proven Choices)

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express 5.x
- **Database:** PostgreSQL (via Supabase)
- **Auth:** JWT (1h access token, 7d refresh token)
- **Validation:** Zod
- **Security:** Helmet, CORS, Rate Limiting
- **Email:** Nodemailer (Gmail SMTP)
- **AI:** OpenAI GPT-4 or Anthropic Claude
- **PDFs:** PDFKit
- **Payments:** Stripe (when needed)
- **Caching:** Redis (optional)
- **Testing:** Jest + Supertest

### Frontend
- **Framework:** React 18+
- **Build:** Vite 5.x
- **CSS:** Tailwind CSS 3.x
- **State:** Zustand (lightweight, persistent)
- **HTTP:** fetch API (built-in)
- **Database Client:** @supabase/supabase-js
- **Design:** Glassmorphic, dark mode friendly

### Deployment
- **Hosting:** Vercel (API + Web)
- **Database:** Supabase (PostgreSQL + Auth)
- **Domains:** Custom domains via DNS CNAME
- **Secrets:** Vercel environment variables

---

## 📋 Frontend Checklist (Vite + React)

```bash
# Create new Vite project
npm create vite@latest [app-name] -- --template react
cd [app-name]
npm install

# Add essential packages
npm install zustand @supabase/supabase-js -S
npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms

# Initialize Tailwind
npx tailwindcss init -p

# Create .env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

### Frontend Structure
```
src/
├── App.jsx              # Main component
├── components/
│   ├── Layout.jsx
│   ├── LoginPage.jsx
│   ├── Dashboard.jsx
│   └── [Feature]/
├── pages/
├── stores/              # Zustand stores
│   ├── authStore.js
│   └── appStore.js
├── styles/
│   └── globals.css      # Tailwind + custom
├── utils/
│   ├── api.js           # fetch wrapper
│   └── auth.js          # JWT handling
└── assets/
    └── images/
```

### Key Components
- **Auth Flow:** register → verify email → login → JWT stored in localStorage
- **Session Persistence:** Zustand `persist()` middleware saves auth state
- **API Calls:** Centralized fetch wrapper that includes JWT header
- **Error Handling:** Graceful fallbacks, clear error messages

---

## 🚀 Backend Checklist (Express + Supabase)

```bash
# Create new project
mkdir [app-name]-backend
cd [app-name]-backend
npm init -y

# Install dependencies
npm install express helmet cors jsonwebtoken dotenv @supabase/supabase-js zod
npm install -D nodemon jest supertest

# Create .env
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
JWT_SECRET=your-secret-here
CORS_ORIGIN=http://localhost:5173
```

### Backend Structure
```
src/
├── server.js            # Express app + listen
├── routes/              # API endpoints
│   ├── auth.js
│   ├── companies.js
│   ├── projects.js
│   └── [feature].js
├── middleware/
│   ├── auth.js          # JWT verification
│   ├── validation.js    # Zod validation
│   └── errorHandler.js
├── services/            # Business logic
│   ├── authService.js
│   ├── aiService.js     # OpenAI calls
│   ├── emailService.js
│   └── [feature]Service.js
├── validation/          # Zod schemas
│   └── schemas.js
└── db/
    └── schema.sql       # Database DDL
```

### API Patterns
```javascript
// Route structure
router.post('/resource', validateInput(schema), requireAuth, async (req, res) => {
  try {
    // Logic
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supabase query pattern
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('id', id);
if (error) throw error;
```

### Database Pattern
- Create full schema in `schema.sql`
- Run in Supabase SQL editor
- Use Supabase migrations for iterative changes
- Add indexes on frequently queried columns

---

## 🌐 Deployment Workflow (Vercel)

### Step 1: Get Vercel Token
1. Go to https://vercel.com/account/tokens
2. Create new token (copy immediately)
3. Store securely (never commit)

### Step 2: Create `vercel.json` (Backend)
```json
{
  "version": 2,
  "buildCommand": "npm install",
  "env": {
    "NODE_ENV": "production"
  },
  "rewrites": [
    { "source": "/(.*)", "destination": "/src/server.js" }
  ]
}
```

### Step 3: Deploy Apps
```bash
# Frontend
cd apps/[app]/web
vercel deploy --prod --yes --token <TOKEN>

# Backend
cd apps/[app]/api
vercel deploy --prod --yes --token <TOKEN>

# Second frontend (admin, etc.)
cd apps/[app]/admin
vercel deploy --prod --yes --token <TOKEN>
```

### Step 4: Configure Environment Variables (API)
For each Vercel project, set these env vars via API:

**Frontend:**
- `VITE_API_URL` = backend URL
- `VITE_SUPABASE_URL` = Supabase project URL
- `VITE_SUPABASE_ANON_KEY` = Supabase anon key

**Backend:**
- `NODE_ENV` = production
- `SUPABASE_URL` = Supabase URL
- `SUPABASE_ANON_KEY` = anon key
- `SUPABASE_SERVICE_ROLE_KEY` = service role key
- `JWT_SECRET` = your secret
- `CORS_ORIGIN` = frontend URLs (comma-separated)
- `GMAIL_USER` = email address
- `GMAIL_PASSWORD` = app-specific password

### Step 5: Add Custom Domains
1. Get project IDs from `.vercel/project.json`
2. Use Vercel API to add domains:
```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  https://api.vercel.com/v9/projects/PROJECT_ID/domains \
  -d '{"name":"subdomain.yourdomain.com"}'
```

### Step 6: Configure DNS
Add CNAME records at your domain provider:
```
subdomain  CNAME  cname.vercel.com
```

---

## 🔐 Supabase Setup

### Initial Setup
1. Create project at https://supabase.com
2. Go to Settings → API
3. Copy: **Project URL** and **Anon Public Key**
4. Go to Settings → Database → Database Password → Reset & copy service role key

### Database Schema
- Create tables in SQL editor
- Add RLS policies (Row-Level Security)
- Create indexes on foreign keys + frequently queried columns
- Document schema in `schema.sql`

### Example RLS Policy
```sql
-- Users can only see their own company's data
CREATE POLICY company_isolation ON projects
  USING (company_id = auth.uid()::uuid);
```

---

## 🔑 Environment Variables Checklist

### Development (.env)
```
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
JWT_SECRET=dev-secret-change-in-prod
CORS_ORIGIN=http://localhost:5173
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password
OPENAI_API_KEY=sk-xxx
STRIPE_SECRET_KEY=sk-test-xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Production (Vercel)
- Same as above, but with real keys
- Use Vercel dashboard or API to set
- Never commit `.env` files

---

## 📦 Deployment Automation Script

Save as `scripts/deploy.sh`:

```bash
#!/bin/bash
set -e

TOKEN=$1
APP_NAME=$2

if [ -z "$TOKEN" ] || [ -z "$APP_NAME" ]; then
  echo "Usage: ./deploy.sh <VERCEL_TOKEN> <APP_NAME>"
  exit 1
fi

echo "🚀 Deploying $APP_NAME..."

# Frontend
echo "→ Deploying web frontend..."
cd apps/$APP_NAME/web
vercel deploy --prod --yes --token $TOKEN

# Backend
echo "→ Deploying API backend..."
cd ../api
vercel deploy --prod --yes --token $TOKEN

echo "✅ $APP_NAME deployed!"
```

---

## 🧪 Testing Checklist

### Frontend
- [ ] Login/register flow
- [ ] Session persistence (refresh page, still logged in)
- [ ] API calls work with real backend
- [ ] Error handling (display toasts, etc.)
- [ ] Responsive design
- [ ] Dark mode works

### Backend
- [ ] All endpoints return correct status codes
- [ ] Auth required for protected routes
- [ ] Company isolation enforced
- [ ] Validation catches bad inputs
- [ ] Database queries are optimized
- [ ] Error messages are helpful

### E2E
- [ ] User can sign up → verify email → login
- [ ] User can create project
- [ ] User can create resource (JTSA, etc.)
- [ ] PDF generation works
- [ ] Email notifications sent
- [ ] Admin dashboard loads

---

## 🔍 Code Review Setup (Optional)

Use Opus 4.6 for automated code reviews:

**In HEARTBEAT.md:**
```markdown
## Code Review (Every 30 minutes)
- Spawn Opus 4.6 to review `/apps/[app]/api/`
- Auto-fix critical + high issues
- Report findings
```

**In OpenClaw config:**
```json
{
  "acp": {
    "allowedAgents": ["opus"]
  }
}
```

---

## 📚 Documentation to Create

For each app, create:

1. **README.md** — Overview, setup, deployment
2. **ENDPOINTS.md** — All API routes with examples
3. **SCHEMA.md** — Database tables + relationships
4. **SETUP_LOCAL.md** — Local dev environment
5. **DEPLOYMENT.md** — Step-by-step deploy guide
6. **BRANDING.md** — Colors, messaging, logo usage

---

## 🎯 Quick Start for Next App

```bash
# 1. Create project directories
mkdir apps/[new-app]
mkdir apps/[new-app]/api
mkdir apps/[new-app]/web

# 2. Use this template
# → Copy backend structure
# → Copy frontend structure
# → Update names, colors, endpoints

# 3. Set up Supabase
# → Create new project
# → Run schema.sql
# → Get credentials

# 4. Deploy
# → Get Vercel token
# → Run deployment script
# → Add DNS CNAME records

# 5. Test
# → Login flow
# → Create resource
# → Verify API calls
```

---

## 📊 WorkSafeAI Reference (Completed Example)

- **Frontend:** React 18 + Vite + Tailwind + Zustand
- **Backend:** Express + Supabase + OpenAI
- **Deployment:** Vercel (3 projects: web, api, admin)
- **Domains:** worksafeai.elevationaiwork.com, etc.
- **Features:** Auth, CRUD, AI generation, PDF export, email
- **Status:** Production-ready (March 8, 2026)

---

## 🛑 Common Pitfalls

❌ **Don't:**
- Hardcode API URLs (use env vars)
- Commit `.env` files or secrets
- Skip database indexes (slow queries)
- Forget CORS configuration
- Store JWT in cookies (localStorage preferred for SPAs)
- Deploy without testing auth flow

✅ **Do:**
- Use TypeScript for large projects (optional but recommended)
- Test auth + CRUD locally before deploying
- Set up monitoring/logging in production
- Use database transactions for multi-step operations
- Document API endpoints with examples
- Keep dependencies updated

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Express Docs:** https://expressjs.com
- **React Docs:** https://react.dev
- **Tailwind Docs:** https://tailwindcss.com

---

**Last Updated:** March 8, 2026 (WorkSafeAI v1 deployed)  
**Created by:** Lucy  
**For:** Tim's future app development
