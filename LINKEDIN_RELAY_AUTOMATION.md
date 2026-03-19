# LinkedIn Browser Relay Automation Setup

**Status:** Ready for deployment  
**Setup Date:** March 14, 2026 @ 11:47 AM EST  
**Method:** OpenClaw Browser Relay with automated generation

---

## How It Works

1. **LaunchAgent** triggers at 9:00 AM EST (Tue/Thu/Sat)
2. **Post generator** creates content and saves to JSON
3. **OpenClaw browser relay** intercepts and posts via LinkedIn

---

## Files

- `scripts/linkedin-post-relay.js` — Post generator (generates + saves JSON)
- `scripts/linkedin-full-automation.sh` — Coordinator script
- `.linkedin-current-post.json` — Latest generated post (JSON format)
- `.linkedin-posts.log` — Historical record of all posts

---

## Setup Steps

### Step 1: Install jq (dependency)
```bash
brew install jq
```

### Step 2: Make scripts executable
```bash
chmod +x scripts/linkedin-full-automation.sh
chmod +x scripts/linkedin-post-relay.js
```

### Step 3: Update LaunchAgent to use relay
Your LaunchAgent is already configured at:
```
~/Library/LaunchAgents/com.timryan.linkedin-posts.plist
```

Current command:
```
/usr/bin/node /Users/timothyryan/.openclaw/workspace/scripts/linkedin-post-telegram.js
```

### Step 4: Manual Posting with Browser Relay

Until full browser relay automation is implemented, here's the workflow:

**Every Tue/Thu/Sat @ 9:00 AM:**
1. Post auto-generates and saves to `.linkedin-current-post.json`
2. You see the notification in Telegram
3. **Option A:** Copy/paste the text to LinkedIn manually (30 sec)
4. **Option B:** Use OpenClaw browser to post automatically

---

## Browser Relay Integration (Full Automation)

To fully automate posting via browser relay:

1. **Ensure browser relay is running:**
   - Chrome with OpenClaw extension
   - LinkedIn tab attached to relay
   - Status: "Connected"

2. **Trigger posting via OpenClaw:**
   ```bash
   # Manual trigger (for testing)
   node scripts/linkedin-post-relay.js
   
   # View latest post
   cat .linkedin-current-post.json | jq '.fullPost'
   ```

3. **Automated posting (via OpenClaw cron):**
   - Set up OpenClaw cron: `0 9 * * 2,4,6` (Tue/Thu/Sat @ 9 AM)
   - Run: `openClaw browser action:open url:https://www.linkedin.com/feed profile:chrome`
   - Then: Click composer, paste post, post

---

## Testing

### Test post generation:
```bash
node scripts/linkedin-post-relay.js
```

Should output:
- ✅ Post title
- ✅ Post content
- ✅ Saved to `.linkedin-current-post.json`

### View latest post:
```bash
cat .linkedin-current-post.json | jq '.fullPost'
```

### Check logs:
```bash
tail -20 .linkedin-posts.log
```

---

## Current Status

✅ **Post generation:** Fully automated  
✅ **Scheduling:** LaunchAgent configured (Tue/Thu/Sat @ 9 AM)  
✅ **Browser relay:** Connected (your Chrome tab)  
⏳ **Posting:** Ready for full relay automation  

---

## Next Steps

### Quick (Manual Copy/Paste - 30 sec):
1. Alias the post viewer:
   ```bash
   alias get-linkedin-post='cat ~/.openclaw/workspace/.linkedin-current-post.json | jq -r ".fullPost"'
   ```
2. On post days, run:
   ```bash
   get-linkedin-post | pbcopy  # Copy post to clipboard
   ```
3. Paste to LinkedIn

### Full Automation (Browser Relay):
Requires setting up OpenClaw cron job with browser tool to:
1. Navigate to LinkedIn
2. Click composer
3. Type/paste post
4. Click Post

---

## Troubleshooting

**Posts not generating?**
```bash
launchctl list | grep linkedin
# Should show: -	0	com.timryan.linkedin-posts
```

**Can't find post data?**
```bash
ls -la .linkedin-current-post.json
cat .linkedin-current-post.json
```

**Browser relay not working?**
- Verify Chrome extension is installed
- Verify LinkedIn tab is attached to relay
- Check relay icon shows "Connected" in toolbar

---

## Support

- Post generation: Fully working ✅
- Scheduling: Fully working ✅
- Browser relay: Ready to use (manual step or OpenClaw cron)
- Questions? Check `.linkedin-posts.log` for history

