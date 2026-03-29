# 🚀 Mission Control — Central Dashboard & Coordination Hub

**Unified entry point for all Mission Control systems**

---

## 📍 WHAT'S HERE

Welcome to Mission Control. This directory contains everything you need:

### **1. Dashboard** (Web Application)
📊 Tracks all 6 projects in real-time  
🔗 **Location:** `./dashboard/` → symlink to `mission-control-express-organized/`  
🚀 **Start:** `cd dashboard && npm run dev` (port 5173)  
📖 **Docs:** See `dashboard/START_HERE.md`

**Projects Tracked:**
1. WorkSafeAI (75% complete)
2. Mission Control (this system)
3. Consensus (review aggregation)
4. LinkedIn Automation (auto-posts)
5. Hyperscaler Briefings (daily market intel)
6. Project Warp Speed (Pro-Tel growth)

---

### **2. iOS Companion App**
📱 Mobile version of Mission Control  
🔗 **Location:** `./ios-app/` → symlink to `mission-control-ios/`  
🚀 **Start:** See `ios-app/QUICKSTART.md`  
📖 **Docs:** See `ios-app/DELIVERABLES_INDEX.md`

**Status:** Complete with screens, components, navigation  
**Ready for:** Simulator testing, API integration, production deployment

---

### **3. Documentation**
📚 Central guides and references  
📖 **This file:** Overview  
📖 **ARCHITECTURE.md:** System design + integration  
📖 **DASHBOARD_SETUP.md:** Dashboard quick start  
📖 **IOS_SETUP.md:** iOS app setup  
📖 **GUIDES.md:** Detailed walkthroughs  

---

### **4. Archives**
🗂️ Versioned history & backups  
🔗 **Location:** `./archives/`  
📦 **Contents:**
- `v1-next-js-deployment/` — Original Next.js version docs
- `backup-snapshots/` — Point-in-time backups

**Why archived?** Old versions, no longer active. Keep for reference/recovery.

---

## 🎯 QUICK START

### Start Development

**Dashboard (Web):**
```bash
cd dashboard
npm install
npm run dev
# Visit http://localhost:5173
```

**iOS App:**
```bash
cd ios-app
npm install
npm run dev
# Or open in Xcode for simulator testing
```

### Check Status

```bash
# View current projects
cd dashboard
curl http://localhost:3001/api/projects

# Monitor execution
tail -f .autonomy-log.txt

# Check task status
cat .mission-control-state.json | jq '.tasks'
```

---

## 📊 SYSTEM OVERVIEW

```
Mission Control Dashboard
│
├─ Backend (Express API on :3001)
│  ├─ 4 REST endpoints (/api/projects/*)
│  └─ JSON persistence (server/data/)
│
├─ Frontend (React + Vite on :5173 dev, :3001 prod)
│  ├─ 11 pages (Dashboard, ProjectDetail, GapAnalysis, Team, etc.)
│  ├─ 4 reusable components
│  └─ Tailwind CSS + glassmorphic design
│
└─ Coordination
   ├─ Autonomy Loop (30-min interval)
   ├─ Execution Tracker (real-time)
   ├─ Daily Gap Analysis (9 AM EST)
   └─ Mission Control Heartbeat (60-min interval)
```

---

## 🔗 INTEGRATION POINTS

### Autonomous Systems
- **Daily Gap Analysis:** Identifies critical gaps, triggers work
- **Autonomy Loop:** Monitors task execution every 30 min
- **Execution Tracker:** Detects task completion in real-time
- **Mission Control Heartbeat:** Updates task queue every 60 min

### External Tools
- **Vercel:** Hosts production frontend + backend
- **Cloudflare:** DNS + domain management
- **GitHub:** Version control + auto-deploy
- **Supabase:** Optional: future database integration

### Data Sources
- WorkSafeAI: Live project metrics
- Consensus: Review aggregation stats
- LinkedIn Automation: Post generation logs
- Hyperscaler Briefings: Article collection data
- Project Warp Speed: Growth metrics
- Agent Logs: Team coordination events

---

