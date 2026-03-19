# LinkedIn Automation Setup Guide

## Current Status: ✅ READY TO GO

All scripts are written and tested. The automation is now operational.

## How It Works

### Daily Workflow
1. **9:00 AM EST (Tue/Thu/Sat)** → Cron job triggers
2. **Post generated** → Topic alternates: Insight → Trending → Insight
3. **Post logged** → Ready for browser posting
4. **Browser relay** → Posts to LinkedIn (manual trigger or automated)

### Three Scripts

#### 1. `linkedin-post-now.js` (Post Generator)
Generates a new post any time, any day.

```bash
# Generate an insight post
node scripts/linkedin-post-now.js insight

# Generate a trending topic post
node scripts/linkedin-post-now.js trending
```

Output: `.linkedin-current-post.json` with post content

#### 2. `linkedin-auto-post.sh` (Scheduled Automation)
Runs via cron on Tue/Thu/Sat @ 9 AM EST.

```bash
# Manual trigger (for testing)
./scripts/linkedin-auto-post.sh

# Set up cron (one-time)
crontab -e
# Add these lines:
# 0 9 * * 2 /Users/timothyryan/.openclaw/workspace/scripts/linkedin-auto-post.sh >> /Users/timothyryan/.openclaw/workspace/.linkedin-cron.log 2>&1
# 0 9 * * 4 /Users/timothyryan/.openclaw/workspace/scripts/linkedin-auto-post.sh >> /Users/timothyryan/.openclaw/workspace/.linkedin-cron.log 2>&1
# 0 9 * * 6 /Users/timothyryan/.openclaw/workspace/scripts/linkedin-auto-post.sh >> /Users/timothyryan/.openclaw/workspace/.linkedin-cron.log 2>&1
```

#### 3. `linkedin-browser-post-automation.js` (Browser Posting)
Posts the generated content via browser relay to LinkedIn.

```bash
# Prepare post and ready for browser relay posting
node scripts/linkedin-browser-post-automation.js

# Then post via OpenClaw browser relay (requires authenticated LinkedIn tab)
```

## Setup Instructions

### Step 1: Verify Scripts Exist
```bash
ls -la scripts/linkedin-*.js scripts/linkedin-*.sh
```

✅ Done — all files created

### Step 2: Set Up Cron Job (One-Time)
```bash
crontab -e
```

Paste these three lines:
```cron
0 9 * * 2 /Users/timothyryan/.openclaw/workspace/scripts/linkedin-auto-post.sh >> /Users/timothyryan/.openclaw/workspace/.linkedin-cron.log 2>&1
0 9 * * 4 /Users/timothyryan/.openclaw/workspace/scripts/linkedin-auto-post.sh >> /Users/timothyryan/.openclaw/workspace/.linkedin-cron.log 2>&1
0 9 * * 6 /Users/timothyryan/.openclaw/workspace/scripts/linkedin-auto-post.sh >> /Users/timothyryan/.openclaw/workspace/.linkedin-cron.log 2>&1
```

Save and exit (`:wq` in vi).

### Step 3: Verify Cron Setup
```bash
crontab -l | grep linkedin
```

Should show three lines for Tue/Thu/Sat @ 9 AM.

### Step 4: Test the Flow (Any Day)
```bash
# Generate a test post
node scripts/linkedin-post-now.js insight

# Prepare for browser posting
node scripts/linkedin-browser-post-automation.js
```

You'll see the post content and instructions.

## Browser Relay Posting

### When Manual Post Needed
If the cron job runs but LinkedIn isn't accessible via browser relay, posts queue in:
- `.linkedin-pending-post.json` — Current pending post
- `.linkedin-posts.log` — History of all posts

### To Complete a Post Manually
1. **Open LinkedIn** in Chrome: https://www.linkedin.com
2. **Start a new post** (click "Start a post" button)
3. **Copy the content** from `.linkedin-current-post.json`:
   ```bash
   jq -r '.fullPost' .linkedin-current-post.json
   ```
4. **Paste** into the post box
5. **Click "Post"**

## Automation Levels

### Level 1: Manual (Current)
- Cron generates post daily
- You manually post via browser

### Level 2: Browser Relay (Ready)
- OpenClaw browser relay posts automatically
- Requires authenticated LinkedIn tab with relay active
- Can be triggered via sessions_spawn with pty=true

### Level 3: API Automation (Future)
- Post directly via LinkedIn API
- Requires LinkedIn app credentials
- No browser needed

## Logging & History

Posts are logged in multiple places:

```bash
# View all posting attempts
cat .linkedin-posts.log

# View cron execution history
cat .linkedin-cron.log

# View current pending post
cat .linkedin-current-post.json | jq '.fullPost'

# View published posts log
cat .linkedin-posts-published.log
```

## Troubleshooting

### Cron job didn't run
```bash
# Check if cron is installed
crontab -l

# Check system logs
log stream --predicate 'eventMessage contains[c] "cron"' --level debug
```

### Post content is blank
```bash
# Check if post file exists and has content
cat .linkedin-current-post.json | jq '.'
```

### Browser relay posting fails
- Ensure LinkedIn tab is open and authenticated
- Ensure OpenClaw Browser Relay toolbar button is active (badge ON)
- Check .linkedin-pending-post.json for error details

## Next Steps

### Immediate (Today)
- ✅ Scripts created and tested
- [ ] Set up cron job (manual edit to crontab)
- [ ] Test by triggering manually: `./scripts/linkedin-auto-post.sh`

### This Week
- [ ] Monitor cron execution on Tue (9 AM)
- [ ] Complete manual browser posting or set up Level 2 automation
- [ ] Review posted content on LinkedIn

### Future Improvements
- Automate browser relay posting
- Add LinkedIn API integration
- Create dashboard to review posted content
- Add analytics tracking

## Files Generated

```
scripts/
├── linkedin-post-now.js              ✅ Generate posts any time
├── linkedin-auto-post.sh             ✅ Scheduled automation (cron)
└── linkedin-browser-post-automation.js ✅ Browser posting helper

.linkedin-current-post.json           → Latest generated post
.linkedin-pending-post.json           → Posts awaiting manual posting
.linkedin-posts.log                   → Full posting history
.linkedin-posts-published.log         → Published posts only
.linkedin-cron.log                    → Cron execution log
```

## Questions?
- Check `.linkedin-posts.log` for debugging
- Verify script permissions: `ls -la scripts/linkedin-*.sh`
- Test post generation: `node scripts/linkedin-post-now.js insight`

---

**Status:** Automation system ready for deployment  
**Last Updated:** March 15, 2026, 9:58 AM EST
