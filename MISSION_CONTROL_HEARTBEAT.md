# Mission Control Heartbeat Integration

**Status:** ✅ Production Ready  
**Last Updated:** March 15, 2026 @ 12:55 PM EST  
**Frequency:** Every 30 minutes (configurable)

## Overview

The **Mission Control Heartbeat** is an automated monitoring system that checks your task board every 30 minutes and reports pending work.

It integrates with OpenClaw's native heartbeat mechanism — no external schedulers needed.

## What It Monitors

### 1. **Tasks Awaiting Review** ⚠️
- Counts pending tasks in "Awaiting Review" column
- Lists each task with:
  - Title
  - Assigned agent
  - Description preview
- Action: "Review these at http://localhost:3001"

### 2. **Tasks Queued** ✅
- Counts ready-to-run tasks in "Queued" column
- Shows which agent each task is assigned to
- Useful for tracking work in progress

### 3. **Messages Ready to Send** 📬
- Checks Inbox for items with status "ready-to-send"
- Lists sender → recipient
- Shows message preview
- Action: "Send these from the Inbox section"

### 4. **Critical Alerts** 🚨
- Flags high-priority alerts requiring immediate action
- Escalates urgently

### 5. **Agent Status** 🤖
- Counts agents by status:
  - **Idle:** Available for work
  - **Working:** Currently running tasks
  - **Complete:** Finished with output

## Smart Recommendations

The heartbeat provides context-aware suggestions:

- **"Review X pending tasks"** → If tasks awaiting approval
- **"Send X messages"** → If inbox has ready items
- **"X agents idle, create new tasks"** → If agents waiting for work
- **"Address X critical alerts"** → If urgent issues

## Installation

### Automatic (Recommended)

Already configured in `openclaw.json`:

```json
{
  "cron": {
    "tasks": [
      {
        "id": "mission-control-heartbeat",
        "schedule": "*/30 * * * *",
        "description": "Check Mission Control task board every 30 minutes",
        "command": "node scripts/heartbeat-mission-control.js",
        "enabled": true
      }
    ]
  }
}
```

### Manual Testing

```bash
# Run heartbeat immediately
node scripts/heartbeat-mission-control.js

# Check exit code (1 = action needed, 0 = all clear)
echo $?
```

## Output Format

```
════════════════════════════════════════════════════════════
  🎯 MISSION CONTROL HEARTBEAT
════════════════════════════════════════════════════════════

📊 BOARD SUMMARY:
   Tasks Awaiting Review: 2
   Tasks Queued: 1
   Messages Ready to Send: 3
   Critical Alerts: 0

🤖 AGENTS:
   Idle: 2
   Working: 0
   Complete: 1

⚠️  AWAITING YOUR REVIEW:
   [1] Review Q2 pricing strategy
       → Assign to: laura
       → Description: Analyze competitor pricing, develop tiered...

   [2] Analyze competitor landscape
       → Assign to: opus

✅ READY TO RUN:
   [1] Generate Q1 report (assigned to linkedin)

📬 MESSAGES READY TO SEND:
   [1] laura → kelly
       "Q2 positioning analysis for elevated..."
   [2] laura → kelly
       "Q2 Brand Strategy Analysis: Premium..."

💡 RECOMMENDATIONS:
   → Review 2 pending tasks at http://localhost:3001
   → Send 2 messages from Inbox section
   → 2 agents are idle - create new tasks to keep them busy

════════════════════════════════════════════════════════════
```

## Exit Codes

- **0** = All clear (no action needed)
- **1** = Action required (tasks pending, messages ready, alerts, etc.)

## Integration with OpenClaw Heartbeat

This is called automatically as part of OpenClaw's heartbeat mechanism.

**In your sessions:**
- The heartbeat prompt will trigger this check
- Results appear in the chat
- You can act directly in Mission Control dashboard
- Changes sync in real-time via WebSocket

## Configuration

### Change Frequency

Edit `openclaw.json`:

```json
{
  "cron": {
    "tasks": [
      {
        "schedule": "*/15 * * * *",  // Check every 15 minutes
        "id": "mission-control-heartbeat"
      }
    ]
  }
}
```

Common schedules:
- `*/15 * * * *` = Every 15 minutes
- `*/30 * * * *` = Every 30 minutes (default)
- `0 * * * *` = Every hour
- `0 9,17 * * *` = 9 AM & 5 PM only

### Disable/Enable

```json
{
  "cron": {
    "tasks": [
      {
        "id": "mission-control-heartbeat",
        "enabled": false  // Set to true to enable
      }
    ]
  }
}
```

## Workflow

### Example: Daily Task Review

**10:30 AM** — OpenClaw heartbeat runs
```
⚠️  AWAITING YOUR REVIEW:
   [1] Review Q2 pricing strategy
   
💡 → Review 1 pending task at http://localhost:3001
```

You open Mission Control and:
1. Click "Awaiting Review" column
2. See the task card with Approve/Reject buttons
3. Click **Approve** → Task moves to Queued
4. Laura (assigned agent) sees it in her queue
5. She starts working on it immediately

**11:00 AM** — Laura completes pricing review
```
✅ READY TO RUN:
   [1] Review Q2 pricing strategy (assigned to laura)

📬 MESSAGES READY TO SEND:
   [1] laura → kelly
       "Q2 Pricing Analysis complete..."
```

You send the message → Kelly receives strategic analysis

## Benefits

✅ **Automation** — No need to check dashboard constantly  
✅ **Visibility** — Always know what needs action  
✅ **Smart Alerts** — Only important stuff bubbles up  
✅ **Context** — Recommendations guide next steps  
✅ **Real-time** — WebSocket keeps data fresh  

## Troubleshooting

### Heartbeat not running?

Check cron is enabled:
```bash
node scripts/mission-control.js status
```

### Exit code always 0?

Board is clear! Check by visiting:
```
http://localhost:3001
```

### State file missing?

Heartbeat creates one if needed. Just run:
```bash
node scripts/heartbeat-mission-control.js
```

## Next Steps

1. ✅ Heartbeat configured (done)
2. Create your first task in Mission Control
3. Approve/reject to test the workflow
4. Watch heartbeat report on pending work
5. Integrate with additional automation

---

**File Location:** `/Users/timothyryan/.openclaw/workspace/scripts/heartbeat-mission-control.js`

**Configuration:** `/Users/timothyryan/.openclaw/openclaw.json` (`cron.tasks`)

**HEARTBEAT.md:** Updated with Mission Control checks
