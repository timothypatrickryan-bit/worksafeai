# Consensus Project Setup — March 11, 2026

## ✅ What's Been Created

Fully scaffolded product review aggregation app, ready for development.

### Directory Structure
```
/apps/consensus/
├── api/          # Node.js + Express backend
├── web/          # React + Vite frontend
├── assets/       # Images, icons (empty)
├── docs/         # Documentation (empty)
├── README.md     # Project overview
├── SETUP_LOCAL.md # Local development guide
└── .gitignore
```

---

## 🎨 Design & Branding

**Name:** Consensus  
**Domain:** consensus.elevationaiwork.com  
**Tagline:** "One place for all product reviews"  
**Vibe:** Crisp, clean, news/information resource aesthetic

**Color Palette:**
- Primary: Sky blue (hover states, CTA)
- Secondary: Slate grays (text, borders)
- Accents: Amber (ratings), Green/Red (sentiment)

**Key UI Elements:**
- Clean header with logo + navigation
- Centered search bar (hero section)
- Responsive tile grid (mobile-first)
- Product cards with rating, source, excerpt, link

---

## 📦 Tech Stack (Same as WorkSafeAI)

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 5.x
- **Database:** Supabase (PostgreSQL) — *to be integrated*
- **Caching:** Redis (optional)
- **Security:** Helmet, CORS, Rate Limiting

### Frontend
- **Framework:** React 18 + Vite 5
- **State:** Zustand (future, not yet added)
- **Styling:** Tailwind CSS 3.4
- **HTTP:** Axios (imported, ready to use)
- **Build:** Vite with hot module reload

---

## 🚀 Quick Start (Local Dev)

### Terminal 1 — Backend
```bash
cd apps/consensus/api
npm install
npm run dev  # Runs on http://localhost:3000
```

### Terminal 2 — Frontend
```bash
cd apps/consensus/web
npm install
npm run dev  # Runs on http://localhost:5173
```

Visit **http://localhost:5173** → Type a product → See mock results

---

## 📋 Files Created

### Backend (`api/`)
- `package.json` — Dependencies (express, cors, helmet, zod, etc.)
- `src/server.js` — Main server with middleware, routes, error handling
- `src/config/envValidation.js` — Environment variable validation
- `src/middleware/errorHandler.js` — Logging, request IDs, error responses
- `src/routes/health.js` — Health check endpoint
- `src/routes/search.js` — Mock search endpoint (scaffold for aggregation)
- `.env.example` — Configuration template

### Frontend (`web/`)
- `package.json` — Dependencies (react, vite, tailwind, axios, zustand)
- `vite.config.js` — Vite configuration with proxy
- `tailwind.config.js` — Tailwind theming
- `postcss.config.js` — PostCSS plugins
- `index.html` — HTML entry point
- `src/main.jsx` — React app entry
- `src/App.jsx` — Main component (state, search logic)
- `src/index.css` — Tailwind imports + custom components
- `src/components/Header.jsx` — Navigation header
- `src/components/SearchBar.jsx` — Search form
- `src/components/ResultsGrid.jsx` — Tile grid layout
- `src/components/ReviewCard.jsx` — Individual review card
- `src/components/icons/StarIcon.jsx` — Star rating display
- `.env.example` — Configuration template

### Documentation
- `README.md` — Full project overview + architecture
- `SETUP_LOCAL.md` — Step-by-step local development setup
- `.gitignore` — Standard Node.js ignore rules

---

## 🎯 Current State

**Fully Functional:**
- ✅ Backend server boots without errors
- ✅ Frontend app runs with hot reload
- ✅ Search API accepts requests (returns mock data)
- ✅ UI components render correctly
- ✅ Responsive design (mobile-first)
- ✅ Rate limiting configured
- ✅ Error handling middleware in place

**Not Yet Implemented:**
- ❌ Real review aggregation (mock data only)
- ❌ Database integration (Supabase schema pending)
- ❌ User accounts / authentication
- ❌ Caching layer
- ❌ State management (Zustand ready but not wired)
- ❌ Testing suite

---

## 📊 Next Phase (Phase 2: Core Features)

### Week 1 Priority
1. **Database Schema** — Design & create Supabase tables
   - `reviews` — Aggregated reviews
   - `products` — Product metadata
   - `sources` — Review source definitions
   - `review_mappings` — Normalize different source formats

2. **First Data Source** — Implement Amazon reviews
   - Research API or scraping options
   - Normalize to common schema
   - Handle pagination + rate limits

3. **Search Aggregation** — Wire up real data
   - Replace mock endpoint
   - Query multiple sources
   - Return normalized results

4. **Caching** — Add Redis
   - Cache popular searches
   - Improve response time
   - Reduce external API calls

### Week 2 Priority
- Error handling + edge cases (no results, API down, etc.)
- Performance optimization
- More data sources (Google, Trustpilot, Reddit)
- Sentiment analysis

---

## 🔌 Data Sources to Implement (Priority Order)

1. **Amazon** — Largest product review database
2. **Google Shopping** — User reviews + pricing
3. **Trustpilot** — Verified reviews + company info
4. **Reddit** — Discussions + community opinions
5. **YouTube** — Review video metadata
6. **News** — TechCrunch, Wirecutter mentions (future)

---

## 🚢 Deployment Path

### Step 1: Create Vercel Projects
- `consensus-web` (Frontend)
- `consensus-api` (Backend)

### Step 2: Set Environment Variables
**Frontend:**
```
VITE_API_URL=https://consensus-api.elevationaiwork.com
```

**Backend:**
```
NODE_ENV=production
SUPABASE_URL=https://yajgvdolpynezwlwkvva.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
ALLOWED_ORIGINS=https://consensus.elevationaiwork.com
```

### Step 3: Add Custom Domains
- `consensus.elevationaiwork.com` → web project
- `consensus-api.elevationaiwork.com` → api project
- Add CNAME records in Cloudflare

### Step 4: Deploy
- Push to GitHub or trigger manual deploy on Vercel
- DNS propagation (up to 24h)
- Test login flow on production domain

---

## 💡 Design Decisions

**Why this stack?**
- Same as WorkSafeAI — proven, documented, Tim knows it
- Express for simplicity (no complex framework)
- React for interactivity (search autocomplete, filtering in future)
- Tailwind for consistent, clean design
- Vercel for deployment (instant, zero-config)

**Why no auth yet?**
- Public search by design (no login barrier)
- Authentication can be added later (saved searches, preferences)

**Why mock data?**
- Let Tim approve architecture before implementing expensive data sources
- Test UI/UX with realistic data structure
- Plan caching/performance before real scale

---

## 📚 Documentation Index

| File | Purpose |
|------|---------|
| `/apps/consensus/README.md` | Full project overview + roadmap |
| `/apps/consensus/SETUP_LOCAL.md` | Local development quickstart |
| `CONSENSUS_PROJECT_SETUP.md` | This file (what's been done) |

---

## 🎉 You're Ready!

Everything is scaffolded and ready to run. Next steps:

1. **Run locally** — Follow SETUP_LOCAL.md
2. **Review the code** — Get familiar with structure
3. **Plan data sources** — Which APIs/services to integrate first?
4. **Design database** — What review fields to store?
5. **Decide launch** — MVP features before production?

---

**Created:** March 11, 2026 at 10:25 AM EST  
**Status:** Ready for development  
**Next Review:** After Phase 1 testing complete
