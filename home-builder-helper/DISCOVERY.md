# Home Builder Helper — Phase 1: Discovery & Planning
**Date:** March 31, 2026  
**Status:** Complete — Ready for Design Phase

---

## 1. User Personas

### Persona 1: "First-Timer Fiona" 🏡
**Age:** 32 | **Occupation:** Marketing Manager | **Budget:** $350K–$450K

**Profile:** Buying her first home — choosing to build new for customization and warranty. Has no prior construction experience and relies heavily on her builder's guidance. Feels overwhelmed by the process.

**Quote:** *"I don't even know what a rough-in inspection is. I just need someone to tell me what to do next and when."*

**Pain Points:**
- Doesn't know what questions to ask or when
- Misses design deadlines because she didn't know they were coming
- Confused by contractor jargon and inspection terminology
- Overspends on upgrades without understanding cumulative impact

**Goals:** Stay on schedule, avoid costly surprises, feel confident and informed

---

### Persona 2: "Budget-Conscious Brad" 💰
**Age:** 38 | **Occupation:** Teacher | **Budget:** $280K–$320K

**Profile:** Building in a production community with a fixed budget. Every upgrade dollar matters. Needs to see real-time cost impact of every selection decision before committing.

**Quote:** *"I said yes to granite countertops and suddenly I'm $8,000 over budget. I need to see the running total before I commit."*

**Pain Points:**
- No visibility into cumulative upgrade costs until it's too late
- Change orders are confusing and feel like hidden fees
- Hard to compare upgrade vs. aftermarket costs
- Forgets which items he selected and why

**Goals:** Stay within budget, track every dollar, make informed trade-offs

---

### Persona 3: "Luxury Linda" ✨
**Age:** 52 | **Occupation:** Business Owner | **Budget:** $1.2M+

**Profile:** Building a fully custom home with an architect and multiple specialty contractors. She's detail-oriented and expects premium communication. Manages a complex project with hundreds of decisions.

**Quote:** *"I have a spreadsheet with 400 rows tracking selections. There has to be a better way."*

**Pain Points:**
- No central place to track hundreds of custom selections and approvals
- Multiple contractors not coordinating well — delays cascade
- Wants document/photo trail for warranty and resale
- Feels out of the loop between site visits

**Goals:** Full project visibility, organized records, accountability from contractors

---

### Persona 4: "Tech-Savvy Tyler" 📱
**Age:** 29 | **Occupation:** Software Engineer | **Budget:** $500K–$650K

**Profile:** Wants data, wants automation, wants everything integrated. Skeptical of paper processes and phone calls. Would use every feature of the app but won't tolerate a clunky UI.

**Quote:** *"Why am I getting construction updates via voicemail? Just give me a dashboard."*

**Pain Points:**
- Wants real-time construction progress with photo evidence
- Frustrated by manual processes (wet signatures, fax, PDF forms)
- Wants to integrate with calendar, documents, and notifications
- No API or data export from builder's system

**Goals:** Automation, integration, real-time visibility, data ownership

---

### Persona 5: "Large Family Larry" 👨‍👩‍👧‍👦
**Age:** 44 | **Occupation:** Regional Sales Manager | **Budget:** $600K–$750K

**Profile:** Building a 5-bedroom custom home. Wife handles design, he handles budget/schedule. Need a shared system where both can track and contribute — currently using a mix of texts, emails, and Google Docs.

**Quote:** *"My wife approved tile I thought we already decided against. We need to stop using text messages to manage a $700K project."*

**Pain Points:**
- Multiple decision-makers with no shared source of truth
- Decisions get made without buy-in from the other partner
- Hard to track who approved what and when
- Kids' room customizations create extra complexity

**Goals:** Shared visibility, approval workflows, unified communication

---

## 2. User Journey Map

### Phase 1: Pre-Construction (Weeks 1–8)
**"I've decided to build. Now what?"**

| Stage | Activities | Pain Points | App Touchpoints |
|-------|-----------|-------------|-----------------|
| Builder Selection | Compare builders, visit models, review contracts | Overwhelmed by options, unclear what's included | Builder comparison tool, contract checklist |
| Lot Selection | Choose lot, understand site conditions | Hidden costs (grading, utilities, premiums) | Lot cost tracker, premium calculator |
| Financing | Secure construction loan, set budget | Complex draw schedule, multiple lenders | Budget dashboard, loan tracking |
| Contract Signing | Review and sign purchase agreement | Confusing addendums, change order traps | Document vault, contract highlights |

### Phase 2: Design & Selections (Weeks 4–20)
**"Hundreds of decisions, limited time and budget"**

