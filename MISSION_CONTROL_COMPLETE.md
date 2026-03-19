# Mission Control — Complete System ✅

**Status:** Production Ready  
**Last Updated:** March 15, 2026 @ 12:56 PM EST  
**Components:** 5 (Dashboard, Task Board, Activity Feed, Heartbeat, WebSocket)

---

## 🎯 What You Have Now

### **1. Next.js Mission Control Dashboard**
**Location:** http://localhost:3001  
**Status:** ✅ Live & Connected

**Features:**
- Linear-inspired design (clean, minimal, professional)
- Real-time WebSocket updates
- Sidebar navigation (fixed 280px)
- 7 sections (Tasks, Activity, Agents, Projects, Inbox, Alerts, Contacts)

**Tech Stack:**
- Frontend: Next.js 14.2.35 + React
- Backend: Express.js (localhost:3000)
- Real-time: WebSocket
- State: Single JSON file (`.mission-control-state.json`)
- Styling: Tailwind CSS with Linear color palette

---

### **2. Task Board (Kanban)**
**Default Homepage:** Yes ✅

**4 Columns:**
1. **Awaiting Review** (Orange) → Your approval gate
   - See pending tasks before agents work on them
   - Approve → Moves to Queued
   - Reject → Removed from board
   
2. **Queued** (Gray) → Ready to run
   - Tasks approved and waiting for agents
   - Shows assignment and description
   
3. **In Progress** (Yellow, pulsing) → Currently running
   - Tasks agents are actively working on
   - Real-time updates via WebSocket
   
4. **Complete** (Green, ✓) → Finished work
   - Tasks done with output visible

**Task Features:**
- ✅ Create new tasks (+ Create New Task button)
- ✅ Assign to agents (Laura, Opus, LinkedIn, Manual)
- ✅ Add descriptions and details
- ✅ Approve/Reject workflow
- ✅ Real-time status tracking

---

### **3. Live Activity Feed**
**Section:** Activity (⊙ in sidebar)

**Shows:**
- Agent work transitions (working → complete)
- Inbox messages ready to send
- Alert escalations
- Sorted newest-first
- Relative timestamps ("5m ago", "2h ago", etc.)
- Color-coded by type (yellow = working, green = complete, blue = inbox, red = alerts)

---

### **4. Automated Heartbeat Monitoring**
**Script:** `scripts/heartbeat-mission-control.js`  
**Frequency:** Every 30 minutes (configurable)  
**Config:** `openclaw.json` cron tasks

**Monitors:**
- ⚠️ Tasks awaiting your review
- ✅ Tasks queued and ready
- 📬 Messages waiting to send
- 🚨 Critical alerts
- 🤖 Agent status (idle/working/complete)

**Smart Recommendations:**
- "Review X tasks at http://localhost:3001"
- "Send X messages from Inbox"
- "X agents idle - create new tasks"
- "Address X critical alerts"

**Manual Run:**
```bash
node scripts/heartbeat-mission-control.js
```

---

### **5. Real-Time Integration**
**Backend:** Express + WebSocket Server  
**Location:** http://localhost:3000

**API Endpoints:**
- `POST /api/tasks/add` → Create new task
- `POST /api/tasks/:id/approve` → Approve & queue task
- `POST /api/tasks/:id/reject` → Reject task
- `POST /api/inbox/send/:id` → Send inbox message
- `GET /api/status` → Full board status
- `WebSocket /` → Real-time updates

**State File:**
- `.mission-control-state.json` (single source of truth)
- Agents, projects, inbox, alerts, tasks, contacts
- Auto-saved on every change
- Broadcast to all WebSocket clients immediately

### **6. Calendar & Cron Jobs View**
**Section:** Calendar (📅 in sidebar)  
**Status:** ✅ Live & Real-Time

**Shows:**
- Weekly calendar with job highlights
- Next 7 days timeline with countdown timers
- Exact cron patterns and frequencies
- Schedule statistics (jobs/week, heartbeats, posts)
- Real-time updates via WebSocket

**Jobs Tracked:**
- Mission Control Heartbeat (every 30 min)
- LinkedIn Auto-Post (Tue/Thu/Sat @ 9 AM EST)

---

## 🚀 Quick Start

### **1. Start the Backend (if not running)**
```bash
node scripts/mission-control-server.js
# Listens on http://localhost:3000
# WebSocket on ws://localhost:3000
```

