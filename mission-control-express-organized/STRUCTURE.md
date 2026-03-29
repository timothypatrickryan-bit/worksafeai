# Mission Control Express — Complete Folder Structure

**Location:** `/Users/timothyryan/.openclaw/workspace/mission-control-express-organized/`

**Purpose:** Streamlined project dashboard (Express backend + React/Vite frontend)

---

## 📁 FOLDER STRUCTURE

```
mission-control-express-organized/
├── README.md                          # Project overview
├── STRUCTURE.md                       # This file
├── package.json                       # Root package (concurrent dev scripts)
├── package-lock.json                  # Dependency lock
│
├── server/                            # Express API Backend
│   ├── index.js                       # Main server (port 3001)
│   └── data/                          # Persistent JSON data
│       ├── projects.json              # Project state (editable)
│       ├── briefings.json             # Briefing data
│       ├── focused-tasks.json         # Task focus data
│       └── adjustments.json           # Project adjustments
│
└── client/                            # React/Vite Frontend
    ├── package.json                   # Frontend dependencies
    ├── index.html                     # HTML entry point
    ├── vite.config.js                 # Vite config
    ├── tailwind.config.js             # Tailwind CSS config
    ├── postcss.config.js              # PostCSS config
    │
    ├── src/
    │   ├── main.jsx                   # React entry point
    │   ├── App.jsx                    # Root component + Router
    │   ├── index.css                  # Global styles
    │   │
    │   ├── components/                # Reusable components
    │   │   ├── Sidebar.jsx            # Navigation sidebar
    │   │   ├── AgentBriefing.jsx      # Briefing display
    │   │   ├── DocumentViewer.jsx     # Doc viewer
    │   │   └── TaskManagement.jsx     # Task panel
    │   │
    │   ├── pages/                     # Route pages
    │   │   ├── Dashboard.jsx          # Project list overview
    │   │   ├── ProjectDetail.jsx      # Project detail view
    │   │   ├── ProjectEdit.jsx        # Edit project form
    │   │   ├── GapAnalysis.jsx        # Gap analysis view
    │   │   ├── Team.jsx               # Team coordination
    │   │   ├── Calendar.jsx           # Calendar events
    │   │   ├── Contacts.jsx           # Contact management
    │   │   ├── Memory.jsx             # Agent memory viewer
    │   │   ├── Docs.jsx               # Documentation
    │   │   ├── SkillsManagement.jsx   # Skills/capabilities
    │   │   ├── SkillsManagement.module.css
    │   │   └── ... (more pages)
    │   │
    │   └── data/
    │       ├── projectMetadata.js     # Static metadata (sections, metrics, tasks)
    │       └── projects.json          # Project definitions
    │
    └── dist/                          # Built output (generated)
        ├── index.html
        └── assets/
            ├── index-{hash}.js
            └── index-{hash}.css
```

---

## 📄 KEY FILES EXPLAINED

### Root Level
| File | Purpose |
|------|---------|
| `README.md` | Quick start guide + architecture overview |
| `package.json` | Root scripts: `dev` (concurrent), `start` (build+run), `build` |
| `package-lock.json` | Dependency versions locked |

### Server (`/server`)
| File | Purpose |
|------|---------|
| `index.js` | Express server, 4 API endpoints, JSON persistence |
| `data/projects.json` | Persisted project state (editable) |
| `data/briefings.json` | Briefing metadata |
| `data/focused-tasks.json` | Task focus tracking |
| `data/adjustments.json` | Project adjustments log |

### Client (`/client`)
| File | Purpose |
|------|---------|
| `main.jsx` | React app entry + React Router setup |
| `App.jsx` | Root layout: Sidebar + Router outlet |
| `index.html` | HTML shell |
| `vite.config.js` | Vite dev server, API proxy to :3001 |
| `tailwind.config.js` | Tailwind CSS config |
| `index.css` | Global styles |

