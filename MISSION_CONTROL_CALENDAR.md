# Mission Control Calendar & Cron Jobs View

**Status:** ✅ Production Ready  
**Last Updated:** March 15, 2026 @ 1:05 PM EST  
**Location:** http://localhost:3001 → Calendar (📅)

---

## Overview

The **Calendar & Cron Jobs** view provides a comprehensive visualization of all scheduled tasks and automation jobs.

It answers:
- **When is the next heartbeat check?**
- **When does LinkedIn auto-post?**
- **What's the cron pattern for each job?**
- **How many times does each job run per week?**

---

## Features

### 1. **Weekly Calendar**

**Visual Overview:**
- 7-day calendar of current week
- Current day highlighted in blue
- LinkedIn posting days highlighted in purple (Tue, Thu, Sat)
- Shows "9 AM" time slot for LinkedIn posts
- Easy at-a-glance scheduling

**What You See:**
```
Sun     Mon     Tue     Wed     Thu     Fri     Sat
15      16      17      18      19      20      21
                📱 9 AM         📱 9 AM         📱 9 AM
                Post           Post           Post
```

---

### 2. **Next 7 Days Timeline**

**Upcoming Jobs Sorted by Time:**

Each job card shows:
- **Icon & Name** — Easy identification
- **Description** — What the job does
- **Next Run Time** — Exact date & time (e.g., "Mar 15, 01:30 PM")
- **Time Until** — Human-readable countdown (e.g., "in 26m", "in 1d 19h")
- **Pattern** — Cron schedule description

**Example:**
```
💓 Mission Control Heartbeat
Check task board & agent status
Mar 15, 01:30 PM  |  in 26m
Pattern: Every 30 minutes
```

---

### 3. **Cron Configuration Reference**

**Shows All Active Jobs:**
```
0 9 * * 2,4,6   — LinkedIn (Tue/Thu/Sat @ 9 AM)
*/30 * * * *     — Heartbeat (every 30 min)
```

**Color-Coded by Job Type:**
- Purple: LinkedIn Auto-Post
- Blue: Mission Control Heartbeat

**Direct Reference:**
- Copy-paste cron patterns
- Understand exact scheduling
- Edit in `openclaw.json` if needed

---

### 4. **Schedule Statistics**

**Key Metrics:**

| Stat | Value | Meaning |
|------|-------|---------|
| Active Jobs | 2 | Running cron jobs |
| Heartbeats/week | 48 | ~48 checks for pending work |
| LinkedIn Posts/week | 3 | Tue, Thu, Sat @ 9 AM |

**At a Glance:**
- System runs ~50 scheduled tasks per week
- Consistent automated monitoring (every 30 min)
- Regular content posting (3x/week)

---

## Cron Job Details

### **Mission Control Heartbeat**

| Property | Value |
|----------|-------|
| **Pattern** | `*/30 * * * *` |
| **Frequency** | Every 30 minutes |
| **What it does** | Check task board, monitor agents, flag pending work |
| **Run time** | ~2 seconds |
| **Config file** | `openclaw.json` (`cron.tasks[0]`) |
| **Log file** | None (stdout to console) |
| **Failure handling** | Continues on next cycle |

**Schedule Examples:**
- 12:00 PM → 12:30 PM → 1:00 PM → 1:30 PM → etc.
- Runs 48 times per week (24/7)

---

### **LinkedIn Auto-Post**

| Property | Value |
|----------|-------|
| **Pattern** | `0 9 * * 2,4,6` |
| **Frequency** | Tuesday, Thursday, Saturday @ 9:00 AM EST |
| **What it does** | Generate & post content to LinkedIn |
| **Run time** | ~5-10 seconds (post generation + posting) |
| **Config file** | macOS launchd plist (also in `openclaw.json`) |
| **Log file** | `.linkedin-posts.log` |
| **Failure handling** | Logged, can be retried manually |

**Schedule Examples:**
- Tue 9:00 AM → Thu 9:00 AM → Sat 9:00 AM → (next Tue) → etc.
- Runs 3 times per week (during EST business hours)

---

## How to Read Cron Patterns

### Pattern Format
```
*    *    *    *    *
│    │    │    │    │
│    │    │    │    └─ Day of Week (0-6, 0=Sunday)
│    │    │    └────── Month (1-12)
│    │    └─────────── Day of Month (1-31)
│    └──────────────── Hour (0-23)
└───────────────────── Minute (0-59)
```

### Examples in Mission Control

**LinkedIn: `0 9 * * 2,4,6`**
- `0` = At minute 0
- `9` = At hour 9 (9 AM)
- `*` = Every day of month
- `*` = Every month
- `2,4,6` = On Tuesday (2), Thursday (4), Saturday (6)

**Heartbeat: `*/30 * * * *`**
- `*/30` = Every 30 minutes
- `*` = Every hour
- `*` = Every day of month
- `*` = Every month
- `*` = Every day of week

---

## Real-Time Updates

**WebSocket Connected:**
✅ Calendar updates in real-time as jobs complete or are scheduled
✅ Timer countdown updates every second
✅ New jobs appear immediately after creation
✅ Completed jobs marked in activity feed

**No Manual Refresh Needed:**
- "Next Run" times auto-calculate
- "Time Until" countdown updates live
- Changes sync across all dashboard sections

---

## Managing Cron Jobs

### Add a New Job