| Stage | Activities | Pain Points | App Touchpoints |
|-------|-----------|-------------|-----------------|
| Design Center Visits | Select finishes, fixtures, appliances | Overwhelmed, overspend on upgrades | Selection tracker, real-time budget impact |
| Structural Options | Decide on layout changes, additions | Don't understand lead time and cost impact | Decision deadlines, cost comparison |
| Approval Workflow | Submit decisions for approval | Mismatched expectations between partners | Multi-user approval, notification system |
| Change Orders | Request post-deadline changes | Surprise costs, delays | Change order tracker, cost/delay impact |

### Phase 3: Construction (Weeks 12–52)
**"Things are happening. Am I on track?"**

| Stage | Activities | Pain Points | App Touchpoints |
|-------|-----------|-------------|-----------------|
| Foundation/Framing | Site prep, foundation pour, framing | Can't visit daily, miss milestones | Progress feed with photos, milestone alerts |
| Mechanical Rough-In | Plumbing, electrical, HVAC installed | Don't know when inspections are scheduled | Inspection calendar, status tracking |
| Inspections | City/county inspections, builder walkthroughs | Fail → delay cascade, not notified promptly | Inspection log, pass/fail alerts |
| Drywall & Finishes | Insulation, drywall, paint, trim | Selections errors discovered too late | Selections checklist, defect photo log |
| Punch List | Walk-through, document issues | Verbal-only → forgotten issues | Punch list builder, contractor sign-off |

### Phase 4: Closing & Move-In (Weeks 48–56)
**"Almost there — don't drop the ball now"**

| Stage | Activities | Pain Points | App Touchpoints |
|-------|-----------|-------------|-----------------|
| Final Walk | Document all outstanding items | Builder fixes some, ignores others | Photo punch list, resolution tracking |
| Closing | Sign docs, wire funds, get keys | Last-minute surprises, fee confusion | Document checklist, cost summary |
| Warranty Period | Report issues within warranty window | Forget what's covered, miss deadlines | Warranty tracker, issue log |

---

## 3. Feature Priority List

### P0 — MVP Core (Must launch with)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Project Dashboard** | Single overview of project status, timeline, budget, and key upcoming dates |
| 2 | **Construction Timeline** | Visual Gantt-style timeline with milestone tracking and current phase indicator |
| 3 | **Budget Tracker** | Base price + upgrades + change orders = running total vs. contract max |
| 4 | **Selections Manager** | Log design selections by category (flooring, cabinets, etc.) with status (pending/approved/ordered) |
| 5 | **Upgrade Cost Calculator** | Real-time impact of each upgrade decision on total budget |
| 6 | **Inspection Log** | Track scheduled and completed inspections with pass/fail and notes |
| 7 | **Progress Photo Feed** | Chronological feed of site photos by construction phase |
| 8 | **Document Vault** | Upload and organize contracts, permits, selections sheets, change orders |
| 9 | **Punch List Tool** | Create itemized punch list with photos, assign to contractor, track resolution |
| 10 | **Multi-User Access** | Invite partner/co-owner with role-based access (view vs. edit vs. approve) |

### P1 — Launch + 4 Weeks

| # | Feature | Description |
|---|---------|-------------|
| 11 | **Change Order Tracker** | Log change orders with cost, delay impact, and approval status |
| 12 | **Push Notifications** | Alerts for upcoming deadlines, inspection results, milestone completions |
| 13 | **Contractor Directory** | Track key contacts (GC, subs, lender, realtor) with role and contact info |
| 14 | **Warranty Tracker** | Log warranty items post-closing, track status and deadlines |

### P2 — Future Roadmap

| # | Feature | Description |
|---|---------|-------------|
| 15 | **Builder Integration API** | Pull schedule/inspection data directly from builder's system |
| 16 | **Upgrade Comparison Tool** | Compare builder upgrade vs. aftermarket install cost |
| 17 | **AI Assistant** | Answer common construction questions, explain terminology |
| 18 | **Lender Draw Tracker** | Sync with construction loan draw schedule |
| 19 | **Neighborhood Community** | Connect with other buyers in the same community |
| 20 | **Smart Home Pre-Wire Planner** | Plan tech infrastructure during rough-in phase |

---

## 4. Requirements Specification

### Tech Stack (Recommended)

**Frontend:**
- React Native (iOS + Android from one codebase) — critical for mobile-first experience
- Expo for rapid iteration and OTA updates
- React Navigation for routing
- Zustand or Redux Toolkit for state management

