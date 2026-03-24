# Data Center Weekly Update - Setup & Deployment

Complete guide to get the automation running on your Mac.

---

## Phase 1: Setup (First Time Only)

### Step 1: Install Dependencies

```bash
cd /Users/timothyryan/.openclaw/workspace/dc-weekly-update
npm install
```

**Expected output:** `added 2 packages` ✅

### Step 2: Configure Gmail Credentials

#### 2a. Get a Gmail App Password

1. Open https://myaccount.google.com/security
2. **Enable 2-Factor Authentication** if not already enabled
3. Search for **"App passwords"** (appears when 2FA is active)
4. Select **Mail** and **Mac**
5. Google generates a **16-character password** — copy it

#### 2b. Update `.env`

```bash
# Edit the .env file
nano /Users/timothyryan/.openclaw/workspace/dc-weekly-update/.env
```

Update these values:

```bash
GMAIL_USER=your-actual-gmail@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

**Important:**
- Use your actual Gmail address (the one you use to log in)
- Use the 16-character **App Password**, not your regular password
- Don't commit `.env` to git (it's in `.gitignore`)

---

## Phase 2: Testing (Before Automation)

### Test 1: Generate Email (No Send)

```bash
cd /Users/timothyryan/.openclaw/workspace/dc-weekly-update
npm run generate
```

**Output:**
- Creates `logs/draft-2026-03-20.html`
- Shows logs confirming generation

**Verification:**
- Open `logs/draft-2026-03-20.html` in your browser
- Verify it looks professional and has all 7 insights
- Check that data is populated (not blank)

### Test 2: Send Test Email

```bash
npm run send:test
```

**Expected behavior:**
- Email sends to `lucy@elevationaiagents.com` (from `.env`)
- Logs show success and message ID
- Check your email for the message
- Verify design looks correct in your email client

**If it fails:**
- Check `.env` has correct `GMAIL_USER` and `GMAIL_APP_PASSWORD`
- Verify Gmail account has 2FA enabled
- Try the SMTP test below

### Test SMTP Connection

```bash
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});
transporter.verify().then(() => {
  console.log('✅ SMTP Connection Successful!');
  process.exit(0);
}).catch(err => {
  console.error('❌ SMTP Error:', err.message);
  process.exit(1);
});
"
```

---

## Phase 3: Automation Setup (launchd Scheduler)

### Install launchd Job

The system runs every **Friday at 9:00 AM EST** automatically.

```bash
# Copy the plist to launchd directory
cp /Users/timothyryan/.openclaw/workspace/dc-weekly-update/com.pro-tel.dc-weekly-update.plist \
   ~/Library/LaunchAgents/