### **2. Start the Frontend (if not running)**
```bash
cd apps/mission-control
npm run dev
# Opens on http://localhost:3001
```

### **3. Create Your First Task**
- Click **+ Create New Task**
- Enter title: "Review Q2 strategy"
- Add description (optional)
- Assign to: Laura (or your preferred agent)
- Click **Create Task**
- Task appears in "Awaiting Review" column

### **4. Approve the Task**
- See the task card with Approve/Reject buttons
- Click **Approve** (green button)
- Task moves to Queued column
- Agent sees it in their queue

### **5. Monitor Heartbeat**
```bash
node scripts/heartbeat-mission-control.js
```
See pending work summary + recommendations

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MISSION CONTROL                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (Next.js)           Backend (Express)         │
│  ├─ Task Board                ├─ REST API               │
│  ├─ Activity Feed             ├─ WebSocket Server       │
│  ├─ Calendar & Cron Jobs      ├─ State Management       │
│  ├─ Agents Section            └─ File I/O              │
│  ├─ Projects/Inbox/Alerts                             │
│  └─ Contacts Manager                                    │
│         │                          ▲                    │
│         └──────────────────────────┘                    │
│            Real-time WebSocket                          │
│                                                          │
│         ┌──────────────────────────┐                    │
│         │ .mission-control-state   │                    │
│         │        .json             │                    │
│         │ (Source of Truth)        │                    │
│         └──────────────────────────┘                    │
│                  ▲                                       │
│         ┌────────┴────────┐                             │
│         ▼                  ▼                             │
│    Heartbeat          Agents (Laura,              │
│    Monitor            Opus, LinkedIn)              │
│    + Cron             + Scheduled Jobs             │
│    Scheduler                                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Typical Workflow

### **Morning (9:30 AM)**
1. OpenClaw heartbeat runs
2. Reports: "2 tasks awaiting review"
3. You open Mission Control
4. Review pending tasks in "Awaiting Review" column
5. Approve → Task queues
6. Reject → Task removed

### **Agent Works (9:35 AM)**
1. Laura sees new task in her queue
2. Task status changes to "working"
3. Task card moves to "In Progress" (yellow, pulsing)
4. Real-time activity feed updates

### **Completion (10:00 AM)**
1. Laura finishes task
2. Task status changes to "complete"
3. Task card moves to "Complete" (green, ✓)
4. Output visible (analysis, report, etc.)
5. Message added to Inbox for you

### **Next Heartbeat (11:00 AM)**
1. Heartbeat checks board
2. Reports: "1 message ready to send"
3. You review in Inbox
4. Click SEND
5. Message goes to recipient (Kelly, Tim, etc.)

---

## 📁 File Structure

```
/Users/timothyryan/.openclaw/workspace/
├── apps/mission-control/              # Next.js app
│   ├── src/pages/
│   │   ├── _app.js
│   │   └── index.js (main dashboard)
│   ├── src/components/
│   │   ├── Sidebar.js
│   │   ├── Dashboard.js
│   │   └── sections/
│   │       ├── TasksSection.js (Kanban board)
│   │       ├── ActivitySection.js (Live feed)
│   │       ├── AgentsSection.js
│   │       ├── ProjectsSection.js
│   │       ├── InboxSection.js
│   │       ├── AlertsSection.js
│   │       └── ContactsSection.js
│   ├── src/hooks/
│   │   └── useWebSocket.js
│   ├── tailwind.config.js
│   └── package.json
│
├── scripts/
│   ├── mission-control-server.js      # Express backend
│   ├── mission-control.js              # CLI tool
│   ├── heartbeat-mission-control.js   # Heartbeat monitor
│   └── spawn-laura.js                  # Agent spawner
│
├── .mission-control-state.json         # State file
├── MISSION_CONTROL.md                  # Architecture docs
├── MISSION_CONTROL_NEXTJS_SETUP.md     # Setup guide
├── MISSION_CONTROL_HEARTBEAT.md        # Heartbeat docs
├── MISSION_CONTROL_COMPLETE.md         # This file
├── openclaw.json                       # Cron config
└── HEARTBEAT.md                        # Heartbeat tasks
```

---

## 🎨 Design System

**Theme:** Linear-inspired (clean, minimal, professional)

