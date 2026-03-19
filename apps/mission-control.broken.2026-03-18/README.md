# Mission Control Dashboard

A modern Next.js dashboard for monitoring AI agents, projects, and critical alerts in real-time.

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

The dashboard connects to the mission control backend via WebSocket for real-time updates.

```
┌─────────────────────────────────────┐
│  Next.js Frontend (localhost:3001)  │
│  - React Components                 │
│  - Tailwind CSS                     │
│  - WebSocket client                 │
└──────────────────┬──────────────────┘
                   │ WebSocket
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
- **`src/pages/index.js`** — Main dashboard page with layout

### Components
- **`Sidebar.js`** — Navigation sidebar with section links
- **`Dashboard.js`** — Section router and content renderer

### Sections
- **`AgentsSection.js`** — Display agent status, current task, output
- **`ProjectsSection.js`** — Display project status, health, progress, alerts
- **`InboxSection.js`** — Show messages ready to send, send button
- **`AlertsSection.js`** — Display critical alerts with severity levels
- **`ContactsSection.js`** — Contact info and communication channels

### Hooks
- **`useWebSocket.js`** — WebSocket connection with auto-reconnect logic

## Features

✅ **Real-time Updates** — WebSocket connection for live data  
✅ **Light Theme** — Clean, professional UI  
✅ **Sidebar Navigation** — Easy section switching  
✅ **Responsive Design** — Works on desktop and mobile  
✅ **Component-based** — Easy to extend and maintain  
✅ **Tailwind CSS** — Modern styling  

## Development

### Running Both Versions

You can run both the vanilla and Next.js versions simultaneously:

```bash
# Terminal 1: Backend server
node scripts/mission-control-server.js

# Terminal 2: Next.js frontend
cd apps/mission-control
npm run dev

# Terminal 3: Test agent spawning
node scripts/spawn-laura.js
```

### Adding a New Section

1. Create `src/components/sections/NewSection.js`
2. Import in `Dashboard.js`
3. Add case to switch statement
4. Add navigation item in `Sidebar.js`

### Modifying Styling

- Edit `tailwind.config.js` for theme colors
- Edit `src/styles/globals.css` for global styles
- Use Tailwind classes in components

### Debug WebSocket

1. Open browser DevTools → Console
2. Look for connection messages
3. Check Network tab (WS protocol)
4. Verify backend is running on `localhost:3000`

## Production Deployment

### Build
```bash
npm run build
```

### Start
```bash
npm run start
```

### Deploy to Vercel
```bash
vercel deploy
```

## State Schema

The mission control state is managed by the backend and streamed via WebSocket. Expected structure:

```json
{
  "agents": [
    {
      "id": "agent-id",
      "name": "Agent Name",
      "status": "running|idle|stopped",
      "task": "Current task description",
      "output": "Task output or logs",
      "uptime": "00:30:45",
      "tasksCompleted": 5,
      "lastActivity": "2 minutes ago"
    }
  ],
  "projects": [
    {
      "id": "project-id",
      "name": "Project Name",
      "description": "Project description",
      "health": "healthy|warning|critical",
      "status": "active|paused|archived",
      "progress": 75,
      "alerts": ["Alert 1", "Alert 2"],
      "updated": "just now"
    }
  ],
  "inbox": [
    {
      "id": "msg-id",
      "title": "Message Title",
      "recipient": "user@example.com",
      "channel": "telegram|email|slack",
      "preview": "Message preview...",
      "actionable": true
    }
  ],
  "alerts": [
    {
      "id": "alert-id",
      "title": "Alert Title",
      "message": "Alert message",
      "severity": "critical|warning|info",
      "source": "System or Agent Name",
      "timestamp": "2026-03-15 14:30:45",
      "actionable": true,
      "action": "Restart Service"
    }
  ],
  "contacts": [
    {
      "id": "contact-id",
      "name": "Contact Name",
      "role": "Role or Title",
      "channels": [
        {
          "type": "telegram|email|slack|discord|phone",
          "address": "contact-address"
        }
      ],
      "details": {
        "timezone": "America/New_York",
        "availability": "9-5 EST",
        "notes": "Additional notes"
      }
    }
  ]
}
```

## Notes

- Frontend expects backend on `localhost:3000`
- Update `useWebSocket.js` if backend port changes
- State is shared between both dashboard versions
- All features work independently of task execution

---

**Status:** ✅ Production-ready  
**Built:** March 18, 2026
