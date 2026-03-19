# 📱 iOS Mission Control App - Project Brief

**Project:** Native iOS app for Mission Control dashboard  
**Timeline:** Full-featured, no rush (quality over speed)  
**Distribution:** Internal (TestFlight/Ad-hoc, NOT App Store)  
**Start Date:** March 15, 2026  
**Owner:** Tim Ryan  

---

## 🎯 Vision

A native iOS app that provides seamless access to Mission Control from iPhone/iPad, featuring:
- Real-time task board with Kanban workflow
- Live agent activity feed
- Team member directory
- Calendar with cron jobs
- Message/inbox management
- Full WebSocket real-time updates

**Why this matters:** Access your autonomous agent system from anywhere. Full feature parity with web dashboard.

---

## 📊 Scope & Features

### **Core Features (MVP)**
1. **Task Board** — 4-column Kanban (Review → Queued → Working → Completed)
2. **Agent Activity** — Real-time status of all agents working/complete
3. **Team Directory** — View all team members, specialties, models
4. **Calendar** — Upcoming scheduled jobs with countdowns
5. **Authentication** — JWT login flow

### **Enhanced Features**
6. **Messaging** — Send/receive messages from agents
7. **Real-time Updates** — WebSocket for live data
8. **Offline Mode** — Cache data for offline viewing
9. **Dark Mode** — Native iOS dark mode support
10. **Push Notifications** — Task alerts, agent completions

### **Polish**
11. **Animations** — Smooth transitions matching web app
12. **Performance** — Optimized for slow networks
13. **Accessibility** — VoiceOver support
14. **iPad Support** — Split view, landscape mode

---

## 🏗️ Architecture

**Frontend:**
- Language: Swift 5.9+
- Framework: SwiftUI
- State Management: @StateObject + Combine
- HTTP: URLSession + AsyncAwait
- WebSocket: Starscream or native WebSocket

**Backend Integration:**
- API: http://localhost:3000 (or remote Cloudflare tunnel)
- Auth: JWT (access + refresh tokens)
- Real-time: WebSocket ws://localhost:3000

**Target:**
- iOS 15.0+ (wide compatibility)
- iPhone & iPad
- Light & Dark modes

---

## 👥 Team & Phases

### **Phase 1: Design (Johnny)** 🎨
- Create mockups for all screens
- Define navigation structure
- Design iOS-specific patterns
- Timeline: 2-3 days

### **Phase 2: Development (Jarvis)** 💻
- Build SwiftUI app from designs
- Implement all core features
- Integrate APIs
- Add WebSocket
- Timeline: 7-10 days

### **Phase 3: Infrastructure (Chief)** ⚙️
- Ensure API mobile-ready
- Add CORS headers
- Test remote access (Cloudflare tunnel)
- Setup remote debugging
- Timeline: 2-3 days (parallel with Phase 2)

### **Phase 4: Security (Opus)** 🔒
- Code review for vulnerabilities
- Test auth flow
- Validate API integrations
- Security audit
- Timeline: 2-3 days (after Phase 2)

### **Phase 5: QA & Testing (Velma)** ✅
- Test on multiple devices
- Test network resilience
- Test offline mode
- Performance testing
- Timeline: 2-3 days (final)

---

## 📁 Deliverables

**By Agent:**

**Johnny (Design):**
- Figma file with all screens
- Design spec document
- iOS HIG compliance checklist
- Navigation wireframe

**Jarvis (Dev):**
- Swift project (.xcodeproj)
- All features implemented
- Code documented
- Ready for TestFlight

**Chief (Infrastructure):**
- API audit report
- CORS configuration
- Mobile debugging setup
- Tunnel configuration for remote access

**Opus (Security):**
- Security audit report
- Vulnerability list + fixes
- Code review comments
- Auth flow validation

**Velma (QA):**
- Test report (all devices)
- Bug list + severity
- Performance metrics
- Accessibility report

**Lucy (Orchestration):**
- Daily standup notes
- Integration timeline
- TestFlight build management
- Final release notes

---

## 🎯 Success Criteria

**MVP Success:**
- ✅ All core features working
- ✅ Zero critical bugs
- ✅ Smooth animations & performance
- ✅ JWT auth working on device
- ✅ WebSocket real-time updates live

**Full Feature Success:**
- ✅ All enhanced features implemented
- ✅ Dark mode working perfectly
- ✅ Offline mode functional
- ✅ iPad split view support
- ✅ Push notifications working
- ✅ VoiceOver accessibility passing

**Deployment Success:**
- ✅ TestFlight build created
- ✅ Can install on test devices
- ✅ All testers report 5-star experience
- ✅ Ready for production-like usage

---

## 📅 Timeline

- **Week 1:** Design complete (Johnny) + Foundation coding (Jarvis)
- **Week 2:** Core features implemented (Jarvis) + API hardened (Chief)
- **Week 3:** Security review (Opus) + QA testing (Velma)
- **Week 4:** Polish, TestFlight build, final integration

**Total: ~4 weeks** (quality-first approach)

---

## 🚀 Next Steps

1. ✅ This brief distributed to team
2. Johnny creates design spec (starting tomorrow)
3. Jarvis begins architecture & foundation (tomorrow)
4. Chief audits API (starting immediately)
5. Lucy coordinates handoffs & blockers

**Daily Standups:** Each agent reports progress in Task Board

---

## 📞 Contact & Escalation

**Project Coordinator:** Lucy (me@lucy.ai)
**On Blocker:** Escalate immediately to Tim via task board

**Files:**
- Design Spec: `iOS_DESIGN_SPEC.md` (Johnny)
- Dev Plan: `iOS_DEV_PLAN.md` (Jarvis)
- API Audit: `iOS_API_AUDIT.md` (Chief)
- Security Review: `iOS_SECURITY_REVIEW.md` (Opus)
- QA Plan: `iOS_QA_PLAN.md` (Velma)

---

**Project Owner:** Tim Ryan  
**Orchestrator:** Lucy  
**Status:** 🟢 **ACTIVE - LAUNCHING NOW**
