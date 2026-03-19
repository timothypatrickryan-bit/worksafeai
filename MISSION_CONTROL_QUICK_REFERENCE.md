# Mission Control — Quick Reference

**Version:** 1.0 — Production Ready  
**Last Updated:** March 15, 2026 @ 12:57 PM EST  

---

## 🎯 In 60 Seconds

1. **Open:** http://localhost:3001
2. **Create Task:** Click "+ Create New Task"
3. **Approve:** Click "Approve" button → Task queues
4. **Monitor:** Watch "In Progress" column
5. **Done:** Task moves to "Complete"

---

## 🎛️ Control Panel

| What | Where | How |
|------|-------|-----|
| **View Tasks** | http://localhost:3001 | Open in browser |
| **Create Task** | Task Board | + Create New Task button |
| **Approve/Reject** | Awaiting Review column | Click buttons |
| **Send Messages** | Inbox section | Click SEND button |
| **Check Status** | Activity feed | Real-time updates |
| **Run Heartbeat** | Terminal | `node scripts/heartbeat-mission-control.js` |

---

## 📊 Dashboard Sections

```
Sidebar (Left)              Main Content (Right)
├─ Tasks (◉)              ┌─ Awaiting Review (Orange)
├─ Activity (⊙)           ├─ Queued (Gray)
├─ Agents (◆)             ├─ In Progress (Yellow, pulsing)
├─ Projects (▪)           └─ Complete (Green, ✓)
├─ Inbox (⊕)
├─ Alerts (⚠)
└─ Contacts (◉)
```

---

## ⚡ Common Tasks

### Create & Assign Task
```
1. Click "+ Create New Task"
2. Title: "Review Q2 strategy"
3. Description: "Analyze competitor pricing"
4. Assign to: "Laura"
5. Click "Create Task"
→ Task appears in "Awaiting Review"
```

### Approve Task
```
1. Find task in "Awaiting Review"
2. Click "Approve" (green button)
→ Task moves to "Queued"
→ Assigned agent sees it immediately
```

### Reject Task
```
1. Find task in "Awaiting Review"
2. Click "Reject" (red button)
→ Task removed from board
```

### Send Message
```
1. Go to "Inbox" section
2. Click "Send" on ready message
→ Message sent to recipient
→ Status changes to "sent"
```

### Monitor Activity
```
1. Click "Activity" in sidebar
2. See all work happening:
   - Agent transitions
   - Messages queued
   - Alert escalations
   - Sorted newest first
```

---

## 🤖 Agent Assignment Options

- **Laura** — Brand Strategy Manager
- **Opus** — Code Review & Analysis
- **LinkedIn** — Auto-posting & Content
- **Manual** — Manual review by you

---

## 🕐 Automation Schedule

| When | What | How |
|------|------|-----|
| Every 30 min | Mission Control heartbeat | Automatic (cron) |
| Tue/Thu/Sat 9 AM | LinkedIn auto-post | Automatic (launchd) |
| Manual | Laura task spawn | `node scripts/spawn-laura.js` |
| Manual | Opus code review | Spawn as needed |

---

## 📝 Status Indicators

| Color | Meaning | Action |
|-------|---------|--------|
| 🟠 Orange | Awaiting Review | Approve or Reject |
| ⚪ Gray | Queued & Ready | Agent will start soon |
| 🟡 Yellow (pulse) | In Progress | Agent actively working |
| 🟢 Green (✓) | Complete | View results |

---

## 🚀 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Create task (from form) |
| `Esc` | Close form |
| `Ctrl+S` | Manual state save |
| `F5` | Refresh dashboard |

---

## 🔧 Quick Commands

```bash
# Start backend
node scripts/mission-control-server.js

# Start frontend
cd apps/mission-control && npm run dev

# Run heartbeat
node scripts/heartbeat-mission-control.js

# View state
cat .mission-control-state.json | jq .

# Spawn Laura
node scripts/spawn-laura.js "Your prompt here"
```

---

## 📍 Ports & URLs

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3001 | http://localhost:3001 |
| Backend | 3000 | http://localhost:3000 |
| WebSocket | 3000 | ws://localhost:3000 |

---

## 📱 State File Location

```
/Users/timothyryan/.openclaw/workspace/.mission-control-state.json
```

Contains:
- Tasks (with status, assignee, description)
- Agents (with status, output)
- Projects (health status)
- Inbox (messages pending)
- Alerts (critical issues)
- Contacts (routing info)

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| Dashboard blank | Restart backend: `node scripts/mission-control-server.js` |
| WebSocket not connected | Check console (F12), verify backend running |
| Heartbeat not running | Manual: `node scripts/heartbeat-mission-control.js` |
| State file missing | Refresh dashboard (creates new state) |
| Task not appearing | Check network tab (F12), verify POST request |

---

## 💡 Pro Tips

1. **Batch Approvals:** Review multiple tasks at once
2. **Activity Monitoring:** Glance at Activity feed during the day
3. **Idle Alert:** Heartbeat tells you when agents are waiting
4. **Message Batching:** Send multiple messages together
5. **Archive Old Tasks:** Delete "complete" tasks to keep board clean

---

## 📚 Documentation

- **Full System:** `MISSION_CONTROL_COMPLETE.md`
- **Heartbeat:** `MISSION_CONTROL_HEARTBEAT.md`
- **Architecture:** `MISSION_CONTROL.md`
- **Agent Integration:** `AGENT_COORDINATION.md`
- **Contacts:** `CONTACTS_MANAGER.md`

---

## ✅ Checklist

- [x] Dashboard running (http://localhost:3001)
- [x] Backend running (http://localhost:3000)
- [x] WebSocket connected (real-time updates)
- [x] Heartbeat configured (every 30 min)
- [x] Task board operational (4 columns)
- [x] Approval workflow working (Approve/Reject)
- [x] Activity feed live (real-time tracking)
- [x] State file managed (`.mission-control-state.json`)

---

**Everything is ready. Start delegating! 🚀**
