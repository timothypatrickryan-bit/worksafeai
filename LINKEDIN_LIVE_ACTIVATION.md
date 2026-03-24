# LinkedIn Automation + Brave Search — LIVE ✅

**Activated:** March 24, 2026 @ 7:11 AM EST  
**Status:** 🟢 PRODUCTION LIVE  
**First Auto-Post:** Tuesday, March 26, 2026 @ 9:00 AM EST

---

## What's Now Live

✅ **Brave Search Integration** — Real-time article discovery  
✅ **LinkedIn Automation** — Data-backed post generation  
✅ **macOS launchd** — Scheduled execution (Tue/Thu/Sat @ 9 AM EST)  
✅ **Fallback Protection** — Safe posts if API fails  
✅ **Full Logging** — Complete audit trail  

---

## Deployment Details

### launchd Job Status
```
Job ID: com.openclaw.linkedin-auto-post
Status: ✅ LOADED & ACTIVE
Schedule: Tuesday, Thursday, Saturday @ 9:00 AM EST
Load Command: launchctl load ~/Library/LaunchAgents/com.openclaw.linkedin-auto-post.plist
```

### Configuration
```
Brave API Key: ✅ Configured (BSAHJ3Wmk1IbHNqEsACADrcFLfW5eLc)
Environment File: .env
Node Interpreter: /usr/local/bin/node
Script: scripts/linkedin-auto-post-brave.sh
Log: .linkedin-launchd.log
Error Log: .linkedin-launchd-error.log
```

### Test Results (March 24)
```
✅ Insight Post: "Data Center Trends 2026" (Accenture)
✅ Trending Post: "Navigating the Future of Data Centers" (DataCenterKnowledge)
✅ Sources: Real articles fetched from Brave Search
✅ Post Format: Professional, data-backed, source-attributed
```

---

## How It Works

**Every Tue/Thu/Sat @ 9:00 AM EST:**

1. launchd triggers `linkedin-auto-post-brave.sh`
2. Determines post type (rotates: insight ↔ trending)
3. `linkedin-post-now-brave.js` executes:
   - Queries Brave Search API (real-time articles)
   - Extracts insights & sources
   - Generates LinkedIn post
   - Saves to `.linkedin-current-post.json`
4. Browser relay auto-posts to LinkedIn (if activated)
5. Logs activity to `.linkedin-launchd.log`

**Example workflow:**
- Tuesday 9 AM: Generates Insight post (e.g., "Data Center Infrastructure Trends")
- Thursday 9 AM: Generates Trending post (e.g., "Breaking: 5G Deployment News")
- Saturday 9 AM: Generates Insight post (e.g., "Network Resilience Strategy")

---

## Files & Logs

### Deployment Files
```
scripts/
├── linkedin-post-now-brave.js        ✅ Post generator (Brave Search)
└── linkedin-auto-post-brave.sh       ✅ Automation wrapper (launchd)

Configuration:
├── .env                              ✅ Brave API key (secure)
└── ~/Library/LaunchAgents/
    └── com.openclaw.linkedin-auto-post.plist  ✅ launchd job (ACTIVE)
```

### Monitoring & Logging
```
Active Logs (Tue/Thu/Sat after 9 AM):
├── .linkedin-launchd.log             → Automation events
├── .linkedin-launchd-error.log       → Error tracking (if any)
├── .linkedin-posts.log               → All posts generated
└── .linkedin-posts-published.log     → Published posts only

Output:
└── .linkedin-current-post.json       → Latest post (ready to send)
```

### Documentation
```
Active Guides:
├── LINKEDIN_BRAVE_DEPLOYMENT.md      → Complete deployment guide
├── LINKEDIN_AUTOMATION_BRAVE_INTEGRATION.md  → Technical reference
└── HEARTBEAT.md                      → Updated task schedule
```

---

## Monitoring Commands

### Check if launchd job is active
```bash
launchctl list | grep linkedin
# Output should show: 0 com.openclaw.linkedin-auto-post
```

### View automation events (after first run)
```bash
tail -20 .linkedin-launchd.log
# Shows timestamps of post generations, API calls, etc.
```

### Check for errors
```bash
tail -10 .linkedin-launchd-error.log
# Should be empty (graceful fallback if API fails)
```

### View generated posts
```bash
tail -5 .linkedin-posts.log
# Shows post generation history with timestamps
```

### Check Brave API usage
```bash
grep "Searching Brave" .linkedin-launchd.log | wc -l
# Your usage: ~3 calls/week = ~13/month (free tier: 2,000/month) ✅
```

---

## First Run Checklist

**Tuesday, March 26, 2026 @ 9:00 AM EST** — First automated post will be generated

**To verify it worked:**

1. Check the log file:
   ```bash
   cat .linkedin-launchd.log
   # Should show: [2026-03-26T13:00:00Z] 🚀 LinkedIn Auto-Post Starting...
   ```

2. View the generated post:
   ```bash
   cat .linkedin-current-post.json | jq '.fullPost'
   ```

