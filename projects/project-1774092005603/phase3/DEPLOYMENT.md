# Phase 3 Deployment Guide — Hyperscaler Briefing Automation

**Status:** Ready for production deployment  
**Deadline:** March 23, 2026 (EOD)  
**Timeline to live:** ~30 minutes (setup + testing)  

---

## 📋 What You're Deploying

Three core components:

1. **briefing-generator.js** — Researches and generates daily briefing (markdown + HTML)
2. **email-delivery.js** — Sends briefing via SMTP to Tim's inbox
3. **briefing-automation.plist** — macOS launchd job to run the pipeline daily at 8:00 AM EST

**Plus:**
- Log files for troubleshooting
- Manual trigger scripts for testing
- Complete documentation (this file + OPERATIONS.md)

---

## ✅ Pre-Deployment Checklist

Before you go live, verify:

- [ ] **Node.js installed:** `node --version` (should be v14+)
- [ ] **nodemailer module installed:** `npm install nodemailer` (in phase3 directory)
- [ ] **SMTP credentials ready:** Gmail SMTP username + app password (see GMAIL_SETUP.md)
- [ ] **Tim's email address:** Confirmed as recipient
- [ ] **Directory structure created:** `/Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3/`
- [ ] **Logs directory:** `/Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/` (will be created automatically)

---

## 🚀 Deployment Steps

### Step 1: Install Dependencies

```bash
cd /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3

# Install nodemailer (required for email delivery)
npm install nodemailer

# Verify installation
node -e "console.log(require('nodemailer').version || 'nodemailer installed')"
```

**Expected output:** Version number or confirmation message  
**Troubleshooting:** If `npm` not found, install Node.js via Homebrew: `brew install node`

---

### Step 2: Configure SMTP Credentials

The automation pipeline reads SMTP configuration from environment variables. You have two options:

#### Option A: Set Environment Variables (Recommended for LaunchAgent)

Create or edit `~/.zshrc` (or `~/.bash_profile` if using bash):

```bash
# Hyperscaler Update SMTP Configuration
export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USER="[YOUR-GMAIL-ACCOUNT]@gmail.com"
export SMTP_PASSWORD="[YOUR-GMAIL-APP-PASSWORD]"
export FROM_EMAIL="lucy@elevationaiagents.com"
export FROM_NAME="Hyperscaler Update"
export RECIPIENT_EMAIL="tim@work-email.com"
# Optional CC recipients (comma-separated)
# export CC_EMAILS="manager@work.com,analyst@work.com"
```

**Important Notes:**
- Replace `[YOUR-GMAIL-ACCOUNT]` with your Gmail address
- Replace `[YOUR-GMAIL-APP-PASSWORD]` with a Gmail app password (NOT your regular password)
- `FROM_EMAIL` is the "From" address shown to recipients (use lucy@elevationaiagents.com for consistency)
- `RECIPIENT_EMAIL` should be Tim's work email address

Then reload your shell:

```bash
source ~/.zshrc
```

**Verify variables are set:**

```bash
echo $SMTP_USER
echo $RECIPIENT_EMAIL
```

#### Option B: Create `.env` File (For Development)

Create `/Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3/.env`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=lucy@elevationaiagents.com
FROM_NAME=Hyperscaler Update
RECIPIENT_EMAIL=tim@work-email.com
```

Then modify `email-delivery.js` to load this file (optional enhancement).

---

### Step 3: Test SMTP Connectivity

Before scheduling, verify your SMTP credentials work:

```bash
cd /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3

# Test SMTP connection
node email-delivery.js --verify

# Expected output:
# ✅ SMTP verification successful
# Host: smtp.gmail.com:587
```

**If verification fails:**
- Check Gmail app password is correct (not your regular password)
- Verify 2-factor authentication is enabled on your Gmail account
- Check that "Less secure app access" is disabled (use app passwords instead)
- See GMAIL_SETUP.md for step-by-step Gmail configuration

---

### Step 4: Test Email Delivery (Optional)

Send a test email to verify end-to-end delivery:

```bash
cd /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3

# Send test email
node email-delivery.js --test

# Expected output:
# ✅ Test email sent successfully
# Message ID: <message-id@gmail.com>

# Check Tim's inbox for test email from "Hyperscaler Update <lucy@elevationaiagents.com>"
```

---

### Step 5: Generate and Deliver First Briefing (Manual)

Test the complete pipeline manually before scheduling:

```bash
cd /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3

