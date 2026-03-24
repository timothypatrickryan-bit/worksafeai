# Mission Control Dashboard — Setup & Troubleshooting

**Last Updated:** March 22, 2026, 11:00 AM EST  
**Status:** ✅ Fully operational

---

## Quick Start

### Start the Dashboard Server

```bash
cd /Users/timothyryan/.openclaw/workspace
node dashboard-server.js
```

### Open in Browser

```
http://localhost:8080
```

---

## What You'll See

**Dashboard displays:**
- 📊 **Agents Panel** — Shows all AI agents and their status
- 🗂️ **Projects Panel** — Shows all projects with progress bars
- 📬 **Inbox Panel** — Shows pending messages and notifications
- 🚨 **Alerts Panel** — Shows system alerts
- 👥 **Contacts Panel** — Shows integrated platforms

**Live Updates:**
- State refreshes every 5 seconds automatically
- WebSocket connection updates in real-time
- No manual refresh needed

---

## Features

### Project Details
- **Click any project** to see detailed information
- Shows: Name, Status, Progress %, Task counts
- Status indicators: 🟢 active, ✅ completed, ⏸️ paused, ⚠️ stalled

### Progress Tracking
- Visual progress bar for each project
- Shows completed tasks vs total tasks
- Updates automatically as work progresses

### Live Status
- Shows when last updated
- Connection status indicator (top-right)
- Reconnects automatically if disconnected

---

## Architecture

### Components

**1. dashboard-server.js** (Node.js backend)
- Serves HTML dashboard
- Provides state via HTTP API
- Streams updates via WebSocket
- Auto-refreshes state every 5 seconds

**2. mission-control-dashboard.html** (Frontend)
- Responsive web interface
- Real-time state rendering
- WebSocket client
- Click handlers for project details

**3. .mission-control-state.json** (Data source)
- Centralized state file
- Updated by autonomy loop and other systems
- Served by dashboard-server.js

### Data Flow

```
.mission-control-state.json
         ↓
dashboard-server.js (reads every 5s)
         ↓
    ├─ HTTP API (/api/state)
    └─ WebSocket (live updates)
         ↓
mission-control-dashboard.html
         ↓
Browser (renders to user)
```

---

## Troubleshooting

### Dashboard Won't Load

**Check 1: Is the server running?**
```bash
curl http://localhost:8080
# Should return HTML content
```

**Check 2: Is port 8080 in use?**
```bash
lsof -i :8080
# If something else is using it, kill it or use different port
```

**Check 3: Can the server read state?**
```bash
# Check file exists
ls -l /Users/timothyryan/.openclaw/workspace/.mission-control-state.json

# Check API endpoint
curl http://localhost:8080/api/state | head
```

### Projects Not Displaying

**Check 1: Does state file have projects?**
```bash
jq '.projects | length' /Users/timothyryan/.openclaw/workspace/.mission-control-state.json
```

**Check 2: Check browser console for errors**
- Open DevTools (⌘+Option+I on Mac)
- Check Console tab for JavaScript errors
- Check Network tab to see API responses

### WebSocket Connection Failing

**Check 1: Server logs should show connection**
- Look for "✅ WebSocket client connected" in server output
- If not connecting, check browser console

**Check 2: Fallback to HTTP**
- Even if WebSocket fails, HTTP API should work
- State will update every time page refreshes

---

## Advanced Setup

### Change Port

Edit dashboard-server.js:
```javascript
const PORT = 8080; // Change to whatever port you want
```

Then restart the server.

### Add to Launchd (Auto-start on Mac)

**Create plist file:**
```bash
cat > ~/Library/LaunchAgents/com.openclaw.dashboard.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.openclaw.dashboard</string>
  <key>ProgramArguments</key>
  <array>
    <string>/opt/homebrew/bin/node</string>
    <string>/Users/timothyryan/.openclaw/workspace/dashboard-server.js</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/tmp/dashboard.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/dashboard-error.log</string>
</dict>
</plist>
EOF
```

**Load the service:**
```bash
launchctl load ~/Library/LaunchAgents/com.openclaw.dashboard.plist
```

**Check status:**
```bash
launchctl list | grep dashboard
```

**Unload:**
```bash
launchctl unload ~/Library/LaunchAgents/com.openclaw.dashboard.plist
```

---

## Customization

### Add New Panels

Edit `mission-control-dashboard.html`:

1. Add sidebar navigation item
2. Add section container
3. Add render function
4. Update `switchSection()` function

### Change Refresh Interval

Edit `dashboard-server.js`:
```javascript
const watchInterval = setInterval(() => {
  // Currently 5000ms (5 seconds)
  // Change to 1000 for 1 second, 10000 for 10 seconds, etc.
}, 5000);
```

### Style Customization

Edit CSS in `mission-control-dashboard.html`:
- Change colors, fonts, sizes
- Add animations
- Adjust layout

---

## Performance

### Current Specs
- **Server memory:** ~10-20MB idle
- **State refresh:** 5 seconds
- **WebSocket overhead:** Minimal
- **Browser rendering:** Real-time (sub-100ms)

### Optimization Tips
- Increase refresh interval if CPU is high
- Reduce history size in state file if it grows large
- Use browser DevTools to profile performance

---

## API Reference

### GET /api/state
Returns current state JSON

**Request:**
```bash
curl http://localhost:8080/api/state
```

**Response:**
```json
{
  "agents": { ... },
  "projects": [ ... ],
  "inbox": [ ... ],
  "alerts": [ ... ],
  "contacts": [ ... ]
}
```

### WebSocket (ws://localhost:8080)

**Message format:**
```json
{
  "type": "state-update",
  "payload": { ... full state ... }
}
```

---

## Logs & Debugging

### Server output
```bash
node dashboard-server.js
# Shows:
# - Startup message
# - WebSocket connections
# - Any errors
```

### Browser console
- Open DevTools (⌘+Option+I)
- Check Console tab
- Check Network tab for API requests

### State file changes
```bash
# Watch for changes to state file
watch -n 1 'wc -l /Users/timothyryan/.openclaw/workspace/.mission-control-state.json'
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Connection refused" | Is server running? Start it with `node dashboard-server.js` |
| "Cannot find module 'ws'" | Install: `npm install ws` |
| "Port 8080 already in use" | Kill other process or change PORT in code |
| "State not updating" | Check if .mission-control-state.json is being modified |
| "WebSocket connection failed" | Check browser console, server logs. HTTP fallback should work. |
| "Projects not showing" | Verify state file has projects array |
| "Blank dashboard" | Check browser console for JavaScript errors |

---

## Summary

✅ **Dashboard fully functional**
✅ **Server auto-serving state**
✅ **WebSocket live updates ready**
✅ **All project features working**
✅ **Easy to customize and extend**

The dashboard is now production-ready!

---

**For support:** Check browser console, server logs, and this guide.  
**Questions?** Review DASHBOARD_BUG_FIX.md for technical details.