3. If you want to manually post it:
   - Go to LinkedIn: https://www.linkedin.com/feed/
   - Click "Start a post"
   - Copy from `.linkedin-current-post.json`
   - Paste and post

4. Or activate browser relay for auto-posting:
   - Open LinkedIn in Chrome
   - Click OpenClaw Browser Relay toolbar button
   - Badge turns ON → relay is active
   - Next scheduled post will auto-post

---

## API Cost & Usage

**Brave Search API (Free Tier):**
- Monthly Limit: 2,000 queries
- Your Usage: ~3 posts/week = ~13/month
- Cost: **$0**
- Safe Margin: Using <1% of free tier ✅

---

## Customization

### Change Search Topics
Edit `scripts/linkedin-post-now-brave.js`:
```javascript
SEARCH_CONFIGS = {
  insight: {
    queries: [
      "YOUR_TOPIC_1 trends",
      "YOUR_TOPIC_2 analysis",
      // ... customize these
    ]
  },
  trending: {
    queries: [
      "YOUR_INDUSTRY breaking news",
      // ... customize these
    ]
  }
}
```

### Change Post Template
Edit `generatePostText()` function in `linkedin-post-now-brave.js` to customize wording, emojis, CTAs, etc.

### Change Schedule
Edit `com.openclaw.linkedin-auto-post.plist`:
```xml
<key>StartCalendarInterval</key>
<array>
  <dict>
    <key>Hour</key>
    <integer>14</integer>      <!-- 9 AM EST = 2 PM UTC (change as needed) -->
    <key>Minute</key>
    <integer>0</integer>
    <key>WeekDay</key>
    <integer>2</integer>        <!-- 2=Tuesday, 4=Thursday, 6=Saturday -->
  </dict>
  <!-- Add more dict entries for Thu/Sat -->
</array>
```

Then reload:
```bash
launchctl unload ~/Library/LaunchAgents/com.openclaw.linkedin-auto-post.plist
launchctl load ~/Library/LaunchAgents/com.openclaw.linkedin-auto-post.plist
```

---

## Troubleshooting

### "launchctl list shows PID 0"
- Job didn't run or crashed
- Check: `cat .linkedin-launchd-error.log`
- Verify: `.env` file exists with BRAVE_API_KEY

### "No posts generated on schedule"
```bash
# Test manually
node scripts/linkedin-post-now-brave.js insight

# If it works manually, check launchd logs
cat .linkedin-launchd.log
tail .linkedin-launchd-error.log
```

### "Brave API error: 401"
- API key invalid or expired
- Get new key: https://api.search.brave.com/
- Update `.env` file
- Test: `node scripts/linkedin-post-now-brave.js insight`

### "Script not found" error
- Verify file permissions:
  ```bash
  chmod +x scripts/linkedin-post-now-brave.js
  chmod +x scripts/linkedin-auto-post-brave.sh
  ```

---

## Emergency Commands

### Stop the scheduler
```bash
launchctl unload ~/Library/LaunchAgents/com.openclaw.linkedin-auto-post.plist
```

### Restart the scheduler
```bash
launchctl load ~/Library/LaunchAgents/com.openclaw.linkedin-auto-post.plist
```

### Check if it's loaded
```bash
launchctl list | grep linkedin
# PID 0 = not running, positive number = running
```

### Manual post generation
```bash
cd /Users/timothyryan/.openclaw/workspace
node scripts/linkedin-post-now-brave.js insight  # or: trending
```

---

## Success Metrics

**You'll know it's working when:**
- ✅ Post generates every 3 days (Tue/Thu/Sat)
- ✅ Post includes real sources from Brave Search
- ✅ `.linkedin-launchd.log` shows timestamps
- ✅ `.linkedin-current-post.json` updates with new posts
- ✅ Posts appear on LinkedIn (if browser relay active)

---

## Summary

| Component | Status | Details |
|-----------|--------|---------|
| Brave API Key | ✅ Configured | BSAHJ3Wmk1IbHNqEsACADrcFLfW5eLc |
| Post Generator | ✅ Tested | Generating real posts with sources |
| launchd Job | ✅ Active | Loaded, scheduled for Tue/Thu/Sat @ 9 AM |
| Logging | ✅ Ready | Full audit trail in place |
| Browser Relay | ⏳ Optional | Activate for auto-posting to LinkedIn |
| Documentation | ✅ Complete | All guides updated & live |

---

## Next Steps

1. **Watch first auto-post** — Tuesday, March 26 @ 9 AM EST
2. **Verify logs** — Check `.linkedin-launchd.log` for activity
3. **Activate browser relay** (optional) — For auto-posting to LinkedIn
4. **Monitor usage** — Verify Brave API calls stay under 2,000/month

---

**Deployment Status:** ✅ LIVE & OPERATIONAL  
**Last Updated:** March 24, 2026 @ 7:11 AM EST  
**Deployed by:** Lucy  
**Next Auto-Post:** Tuesday, March 26, 2026 @ 9:00 AM EST