**Backend:**
- Node.js + Express (or Fastify) REST API
- PostgreSQL — relational data model suits structured project/timeline data
- Supabase — auth + storage + real-time subscriptions (great fit, Tim already uses it)
- Redis for caching and session management

**Infrastructure:**
- Vercel (API) + Supabase (DB/auth/storage) — aligns with Tim's existing stack
- Cloudflare for CDN and domain management
- Expo EAS for mobile builds and OTA updates

**Integrations (MVP):**
- Push notifications: Expo Notifications + APNs/FCM
- File storage: Supabase Storage (photos, docs)
- Auth: Supabase Auth (email/password + magic link)

### Data Model (Core Entities)

```
Project
  ├── id, owner_id, name, address, builder_name
  ├── contract_price, current_total, lot_premium
  ├── start_date, target_close_date, actual_close_date
  └── status (pre-construction | design | construction | closed)

ProjectMember
  ├── project_id, user_id, role (owner | co-owner | viewer)

TimelineMilestone
  ├── project_id, name, phase, planned_date, actual_date
  └── status (upcoming | in-progress | complete | delayed)

Selection
  ├── project_id, category (flooring | cabinets | countertops | ...)
  ├── item_name, item_description, vendor, model_number
  ├── base_included (bool), upgrade_cost, status
  └── approved_by, approved_at, notes

ChangeOrder
  ├── project_id, description, requested_date
  ├── cost_impact, schedule_impact_days
  └── status (pending | approved | rejected)

Inspection
  ├── project_id, inspection_type, scheduled_date
  ├── result (pass | fail | pending), inspector_name
  └── notes, photos[]

PunchListItem
  ├── project_id, description, location, priority
  ├── photo_url, assigned_to, due_date
  └── status (open | in-progress | resolved)

Document
  ├── project_id, name, category (contract | permit | selection | ...)
  └── file_url, uploaded_by, uploaded_at

Photo
  ├── project_id, phase, caption, file_url
  └── taken_at, uploaded_by
```

### Key Non-Functional Requirements
- **Offline support:** Punch list and photo capture must work offline, sync when connected
- **Photo optimization:** Compress before upload; construction photos are large
- **Real-time updates:** Co-owners see changes without refresh (Supabase real-time)
- **Security:** Row-level security on all project data (Supabase RLS)
- **Export:** PDF export of selections summary and punch list for contractor sharing

---

## 5. MVP Timeline Estimate (AI Agent Velocity)

**Total: ~4 weeks to MVP** (working at AI agent pace: parallel execution, rapid iteration)

### Week 1: Foundation
- [ ] Project setup (Expo + Supabase + Vercel)
- [ ] Auth (email login, invite flow)
- [ ] Core data model + RLS policies
- [ ] Project creation + member invite
- [ ] Navigation shell (5 tab layout)

### Week 2: Core Features (Part 1)
- [ ] Project Dashboard screen
- [ ] Construction Timeline (milestone list + visual)
- [ ] Budget Tracker (base + upgrades running total)
- [ ] Document Vault (upload, categorize, view)

### Week 3: Core Features (Part 2)
- [ ] Selections Manager (CRUD + categories)
- [ ] Upgrade Cost Calculator (real-time budget impact)
- [ ] Inspection Log (schedule, results, notes)
- [ ] Progress Photo Feed (upload, browse by phase)

### Week 4: Polish + Launch
- [ ] Punch List Tool (create, photo, assign, resolve)
- [ ] Multi-user roles + approval flow
- [ ] Push notifications (deadlines, milestones)
- [ ] Onboarding flow (new project setup wizard)
- [ ] QA + bug fix
- [ ] TestFlight / Play Store beta release

### Post-MVP Sprint (Week 5–6)
- [ ] Change Order Tracker (P1)
- [ ] Contractor Directory (P1)
- [ ] Warranty Tracker (P1)
- [ ] Performance optimization
- [ ] App Store submission

---

## Summary & Next Steps

**What we're building:** A mobile-first app for homeowners managing new construction. Two core loops — *track physical construction progress* and *manage design selections + costs*.

**MVP scope:** 10 P0 features, 2 platforms (iOS + Android), multi-user access, photo/document support.

**Target user:** Production and semi-custom homebuilders ($280K–$750K range) — largest addressable market. Luxury/custom is P2.

**Recommended stack:** React Native (Expo) + Supabase + Vercel — fast to build, Tim's familiar territory.

**Ready for:** Design phase — wireframes for 5 core screens (Dashboard, Timeline, Budget, Selections, Punch List).

---

*Document created: March 31, 2026*  
*Phase 2: Design & Wireframing — ready to begin*
