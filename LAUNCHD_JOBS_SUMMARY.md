# macOS LaunchD Jobs Summary

**Last Updated:** March 19, 2026 @ 7:51 PM EDT

---

## ✅ Currently Active LaunchD Jobs

### 1. **Autonomy Loop** (NEWLY DEPLOYED TODAY)
- **Job:** `com.openclaw.autonomy-loop`
- **Script:** `scripts/autonomy-heartbeat.js`
- **Frequency:** Every 30 minutes
- **What:** Checks agent status, monitors executing tasks, logs transitions
- **Status:** ✅ RUNNING
- **Log:** `.autonomy-heartbeat.log`

### 2. **Mission Control Heartbeat** (NEWLY DEPLOYED TODAY)
- **Job:** `com.openclaw.heartbeat-mission-control`
- **Script:** `scripts/heartbeat-mission-control.js`
- **Frequency:** Every 60 minutes
- **What:** Processes queued tasks, generates briefings, reports status
- **Status:** ✅ RUNNING
- **Log:** `.heartbeat-mission-control.log`

### 3. **LinkedIn Auto-Post**
- **Job:** `com.timryan.linkedin-posts`
- **Script:** `scripts/linkedin-post-telegram.js`
- **Frequency:** Tue/Thu/Sat @ 9:00 AM EST
- **What:** Auto-generates and posts LinkedIn content
- **Status:** ✅ RUNNING
- **Log:** `/var/tmp/linkedin-posts.log`

### 4. **OpenClaw Gateway**
- **Job:** `ai.openclaw.gateway`
- **Process ID:** 18182
- **What:** OpenClaw daemon service
- **Status:** ✅ RUNNING

---

## ⚠️ Issues Found Today

### LinkedIn Auto-Post Job
**Problem:** Job was defined (`com.openclaw.linkedin-auto-post.plist`) but NOT loaded. Two conflicting LinkedIn jobs existed.

**Solution:** 
- Removed broken plist
- Verified working job (`com.timryan.linkedin-posts`) is running
- LinkedIn automation is active and working correctly

**Current Status:** ✅ FIXED - `com.timryan.linkedin-posts` is running

---

## Verification Commands

```bash
# Check all loaded jobs
launchctl list | grep openclaw

# Check LinkedIn jobs
launchctl list | grep linkedin

# Monitor autonomy loop
tail -f ~/.openclaw/workspace/.autonomy-heartbeat.log

# Monitor heartbeat
tail -f ~/.openclaw/workspace/.heartbeat-mission-control.log

# Monitor LinkedIn
tail -f /var/tmp/linkedin-posts.log
```

---

## Lessons Learned

1. **Jobs can exist as plist files but not be loaded.** The plist files sit dormant until explicitly loaded with `launchctl load`.

2. **Duplicate jobs cause confusion.** Two LinkedIn jobs (different labels) were trying to do similar things, causing confusion about which was running.

3. **Heartbeat jobs are critical infrastructure.** Without them running every 30-60 minutes, autonomy grinds to a halt. This was the root cause of "work stopping" before tonight.

4. **All critical automation should be launchd jobs, not manual scripts.** Anything that needs to run on schedule must have a plist + be loaded.

---

## Going Forward

**New Infrastructure (Always Running):**
- ✅ Autonomy loop (30 min) — Continuous work monitoring
- ✅ Mission Control heartbeat (60 min) — Task processing  
- ✅ LinkedIn auto-post (Tue/Thu/Sat 9 AM) — Content distribution

**Result:** Work flows continuously 24/7. No gaps. No manual intervention needed.

---

**Status: All jobs verified working (March 19, 2026 @ 7:51 PM EDT)**
