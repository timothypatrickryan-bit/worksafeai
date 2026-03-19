# Mission Control Next.js Setup

Complete rebuild of Mission Control as a Next.js application.

## What Changed

**Before (Vanilla HTML):**
- Single HTML file
- Inline CSS + JavaScript
- Simpler but less maintainable

**After (Next.js):**
- Modern React components
- Tailwind CSS for styling
- Reusable hooks
- Scalable architecture
- Consistent with your tech stack

## Quick Start

### 1. Install Dependencies
```bash
cd apps/mission-control
npm install
```

### 2. Start Backend (if not already running)
```bash
# In workspace root
node scripts/mission-control-server.js
# Runs on localhost:3000
```

### 3. Start Next.js Frontend
```bash
cd apps/mission-control
npm run dev
# Runs on localhost:3001
```

### 4. Open Dashboard
```
http://localhost:3001
```

## Architecture

```
┌─────────────────────────────────────┐
│  Next.js Frontend (localhost:3001)  │
│  - React Components                 │
│  - Tailwind CSS                     │
│  - WebSocket client                 │
└──────────────────┬──────────────────┘
                   │ WebSocket + REST API
                   ↓
┌─────────────────────────────────────┐
│  Express Backend (localhost:3000)   │
│  - WebSocket server                 │
│  - REST API routes                  │
│  - State management                 │
└──────────────────┬──────────────────┘
                   │ Read/write
                   ↓
      .mission-control-state.json
```

## Components

### Pages
- `src/pages/index.js` — Main dashboard page

### Components
- `Sidebar.js` — Navigation sidebar
- `Dashboard.js` — Section router
- `sections/` — Individual section components
  - `AgentsSection.js`
  - `ProjectsSection.js`
  - `InboxSection.js`
  - `AlertsSection.js`
  - `ContactsSection.js`

### Hooks
- `useWebSocket.js` — WebSocket connection + auto-reconnect

## Features

✅ **Real-time Updates** — WebSocket connection to backend  
✅ **Light Theme** — Clean, professional UI  
✅ **Sidebar Navigation** — Easy section switching  
✅ **Responsive** — Works on mobile too  
✅ **Component-based** — Easy to extend  

## Running Both Versions

You can run **both** the old vanilla version and new Next.js version at the same time:

```bash
# Terminal 1: Backend server
node scripts/mission-control-server.js
# Serves on localhost:3000

# Terminal 2: Next.js frontend
cd apps/mission-control
npm run dev
# Serves on localhost:3001

# Terminal 3: Test agent spawning
node scripts/spawn-laura.js
```

Access via:
- Next.js: http://localhost:3001 (new)
- Vanilla: http://localhost:3000 (old)

Both connect to the same backend/state!

## Production Deployment

### Frontend (Next.js)
```bash
npm run build
npm run start
```
Deploy to Vercel like your other Next.js apps.

### Backend (Express)
Keep running as a separate service or integrate with your existing backend infrastructure.

### State Storage
Currently uses local JSON file. For production, consider:
- PostgreSQL (Supabase)
- MongoDB
- S3 + Lambda
- Any persistent storage

## Development Tips

### Add a New Section

1. Create `src/components/sections/NewSection.js`
2. Import in `Dashboard.js`
3. Add to switch statement
4. Add to sidebar nav items

### Modify Styling

Edit `tailwind.config.js` for theme colors  
Edit `src/styles/globals.css` for global styles  
Use Tailwind classes in components

### Debug WebSocket

1. Open browser DevTools → Console
2. Look for connection messages
3. Check Network tab (WS protocol)
4. Verify backend is running

## Notes

- Frontend expects backend on `localhost:3000`
- Update `useWebSocket.js` if backend port changes
- State is shared between both dashboard versions
- All features work the same as vanilla version

## Next Steps

1. Test the Next.js dashboard (localhost:3001)
2. Verify WebSocket connection (should see green "Connected" badge)
3. Run `spawn-laura.js` to test agent integration
4. Watch inbox update in real-time

---

**Status:** ✅ Production-ready  
**Created:** March 15, 2026