## 📖 DOCUMENTATION MAP

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **README.md** | This file — overview | 5 min |
| **ARCHITECTURE.md** | System design + flows | 10 min |
| **DASHBOARD_SETUP.md** | Dashboard quick start | 5 min |
| **IOS_SETUP.md** | iOS app setup | 5 min |
| **GUIDES.md** | Detailed walkthroughs | 15 min |
| `dashboard/START_HERE.md` | Dashboard detailed setup | 5 min |
| `ios-app/QUICKSTART.md` | iOS detailed setup | 5 min |

---

## 🛠️ COMMON TASKS

### View All Projects
```bash
cd dashboard
npm run dev
# Visit http://localhost:5173
```

### Edit a Project
1. Visit Dashboard
2. Click project card
3. Click "Edit"
4. Update fields
5. Save (auto-persists to JSON)

### Check Execution Status
```bash
tail -f .autonomy-log.txt
# Shows: task starts, completions, blockers
```

### Monitor Autonomous Work
```bash
cd dashboard/..
node scripts/execution-tracker.js
# Shows: task status, health, blockers
```

### Review Gap Analysis
```bash
cat memory/2026-03-29.md | grep "GAP ANALYSIS"
```

---

## 🚀 DEPLOYMENT

### Local Development
```bash
cd dashboard
npm run dev
# API: http://localhost:3001
# UI: http://localhost:5173
```

### Production
```bash
cd dashboard
npm run build
npm start
# Everything on http://localhost:3001
```

### To Vercel (Hosted)
```bash
cd dashboard
# Already auto-deployed via GitHub Actions
# Check: https://vercel.com/timothypatrickryan-7139s-projects
```

---

## 📊 CURRENT STATUS

**Dashboard:** ✅ Production-ready  
**iOS App:** ✅ Screens complete, ready for testing  
**Projects:** ✅ 6 tracked and monitored  
**Autonomy:** ✅ Fully operational  
**Documentation:** ✅ Complete  

---

## 🎯 NEXT STEPS

1. **Review:** Read ARCHITECTURE.md (10 min)
2. **Setup:** Run `npm install && npm run dev` in dashboard/ (5 min)
3. **Explore:** Visit http://localhost:5173 (10 min)
4. **Monitor:** Check autonomy logs for real-time work (ongoing)
5. **Develop:** Make improvements, deploy, iterate (continuous)

---

## 📞 SUPPORT

**Quick reference:** `GUIDES.md`  
**Dashboard setup:** `dashboard/START_HERE.md`  
**iOS setup:** `ios-app/QUICKSTART.md`  
**Architecture:** `ARCHITECTURE.md`  
**Archives:** `archives/` (old versions, backup snapshots)

---

## 🏗️ WORKSPACE STRUCTURE

```
mission-control/
├── README.md (this file)
├── ARCHITECTURE.md
├── DASHBOARD_SETUP.md
├── IOS_SETUP.md
├── GUIDES.md
│
├── dashboard/ → mission-control-express-organized/
│   ├── START_HERE.md
│   ├── STRUCTURE.md
│   ├── server/
│   ├── client/
│   └── (see dashboard docs)
│
├── ios-app/ → mission-control-ios/
│   ├── QUICKSTART.md
│   ├── DELIVERABLES_INDEX.md
│   ├── src/
│   └── (see ios-app docs)
│
├── docs/
│   └── (additional guides)
│
└── archives/
    ├── v1-next-js-deployment/
    └── backup-snapshots/
```

---

## ✅ CHECKLIST FOR NEW USERS

- [ ] Read this README (5 min)
- [ ] Read ARCHITECTURE.md (10 min)
- [ ] Install dashboard: `cd dashboard && npm install` (2 min)
- [ ] Start dev server: `npm run dev` (1 min)
- [ ] Visit http://localhost:5173 (1 min)
- [ ] Click through projects, explore UI (10 min)
- [ ] Read dashboard/STRUCTURE.md for deep dive (10 min)
- [ ] Optional: Setup iOS app (15 min)

**Total:** 45-60 minutes to full familiarity

---

**Last Updated:** March 29, 2026 @ 10:04 AM EST  
**Status:** ✅ Live & Production-Ready  
**Version:** 1.0 (Officially Organized)

🚀 **Welcome to Mission Control!**