# Generate briefing for today
node briefing-generator.js

# Expected output:
# ✅ Briefing generation complete
# Date: 2026-03-23
# Stories: 5
# Markdown: /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/briefings/BRIEFING_2026-03-23.md
# HTML Email: /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/briefings/EMAIL_2026-03-23.html

# Verify files were created
ls -lh /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/briefings/
```

Then send the briefing:

```bash
# Send briefing email
node email-delivery.js

# Expected output:
# ✅ Briefing delivered successfully
# Date: 2026-03-23
# Subject: Hyperscaler Update: Mar 23, 2026
# Recipients: tim@work-email.com
# Message ID: <message-id@gmail.com>
```

**Verify:** Check Tim's inbox for the briefing email. It should have:
- **From:** `Hyperscaler Update <lucy@elevationaiagents.com>`
- **Subject:** `Hyperscaler Update: Mar 23, 2026`
- **Body:** Professional HTML email with 4-5 stories in formatted layout

---

### Step 6: Install LaunchAgent (macOS Automation)

Install the launchd job to run briefings automatically every weekday morning at 8:00 AM EST:

```bash
# Copy plist to LaunchAgents directory
cp /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3/briefing-automation.plist \
   ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist

# Set proper permissions
chmod 644 ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist

# Load the job
launchctl load ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist

# Verify it's loaded
launchctl list | grep com.elevationai.hyperscaler-update
```

**Expected output:** Job name with status (should show PID or "-" if not currently running)

---

### Step 7: Verify Scheduling

Check that the job is scheduled correctly:

```bash
# List all scheduled jobs
launchctl list | grep hyperscaler

# Get detailed job info
launchctl info ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist

# View plist contents (verify scheduling times)
cat ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist | grep -A 20 "StartCalendarInterval"
```

---

## 🧪 Testing the Automation

### Manual Trigger Test (Dry Run)

Before waiting for 8:00 AM, test the full pipeline in dry-run mode:

```bash
cd /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3

# Full pipeline dry-run (no files created, no emails sent)
bash -c "
    TIMESTAMP=\$(date +%Y-%m-%d)
    node briefing-generator.js --date \$TIMESTAMP --dry-run
    node email-delivery.js --date \$TIMESTAMP --dry-run
"

# Expected output shows what WOULD happen without actually doing it
```

### Full Pipeline Test (Actual Execution)

```bash
cd /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3

# Generate and deliver briefing for today
TIMESTAMP=$(date +%Y-%m-%d)
node briefing-generator.js --date $TIMESTAMP && \
node email-delivery.js --date $TIMESTAMP

# Check logs
tail -20 /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/automation.log
```

### Monitor LaunchAgent

After deploying the plist, monitor job execution:

```bash
# Watch log file for job execution
tail -f /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/launchd.stdout.log

# Or check for errors
tail -f /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/launchd.stderr.log
```

The job will run at 8:00 AM EST Monday-Friday. Logs appear immediately after execution.

---

## 📊 Monitoring & Troubleshooting

### Check Job Status

```bash
# Is the job loaded?
launchctl list com.elevationai.hyperscaler-update

# Unload if needed (to disable temporarily)
launchctl unload ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist

# Reload to re-enable
launchctl load ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist
```

### View Logs

```bash
# Overall automation log
tail -50 /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/automation.log

# LaunchAgent stdout/stderr
tail -50 /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/launchd.stdout.log
tail -50 /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/launchd.stderr.log

