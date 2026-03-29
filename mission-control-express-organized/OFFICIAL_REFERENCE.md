# Mission Control Dashboard — Official Reference

**Effective Date:** March 29, 2026 @ 9:59 AM EST  
**Status:** ✅ Official system name confirmed

---

## 📋 OFFICIAL DESIGNATION

**Official Name:** Mission Control Dashboard  
**Previous Name:** mission-control-express (legacy reference only)  
**Type:** Unified project dashboard (Express + React/Vite)  
**Classification:** Internal tool, production-ready

**In conversation, refer to this as:**
- ✅ **"Mission Control Dashboard"** (formal)
- ✅ **"Mission Control"** (casual)
- ❌ **"mission-control-express"** (outdated)
- ❌ **"the minimal version"** (vague)

---

## 🎯 PURPOSE & MISSION

**Purpose:**
Provide a unified, real-time view of all major projects with metrics, milestones, tasks, and strategic coordination.

**Mission Statement:**
Enable autonomous organization oversight through a centralized dashboard that tracks project progress, identifies gaps, and facilitates team coordination.

**Key Users:**
- Tim Ryan (CEO/Project owner)
- AI agents (automated reporting)
- Team members (progress tracking)

---

## 📍 OFFICIAL LOCATION

**Primary:** `/Users/timothyryan/.openclaw/workspace/mission-control-express-organized/`

**Backup:** `/Users/timothyryan/.openclaw/workspace/apps/mission-control-express/` (original)

**Memory References:**
- MEMORY.md — Full technical details
- TOOLS.md — Quick reference

---

## 🚀 DEPLOYMENT INSTRUCTIONS

### Development
```bash
cd /Users/timothyryan/.openclaw/workspace/mission-control-express-organized
npm install
npm run dev
# Visit http://localhost:5173
```

### Production
```bash
cd /Users/timothyryan/.openclaw/workspace/mission-control-express-organized
npm install
npm run build
npm start
# Visit http://localhost:3001
```

---

## 📊 WHAT IT TRACKS

### 6 Strategic Projects

| ID | Project | Status | Progress |
|----|---------|--------|----------|
| 1 | WorkSafeAI | In Progress | 75% |
| 2 | Mission Control | Active | Live |
| 3 | Consensus | Launched | Growing |
| 4 | LinkedIn Automation | Active | 100% |
| 5 | Hyperscaler Briefings | Daily | 100% |
| 6 | Project Warp Speed | Starting | 6 months |

### Per-Project Data
- **Metrics:** Key performance indicators (users, uptime, speed, etc.)
- **Milestones:** Major checkpoints with dates and status
- **Tasks:** Work items with assignments and progress
- **Links:** References to repos, live apps, documentation

---

## 🔧 TECHNICAL SPECIFICATIONS

### Backend
- **Framework:** Express.js
- **Port:** 3001
- **Entry:** `server/index.js`
- **API:** 4 endpoints (GET, PUT, POST for projects)
- **Storage:** JSON files in `server/data/`
- **Features:** CORS, JSON persistence, atomic writes

### Frontend
- **Framework:** React 18+
- **Build:** Vite
- **Styling:** Tailwind CSS v3
- **Routing:** React Router v6+
- **Dev Port:** 5173 (Vite HMR)
- **Prod Port:** 3001 (Express static)

### Data Storage
- **Format:** JSON (human-readable)
- **Location:** `server/data/projects.json` (main)
- **Backup Files:**
  - `briefings.json`
  - `focused-tasks.json`
  - `adjustments.json` (change log)
- **Persistence:** Atomic writes (temp → rename)
- **Modification:** Via UI or direct JSON edit

---

## 📖 DOCUMENTATION MAP

**Start Here:**
1. `START_HERE.md` — 5-minute setup guide

**Deep Dives:**
2. `STRUCTURE.md` — Complete folder + file explanations
3. `FILE_TREE.txt` — Visual tree view
4. `INVENTORY.md` — Full file listing + statistics
5. `README.md` — Original project README
6. `OFFICIAL_REFERENCE.md` — This file

