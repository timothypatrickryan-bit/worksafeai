# Mission Control Dashboard

Next.js-based monitoring and coordination dashboard for autonomous agents.

## Architecture

**Frontend:** Next.js 14 + React + Tailwind CSS  
**Backend:** Express.js (separate server)  
**State:** `.mission-control-state.json` (shared JSON file)  
**Communication:** WebSocket (real-time updates) + REST API

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend Server
```bash
# In parent workspace directory
node scripts/mission-control-server.js
# Runs on localhost:3000 (provides WebSocket + API)
```

### 3. Start Next.js Frontend
```bash
npm run dev
# Runs on localhost:3001
```

Then open: http://localhost:3001

## Features

✅ **Real-time Dashboard**
- Sidebar navigation
- Light theme (Tailwind CSS)
- Auto-updates via WebSocket

✅ **Agent Management**
- View agent statuses (idle, working, complete, scheduled)
- See agent outputs
- Track agent activity

✅ **Project Monitoring**
- Project health checks
- Deployment tracking
- Alert management

✅ **Inbox System**
- Async task queue
- From/to routing
- Send button to process items

✅ **Alerts**
- Critical/warning/info levels
- Timestamps
- Auto-clear

✅ **Contacts Registry**
- Expandable tree structure
- People, tools, platforms
- Channel details (WhatsApp, Email, API)
- Availability tracking

## File Structure

```
src/
├── pages/
│   ├── _app.js           # App wrapper
│   └── index.js          # Main dashboard page
├── components/
│   ├── Sidebar.js        # Navigation sidebar
│   ├── Dashboard.js      # Section router
│   └── sections/
│       ├── AgentsSection.js
│       ├── ProjectsSection.js
│       ├── InboxSection.js
│       ├── AlertsSection.js
│       └── ContactsSection.js
├── hooks/
│   └── useWebSocket.js   # WebSocket connection
├── styles/
│   └── globals.css       # Global styles
└── ...
```

## API Endpoints (Backend)

```
GET  /api/status              - Get current state
GET  /api/agents              - List agents
GET  /api/projects            - List projects
GET  /api/inbox               - List inbox items
GET  /api/alerts              - List alerts
POST /api/inbox/send/:id      - Mark item as sent
POST /api/agent/:name/status  - Update agent status
POST /api/inbox               - Add inbox item
```

## WebSocket

**URL:** `ws://localhost:3000`

**Message Format:**
```json
{
  "type": "state-update",
  "payload": { /* full state */ }
}
```

Sent automatically when state changes (via `.mission-control-state.json` updates).

## Deployment

For production, deploy:
- **Frontend:** Vercel (Next.js standard)
- **Backend:** Same server or separate
- **State:** Shared storage (S3, database, or mounted filesystem)

## Development

### Add a New Section

1. Create component in `src/components/sections/NewSection.js`
2. Import in `src/components/Dashboard.js`
3. Add case in `renderSection()` switch
4. Add nav item in `src/components/Sidebar.js`

### Update Styling

Edit `tailwind.config.js` or `src/styles/globals.css`

### Debug WebSocket

Check browser console for connection messages. Verify backend is running on port 3000.

## Notes

- Frontend connects to backend on `localhost:3000`
- Update `useWebSocket.js` if backend runs on different port
- State updates are real-time (WebSocket)
- All data persists in `.mission-control-state.json`

---

**Created:** March 15, 2026  
**Status:** Production-ready