### Components (`/client/src/components`)
| Component | Purpose |
|-----------|---------|
| `Sidebar.jsx` | Navigation menu with project/page links |
| `AgentBriefing.jsx` | Display briefing cards |
| `DocumentViewer.jsx` | View/render documents |
| `TaskManagement.jsx` | Task list + status management |

### Pages (`/client/src/pages`)
| Page | Route | Purpose |
|------|-------|---------|
| `Dashboard.jsx` | `/` | List all projects with progress |
| `ProjectDetail.jsx` | `/project/:id` | Detailed metrics, milestones, tasks |
| `ProjectEdit.jsx` | `/project/:id/edit` | Edit project form |
| `GapAnalysis.jsx` | `/gap-analysis` | Organization gap analysis |
| `Team.jsx` | `/team` | Team coordination + briefings |
| `Calendar.jsx` | `/calendar` | Event calendar |
| `Contacts.jsx` | `/contacts` | Contact directory |
| `Memory.jsx` | `/memory` | Agent memory viewer |
| `Docs.jsx` | `/docs` | Documentation browser |
| `SkillsManagement.jsx` | `/skills` | Skills/capabilities |

### Data (`/client/src/data`)
| File | Purpose |
|------|---------|
| `projectMetadata.js` | Static data: project sections, metrics, milestones, tasks (keyed by ID) |
| `projects.json` | Project definitions from API |

---

## 🚀 HOW TO USE

### Start Development
```bash
cd mission-control-express-organized
npm install
npm run dev
# Runs: API on :3001, Vite on :5173
```

### Build for Production
```bash
npm run build
npm start
# API + Frontend on :3001
```

### API Endpoints (JSON persistence)
```
GET    /api/projects        # List all projects
GET    /api/projects/:id    # Get single project
PUT    /api/projects/:id    # Update project
POST   /api/projects        # Create new project
```

### Data Files (Auto-persisted)
- `server/data/projects.json` — Updated when you edit via UI
- `server/data/briefings.json` — Briefing state
- `server/data/focused-tasks.json` — Task focus
- `server/data/adjustments.json` — Adjustments log

---

## 📊 PROJECTS TRACKED

1. **WorkSafeAI** — Job Task Safety Analysis tool
2. **Mission Control** — Autonomous agent orchestration
3. **Consensus** — Product review aggregation
4. **LinkedIn Automation** — Auto-post generator
5. **Hyperscaler Briefings** — Data center/fiber news
6. **Project Warp Speed** — Pro-Tel growth acceleration

Each project has:
- Metrics (key stats)
- Milestones (progress checkpoints)
- Tasks (work items)
- Links (to repos, live apps, docs)

---

## 🔄 ARCHITECTURE FLOW

```
User Browser
    ↓
Vite Dev Server (5173)
    ↓ (API proxy)
Express Server (3001)
    ↓
JSON Files (persistence)
```

**Production:**
```
User Browser
    ↓
Express Server (3001)
    ↓ (serves built React)
JSON Files (persistence)
```

---

## 📝 CONFIGURATION NOTES

- **Tailwind CSS:** v3.x (defined in `tailwind.config.js`)
- **React Router:** v6+ (SPA routing)
- **Vite:** Dev server with HMR + API proxy
- **Express:** Minimal, CORS-enabled, JSON middleware
- **Data:** JSON files in `server/data/` (auto-persisted)

---

## ✅ QUICK REFERENCE

| Task | Command |
|------|---------|
| Start dev (hot reload) | `npm run dev` |
| Start production | `npm start` |
| Build frontend only | `npm run build` |
| View on browser | `http://localhost:5173` (dev) or `:3001` (prod) |
| Edit project data | UI → PUT `/api/projects/:id` → JSON updated |
| Add new project | UI → POST `/api/projects` → Added to JSON |

---

**Last Updated:** March 29, 2026  
**Status:** ✅ Ready to use
