# Mission Control Backup — Quick Reference Card

**Location:** `/Users/timothyryan/.openclaw/workspace/backups/mission-control/`

---

## 📁 Structure at a Glance

```
backups/mission-control/
├── app/              ← Full application backups (262 MB each)
├── state/            ← Mission state snapshots (~50 KB each)
├── memory/           ← Memory file backups (~140 KB each)
└── README.md         ← Full documentation
```

---

## ⚡ One-Liners

### View All Backups
```bash
ls -lh backups/mission-control/*/
```

### Get Latest Backup Dates
```bash
ls -t backups/mission-control/*/ | head -3
```

### Restore State Only (30 seconds)
```bash
cp backups/mission-control/state/state-20260319-192838.json .mission-control-state.json
```

### Full System Restore (5 minutes)
```bash
cp -r backups/mission-control/app/mission-control-20260319-192838 apps/mission-control && \
cp backups/mission-control/state/state-20260319-192838.json .mission-control-state.json && \
cp -r backups/mission-control/memory/memory-20260319-192838 memory && \
cd apps/mission-control && npm install && npm run build && npm start
```

### Check Backup Sizes
```bash
du -sh backups/mission-control/*
```

---

## 🎯 When to Use Each Backup Type

| Issue | Restore | Time |
|-------|---------|------|
| Wrong state/tasks | `state/state-*.json` | 30s |
| Lost memory notes | `memory/memory-*` | 1m |
| App code corrupted | `app/mission-control-*` | 5m |
| Everything broken | All three | 10m |

---

## 📅 Latest Backups

**As of:** March 19, 2026 @ 7:32 PM EDT

- **App:** `mission-control-20260319-192838/` (262 MB)
- **State:** `state-20260319-192838.json` (~50 KB)
- **Memory:** `memory-20260319-192838/` (140 KB)

---

## 🔄 Create New Backup

```bash
TIMESTAMP=$(date +%Y%m%d-%H%M%S) && \
cp -r apps/mission-control backups/mission-control/app/mission-control-$TIMESTAMP && \
cp .mission-control-state.json backups/mission-control/state/state-$TIMESTAMP.json && \
cp -r memory backups/mission-control/memory/memory-$TIMESTAMP && \
git add backups/mission-control/ && \
git commit -m "Backup: Mission Control $TIMESTAMP" && \
echo "✅ Backup created: $TIMESTAMP"
```

---

## 🧹 Cleanup Old Backups

```bash
# Keep 5 most recent of each
ls -t backups/mission-control/app/ | tail -n +6 | xargs rm -rf
ls -t backups/mission-control/state/ | tail -n +11 | xargs rm -rf
ls -t backups/mission-control/memory/ | tail -n +6 | xargs rm -rf
```

---

## ✅ Verify Backup Integrity

```bash
# App backup
test -d backups/mission-control/app/mission-control-20260319-192838/src && \
test -d backups/mission-control/app/mission-control-20260319-192838/.next && \
echo "✅ App backup complete"

# State backup
test -f backups/mission-control/state/state-20260319-192838.json && \
echo "✅ State backup complete"

# Memory backup
test -d backups/mission-control/memory/memory-20260319-192838 && \
echo "✅ Memory backup complete"
```

---

## 📊 Backup Stats

| Type | Count | Size |
|------|-------|------|
| App backups | 1 | 262 MB |
| State backups | 1 | 50 KB |
| Memory backups | 1 | 140 KB |
| **Total** | **3** | **262 MB** |

---

## 🎓 Naming Format

```
[component]-[YYYYMMDD]-[HHMMSS]/
       ↓        ↓         ↓
   Type      Date      Time
```

Example: `mission-control-20260319-192838/`
- Component: mission-control
- Date: March 19, 2026
- Time: 7:28:38 PM EDT

---

## 📚 Full Documentation

For complete backup guide including security, recovery steps, and automation setup, see:
- `backups/mission-control/README.md` — Complete guide
- `BACKUP_SUMMARY_2026-03-19.md` — Session backup details
- `SESSION_COMPLETE_2026-03-19.md` — Session summary

---

## 🚀 Pro Tips

1. **Before Major Changes:** Create a backup
2. **Before Git Commits:** Backup to be safe
3. **Weekly Cleanup:** Remove backups older than 30 days
4. **Automated:** Can add to cron for hourly state backups
5. **Test Restores:** Occasionally verify backups work

---

**Last Updated:** March 19, 2026 @ 7:32 PM EDT  
**Keep This Handy:** Reference this card for quick backup operations!
