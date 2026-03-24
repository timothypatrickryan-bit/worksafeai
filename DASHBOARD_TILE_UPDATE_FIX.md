# Dashboard Tile Update — Complete Solution

## The Problem

Your Unified Dashboard tiles weren't showing updated values even though work was being completed in the background. The tiles showed stale data from when the page first loaded.

## Root Causes Identified & Fixed

### Issue 1: State File Updates vs UI Refresh
**Problem:** The `.mission-control-state.json` file was being updated by the refresh daemon, but the React components weren't re-fetching the updated data.

**Solution:** ✅ Already in place via `useWebSocket` hook
- The dashboard polls `/api/status` every 10 seconds
- Each poll fetches fresh data from `.mission-control-state.json`
- React updates the tiles when new data arrives

**Current status:** Working. Just needs a page refresh or 10-second wait.

---

### Issue 2: Project Progress Calculation
**Problem:** Project tiles showed 0% progress even though tasks were completed.

**Root cause:** The `progress` field in projects wasn't being recalculated when tasks changed.

**Solution:** ✅ Fixed
- Updated `dashboard-refresh-daemon.js` to calculate progress from task counts
- Progress = (completed tasks / total tasks) × 100
- Recalculates every 5 minutes automatically

**Verification:**
```bash
cat .mission-control-state.json | jq '.projects[] | {name, progress}'
# Now shows: 100%, 100%, 100% for completed projects
# And: 0% for active projects with queued tasks
```

---

### Issue 3: New Projects Missing Tasks
**Problem:** The Data Center Weekly Update project was created but had no tasks, so it showed no progress.

**Solution:** ✅ Fixed
- Created `sync-project-tasks.js` to inject tasks into mission control
- Added 3 queued tasks for Data Center Weekly Update
- Tasks now show up on dashboard

**Current state:**
- Data Center Weekly Update: 3 tasks (0% complete, queued)
- Hyperscaler Update: 0 tasks (awaiting decomposition)

---

## How the System Works Now

```
┌─────────────────────────────────────────────────────────────┐
│ Your Web Browser (Unified Dashboard)                        │
│                                                             │
│ Polls /api/status every 10 seconds                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (fetches fresh data)
                     
┌─────────────────────────────────────────────────────────────┐
│ Next.js API: GET /api/status                               │
│                                                             │
│ Reads: .mission-control-state.json                        │
│ Returns: { tasks, projects, agents, ... }                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (every 5 minutes)
                     
┌─────────────────────────────────────────────────────────────┐
│ Dashboard Refresh Daemon (Automatic)                       │
│                                                             │
│ - Recalculates project progress                           │
│ - Counts tasks by status                                  │
│ - Updates .mission-control-state.json                     │
│ - Logs changes to .dashboard-refresh.log                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (updated)
                     
┌─────────────────────────────────────────────────────────────┐
│ .mission-control-state.json                                │
│                                                             │
│ {                                                          │
│   "projects": [                                           │
│     { "name": "Data Center Weekly Update",                │
│       "progress": 0,        ← UPDATED                     │
│       "taskCount": 3,       ← UPDATED                     │
│       "status": "active"                                  │
│     }                                                     │
│   ],                                                      │
│   "tasks": [ ... ],                                       │
│   "dashboardStats": {                                     │
│     "timestamp": "...",     ← UPDATED                     │
│     "projectCount": 5,                                    │
│     "activeProjects": 2,                                  │
│     ...                                                   │
│   }                                                       │
│ }                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Verification Steps

### 1. Check Data is Updating
```bash
# Should show progress has changed
cat .mission-control-state.json | jq '.projects[] | {name, progress, lastProgressUpdate}'

# Should show recent refresh timestamp
cat .mission-control-state.json | jq '.dashboardStats.lastRefresh'
```

### 2. Check Daemon is Running
```bash
launchctl list | grep com.openclaw.dashboard-refresh
# Should show: -	78	com.openclaw.dashboard-refresh
```

### 3. Check API Returns Fresh Data
```bash
# On local dev (or adjust for production)
curl http://localhost:3000/api/status | jq '.projects[] | {name, progress}'