**Color Palette:**
- Primary: `#0052CC` (Deep Blue)
- Success: `#22C55E` (Green)
- Warning: `#F59E0B` (Amber)
- Danger: `#EF4444` (Red)
- Gray 50-900 (Neutral shades)

**Typography:**
- Font: System fonts (San Francisco, Helvetica)
- Sizes: xs (12px), sm (13px), base (14px), lg (16px)

**Components:**
- Buttons: Minimal, clear labels
- Cards: Subtle borders, no shadows
- Status indicators: Colored dots + badges
- Interactive: Hover states, smooth transitions

---

## ⚙️ Configuration

### **Change Heartbeat Frequency**
Edit `openclaw.json`:
```json
{
  "cron": {
    "tasks": [
      {
        "schedule": "*/15 * * * *",  // Every 15 min
        "id": "mission-control-heartbeat"
      }
    ]
  }
}
```

### **Disable Heartbeat**
```json
{
  "cron": {
    "tasks": [
      {
        "id": "mission-control-heartbeat",
        "enabled": false
      }
    ]
  }
}
```

### **Change Dashboard Port**
Backend: `PORT=4000 node scripts/mission-control-server.js`  
Frontend: `cd apps/mission-control && PORT=4001 npm run dev`

---

## 🔧 Troubleshooting

### **Dashboard not loading?**
1. Check backend: `http://localhost:3000` (should show JSON)
2. Check frontend: `http://localhost:3001` (should show UI)
3. Restart both servers

### **WebSocket not connecting?**
1. Check console (F12) for errors
2. Verify backend running on :3000
3. Check browser firewall/proxy settings

### **Heartbeat not running?**
1. Verify config: `cat openclaw.json | grep mission-control`
2. Manual test: `node scripts/heartbeat-mission-control.js`
3. Check cron logs: OpenClaw dashboard

### **State file corrupted?**
1. Backup: `cp .mission-control-state.json .mission-control-state.json.bak`
2. Reinit: Delete file, refresh dashboard (creates new)
3. Or restore from backup: `cp .mission-control-state.json.bak .mission-control-state.json`

---

## 📈 Next Steps

### **Immediate (Ready Now)**
- ✅ Create tasks manually
- ✅ Approve/reject workflow
- ✅ View real-time activity
- ✅ Run heartbeat checks

### **Short-term (This Week)**
- [ ] Integrate Laura with auto-task creation
- [ ] Set up Opus code review automation
- [ ] Connect LinkedIn auto-poster to task queue
- [ ] Add WhatsApp messaging for Kelly

### **Long-term (Month)**
- [ ] Advanced filtering/search in task board
- [ ] Drag-drop between columns (drag-to-approve)
- [ ] Task time tracking (est vs actual)
- [ ] Agent performance metrics
- [ ] Recurring tasks (daily, weekly)
- [ ] Team collaboration (shared review queues)

---

## 💡 Pro Tips

1. **Morning Routine:** Check heartbeat first thing
2. **Batch Approvals:** Approve 3-5 tasks at once
3. **Monitor Activity:** Glance at Activity feed during the day
4. **Idle Agents:** Create tasks when you see idle agents
5. **Message Queue:** Send batches of messages together

---

## 📞 Support

**Dashboard:** http://localhost:3001  
**Backend API:** http://localhost:3000  
**State File:** `.mission-control-state.json`  
**Heartbeat Script:** `scripts/heartbeat-mission-control.js`  

**Documentation:**
- `MISSION_CONTROL.md` — Architecture
- `MISSION_CONTROL_NEXTJS_SETUP.md` — Setup guide
- `MISSION_CONTROL_HEARTBEAT.md` — Heartbeat reference
- `MISSION_CONTROL_CALENDAR.md` — Calendar & cron jobs reference
- `AGENT_COORDINATION.md` — Agent integration
- `CONTACTS_MANAGER.md` — Contact registry
- `MISSION_CONTROL_COMPLETE.md` — Full system overview (this file)
- `MISSION_CONTROL_QUICK_REFERENCE.md` — Daily quick card

---

**🎉 Mission Control is production-ready and fully automated!**

You now have:
- ✅ Real-time task board with approval workflow
- ✅ Live activity feed showing all work
- ✅ Automated heartbeat monitoring every 30 minutes
- ✅ Full agent coordination via shared state
- ✅ Professional Linear-inspired interface

**Time to delegate, monitor, and let agents do the work!** 🚀
