# JTSA Tool — Technical Specification

**Project:** Job Task Safety Analysis (JTSA) AI Tool
**Timeline:** 3 weeks to MVP
**Target Platforms:** Web (React), iOS (React Native), Android (React Native)
**Created:** 2026-03-06

---

## 1. Product Overview

**Core Loop:**
1. Employee submits task description
2. AI reviews and suggests hazards
3. Employee acknowledges hazards and proposes mitigations
4. AI reviews mitigations and suggests improvements
5. Employee accepts/rejects AI feedback
6. JTSA marked complete → PDF generated and emailed, available for download

**User Roles:**
- **Employee:** Create JTSAs, review AI suggestions, propose mitigations
- **Project Manager:** Dashboard view of all company JTSAs
- **Safety Manager:** Dashboard view of all company JTSAs
- **Admin:** Full company management, billing, user invites
- **Owner:** Same as admin (can have multiple per company)

---

## 2. Data Model

```
Companies
├── id (UUID)
├── name (string)
├── subscription_tier (enum: starter, pro, enterprise)
├── trial_ends_at (timestamp, nullable)
├── billing_active (boolean)
├── created_at (timestamp)
└── updated_at (timestamp)

Users
├── id (UUID)
├── email (string, unique)
├── password_hash (string)
├── full_name (string)
├── role (enum: owner, admin, project_manager, safety_manager, employee)
├── company_id (UUID, FK)
├── language (enum: en, es)
├── created_at (timestamp)
└── updated_at (timestamp)

Projects
├── id (UUID)
├── company_id (UUID, FK)
├── name (string)
├── description (text)
├── status (enum: active, completed, archived)
├── created_at (timestamp)
└── updated_at (timestamp)

JTSAs
├── id (UUID)
├── project_id (UUID, FK)
├── date (date) — the work day
├── task_description (text)
├── status (enum: in_progress, completed)
├── created_by (UUID, FK to Users)
├── created_at (timestamp)
├── updated_at (timestamp)

JTSA_Participants
├── jtsa_id (UUID, FK)
├── user_id (UUID, FK)
├── role_in_jtsa (string, e.g., "lead", "participant")
├── signed_in_at (timestamp)
└── signed_out_at (timestamp, nullable)

Hazards
├── id (UUID)
├── jtsa_id (UUID, FK)
├── description (text)
├── ai_suggested (boolean)
├── severity (enum: low, medium, high)
├── user_acknowledged (boolean)
├── acknowledged_at (timestamp, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)

Mitigations
├── id (UUID)
├── hazard_id (UUID, FK)
├── mitigation_plan (text)
├── ai_reviewed (boolean)
├── ai_feedback (text)
├── user_accepted (boolean)
├── accepted_at (timestamp, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)

AuditLog
├── id (UUID)
├── company_id (UUID, FK)
├── user_id (UUID, FK)
├── action (enum: created_jtsa, accepted_hazard, rejected_hazard, created_mitigation, accepted_mitigation, rejected_mitigation, completed_jtsa, exported_pdf)
├── resource_type (string, e.g., "jtsa", "hazard", "mitigation")
├── resource_id (UUID)
├── data_changed (JSON)
├── timestamp (timestamp)
└── ip_address (string)

Subscriptions
├── id (UUID)
├── company_id (UUID, FK)
├── stripe_customer_id (string)
├── stripe_subscription_id (string)
├── tier (enum: starter, pro, enterprise)
├── current_period_start (timestamp)
├── current_period_end (timestamp)
├── trial_ends_at (timestamp, nullable)
├── status (enum: active, past_due, cancelled)
├── created_at (timestamp)
└── updated_at (timestamp)
```

---

## 3. API Routes

### Auth
```
POST   /api/auth/register              — Create company + owner account
POST   /api/auth/login                 — User login
POST   /api/auth/logout                — User logout
GET    /api/auth/me                    — Get current user
POST   /api/auth/refresh-token         — Refresh JWT
```

