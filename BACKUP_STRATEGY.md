# Backup & Recovery Strategy

## Overview
Three-layer backup system to protect against data loss and application breaking changes.

## Layers

### 1. State File Backups (Every 6 Hours)
**What:** `.mission-control-state.json` (all projects, tasks, briefings)
**Location:** `backups/mission-control-state/`
**Retention:** 30 days
**Script:** `scripts/backup-state.sh`
**Automated:** ✅ Runs every 6 hours via OpenClaw cron

**Why:** This file contains ALL your mission control data. If we corrupt it during development, we need instant recovery.

### 2. Full App Backups (Daily @ 2 AM)
**What:** Complete Mission Control app (`apps/mission-control/`)
**Location:** `backups/mission-control-app/`
**Retention:** 7 days
**Script:** `scripts/backup-app.sh`
**Size:** ~50-100 MB compressed
**Automated:** ✅ Runs daily at 2 AM via OpenClaw cron

**Why:** Before major refactors, rebuilds, or deployments, have a full snapshot.

### 3. Git Repository
**What:** All code changes
**Location:** GitHub (https://github.com/timothypatrickryan-bit/mission-control-dashboard)
**Retention:** Forever
**Manual:** Push changes regularly with clear commit messages

**Why:** Full history, ability to see what changed and when.

## Recovery Procedures

### Scenario 1: Data Corruption (State File)
**Timeline:** 5 seconds

```bash
# List available backups
ls -lh backups/mission-control-state/

# Restore from most recent
./scripts/restore-state.sh state-20260318-205412.json

# Or find by date
./scripts/restore-state.sh 20260318

# Restart Mission Control
pkill -f 'npm start'
cd apps/mission-control && npm start
```

### Scenario 2: Application Breaking (Need Full Rollback)
**Timeline:** 1 minute

```bash
# List app backups
ls -lh backups/mission-control-app/

# Extract specific backup
tar -xzf backups/mission-control-app/mission-control-20260318-020000.tar.gz

# Rebuild and restart
cd apps/mission-control
npm run build
npm start
```

### Scenario 3: Git Revert
```bash
# See commit history
git log --oneline

# Revert to specific commit
git revert <commit-hash>
git push origin main
```

## Testing Recovery

Periodically test recovery to ensure backups are valid:

```bash
# Test state file backup
./scripts/restore-state.sh state-20260318-205412.json
# Verify Mission Control still loads

# Test app backup extraction
tar -tzf backups/mission-control-app/mission-control-*.tar.gz | head -20
# Should show app files without errors
```

## Monitoring

Check backup health:

```bash
# View backup logs
cat backups/mission-control-state/backup.log
cat backups/mission-control-app/backup.log

# Check disk space usage
du -sh backups/

# Verify latest backups exist
ls -lt backups/mission-control-state/ | head -5
```

## Cost-Benefit Analysis

**Time to implement:** 10 minutes ✅ (Already done)
**Time to restore from corruption:** 5 seconds
**Time to restore full app:** 1 minute
**Disk space used:** ~500 MB (30-day state + 7-day apps)

**Prevents:** Hours of debugging and data loss

---

## When to Use

| Situation | Action | Estimated Time |
|-----------|--------|-----------------|
| State file corrupted | Restore state file | 5s |
| App won't start after rebuild | Restore full app | 1m |
| Made breaking changes | Git revert | 2m |
| Want safety net before major work | Run `backup-app.sh` | 30s |
| Routine protection | Let cron handle it | 0m |

---

Last Updated: 2026-03-18 20:54