**Memory:**
7. `/Users/timothyryan/.openclaw/workspace/memory/MEMORY.md` — Full technical details
8. `/Users/timothyryan/.openclaw/workspace/TOOLS.md` — Quick reference

---

## 🔗 INTEGRATION POINTS

### Autonomous Systems
- **Daily Gap Analysis** (9:03 AM) — Identifies gaps, feeds into dashboard
- **Autonomy Loop** (30 min interval) — Monitors task execution
- **Mission Control Heartbeat** (60 min) — Processes queue
- **Execution Tracker** (continuous) — Tracks task completion

### External Data Sources
- **WorkSafeAI:** Live project status
- **Consensus:** Review aggregation metrics
- **LinkedIn Automation:** Post generation stats
- **Hyperscaler Briefings:** Article counts
- **Project Warp Speed:** Growth metrics
- **Agent Logs:** Team coordination

### API Integration
All dashboard data accessible via REST:
```
GET /api/projects           → List all projects
GET /api/projects/:id       → Single project details
PUT /api/projects/:id       → Update project
POST /api/projects          → Create new project
```

---

## 🎯 KEY FEATURES

✅ **Real-time Tracking**
- Live project status
- Auto-updated metrics
- Progress visualization

✅ **Team Coordination**
- Team member directory
- Briefing management
- Contact registry

✅ **Strategic Planning**
- Gap analysis view
- Calendar management
- Documentation access

✅ **Data Management**
- Full CRUD for projects
- Persistent storage
- JSON-based (debuggable)

✅ **Development Features**
- Hot reload (Vite)
- API proxy in dev
- TypeScript-ready

---

## 📋 MAINTENANCE & UPDATES

### Regular Checks
- Weekly: Verify all projects accessible
- Monthly: Review and update project status
- Quarterly: Archive completed projects

### Common Maintenance Tasks

**Update Project Progress:**
1. Open Dashboard
2. Click project card
3. Click "Edit"
4. Update progress/status
5. Save (auto-persists)

**Add New Project:**
1. API: POST /api/projects
2. Or: Edit `server/data/projects.json` directly
3. Update `client/src/data/projectMetadata.js` for display

**Check Project Details:**
1. Dashboard → Click any project card
2. Or: `/project/:id` route

---

## 🔐 SECURITY NOTES

- **JSON Storage:** No authentication (local development)
- **API:** No auth currently (add if public)
- **CORS:** Enabled for local dev/prod
- **HTTPS:** Not configured (add for production deployment)

---

## 🚨 ERROR HANDLING

**Port already in use?**
```bash
lsof -i :3001
kill -9 <PID>
```

**Dependencies broken?**
```bash
rm -rf node_modules client/node_modules
npm install
cd client && npm install && cd ..
```

**Data corrupted?**
- Check `server/data/adjustments.json` for change log
- Restore from backup or re-enter manually

---

## 📞 SUPPORT & REFERENCES

**For quick setup:** START_HERE.md  
**For architecture:** STRUCTURE.md  
**For file listing:** FILE_TREE.txt  
**For full specs:** INVENTORY.md  
**For technical details:** MEMORY.md  
**For quick commands:** TOOLS.md  

---

## ✅ OPERATIONAL CHECKLIST

- ✅ Named officially as "Mission Control Dashboard"
- ✅ Documented in MEMORY.md
- ✅ Referenced in TOOLS.md
- ✅ Complete documentation provided (5 guides)
- ✅ Quick start available (START_HERE.md)
- ✅ Ready for immediate use
- ✅ Production-ready
- ✅ All 6 projects configured

---

## 🎉 STATUS

**Mission Control Dashboard is officially live and ready for daily use.**

**Next Actions:**
1. Read START_HERE.md
2. Run `npm run dev`
3. Visit http://localhost:5173
4. Start tracking projects

**For ongoing reference:**
- Refer to as "Mission Control" or "Mission Control Dashboard"
- Check MEMORY.md for technical details
- Check TOOLS.md for quick commands

---

**Official Designation Date:** March 29, 2026, 9:59 AM EST  
**Status:** ✅ Active & Production-Ready  
**Version:** 1.0 (organized & documented)