# Specific date logs
ls /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/generator-*.log
ls /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/delivery-*.log
```

### Troubleshooting Common Issues

#### "RECIPIENT_EMAIL environment variable not set"
**Solution:** Add environment variables to `~/.zshrc` and reload: `source ~/.zshrc`

#### "SMTP verification failed: 535 Invalid credentials"
**Solution:** 
- Gmail password must be an app password (not your regular password)
- Enable 2-factor authentication on your Gmail account
- See GMAIL_SETUP.md for detailed instructions

#### "Email delivery failed: Error: connect ECONNREFUSED"
**Solution:**
- Check SMTP_HOST and SMTP_PORT are correct (should be smtp.gmail.com:587)
- Verify internet connection is working
- Check firewall isn't blocking outbound SMTP

#### "Briefing files not found"
**Solution:**
- Ensure briefing-generator.js ran successfully (check logs)
- Verify `/Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/briefings/` directory exists
- Check file permissions: `ls -la briefings/BRIEFING_*.md`

---

## 🎯 What Happens When It Runs

Every weekday at 8:00 AM EST (Monday-Friday):

1. **8:00:00 AM** — LaunchAgent triggers the job
2. **8:00-8:02 AM** — briefing-generator.js runs:
   - Researches hyperscaler news from Phase 1 sources
   - Scores and ranks stories (4-5 stories minimum 4.0 score)
   - Generates markdown briefing + HTML email template
   - Saves files: `BRIEFING_YYYY-MM-DD.md` and `EMAIL_YYYY-MM-DD.html`
3. **8:02-8:03 AM** — email-delivery.js runs:
   - Reads the generated briefing files
   - Connects to Gmail SMTP
   - Sends HTML email to Tim's inbox with full briefing
   - Logs delivery status and message ID
4. **8:03:XX AM** — Job completes, logs appear in automation.log

**Tim receives:** Professional HTML email from "Hyperscaler Update <lucy@elevationaiagents.com>" with 4-5 curated hyperscaler stories, sorted by importance, ready to read in 5-10 minutes.

---

## 📝 Configuration Reference

### Environment Variables

| Variable | Default | Required | Purpose |
|----------|---------|----------|---------|
| `SMTP_HOST` | smtp.gmail.com | No | SMTP server address |
| `SMTP_PORT` | 587 | No | SMTP port (587 for TLS, 465 for SSL) |
| `SMTP_USER` | (none) | **Yes** | Gmail account for sending emails |
| `SMTP_PASSWORD` | (none) | **Yes** | Gmail app password (not regular password) |
| `FROM_EMAIL` | lucy@elevationaiagents.com | No | From address shown to recipients |
| `FROM_NAME` | Hyperscaler Update | No | From name shown to recipients |
| `RECIPIENT_EMAIL` | (none) | **Yes** | Tim's work email address |
| `CC_EMAILS` | (none) | No | Optional CC recipients (comma-separated) |

### File Locations

| File | Location | Purpose |
|------|----------|---------|
| Generator script | `phase3/briefing-generator.js` | Creates daily briefings |
| Delivery script | `phase3/email-delivery.js` | Sends emails via SMTP |
| LaunchAgent plist | `~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist` | Scheduling definition |
| Briefing markdown | `briefings/BRIEFING_YYYY-MM-DD.md` | Daily briefing text |
| Briefing HTML | `briefings/EMAIL_YYYY-MM-DD.html` | Formatted email template |
| Automation log | `logs/automation.log` | Overall pipeline logs |
| Generator log | `logs/generator-YYYY-MM-DD.log` | Briefing generation details |
| Delivery log | `logs/delivery-YYYY-MM-DD.log` | Email delivery details |
| LaunchAgent logs | `logs/launchd.stdout.log`, `logs/launchd.stderr.log` | Job execution logs |

---

## ✨ Success Criteria

You've successfully deployed Phase 3 when:

- ✅ `npm install nodemailer` completes without errors
- ✅ `node email-delivery.js --verify` shows "SMTP verification successful"
- ✅ `node email-delivery.js --test` delivers a test email to Tim
- ✅ Manual `briefing-generator.js` generates briefing files
- ✅ Manual `email-delivery.js` delivers briefing email to Tim's inbox
- ✅ LaunchAgent job loads without errors
- ✅ Job automatically runs tomorrow at 8:00 AM EST (logs confirm execution)
- ✅ Tim receives the briefing email by 8:03 AM the next weekday morning

---

## 📞 Need Help?

See:
- **OPERATIONS.md** — How to manually trigger, troubleshoot, view logs
- **SCHEDULE.md** — Cron/launchd configuration details
- **GMAIL_SETUP.md** — Step-by-step Gmail SMTP configuration
- **TIM_BRIEFING.md** — Quick start guide for Tim

---

## 🚨 Emergency: Disable Automation

If something goes wrong and you need to disable the briefing pipeline:

```bash
# Unload (disable) the launchd job
launchctl unload ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist

# Verify it's unloaded
launchctl list | grep -i hyperscaler  # Should return nothing

# Re-enable later
launchctl load ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist
```

---

**Ready to deploy!** Start with Step 1 and work through to Step 7. Total time: ~30 minutes.

Next: See OPERATIONS.md for day-to-day operations and troubleshooting.