Edit `openclaw.json`:
```json
{
  "cron": {
    "tasks": [
      {
        "id": "my-new-job",
        "schedule": "0 18 * * *",  // 6 PM daily
        "description": "My custom job",
        "command": "node scripts/my-job.js",
        "enabled": true
      }
    ]
  }
}
```

**Then restart OpenClaw** for the job to appear in Calendar.

### Disable a Job

Set `"enabled": false`:
```json
{
  "id": "linkedin-auto-post",
  "enabled": false
}
```

Job will be shown as "Disabled" in Calendar.

### Change Frequency

Edit the `schedule` field:
```json
{
  "schedule": "*/15 * * * *"  // Change from every 30 min to every 15 min
}
```

---

## Common Cron Patterns

| Pattern | Description |
|---------|-------------|
| `*/30 * * * *` | Every 30 minutes |
| `*/15 * * * *` | Every 15 minutes |
| `0 * * * *` | Every hour |
| `0 9 * * *` | Daily @ 9 AM |
| `0 9 * * 1-5` | Weekdays @ 9 AM |
| `0 9 * * 0,6` | Weekends @ 9 AM |
| `0 0 * * *` | Daily @ midnight |
| `0 9 * * 2,4,6` | Tue/Thu/Sat @ 9 AM |
| `0 9,17 * * *` | @ 9 AM & 5 PM daily |

---

## Monitoring & Logging

### Check Heartbeat Logs
```bash
node scripts/heartbeat-mission-control.js
```

### Check LinkedIn Logs
```bash
tail -20 .linkedin-posts.log
tail -20 .linkedin-posts-published.log
```

### Verify LaunchD Status (LinkedIn)
```bash
launchctl list | grep linkedin
```

### View OpenClaw Cron Config
```bash
cat openclaw.json | jq '.cron'
```

---

## Timezone Handling

**Mission Control Dashboard:**
- Displays times in your system timezone
- Calculated from UTC timestamps
- Auto-updates when system timezone changes

**Cron Patterns:**
- Use **24-hour format** (0-23)
- Times are in **server timezone** (UTC for most deployments)
- LinkedIn jobs: Converted to **EST** in cron pattern

**Example:**
- Cron pattern: `0 9 * * 2,4,6` = 9 AM UTC
- Dashboard shows: 9 AM EST (adjusted for your timezone)

---

## Troubleshooting

### Job not appearing in Calendar?

1. Check `openclaw.json` for typos
2. Verify `"enabled": true`
3. Restart OpenClaw: `openclaw gateway restart`
4. Refresh dashboard (F5)

### "Next Run" time seems wrong?

1. Verify system time: `date`
2. Check timezone: `date +%Z`
3. Verify cron pattern in `openclaw.json`

### Job keeps failing?

1. Check logs: `node scripts/heartbeat-mission-control.js`
2. Manual test: Run command directly
3. Fix any errors
4. Re-enable in config

### LaunchD job not running (LinkedIn)?

1. Verify plist installed: `launchctl list | grep linkedin`
2. Verify plist syntax: `plutil -lint ~/Library/LaunchAgents/com.openclaw.linkedin-auto-post.plist`
3. Load if needed: `launchctl load ~/Library/LaunchAgents/com.openclaw.linkedin-auto-post.plist`
4. Check system cron (built-in macOS app): System Preferences → Time Machine

---

## Tips & Best Practices

1. **Check Calendar Before Creating New Jobs**
   - Avoid scheduling conflicts
   - Stagger heavy workloads

2. **Use Relative Times**
   - Dashboard shows "in 26m" not just time
   - Easy to see urgency

3. **Review Weekly Schedule**
   - Click Calendar on Sunday
   - Plan ahead for week

4. **Monitor Heartbeat Regularly**
   - Most frequent job (every 30 min)
   - First sign of system health

5. **Test New Jobs**
   - Run manually first: `node scripts/my-job.js`
   - Add to cron after verification
   - Verify in Calendar view

---

## File Structure

```
openclaw.json
├── cron
│   └── tasks[]
│       ├── id: "mission-control-heartbeat"
│       ├── schedule: "*/30 * * * *"
│       ├── description: "..."
│       ├── command: "..."
│       └── enabled: true

~/Library/LaunchAgents/
└── com.openclaw.linkedin-auto-post.plist  (macOS scheduler)
```

---

## Integration Points

**Calendar connects to:**
- ✅ OpenClaw cron configuration (`openclaw.json`)
- ✅ macOS LaunchAgent (LinkedIn automation)
- ✅ Mission Control state (upcoming jobs)
- ✅ Activity feed (completed jobs)
- ✅ WebSocket (real-time updates)

**Data flow:**
1. Calendar reads `openclaw.json` cron.tasks
2. Calculates next run time for each job
3. Updates countdown timer every second
4. Shows in real-time via WebSocket
5. Activity feed logs when jobs complete

---

## Next Steps

1. ✅ View current schedule (Calendar section)
2. ✅ Monitor next heartbeat countdown
3. ✅ Plan LinkedIn posting strategy (3x/week)
4. ✅ Add custom cron jobs as needed
5. ✅ Review execution logs weekly

---

**Calendar View is fully integrated with Mission Control!**

**Dashboard Sections Now:**
- Tasks → Activity → **Calendar** → Agents → Projects → Inbox → Alerts → Contacts

**All running with real-time WebSocket updates** 🚀
