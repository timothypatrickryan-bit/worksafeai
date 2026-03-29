# Mission Control Backups

**Location:** `/Users/timothyryan/.openclaw/workspace/backups/mission-control/`

This directory contains all backups of the Mission Control system, organized by component type.

## 📁 Directory Structure

```
backups/mission-control/
├── app/              # Full Mission Control application
├── state/            # Mission Control state files (.mission-control-state.json)
├── memory/           # Memory files (daily notes + MEMORY.md)
└── README.md         # This file
```

---

## 📦 Backup Inventory

### `app/` — Full Application Backups

Complete snapshots of the Mission Control app including source code, build artifacts, and dependencies.

| Backup | Date | Size | Status |
|--------|------|------|--------|
| `mission-control-20260319-192838/` | Mar 19, 2026 @ 7:28 PM EDT | 262 MB | ✅ Latest |

**What's Included:**
- Full source code (`src/`)
- Compiled Next.js build (`.next/`)
- All dependencies (`node_modules/`)
- Configuration files (`package.json`, `tsconfig.json`, etc.)
- Public assets (`public/`)

**Use Case:** Complete app restoration if source code is corrupted or lost

---

### `state/` — Mission Control State Snapshots

State files containing all tasks, agents, projects, and system configuration.

| Backup | Date | Size | Status |
|--------|------|------|--------|
| `state-20260319-192838.json` | Mar 19, 2026 @ 7:28 PM EDT | ~50 KB | ✅ Latest |

**What's Included:**
- 43+ tasks with execution history
- 11+ team members & agent configurations
- 2+ active projects
- Inbox items & alerts
- All state snapshots

**Use Case:** Quick state recovery without rebuilding the entire app

---

### `memory/` — Workspace Memory Backups

Complete backups of all memory files including daily notes and long-term memory.

| Backup | Date | Size | Status |
|--------|------|------|--------|
| `memory-20260319-192838/` | Mar 19, 2026 @ 7:28 PM EDT | 140 KB | ✅ Latest |

**What's Included:**
- 17 daily notes (2026-03-07 through 2026-03-19)
- MEMORY.md (long-term memory & context)
- All historical session notes

**Use Case:** Restore memory files if workspace memory is accidentally deleted

---

## 🔄 Backup Schedule

### Current Approach
- **Frequency:** Manual at session end
- **Timing:** When "Let's back up Mission Control now" is requested
- **Retention:** All backups kept (can archive old ones as needed)

### Recommended Future Automation
- Hourly backups of state files
- Daily backups of app and memory
- Weekly cleanup of backups older than 30 days

---

## 💾 How to Use Backups

### Quick State Restore (Minutes)
```bash
cd /Users/timothyryan/.openclaw/workspace
cp backups/mission-control/state/state-20260319-192838.json .mission-control-state.json
```

### Full App Restore (5-10 Minutes)
```bash
cd /Users/timothyryan/.openclaw/workspace

# Backup current app
mv apps/mission-control apps/mission-control-old

# Restore from backup
cp -r backups/mission-control/app/mission-control-20260319-192838 apps/mission-control

# Install & build
cd apps/mission-control
npm install
npm run build
npm start
```

### Memory Restore (Seconds)
```bash
cd /Users/timothyryan/.openclaw/workspace

# Backup current memory
mv memory memory-old

# Restore from backup
cp -r backups/mission-control/memory/memory-20260319-192838 memory
```

### Full System Restore (All Components)
```bash
cd /Users/timothyryan/.openclaw/workspace

# 1. Restore state
cp backups/mission-control/state/state-20260319-192838.json .mission-control-state.json

# 2. Restore memory
rm -rf memory
cp -r backups/mission-control/memory/memory-20260319-192838 memory

# 3. Restore app
rm -rf apps/mission-control
cp -r backups/mission-control/app/mission-control-20260319-192838 apps/mission-control
cd apps/mission-control && npm install && npm run build && npm start
```

---

## 📝 Backup Naming Convention

Backups follow this naming scheme for easy organization:

```
[component]-[YYYYMMDD]-[HHMMSS]/
```

**Examples:**
- `mission-control-20260319-192838/` — App backup on Mar 19 @ 7:28:38 PM
- `state-20260319-192838.json` — State backup on Mar 19 @ 7:28:38 PM
- `memory-20260319-192838/` — Memory backup on Mar 19 @ 7:28:38 PM

