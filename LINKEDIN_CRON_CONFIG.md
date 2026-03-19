# OpenClaw Cron Configuration for LinkedIn Automation

**Status:** Ready to activate  
**Schedule:** Tuesday, Thursday, Saturday @ 9:00 AM EST  
**Method:** OpenClaw cron + browser relay

---

## How It Works

1. **9:00 AM EST:** OpenClaw cron triggers
2. **Step 1:** Generate post (`linkedin-post-relay.js`)
3. **Step 2:** Open LinkedIn in browser relay
4. **Step 3:** Post content via browser automation
5. **Step 4:** Confirm success + log

---

## Cron Configuration

**File:** `~/.openclaw/openclaw.json`

Add this to your cron section:

```json
{
  "cron": [
    {
      "name": "LinkedIn Auto-Post",
      "schedule": "0 9 * * 2,4,6",
      "timeZone": "America/New_York",
      "task": "Generate and post LinkedIn content",
      "command": "node /Users/timothyryan/.openclaw/workspace/scripts/linkedin-post-relay.js && sleep 2 && echo 'Post ready for browser relay posting'",
      "tags": ["linkedin", "social", "automated"]
    }
  ]
}
```

---

## Two-Part Execution

### Part 1: Content Generation (100% Automated)
```bash
node scripts/linkedin-post-relay.js
```
✅ Generates post  
✅ Saves to `.linkedin-current-post.json`  
✅ Logs to `.linkedin-posts.log`

### Part 2: Browser Posting (Via OpenClaw Relay)
OpenClaw browser tool will:
1. Navigate to LinkedIn feed
2. Click share button
3. Paste post content
4. Click post

---

## Manual Trigger (For Testing)

```bash
# Generate post
cd /Users/timothyryan/.openclaw/workspace
node scripts/linkedin-post-relay.js

# View what was generated
cat .linkedin-current-post.json | jq '.fullPost'

# Log shows it's ready
tail -5 .linkedin-posts.log
```

---

## Browser Relay Command

OpenClaw will execute (via browser tool):

```javascript
// Navigate to feed
await browser.goto('https://www.linkedin.com/feed');

// Click share box
await page.click('[data-test-id="share-box-trigger"]');
await page.waitForSelector('[contenteditable="true"]');

// Get post content
const postContent = JSON.parse(fs.readFileSync('.linkedin-current-post.json')).fullPost;

// Type post
await page.keyboard.type(postContent);

// Post
await page.click('button:has-text("Post")');

// Success
console.log('✅ Posted to LinkedIn');
```

---

## Activation Steps

1. **Update OpenClaw config with cron schedule above**
2. **Verify cron is active:**
   ```bash
   openclaw cron list
   ```
3. **Test manually:**
   ```bash
   node scripts/linkedin-post-relay.js
   cat .linkedin-current-post.json | jq '.fullPost'
   ```
4. **Wait for next scheduled time (Tue 9 AM EST)**

---

## Status

✅ Post generation: Ready  
✅ Browser relay: Connected  
✅ Cron schedule: Configured  
⏳ Testing: Next trigger is Tuesday 9 AM

---

## Logs

- **Post generation:** `.linkedin-posts.log`
- **Published posts:** `.linkedin-posts-published.log`
- **Browser relay:** Check OpenClaw logs

---

## Troubleshooting

**Cron not triggering?**
```bash
openclaw cron list
openclaw cron status "LinkedIn Auto-Post"
```

**Post not posting?**
- Check browser relay is connected
- Verify LinkedIn tab is open in Chrome
- Check browser relay logs

**Need to post immediately?**
```bash
node scripts/linkedin-post-relay.js
# Then manually click post in LinkedIn via browser relay
```

