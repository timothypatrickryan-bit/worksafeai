# LinkedIn Automation - FINAL SETUP (March 15, 2026)

## ✅ Status: READY TO DEPLOY

All scripts created, tested, and working. Following steps will fully automate LinkedIn posting.

## Installation (5 minutes)

### Step 1: Set Up Automated Scheduling
Choose ONE of these options:

#### Option A: Use macOS launchd (Recommended)
Already created at: `~/Library/LaunchAgents/com.openclaw.linkedin-auto-post.plist`

To activate:
```bash
# Unload if previously loaded
launchctl unload ~/Library/LaunchAgents/com.openclaw.linkedin-auto-post.plist 2>/dev/null || true

# Load the job
launchctl load ~/Library/LaunchAgents/com.openclaw.linkedin-auto-post.plist

# Verify it's loaded
launchctl list | grep linkedin-auto-post
```

#### Option B: Use Traditional cron
```bash
# Open cron editor
crontab -e

# Add these three lines:
0 9 * * 2 /Users/timothyryan/.openclaw/workspace/scripts/linkedin-auto-post.sh >> /Users/timothyryan/.openclaw/workspace/.linkedin-cron.log 2>&1
0 9 * * 4 /Users/timothyryan/.openclaw/workspace/scripts/linkedin-auto-post.sh >> /Users/timothyryan/.openclaw/workspace/.linkedin-cron.log 2>&1
0 9 * * 6 /Users/timothyryan/.openclaw/workspace/scripts/linkedin-auto-post.sh >> /Users/timothyryan/.openclaw/workspace/.linkedin-cron.log 2>&1

# Save and exit (:wq)
```

### Step 2: Test the Automation
```bash
# Test post generation (any type)
node /Users/timothyryan/.openclaw/workspace/scripts/linkedin-post-now.js insight

# Test automation script
/Users/timothyryan/.openclaw/workspace/scripts/linkedin-auto-post.sh
```

Expected output: ✅ Post generated and ready

### Step 3: Browser Relay Setup (For Auto-Posting)
To automate posting to LinkedIn without manual intervention:

1. **Open LinkedIn** in Chrome: https://www.linkedin.com
2. **Click OpenClaw Browser Relay toolbar button** (badge should turn ON)
3. Tab is now connected for relay automation

When cron job runs, it will attempt to post automatically via your authenticated session.

## How It Works (Automated)

### Tue/Thu/Sat @ 9:00 AM EST
1. **launchd/cron** triggers script
2. **Post generates** with alternating topics (Insight → Trending → Insight)
3. **Browser posts** automatically (if relay active)
4. **Logging** records all activity

### What's Logged
- `.linkedin-posts.log` — All posting attempts
- `.linkedin-pending-post.json` — Current pending post
- `.linkedin-cron.log` — Cron job output (if using cron)
- `.linkedin-launchd.log` — launchd output (if using launchd)
- `.linkedin-launchd-error.log` — Any errors

## Manual Operations (Any Time)

### Generate a Post Today
```bash
# Create an insight post
node /Users/timothyryan/.openclaw/workspace/scripts/linkedin-post-now.js insight

# Create a trending topic post
node /Users/timothyryan/.openclaw/workspace/scripts/linkedin-post-now.js trending

# View the generated post
cat /Users/timothyryan/.openclaw/workspace/.linkedin-current-post.json | jq '.fullPost'
```

### Manually Post to LinkedIn
```bash
# If cron generated a post but you want to post manually:
# 1. Copy the content
jq -r '.fullPost' .linkedin-current-post.json

# 2. Go to LinkedIn: https://www.linkedin.com
# 3. Click "Start a post"
# 4. Paste the content
# 5. Click "Post"
```

## Monitoring

### Check If Scheduled
```bash
# For launchd
launchctl list | grep linkedin

# For cron
crontab -l | grep linkedin
```

### View Posting History
```bash
# All posts
cat .linkedin-posts.log

# Just published
cat .linkedin-posts-published.log

# Last 5 posts
tail -5 .linkedin-posts.log
```

### Check Next Scheduled Run
```bash
# launchd shows all scheduled jobs
launchctl list | grep linkedin

# Next Tuesday @ 9 AM will auto-run
```

## Troubleshooting

### Scheduler Not Running
**Symptom:** No entries in `.linkedin-posts.log` on scheduled day

```bash
# For launchd, check error log
cat .linkedin-launchd-error.log

# For cron, check system logs
log stream --predicate 'eventMessage contains[c] "linkedin"' --level debug
```

### Scripts Not Executable
```bash
# Fix permissions
chmod +x /Users/timothyryan/.openclaw/workspace/scripts/linkedin-*.sh
chmod +x /Users/timothyryan/.openclaw/workspace/scripts/linkedin-post-now.js
chmod +x /Users/timothyryan/.openclaw/workspace/scripts/linkedin-browser-post-automation.js
```

### Post Content Is Blank
```bash
# Check if post file exists
test -f .linkedin-current-post.json && echo "✅ File exists" || echo "❌ Missing"

# View content
cat .linkedin-current-post.json
```

## Files Created

```
scripts/
├── linkedin-post-now.js                    ✅ Generate posts any time
├── linkedin-auto-post.sh                   ✅ Scheduled job (launchd/cron)
└── linkedin-browser-post-automation.js     ✅ Browser posting helper

~/Library/LaunchAgents/
└── com.openclaw.linkedin-auto-post.plist   ✅ macOS scheduler config

Logs/
├── .linkedin-posts.log                     → All posting history
├── .linkedin-pending-post.json             → Current pending post
├── .linkedin-posts-published.log           → Published posts only
├── .linkedin-cron.log                      → Cron output (if using cron)
├── .linkedin-launchd.log                   → launchd output
└── .linkedin-launchd-error.log             → launchd errors
```

## Quick Reference

### Manual Post Now
```bash
node scripts/linkedin-post-now.js insight  # Generate
```

### View Pending Post
```bash
cat .linkedin-current-post.json | jq '.fullPost'
```

### Check Scheduler Status
```bash
launchctl list | grep linkedin  # launchd
crontab -l | grep linkedin       # cron
```

### View Posting Log
```bash
tail -10 .linkedin-posts.log
```

## Next Tuesday (March 18, 9:00 AM EST)

If set up correctly:
1. ✅ Job runs automatically
2. ✅ Post generates
3. ✅ Browser posts (if relay active)
4. ✅ Log entry created
5. ✅ Post appears on LinkedIn (if relay active)

**Check the logs that day:**
```bash
cat .linkedin-posts.log
cat .linkedin-posts-published.log
```

---

## Setup Summary

✅ **Scripts**: All 3 created and tested  
✅ **Scheduling**: launchd plist created (or use cron)  
✅ **Testing**: Post generation verified working  
✅ **Browser Relay**: Ready when you open LinkedIn + activate relay  

**Time to Automate**: < 5 minutes  
**Maintenance**: None (runs automatically Tue/Thu/Sat @ 9 AM)

---

**Last Updated**: March 15, 2026, 10:00 AM EST  
**Status**: Ready for production deployment
