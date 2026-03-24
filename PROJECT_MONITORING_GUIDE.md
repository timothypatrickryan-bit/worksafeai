# Project Creation System — Monitoring & Maintenance Guide

**For:** Tim Ryan  
**Date:** March 22, 2026  
**Purpose:** How to monitor and maintain the automated project creation system

---

## 🔍 How to Monitor Projects

### 1. Check Current Project Status (Anytime)

```bash
# See all active projects with progress
jq '.projects[] | select(.status == "active") | {name: .name, progress: .progress, tasks: .taskCount, completed: .completedTaskCount, timeline: .orchestratorPlan.timeline}' ~/.openclaw/workspace/.mission-control-state.json
```

### 2. Check Project Orchestrator Plans

```bash
# See if a project has been decomposed (has orchestratorPlan)
jq '.projects[] | select(.id == "project-id") | .orchestratorPlan' ~/.openclaw/workspace/.mission-control-state.json
```

### 3. View Autonomy Loop Activity

```bash
# See last 50 lines of autonomy activity
tail -50 ~/.openclaw/workspace/.autonomy-log.txt

# Watch autonomy loop in real-time (run every 30 seconds)
while true; do tail -10 ~/.openclaw/workspace/.autonomy-log.txt; sleep 30; done

# Search for project detection
grep "PROJECT DETECTION\|DECOMPOSITION\|PROJECT PROGRESS" ~/.openclaw/workspace/.autonomy-log.txt | tail -20
```

---

## 📊 Dashboard Indicators

### What to Look For

✅ **Green Signals:**
- Projects show 0% (just created, not yet started) → Normal
- Projects show 50% (half tasks done) → Progressing well
- Projects show 100% (all tasks done) → Complete
- Projects detected within 30 min → System working
- No stuck projects → System healthy

❌ **Red Signals:**
- Projects at 0% for >24 hours → Check if decomposition ran
- Projects at same % for >4 hours → System will auto-escalate
- No new projects detected → Check autonomy heartbeat daemon

---

## 🚨 Troubleshooting

### Problem: Project Not Decomposing

**Check 1: Is the autonomy heartbeat running?**
```bash
launchctl list | grep autonomy
# Should show: -    0    com.openclaw.autonomy-loop
```

If not running:
```bash
launchctl load ~/Library/LaunchAgents/com.openclaw.autonomy-loop.plist
```

**Check 2: Does the project have an empty orchestratorPlan?**
```bash
jq '.projects[] | select(.id == "your-project-id") | .orchestratorPlan' ~/.openclaw/workspace/.mission-control-state.json
# Should show empty {} if needs decomposition
```

**Check 3: Did decomposition try to run?**
```bash
grep "DECOMPOSING\|project-id" ~/.openclaw/workspace/.autonomy-log.txt | tail -10
# Should show decomposition attempt
```

**Check 4: Manually trigger decomposition**
```bash
cd ~/.openclaw/workspace
node scripts/project-decomposition-automation.js your-project-id
# Watch for "✅ PROJECT DECOMPOSITION COMPLETE" message
```

### Problem: Projects Detected But Not Decomposing

**Check:** Is project-decomposition-automation.js executable?
```bash
ls -la ~/.openclaw/workspace/scripts/project-decomposition-automation.js
# Should have -rwx (execute permissions)
```

If not:
```bash
chmod +x ~/.openclaw/workspace/scripts/project-decomposition-automation.js
```

### Problem: Progress Not Updating

**Check:** Did project progress monitoring run?
```bash
grep "PROJECT PROGRESS MONITORING" ~/.openclaw/workspace/.autonomy-log.txt | tail -5
# Should show recent timestamps
```

**Check:** Are tasks actually marked complete?
```bash
jq '.tasks[] | select(.projectId == "your-project-id" and .status == "completed") | .title' ~/.openclaw/workspace/.mission-control-state.json
# Should show completed task names
```

---

## 🔧 Manual Interventions

### Manually Decompose a Project

```bash
cd ~/.openclaw/workspace
node scripts/project-decomposition-automation.js project-id-here
```

This will:
1. Generate orchestratorPlan from project description
2. Create tasks automatically
3. Queue tasks for execution
4. Update state file

