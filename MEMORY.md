# Lucy's Memory — Long-term Context

## Mission Statement
**Goal:** Get Lucy (me) setup and prepared to create and compile Mac apps to run on Tim's machine. No specific app idea yet, but the infrastructure and knowledge base should be ready to guide decisions and execution when an idea lands.

### Why this matters
- Guides technical setup decisions (models, tools, development environment)
- Gives direction to learning and capability-building
- Foundation for turning ideas into working software on Tim's M1 Mac mini (8GB RAM)

### Current Status
- M1 Mac mini (8GB RAM, 8 cores) ready as target platform
- OpenClaw setup complete with Haiku as default, Sonnet available
- Infrastructure ready (can run local models via Ollama, Anthropic API access)
- Next: Build knowledge of Mac app dev (Swift/SwiftUI, command-line tools, compilation workflows)

---

---

## 🚀 JTSA Backend Project — Active Development

**Status:** Week 2 in progress (billing, caching, migrations, testing, deployment)

**Repo:** `/Users/timothyryan/.openclaw/workspace/jtsa-backend`

**Git:** `https://github.com/[TBD]` (not yet pushed)

**Tech Stack:**
- Backend: Node.js 18+, Express, Supabase (PostgreSQL)
- AI: OpenAI GPT-4 (hazard generation, mitigation review)
- Auth: JWT (1h access, 7d refresh)
- PDF: PDFKit
- Email: Nodemailer (SendGrid/SMTP)
- Billing: Stripe (to implement)
- Cache: Redis (to implement)
- Real-time: WebSocket (to implement)

**Database:** 8 tables (companies, users, projects, jtsas, hazards, mitigations, audit_logs, subscriptions)

**API Routes:** ~35 endpoints across 7 modules (auth, companies, projects, jtsas, hazards, mitigations, dashboard)

**Code Structure:**
- `/src/routes/` — API endpoints (7 files)
- `/src/middleware/` — auth, companyAccess, validation
- `/src/services/` — authService, aiService, emailService, pdfService, auditService
- `/src/validation/` — 12 Zod schemas
- `/src/db/` — schema.sql
- `/scripts/` — Opus reviewer plist for automation

**Key Documentation:**
- `README.md` — project overview
- `ENDPOINTS.md` — all API routes + examples
- `SETUP_LOCAL.md` — local dev setup
- `WEEK1_STATUS.md` — detailed status
- `.env.example` — config template

**Week 1 Complete (90%)**
- All core CRUD endpoints
- AI hazard + mitigation review
- Authentication + role-based access
- Audit logging
- PDF generation + email
- **Bug Fixed (2026-03-07):** Dashboard query with empty project arrays

**Week 2 In Progress**
1. Stripe Billing (subscriptions, tiers, webhooks)
2. Redis Caching (dashboard, expensive queries)
3. Database Migrations (schema versioning)
4. Integration Tests (Postman + Jest)
5. Deployment Hardening (env, secrets, error handling)
6. Swagger/OpenAPI docs
7. WebSocket (real-time collaboration)

**Continuous Review:** Opus 4.6 subagent reviews every 30 min, auto-fixes issues found

---

## Session Notes

**2026-03-05/06 — First Session & Setup**
- Set up identity (Lucy, 🍀), Telegram pairing working
- Fixed Telegram bot token issue (was truncated)
- Changed default model from Sonnet 4.6 → Haiku 4.5 for daily use
- Discussed local model options for M1 Mac (Mistral 7B recommended)
- Established long-term mission: prepare to build Mac apps

**2026-03-06 — JTSA Project Kickoff**
- Tim's first real app idea: **Job Task Safety Analysis (JTSA) Tool**
- Multi-platform: Web (React), iOS (React Native), Android (React Native)
- Timeline: 3 weeks to MVP
- Completed full technical spec (JTSA_TECHNICAL_SPEC.md)
  - User roles: Employee, Project Manager, Safety Manager, Admin/Owner
  - Core loop: task → AI hazard analysis → mitigation review → PDF export
  - Daily JTSAs (per-project, multi-person teams for the day)
  - Subscription tiers: Starter (10 emp/5 proj), Pro (50 emp/unlimited), Enterprise (custom)
  - 3-day free trial
  - Detailed audit logging + 5-year OSHA retention
  - Bilingual: English + Spanish
  - Backend: Node + Express + Supabase; AI: OpenAI GPT-4
- **Week 1 Backend (Complete - 90%):**
  - Created Node.js + Express project at `/Users/timothyryan/.openclaw/workspace/jtsa-backend` (~2000 LOC)
  - ✅ Database schema (SQL) with 8 tables: companies, users, projects, jtsas, hazards, mitigations, audit_logs, subscriptions
  - ✅ Authentication: register (company + owner + trial), login, refresh, logout, JWT (1h access, 7d refresh)
  - ✅ Auth middleware: token verification + role-based authorization (5 roles)
  - ✅ Company access isolation: application-level (verified on all routes)
  - ✅ Input validation: 12 Zod schemas + middleware
  - ✅ Projects CRUD: create, list, get, update, archive (soft delete)
  - ✅ JTSAs: create (auto-generates AI hazards), get today's, get details, update, participants, complete
  - ✅ Hazards: create (user-submitted), list, acknowledge, get with mitigations
  - ✅ Mitigations: create (async AI review), list, accept/reject, get details
  - ✅ Dashboard: overview stats, JTSA list with filtering, audit log (admin/owner)
  - ✅ PDF generation: formatted JTSA document (PDFKit)
  - ✅ Email service: JTSA completion + PDFs, employee invites (SendGrid/SMTP)
  - ✅ OpenAI integration: hazard generation, mitigation review, retry logic, safe JSON, error handling
  - ✅ Audit logging: tracks all actions for OSHA compliance
  - ✅ Syntax verified, all routes tested
  - **Status:** Awaiting Opus 4.6 code review (spawned 14:12)
  - **Setup:** Opus review every 30 minutes, auto-fix issues
  - Next: Opus review results → fix issues → Supabase deployment → integration testing