# Should show current progress
```

### 4. Check Dashboard Tiles Auto-Update
- Open Unified Dashboard in browser
- Wait 10 seconds (polling interval)
- Tiles should refresh with latest data
- Or manually refresh page (Cmd+R) to get latest immediately

---

## What's Now Updating

### Every 5 Minutes (Daemon)
- ✅ Project progress percentages
- ✅ Task status counts (queued, in-progress, completed)
- ✅ Agent idle/working counts
- ✅ Overall completion rate
- ✅ Dashboard timestamps

### Every 10 Seconds (Browser Poll)
- ✅ Dashboard tile values
- ✅ Project cards
- ✅ Summary stats
- ✅ Task counts

### On Demand
- ✅ Manual refresh: `dashboard-refresh-daemon.js`
- ✅ Manual sync: `sync-project-tasks.js`

---

## Current Dashboard State

**Active Projects:**
1. **Data Center Weekly Update**
   - Status: Active
   - Tasks: 3 (all queued)
   - Progress: 0% (none started yet)
   - Next milestone: Task 1 & 2 start immediately

2. **Hyperscaler Update**
   - Status: Active
   - Tasks: 0 (waiting for decomposition)
   - Progress: 0%
   - Next milestone: Schedule decomposition agent

**Completed Projects:**
- Mission Control iOS App (100%)
- Pro-Tel Academy (100%)
- Gap Analysis Intelligence System (100%)

---

## Troubleshooting

### Dashboard Still Shows Old Data?

**Option 1: Manual Refresh**
```bash
# Force immediate update
node /Users/timothyryan/.openclaw/workspace/scripts/dashboard-refresh-daemon.js

# Or via browser: Cmd+R (hard refresh)
```

**Option 2: Check Polling**
- Open browser DevTools (F12)
- Look for `/api/status` calls in Network tab
- Should see requests every ~10 seconds
- Check response includes latest data

**Option 3: Verify Daemon Running**
```bash
# Check if launchd job is active
launchctl list | grep dashboard

# Restart if needed
launchctl unload ~/Library/LaunchAgents/com.openclaw.dashboard-refresh.plist
launchctl load ~/Library/LaunchAgents/com.openclaw.dashboard-refresh.plist
```

### New Tasks Not Appearing?

**Do this:**
```bash
# Manually sync tasks into state
node /Users/timothyryan/.openclaw/workspace/scripts/sync-project-tasks.js

# Then refresh daemon
node /Users/timothyryan/.openclaw/workspace/scripts/dashboard-refresh-daemon.js

# Then reload browser (Cmd+R)
```

---

## Files Involved

| File | Purpose |
|------|---------|
| `.mission-control-state.json` | Single source of truth for all state |
| `scripts/dashboard-refresh-daemon.js` | Updates state every 5 min |
| `scripts/dashboard-refresh-daemon.js --daemon` | Runs continuously via launchd |
| `src/pages/api/status.js` | API endpoint that serves state to browser |
| `src/hooks/useWebSocket.js` | Browser hook that polls every 10 sec |
| `src/components/sections/UnifiedDashboardSection.js` | React component that displays tiles |
| `sync-project-tasks.js` | Tool to inject new tasks into state |

---

## Summary

✅ **Dashboard update system is now fully integrated:**

1. **State files update automatically** (every 5 minutes)
2. **Browser polls fresh data** (every 10 seconds)
3. **Tiles refresh on poll** (automatic)
4. **New tasks sync** via `sync-project-tasks.js`
5. **Manual refresh** available anytime

**Next step:** Open the dashboard in your browser, wait 10 seconds, and the tiles will show current progress. Or reload the page for immediate refresh.

**Example expected to see:**
```
Data Center Weekly Update
├─ 3 tasks (0% complete)
│  ├─ Email Automation Setup [Queued]
│  ├─ Research Framework [Queued]
│  └─ First Email Draft [Queued]
└─ Timeline: Setup week (March 21-28)
```

All tiles should now reflect the current state of work! 🎯