### Manually Trigger Full Autonomy Heartbeat

```bash
cd ~/.openclaw/workspace
node scripts/autonomy-heartbeat.js
```

This will:
1. Detect new projects
2. Decompose if needed
3. Monitor project progress
4. Check agent completion
5. Track gap remediation

### Manually Reload Autonomy Daemon

```bash
launchctl unload ~/Library/LaunchAgents/com.openclaw.autonomy-loop.plist
launchctl load ~/Library/LaunchAgents/com.openclaw.autonomy-loop.plist
```

### Rollback (If Something Goes Wrong)

```bash
# Restore from backup
cp ~/.openclaw/workspace/.mission-control-state.json.backup-2026-03-22-post-fix ~/.openclaw/workspace/.mission-control-state.json
```

---

## 📈 What to Expect

### Normal Operation

**Project Created:**
```
[10:02 AM] Project created (orchestratorPlan: {})
[10:32 AM] Autonomy heartbeat runs
[10:33 AM] Project detected
[10:34 AM] Decomposition agent spawned
[10:38 AM] Project decomposed (3 phases, 9 tasks)
[10:39 AM] Dashboard updates (0% - 0/9 tasks)
[10:40 AM] Autonomy heartbeat monitors progress
```

**Task Completion:**
```
[2:00 PM] Task 1 marked complete
[2:30 PM] Autonomy heartbeat detects completion
[2:31 PM] Project progress updates (11% - 1/9 tasks)
[2:32 PM] Dashboard reflects new progress
[3:00 PM] Autonomy heartbeat monitors progress again
```

**Project Complete:**
```
[4:00 PM] Last task marked complete
[4:30 PM] Autonomy heartbeat runs
[4:31 PM] Project progress = 100% (9/9 tasks)
[4:32 PM] Project status changes to "completed"
[4:33 PM] Dashboard shows project complete
```

---

## 📋 Monthly Maintenance

### Week 1: Verify System Health
- Check autonomy loop is running
- Verify at least one project has been decomposed
- Confirm dashboard is updating

### Week 2: Review Logs
- Look for any errors in autonomy-log.txt
- Check for stuck projects that were escalated
- Verify decomposition completed successfully

### Week 3: Test Auto-Detection
- Create a test project
- Let system auto-detect and decompose
- Verify full flow works end-to-end

### Week 4: Review & Update
- Check if any improvements needed
- Review documentation
- Plan for next month

---

## 🎯 Success Metrics

**System is healthy if:**

✅ New projects detected within 30 min  
✅ Projects decomposed into full plans  
✅ Tasks auto-queued and briefing-ready  
✅ Progress % calculated correctly  
✅ Dashboard updates show task completion  
✅ Stuck projects detected and escalated  
✅ No errors in autonomy-log.txt  
✅ Agents can see and execute queued tasks  

---

## 📞 When to Escalate

**Contact Lucy if:**
- Project not decomposed after 1 hour
- Progress % stuck at same value for >6 hours
- Errors in autonomy-log.txt
- Tasks not appearing in queue
- Dashboard not updating

**What to provide:**
- Project ID
- Timestamp of issue
- Relevant log entries
- State file snapshot

---

## 🔐 Backups

**Current backup:**
- Location: `.mission-control-state.json.backup-2026-03-22-post-fix`
- Date: March 22, 2026 (post-deployment)
- Use if: Need to rollback the fix

**Create new backup before major changes:**
```bash
cp ~/.openclaw/workspace/.mission-control-state.json ~/.openclaw/workspace/.mission-control-state.json.backup-$(date +%Y-%m-%d)
```

---

## 📚 Related Documentation

- **PROJECT_FIX_DEPLOYMENT_COMPLETE.md** — Deployment details
- **PROJECT_FIX_BEFORE_AFTER.md** — Problem & solution overview
- **PROJECT_CREATION_FIX_PLAN.md** — Technical root cause analysis
- **PROJECT_DETECTION_WORKFLOW.md** — Design documentation

---

**Last Updated:** March 22, 2026  
**Status:** ✅ System Production Ready  
**Next Review:** April 22, 2026