### Companies & Users
```
GET    /api/companies/{id}             — Get company details (admin only)
PATCH  /api/companies/{id}             — Update company settings
POST   /api/companies/{id}/users       — Invite employee
GET    /api/companies/{id}/users       — List employees (admin only)
DELETE /api/companies/{id}/users/{uid} — Remove employee
```

### Projects
```
POST   /api/companies/{cid}/projects   — Create project
GET    /api/companies/{cid}/projects   — List projects
GET    /api/projects/{id}              — Get project details
PATCH  /api/projects/{id}              — Update project
DELETE /api/projects/{id}              — Archive project
```

### JTSAs
```
POST   /api/projects/{pid}/jtsa        — Create new JTSA for today
GET    /api/projects/{pid}/jtsa        — Get today's JTSA (or list by date)
GET    /api/jtsa/{id}                  — Get JTSA details
PATCH  /api/jtsa/{id}                  — Update JTSA (task description, status)
POST   /api/jtsa/{id}/participants     — Add user to JTSA
DELETE /api/jtsa/{id}/participants/{uid} — Remove user from JTSA
GET    /api/jtsa/{id}/participants     — List who's signed in
```

### Hazards
```
POST   /api/jtsa/{id}/hazards          — Create hazard (user-submitted)
GET    /api/jtsa/{id}/hazards          — List hazards for JTSA
PATCH  /api/hazards/{id}               — Acknowledge hazard, update description
GET    /api/hazards/{id}               — Get hazard + AI feedback
```

### Mitigations
```
POST   /api/hazards/{id}/mitigations   — Submit mitigation plan
GET    /api/hazards/{id}/mitigations   — List mitigations for hazard
PATCH  /api/mitigations/{id}           — Accept/reject mitigation
GET    /api/mitigations/{id}           — Get mitigation + AI feedback
```

### Dashboards
```
GET    /api/companies/{cid}/dashboard  — Dashboard data (all JTSAs, stats)
GET    /api/companies/{cid}/jtsa-list  — List all company JTSAs (filterable by date, status)
```

### PDF & Compliance
```
POST   /api/jtsa/{id}/export-pdf       — Generate and email PDF
GET    /api/jtsa/{id}/pdf              — Download PDF
GET    /api/companies/{cid}/audit-log  — Get audit log (admin only)
```

### Billing (Stripe)
```
POST   /api/billing/create-subscription — Create subscription (Stripe)
GET    /api/billing/subscription        — Get subscription status
POST   /api/billing/cancel              — Cancel subscription
POST   /api/billing/webhook             — Stripe webhook handler
```

---

## 4. AI Integration

**Provider:** OpenAI API (GPT-4)

**Workflow:**

1. **Hazard Generation**
   - User submits task → POST to `/api/jtsa/{id}/hazards`
   - Backend sends to AI:
     ```
     "Review this task for safety hazards in a construction/industrial setting.
     Task: {task_description}
     
     Return a JSON array of hazards, each with {id, description, severity (low/medium/high)}
     ```
   - AI response stored as "Hazards" with `ai_suggested: true`

2. **Mitigation Review**
   - User proposes mitigation → POST to `/api/hazards/{id}/mitigations`
   - Backend sends to AI:
     ```
     "Review this safety mitigation plan.
     Hazard: {hazard_description}
     Proposed Mitigation: {mitigation_plan}
     
     Return JSON: {approved: boolean, feedback: string, suggestions: string[]}"
     ```
   - AI response stored in Mitigation `ai_feedback` field

**Offline Support:**
- Client caches task description locally
- When AI endpoint is unreachable, store request in local queue
- On reconnect, sync queue to backend (backend handles duplicate prevention via request IDs)

---

## 5. PDF Generation

**Library:** PDFKit (Node.js) or similar