# Load the job
launchctl load ~/Library/LaunchAgents/com.pro-tel.dc-weekly-update.plist
```

### Verify Job is Loaded

```bash
launchctl list | grep dc-weekly
```

**Expected output:**
```
- 0 com.pro-tel.dc-weekly-update
```

(The `-` at the start means it's not currently running, which is correct — it only runs at scheduled times.)

---

## Phase 4: Testing the Scheduler

### Test 1: Manually Trigger Job (Immediate)

Test that the launchd job actually works:

```bash
launchctl start com.pro-tel.dc-weekly-update
```

**Within 5 seconds:**
- Check logs: `tail -f /Users/timothyryan/.openclaw/workspace/dc-weekly-update/logs/dc-weekly-*.log`
- You should see email being sent to `tim.ryan@pro-tel.com`
- Check your email inbox for the message

### Test 2: Verify Job Scheduled for Next Friday

Check that launchd is configured correctly:

```bash
# View the plist
cat ~/Library/LaunchAgents/com.pro-tel.dc-weekly-update.plist
```

Look for:
- `<key>StartCalendarInterval</key>` 
- `<key>Day</key> <integer>5</integer>` (Friday = day 5)
- `<key>Hour</key> <integer>9</integer>` (9 AM)
- `<key>Minute</key> <integer>0</integer>` (00 minutes)

### Test 3: Watch the Logs

To see logs in real-time:

```bash
tail -f /Users/timothyryan/.openclaw/workspace/dc-weekly-update/logs/dc-weekly-*.log
```

Or check the send history:

```bash
cat /Users/timothyryan/.openclaw/workspace/dc-weekly-update/logs/send-history.json
```

---

## Phase 5: Going Live

### Checklist Before Production

- [x] npm install completed
- [x] `.env` has real Gmail credentials
- [x] `npm run generate` produces clean HTML
- [x] `npm run send:test` successfully sends email
- [x] SMTP connection test passes
- [x] launchd job is loaded (`launchctl list | grep dc-weekly`)
- [x] Manual trigger works (`launchctl start com.pro-tel.dc-weekly-update`)
- [x] Email arrives in inbox correctly formatted
- [x] Logs are being written to `logs/` directory

### Production Expectations

Once everything is tested and loaded:

**Every Friday at 9:00 AM EST:**
1. launchd triggers the job automatically
2. Script loads this week's data center insights
3. Generates professional HTML email
4. Sends to `tim.ryan@pro-tel.com` via Gmail SMTP
5. Logs the send event with message ID
6. Draft saved to `logs/draft-YYYY-MM-DD.html`

**No manual action needed.** It just works.

---

## Troubleshooting

### Email not arriving?

1. **Check launchd logs:**
   ```bash
   tail -n 20 /Users/timothyryan/.openclaw/workspace/dc-weekly-update/logs/launchd-stderr.log
   ```

2. **Check application logs:**
   ```bash
   cat /Users/timothyryan/.openclaw/workspace/dc-weekly-update/logs/dc-weekly-*.log
   ```

3. **Check send history:**
   ```bash
   cat /Users/timothyryan/.openclaw/workspace/dc-weekly-update/logs/send-history.json | tail -5
   ```

4. **Test SMTP manually:**
   ```bash
   npm run send:test
   ```

### launchd not triggering?

1. **Verify it's loaded:**
   ```bash
   launchctl list | grep dc-weekly
   ```

2. **If missing, reload it:**
   ```bash
   launchctl load ~/Library/LaunchAgents/com.pro-tel.dc-weekly-update.plist
   ```

3. **Check plist syntax:**
   ```bash
   plutil -lint ~/Library/LaunchAgents/com.pro-tel.dc-weekly-update.plist
   ```

4. **View plist contents:**
   ```bash
   cat ~/Library/LaunchAgents/com.pro-tel.dc-weekly-update.plist
   ```

### Manually trigger for testing:

```bash
# Start immediately
launchctl start com.pro-tel.dc-weekly-update

# View logs while it runs
tail -f /Users/timothyryan/.openclaw/workspace/dc-weekly-update/logs/launchd-*.log
```

---

## Commands Reference

### Generate Email

```bash
# Generate draft (no send)
npm run generate

# Generate with mock data (default)
npm run generate:mock

# View draft in browser
open logs/draft-$(date +%Y-%m-%d).html
```

### Send Email

```bash
# Send test email
npm run send:test

# Send production email
npm run send

# Send with specific date
node scripts/dc-weekly-update.js --send --date 2026-03-15
```

### View Logs

```bash
# Tail all logs in real-time
npm run logs

# View send history
cat logs/send-history.json

# View launchd output
tail -f logs/launchd-*.log
```

### Manage launchd Job

```bash
# Load the job
launchctl load ~/Library/LaunchAgents/com.pro-tel.dc-weekly-update.plist

# Unload the job (stop automation)
launchctl unload ~/Library/LaunchAgents/com.pro-tel.dc-weekly-update.plist

# Start job immediately
launchctl start com.pro-tel.dc-weekly-update

# Stop running job
launchctl stop com.pro-tel.dc-weekly-update

# List all jobs
launchctl list | grep dc-weekly

# Check if loaded
launchctl list com.pro-tel.dc-weekly-update
```

---

## Security Notes

- ✅ `.env` is in `.gitignore` (not committed)
- ✅ Credentials only in `.env` (not in code)
- ✅ Gmail App Password (not regular password)
- ✅ SMTP over TLS (port 587, not open relay)
- ✅ Email from professional domain (`lucy@elevationaiagents.com`)

---

## What's Next?

### Immediate (This Week)
- Complete Phase 1-3 setup
- Test everything in Phase 4
- Go live for next Friday

### Short-term (Next 2-4 Weeks)
- Implement real web scraping for data sources
- Add deduplication logic
- Set up monitoring/alerting for send failures

### Medium-term (Next Month)
- Build web archive of past emails
- Add multi-recipient support
- Implement email delivery tracking

---

## Questions?

If something isn't working:

1. Check the troubleshooting section above
2. Review logs in `logs/` directory
3. Run `npm run send:test` to verify SMTP
4. Manually trigger: `launchctl start com.pro-tel.dc-weekly-update`
5. Check `.env` has correct credentials

The system is designed to be simple and self-contained. If SMTP works, email gets sent. If launchd is loaded, it runs on schedule.
