# WorkSafeAI: Intelligence That Protects

**AI-powered workplace safety & hazard intelligence platform**

## 📋 Project Overview

WorkSafeAI is an intelligent workplace safety assessment system that uses AI to:
- Analyze job tasks for potential hazards
- Generate risk assessments automatically
- Track mitigation strategies
- Ensure OSHA compliance
- Protect your workforce with actionable intelligence

## 🏗️ Architecture

```
worksafeai/
├── api/                 # Backend API (3700+ LOC)
│   ├── src/
│   │   ├── routes/      # 35+ API endpoints
│   │   ├── services/    # AI, auth, email, stripe, caching
│   │   ├── middleware/  # Auth, validation, cache
│   │   └── db/          # Supabase schema & migrations
│   ├── tests/           # Integration tests (19+ cases)
│   └── package.json
│
├── web/                 # Frontend UI (1800+ LOC)
│   ├── src/
│   │   ├── pages/       # 10 app pages
│   │   ├── components/  # Reusable React components
│   │   ├── stores/      # Zustand state management
│   │   └── api/         # Axios HTTP client
│   ├── public/          # Static assets
│   └── package.json
│
├── assets/              # Branding & design files
│   └── worksafe_icon.jpg # App icon
│
├── docs/                # App-specific documentation
│   ├── API.md           # API documentation
│   ├── DEPLOYMENT.md    # Deployment guide
│   └── CONTRIBUTING.md  # Development guide
│
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier OK)
- Gmail account with app password

### Backend Setup

```bash
cd api
npm install
cp .env.example .env
# Update .env with your Supabase credentials
npm run dev
```

**Backend runs on:** `http://localhost:3000`

### Frontend Setup

```bash
cd web
npm install
npm run dev
```

**Frontend runs on:** `http://localhost:5174`

## 📚 Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **Cache:** Redis (optional)
- **Auth:** JWT (httpOnly cookies)
- **AI:** OpenAI GPT-4
- **Payments:** Stripe
- **Email:** Gmail SMTP
- **Testing:** Jest + Supertest

### Frontend
- **Framework:** React 18
- **Build:** Vite
- **Styling:** Tailwind CSS
- **State:** Zustand
- **HTTP:** Axios
- **Icons:** Lucide React
- **UI Pattern:** Glassmorphism

## 🔑 Key Features

### Hazard Analysis
- AI-powered hazard detection
- Job task safety assessment
- Risk severity classification
- Automated mitigation generation

### Team Management
- Multi-user workspaces
- Role-based access control (5 roles)
- Invite employees via email
- Audit logging of all actions

### Compliance & Reporting
- OSHA-compliant safety assessments
- PDF report generation
- Safety metrics dashboard
- Compliance tracking

### Billing
- 3-tier pricing (Starter, Pro, Enterprise)
- Stripe integration
- 3-day free trial
- Subscription management

## 🔐 Security

- JWT tokens with explicit algorithm
- bcrypt password hashing (10+ rounds)
- Input validation (Zod schemas)
- Rate limiting (IP-based)
- CSRF protection (production)
- SQL injection prevention (parameterized queries)
- Audit logging
- Company-level data isolation

**Security Status:** ✅ Production-ready (20 security issues reviewed & fixed)

## 📊 Database Schema

8 tables with proper relationships:
- `companies` — Organizations
- `users` — Team members
- `projects` — Safety initiatives
- `jtsas` — Job task assessments
- `hazards` — Identified risks
- `mitigations` — Safety strategies
- `subscriptions` — Billing
- `audit_logs` — Action tracking

## 🧪 Testing

### Run Tests
```bash
cd api
npm test
```

### Test Coverage
- 19+ integration tests
- Auth flow (register, login, token refresh)
- JTSA CRUD operations
- Hazard analysis
- Billing webhook handlers

## 📖 Documentation

- **API:** See `docs/API.md`
- **Deployment:** See `docs/DEPLOYMENT.md`
- **Contributing:** See `docs/CONTRIBUTING.md`
- **Architecture:** See root `docs/ARCHITECTURE.md`
- **Email:** See root `EMAIL_SETUP.md`
- **Branding:** See root `BRANDING.md`

## 🛠️ Development Commands

**Backend:**
```bash
cd api
npm run dev       # Start development server with nodemon
npm test          # Run integration tests
npm run lint      # Lint code
```

**Frontend:**
```bash
cd web
npm run dev       # Start Vite dev server
npm run build     # Build for production
npm run lint      # Lint code
npm run preview   # Preview production build
```

## 🚀 Deployment

### Backend
- Supports deployment to Vercel, Heroku, AWS, etc.
- Uses environment variables for config
- Database migrations auto-run on startup

### Frontend
- Optimized Vite build
- Deploys to Vercel, Netlify, GitHub Pages
- Hardened with CSP headers
- Gzip compression enabled

See `docs/DEPLOYMENT.md` for detailed instructions.

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/my-feature`
4. Open a Pull Request

See `docs/CONTRIBUTING.md` for guidelines.

## 📧 Support

- **Email:** f5zothoi@gmail.com (configured for system emails)
- **Issues:** Create GitHub issue with details
- **Documentation:** See `docs/` folder

## 📄 License

WorkSafeAI is proprietary software. All rights reserved.

---

**Version:** 0.1.0 (MVP)  
**Status:** Production-ready  
**Last Updated:** 2026-03-07  
**Maintained by:** Lucy (AI Assistant)