**Contents:**
- Company name, project, date
- Task description
- All hazards (AI-suggested + user-submitted) with status
- All mitigations with acceptance status
- Signatures/timestamps (optional v1)
- Audit trail (who acknowledged what, when)

**Delivery:**
- Generated on JTSA completion
- Email to all participants + owner + safety manager
- Stored in S3 or similar for dashboard download
- Retention: Keep for 5 years, auto-delete

---

## 6. Authentication & Authorization

**Tech:** JWT + Supabase Auth

**Flow:**
1. User registers → Supabase creates auth user + app user record
2. Login → JWT token issued
3. All API requests require `Authorization: Bearer <token>`

**Permissions:**
- **Employee:** Can only see JTSAs they're assigned to
- **Project Manager/Safety Manager:** Can see all company JTSAs (read-only)
- **Admin/Owner:** Full company access

---

## 7. Billing & Subscriptions

**Provider:** Stripe

**Tier Limits:**
- **Starter:** 10 employees, 5 projects/month
- **Pro:** 50 employees, unlimited projects
- **Enterprise:** Custom (manual)

**Free Trial:** 3 days, no credit card required

**Enforcement:**
- API checks subscription tier on employee add
- API checks project creation against tier limits
- Webhook handler updates subscription status on Stripe events

---

## 8. Localization

**Languages:** English (en), Spanish (es)

**Implementation:**
- Store `language` preference in Users table
- API returns translations based on user language
- Frontend uses i18n library (next-i18next for React)

**Scope for MVP:**
- UI labels, buttons, error messages
- Not required: AI prompts (can be English-only)

---

## 9. Compliance & Data

**OSHA Compliance:**
- Audit log tracks all actions + timestamps
- PDFs generated with full hazard/mitigation history
- 5-year retention → Cron job auto-deletes after 5 years
- IP address logged for audit trail

**Data Security:**
- Passwords hashed (bcrypt, min 10 rounds)
- HTTPS only
- JWT expiry: 1 hour access, 7-day refresh
- No sensitive data in logs

---

## 10. Tech Stack

**Frontend:**
- React (web)
- React Native + Expo (iOS/Android)
- Shared component library (UI kit)

**Backend:**
- Node.js + Express
- Supabase (PostgreSQL + auth)
- OpenAI API (GPT-4)

**Infrastructure:**
- Vercel (frontend) or Railway
- Supabase (database + auth)
- S3/R2 (PDF storage)
- Stripe (payments)

**Libraries:**
- PDFKit (PDF generation)
- i18next (localization)
- Zod (schema validation)

---

## 11. Development Timeline

**Week 1: Backend & Database**
- Supabase setup (schema, migrations, RLS)
- Auth routes (register, login, invite)
- CRUD routes for projects, JTSAs, hazards, mitigations
- AI integration (prompt templates, OpenAI client)

**Week 2: Web Frontend**
- React app (login, dashboard, project creation)
- JTSA flow (task submission → hazard review → mitigation)
- PDF export + email
- Stripe subscription flow

**Week 3: Polish & Mobile**
- React Native app (same core flows)
- Offline support (local queue sync)
- Bug fixes, testing
- Deploy to production

---

## 12. Success Metrics (MVP)

- [ ] Owner can create company + invite employees
- [ ] Employee can create JTSA for a project
- [ ] AI generates hazards from task description
- [ ] Employee acknowledges hazards + proposes mitigations
- [ ] AI reviews mitigations + provides feedback
- [ ] JTSA completion triggers PDF export + email
- [ ] Admin sees all JTSAs on dashboard
- [ ] Subscription tier limits are enforced
- [ ] Offline mode works (client queues sync on reconnect)
- [ ] 3-day free trial, Stripe billing active

---

## 13. Future Enhancements

- Mobile app native notifications
- AI hazard suggestions by industry/trade
- Signature capture on JTSAs
- Real-time collaboration (WebSocket for live updates)
- Historical hazard templates (reusable from past JTSAs)
- Integration with incident reporting
- Multi-language AI prompts

