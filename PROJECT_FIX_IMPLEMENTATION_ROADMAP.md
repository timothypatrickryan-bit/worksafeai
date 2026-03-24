# Project Creation Fix — Implementation Roadmap

**Status:** Ready to start  
**Timeline:** 1 hour total (code → test → deploy)  
**Owner:** Lucy (I can implement this immediately)

---

## Phase 1: Code Changes (20 min)

### 1.1 Update autonomy-heartbeat.js
- Add `detectNewProjects()` function (~40 lines)
- Add `monitorProjectProgress()` function (~60 lines)
- Integrate both into main() flow
- No breaking changes to existing logic

### 1.2 Create project-decomposition-automation.js
- New standalone script (~200 lines)
- Accepts project ID as argument
- Generates full orchestratorPlan
- Creates and queues tasks
- Sends Tim a briefing

### 1.3 Update HEARTBEAT.md documentation
- Add project detection to autonomy loop section
- Reference new automation script
- Document monitoring process

---

## Phase 2: Testing (25 min)

### 2.1 Test decomposition on stuck projects
```bash
node scripts/project-decomposition-automation.js project-1774041827180
# Should populate DCWU orchestratorPlan
# Should create Scout/Steven/Lucy tasks
# Should update project progress
```

### 2.2 Test project monitoring
- Manually mark tasks complete
- Run autonomy heartbeat
- Verify progress % updates
- Check dashboard reflects changes

### 2.3 Test stuck project detection
- Create fake old project
- Run autonomy heartbeat
- Verify escalation alert logged

### 2.4 Test with new project
- Create test project in state file
- Run autonomy heartbeat
- Verify auto-decomposition triggers
- Verify tasks queued within 30 min

---

## Phase 3: Deployment (15 min)

### 3.1 Backup current state
```bash
cp .mission-control-state.json .mission-control-state.json.backup-2026-03-22
```

### 3.2 Deploy code
- Replace autonomy-heartbeat.js
- Create project-decomposition-automation.js
- Update HEARTBEAT.md

### 3.3 Reload daemon
```bash
launchctl unload ~/Library/LaunchAgents/com.openclaw.autonomy-loop.plist
launchctl load ~/Library/LaunchAgents/com.openclaw.autonomy-loop.plist
```

### 3.4 Monitor for 1 hour
```bash
tail -f .autonomy-log.txt
# Watch for project detections, decompositions, task queueing
```

---

## Phase 4: Verification (post-deployment)

### 4.1 Verify DCWU and Hyperscaler projects
- Check orchestratorPlan populated
- Check tasks are queued
- Check progress % displays correctly

### 4.2 Monitor next 24 hours
- Watch for new project creation
- Verify auto-decomposition triggers
- Verify task queue-to-execution flow

### 4.3 Document lessons learned
- What worked, what didn't
- Edge cases discovered
- Future improvements

---

## Rollback Plan (if needed)

```bash
# Restore from backup
cp .mission-control-state.json.backup-2026-03-22 .mission-control-state.json

# Reload heartbeat with old code
launchctl unload ~/Library/LaunchAgents/com.openclaw.autonomy-loop.plist
launchctl load ~/Library/LaunchAgents/com.openclaw.autonomy-loop.plist

# Verify old behavior restored
```

---

## Success Indicators (Post-Deployment)

✅ DCWU project shows:
- orchestratorPlan with 3+ phases
- 6+ tasks (Scout → Steven → Lucy + weekly updates)
- Progress % calculated correctly
- Dashboard displays 0→20%→40% etc. as work progresses

✅ Hyperscaler project shows:
- Full orchestratorPlan generated
- Tasks queued (briefing-ready)
- Progress tracking enabled

✅ Next project creation:
- Auto-detected by autonomy loop
- Decomposed within 30 minutes
- Tasks queued without manual intervention
- Dashboard shows project immediately

✅ System stability:
- No errors in autonomy logs
- State file consistent
- No duplicate task creation
- Task briefings generate cleanly

---

## Ready to Begin?

Once you approve, I will:

1. ✅ Write the code (20 min)
2. ✅ Test thoroughly (25 min)
3. ✅ Deploy to production (15 min)
4. ✅ Monitor and verify (ongoing)

**Next action:** Confirm you want me to proceed with implementation
