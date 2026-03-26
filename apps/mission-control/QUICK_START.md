# Mission Control - Quick Start

## Start Mission Control (Production Mode)

```bash
cd /Users/timothyryan/.openclaw/workspace/apps/mission-control
npm run build
npm start
```

Open browser: **http://localhost:3000**

---

## What You'll See

✅ **Full dashboard** with:
- Sidebar navigation (7 main sections)
- Unified Dashboard with project stats
- Connected status indicator
- All UI components loaded

---

## How It Works

- **Build** (~15s): Compiles all components to optimized JS
- **Start** (~3s): Starts Next.js server on port 3000
- **Ready**: Dashboard is live and functional

---

## Key Features Active

- 📊 Unified Dashboard (Project stats, create project)
- 📋 Task management API
- 👥 Team management
- 📅 Calendar integration
- 💾 Memory/journal system
- 📚 Documentation viewer
- 🎯 Gap analysis tools

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `pkill -f "next start"` then retry |
| Stale build | `rm -rf .next && npm run build` |
| Module not found | `npm install` (reinstall deps) |
| CSS not loading | Build includes CSS, refresh browser (Ctrl+Shift+R) |

---

## Files Structure

- `src/pages/` - Page components (now `.jsx`)
- `src/components/` - Reusable UI components (now `.jsx`)
- `src/pages/api/` - REST API endpoints
- `src/hooks/` - React hooks
- `src/styles/` - Tailwind CSS
- `jsconfig.json` - JS config with JSX settings

---

**Status:** ✅ Production-ready | All features functional | Build verified
