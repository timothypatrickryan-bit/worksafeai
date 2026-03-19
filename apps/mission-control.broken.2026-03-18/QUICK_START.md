# Mission Control Dashboard - Quick Start Guide

## 🚀 Get Running in 2 Minutes

### Terminal 1: Backend Server
```bash
cd /Users/timothyryan/.openclaw/workspace
node scripts/mission-control-server.js
# ✅ Serves on http://localhost:3000
```

### Terminal 2: Next.js Frontend
```bash
cd /Users/timothyryan/.openclaw/workspace/apps/mission-control
npm install
npm run dev
# ✅ Serves on http://localhost:3001
```

### Terminal 3: Test with Agent (optional)
```bash
cd /Users/timothyryan/.openclaw/workspace
node scripts/spawn-laura.js
# 📊 Watch dashboard update in real-time
```

### Open Dashboard
```
http://localhost:3001
```

---

## 📁 Project Structure

```
apps/mission-control/
├── src/
│   ├── pages/
│   │   ├── _app.js           ← App wrapper
│   │   └── index.js          ← Main dashboard
│   ├── components/
│   │   ├── Sidebar.js        ← Navigation
│   │   ├── Dashboard.js      ← Section router
│   │   └── sections/
│   │       ├── AgentsSection.js
│   │       ├── ProjectsSection.js
│   │       ├── InboxSection.js
│   │       ├── AlertsSection.js
│   │       └── ContactsSection.js
│   ├── hooks/
│   │   └── useWebSocket.js   ← Connection handler
│   └── styles/
│       └── globals.css       ← Global styles
├── tailwind.config.js        ← Tailwind config
├── postcss.config.js         ← PostCSS config
├── next.config.js            ← Next.js config
├── package.json              ← Dependencies
└── README.md                 ← Full documentation
```

---

## 🎨 Design System

### Colors
- **Primary:** `#2563eb` (Blue)
- **Secondary:** `#64748b` (Gray)
- **Success:** `#16a34a` (Green)
- **Warning:** `#ea580c` (Orange)
- **Danger:** `#dc2626` (Red)

### Components
- **Sidebar:** Fixed left navigation
- **Dashboard:** Main content area with section routing
- **Cards:** White background, subtle shadows, hover effects
- **Status badges:** Color-coded by state

### Responsive
- **Desktop:** Full multi-column layout
- **Tablet:** Adjusted grid (2 cols)
- **Mobile:** Single column, collapsible sidebar

---

## 🔌 WebSocket Connection

The dashboard auto-connects to `ws://localhost:3000` on mount.

**Features:**
- ✅ Auto-reconnect (3-second retry)
- ✅ Real-time state updates
- ✅ Connection status indicator
- ✅ Error handling

**Hook:**
```javascript
import useWebSocket from '../hooks/useWebSocket';

const { state, connected, error } = useWebSocket('ws://localhost:3000');
```

---

## 📊 Sections

### Agents
Display agent status, current task, output, and stats.

### Projects
Show project health (healthy/warning/critical), progress, alerts.

### Inbox
List messages ready to send with send button integration.

### Alerts
Display critical alerts with severity levels and action buttons.

### Contacts
Show contact info and communication channels.

---

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start dev server (port 3001)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

---

## 🐛 Troubleshooting

### WebSocket connection fails
- ✓ Check backend is running: `http://localhost:3000`
- ✓ Verify backend WebSocket is on port 3000
- ✓ Check browser console for errors

### Styling looks wrong
- ✓ Verify Tailwind CSS is installed: `npm install`
- ✓ Check `tailwind.config.js` is correct
- ✓ Clear `.next` folder: `rm -rf .next && npm run dev`

### Dashboard is blank
- ✓ Check if state is being sent from backend
- ✓ Open browser DevTools → Console
- ✓ Look for WebSocket connection messages

---

## 📝 Notes

- **Backend port:** 3000 (WebSocket + REST API)
- **Frontend port:** 3001 (Next.js)
- **State file:** `/workspace/.mission-control-state.json`
- **No database required** — uses JSON file for state
- **Monitoring only** — does not execute tasks, just displays state

---

**Ready to go!** Open http://localhost:3001 and start monitoring. 🚀
