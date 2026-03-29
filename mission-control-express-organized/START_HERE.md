# 🚀 Mission Control Express — START HERE

**Welcome!** You now have the complete, organized Mission Control Express application.

---

## 📍 WHAT YOU HAVE

A full-stack project dashboard:
- **Backend:** Express API on port 3001
- **Frontend:** React + Vite UI
- **Storage:** JSON persistence
- **Projects:** 6 tracked (WorkSafeAI, Mission Control, Consensus, etc.)

**Location:** `/Users/timothyryan/.openclaw/workspace/mission-control-express-organized/`

---

## 🎯 QUICK START (5 MINUTES)

### 1. Install Dependencies
```bash
cd /Users/timothyryan/.openclaw/workspace/mission-control-express-organized
npm install
cd client && npm install && cd ..
```

### 2. Start Development Server
```bash
npm run dev
```

You'll see:
```
API Server: http://localhost:3001
Frontend UI: http://localhost:5173
```

### 3. Open in Browser
Visit: **http://localhost:5173**

You should see:
- Sidebar with navigation
- Dashboard showing all 6 projects
- Project cards with progress bars
- Links to detail views

---

## 📚 DOCUMENTATION

Read these in order:

1. **STRUCTURE.md** (5 min read)
   - Complete folder structure
   - What each file does
   - Key configuration

2. **FILE_TREE.txt** (2 min read)
   - Visual tree of all files
   - Quick reference
   - File statistics

3. **INVENTORY.md** (5 min read)
   - Complete file listing
   - Project data included
   - Technical stack details

---

## 🔧 COMMON TASKS

### View All Projects
Visit: `http://localhost:5173/`

### View Project Details
Click any project card, or visit: `http://localhost:5173/project/1`

### Edit a Project
Click "Edit" button on project detail, or visit: `http://localhost:5173/project/1/edit`

### Check Gap Analysis
Visit: `http://localhost:5173/gap-analysis`

### View Team & Coordination
Visit: `http://localhost:5173/team`

### See Calendar
Visit: `http://localhost:5173/calendar`

---

## 🌍 API ENDPOINTS

All endpoints served on `http://localhost:3001`

```bash
# List all projects
curl http://localhost:3001/api/projects

# Get specific project
curl http://localhost:3001/api/projects/1

# Update project
curl -X PUT http://localhost:3001/api/projects/1 \
  -H "Content-Type: application/json" \
  -d '{"progress": 80, "status": "In Progress"}'

# Create new project
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "New Project", "status": "Planned"}'
```

---

## 📊 PROJECTS INCLUDED

| ID | Project | Progress | Status |
|----|---------|----------|--------|
| 1 | WorkSafeAI | 75% | In Progress |
| 2 | Mission Control | Active | Live |
| 3 | Consensus | Growing | Launched |
| 4 | LinkedIn Automation | 100% | Active |
| 5 | Hyperscaler Briefings | 100% | Daily |
| 6 | Project Warp Speed | Starting | 6 months |

Click on any project in the Dashboard to see full details.

---

## 🛠️ FOLDER QUICK REFERENCE

```
mission-control-express-organized/
├── server/               ← Express API
│   ├── index.js         (main server code)
│   └── data/            (JSON storage)
│
└── client/              ← React UI
    ├── src/components/  (reusable parts)
    ├── src/pages/       (11 route pages)
    └── src/data/        (project metadata)
```

**Want to modify something?**
- Change project data → Edit `server/data/projects.json`
- Update a page → Edit `client/src/pages/*.jsx`
- Add a component → Create in `client/src/components/`
- Change styling → Modify `client/src/index.css` or use Tailwind classes

---

## 🚀 PRODUCTION DEPLOYMENT

To run production build on port 3001:

```bash
npm run build    # Build React app
npm start        # Start Express server with built app
```

Then visit: **http://localhost:3001**

---

## 💾 DATA PERSISTENCE

Project changes are saved to JSON files:
- `server/data/projects.json` — Main project data
- `server/data/briefings.json` — Briefing data
- `server/data/focused-tasks.json` — Task focus
- `server/data/adjustments.json` — Adjustments log

Edit via UI and changes persist to disk. Edit JSON directly and server reloads.

---

## 🆘 TROUBLESHOOTING

**Port already in use?**
```bash
# Find what's using port 3001
lsof -i :3001

# Kill it (replace PID with actual process ID)
kill -9 <PID>
```

**Dependencies not installing?**
```bash
# Clear cache and reinstall
rm -rf node_modules client/node_modules
npm cache clean --force
npm install
cd client && npm install && cd ..
```

**Frontend not loading?**
```bash
# Make sure both servers are running
# Check: http://localhost:3001 (API)
# Check: http://localhost:5173 (UI)
```

---

## 📞 GETTING HELP

Each documentation file has specific info:

- **Architecture questions?** → See `STRUCTURE.md`
- **File locations?** → See `FILE_TREE.txt`
- **Project details?** → See `INVENTORY.md`
- **How to run?** → You're reading it! (START_HERE.md)

---

## ✅ NEXT STEPS

1. ✅ **Read this file** (you are here)
2. **Install & start:** Follow "Quick Start" above
3. **Explore:** Click around the dashboard
4. **Read docs:** Open STRUCTURE.md for deeper understanding
5. **Customize:** Modify projects, add new ones, tweak UI

---

## 🎯 YOU'RE ALL SET!

Everything is organized, documented, and ready to run.

**Next:** Run `npm run dev` and start using Mission Control Express!

```bash
cd /Users/timothyryan/.openclaw/workspace/mission-control-express-organized
npm install
npm run dev
```

Then open: **http://localhost:5173**

Enjoy! 🚀

---

**Last Updated:** March 29, 2026 @ 9:57 AM EST