**Benefits:**
- Chronological sorting (oldest first when sorted alphabetically)
- Timestamp included for quick identification
- Easy to find specific dates
- Scales well with multiple backups

---

## 📊 Backup Size Reference

| Component | Size | Notes |
|-----------|------|-------|
| App (262 MB) | ~262 MB | Includes node_modules (largest part) |
| State | ~50 KB | Compact JSON, can compress further |
| Memory | ~140 KB | All historical notes, efficient |
| **Total** | **~262 MB** | App dominates; state & memory negligible |

**Optimization Tip:** Can exclude `node_modules/` from app backups to reduce size to ~50 MB. Rebuild with `npm install && npm run build` on restore.

---

## 🔐 Backup Security

### What's Backed Up
- ✅ Source code (safe to backup)
- ✅ Configuration files (safe)
- ✅ Build artifacts (regenerable)
- ✅ Mission state (no secrets)
- ✅ Memory files (no sensitive data)

### What's NOT Backed Up
- ❌ `.env` files (not in backups, keep separately)
- ❌ API keys (use Vercel secrets, not local)
- ❌ Passwords (use password manager, not files)
- ❌ node_modules (regenerable, reduce backup size)

---

## 📈 Adding New Backups

When creating a new backup, follow these steps:

```bash
# Set timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Backup app
cp -r apps/mission-control backups/mission-control/app/mission-control-$TIMESTAMP

# Backup state
cp .mission-control-state.json backups/mission-control/state/state-$TIMESTAMP.json

# Backup memory
cp -r memory backups/mission-control/memory/memory-$TIMESTAMP

# Commit to git
git add backups/mission-control/
git commit -m "Backup: Mission Control session ($TIMESTAMP)"
```

Or use the quick command:
```bash
# (From workspace root)
TIMESTAMP=$(date +%Y%m%d-%H%M%S) && \
  cp -r apps/mission-control backups/mission-control/app/mission-control-$TIMESTAMP && \
  cp .mission-control-state.json backups/mission-control/state/state-$TIMESTAMP.json && \
  cp -r memory backups/mission-control/memory/memory-$TIMESTAMP && \
  echo "✅ Backup created: $TIMESTAMP"
```

---

## 🗑️ Cleanup (Optional)

To remove old backups and reclaim space:

```bash
# Keep only the 5 most recent app backups
ls -t backups/mission-control/app/ | tail -n +6 | xargs rm -rf

# Keep only the 10 most recent state backups
ls -t backups/mission-control/state/ | tail -n +11 | xargs rm -rf

# Keep only the 5 most recent memory backups
ls -t backups/mission-control/memory/ | tail -n +6 | xargs rm -rf
```

---

## ✅ Verification

To verify a backup is complete:

```bash
# Check app backup
ls -la backups/mission-control/app/mission-control-20260319-192838/src/
ls -la backups/mission-control/app/mission-control-20260319-192838/.next/

# Check state backup
file backups/mission-control/state/state-20260319-192838.json
wc -l backups/mission-control/state/state-20260319-192838.json

# Check memory backup
ls -la backups/mission-control/memory/memory-20260319-192838/
wc -l backups/mission-control/memory/memory-20260319-192838/*.md
```

---

## 📚 Related Documentation

- **BACKUP_SUMMARY_2026-03-19.md** — Session backup summary
- **SESSION_COMPLETE_2026-03-19.md** — Session completion report
- **.mission-control-state.json** — Current running state (workspace root)
- **MEMORY.md** — Long-term memory (workspace root)

---

## 🎯 Quick Reference

| Need | Command | Location |
|------|---------|----------|
| Restore state | `cp backups/mission-control/state/state-*.json .mission-control-state.json` | workspace root |
| Restore app | `cp -r backups/mission-control/app/mission-control-* apps/mission-control` | workspace root |
| Restore memory | `cp -r backups/mission-control/memory/memory-* memory` | workspace root |
| List all backups | `ls -lh backups/mission-control/*/*/` | workspace root |
| Latest backups | `ls -lh backups/mission-control/*/` \| sort -k6,7r | workspace root |
| Backup size | `du -sh backups/mission-control/` | workspace root |

---

**Last Updated:** March 19, 2026 @ 7:32 PM EDT  
**Latest Backup:** mission-control-20260319-192838  
**Status:** ✅ Organized & Ready

---

For questions or updates to this guide, see **SESSION_COMPLETE_2026-03-19.md**
