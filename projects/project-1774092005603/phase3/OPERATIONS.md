# Phase 3 Operations Guide — Hyperscaler Briefing Automation

**Purpose:** Day-to-day operations, manual triggers, troubleshooting, and log monitoring  
**Audience:** Tim Ryan (can run these commands independently)  
**Last Updated:** March 23, 2026

---

## 📋 Daily Operations Summary

Once deployed, the briefing automation runs **automatically every weekday at 8:00 AM EST**. You don't need to do anything—Tim should receive the briefing email in his inbox by 8:03 AM.

However, this guide covers:
- How to manually trigger a briefing (on-demand)
- How to view logs and monitor execution
- How to troubleshoot if something goes wrong
- How to pause/resume the automation

---

## 🎬 Manual Briefing Trigger

Generate and send a briefing on-demand (not on schedule):

### Generate Briefing Only

```bash
cd /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3

# Generate briefing for today
node briefing-generator.js

# Or specify a date
node briefing-generator.js --date 2026-03-24
```

**Output:**
```
✅ Briefing generation complete
Date: 2026-03-23
Stories: 5
Markdown: /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/briefings/BRIEFING_2026-03-23.md
HTML Email: /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/briefings/EMAIL_2026-03-23.html
```

**Files created:**
- `BRIEFING_2026-03-23.md` — Markdown briefing (plaintext, readable)
- `EMAIL_2026-03-23.html` — HTML email template (formatted, ready to send)

### Send Email Only (Pre-generated Briefing)

```bash
# Send briefing email for a specific date
node email-delivery.js --date 2026-03-23

# Or today
node email-delivery.js
```

**Output:**
```
✅ Briefing delivered successfully
Date: 2026-03-23
Subject: Hyperscaler Update: Mar 23, 2026
Recipients: tim@work-email.com
Message ID: <message-id@gmail.com>
```

### Full Pipeline (Generate + Send)

```bash
# All-in-one: generate briefing and send email
cd /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3

TIMESTAMP=$(date +%Y-%m-%d)
node briefing-generator.js --date $TIMESTAMP && \
node email-delivery.js --date $TIMESTAMP

echo "✅ Briefing generated and delivered for $TIMESTAMP"
```

---

## 🧪 Testing & Validation

### Test SMTP Connection (Verify Email Setup Works)

```bash
cd /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3

node email-delivery.js --verify
```

**Expected output:**
```
✅ SMTP verification successful
Host: smtp.gmail.com:587
```

**If this fails:** Check environment variables are set (`echo $SMTP_USER`)

---

### Send Test Email (End-to-End Test)

```bash
cd /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3

node email-delivery.js --test
```

**Expected output:**
```
✅ Test email sent successfully
Message ID: <message-id@gmail.com>
```

Check Tim's inbox for a test email. This verifies email delivery is working without needing a generated briefing file.

---

### Dry Run (Simulate Without Making Changes)

```bash
# Generate briefing without creating files
node briefing-generator.js --dry-run

# Send email without actually connecting to SMTP
node email-delivery.js --dry-run

# Full pipeline dry-run
TIMESTAMP=$(date +%Y-%m-%d)
node briefing-generator.js --date $TIMESTAMP --dry-run && \
node email-delivery.js --date $TIMESTAMP --dry-run
```

**Use case:** See what WOULD happen without making actual changes.

---

## 📊 View Logs

### Watch Real-Time Log Output

```bash
# Monitor automation log as it runs (live)
tail -f /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/automation.log

# Or use a pager for the last 50 lines
tail -50 /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/automation.log
```

**Log format:**
```
[2026-03-24 08:00:15] [INFO] === HYPERSCALER BRIEFING AUTOMATION STARTED ===
[2026-03-24 08:00:15] [INFO] Date: 2026-03-24
[2026-03-24 08:00:15] [INFO] Step 1: Generating briefing...
[2026-03-24 08:00:17] [INFO] ✓ Briefing generated successfully
[2026-03-24 08:00:17] [INFO] Step 2: Sending email...
[2026-03-24 08:00:20] [INFO] ✓ Email sent successfully
[2026-03-24 08:00:20] [INFO] === HYPERSCALER BRIEFING AUTOMATION COMPLETED ===
```

### View Specific Date Logs

```bash
# Generator logs for a specific date
tail -20 /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/generator-2026-03-23.log

# Email delivery logs for a specific date
tail -20 /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/delivery-2026-03-23.log

# LaunchAgent system logs
tail -20 /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/launchd.stdout.log
tail -20 /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/launchd.stderr.log
```

### List All Available Logs

```bash
# Show all briefing files (markdown)
ls -lh /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/briefings/BRIEFING_*.md

# Show all email templates
ls -lh /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/briefings/EMAIL_*.html

# Show all log files
ls -lh /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/
```

---

## 🎛️ Manage the Automation Job

### Check Job Status

```bash
# Is the job loaded and running?
launchctl list com.elevationai.hyperscaler-update

# Should show:
# {
#   "Label" = "com.elevationai.hyperscaler-update";
#   "LimitLoadToSessionType" = "Aqua";
# }
```

### Pause Automation (Temporarily Disable)

```bash
# Unload the job (stops it from running)
launchctl unload ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist

# Verify it's unloaded
launchctl list | grep hyperscaler  # Should return nothing
```

**Use case:** You need to fix something or don't want briefings for a while.

### Resume Automation (Re-enable)

```bash
# Load the job (restarts scheduled execution)
launchctl load ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist

# Verify it's loaded
launchctl list com.elevationai.hyperscaler-update
```

### Remove Job Permanently (Uninstall)

```bash
# Unload the job
launchctl unload ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist

# Delete the plist file
rm ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist
```

**Warning:** This removes the automation completely. See DEPLOYMENT.md to reinstall.

---

## 🔧 Troubleshooting

### Issue: "RECIPIENT_EMAIL environment variable not set"

**Problem:** Email delivery fails because recipient email isn't configured.

**Solution:**
```bash
# Check if environment variable is set
echo $RECIPIENT_EMAIL

# If empty, add to ~/.zshrc
echo 'export RECIPIENT_EMAIL="tim@work-email.com"' >> ~/.zshrc

# Reload shell
source ~/.zshrc

# Verify
echo $RECIPIENT_EMAIL
```

---

### Issue: "SMTP verification failed: 535 Invalid credentials"

**Problem:** Gmail authentication failed (wrong password or account setup).

**Solution:**
1. Verify you're using a Gmail app password (not your regular password)
2. Check 2-factor authentication is enabled on your Gmail account
3. Generate a new app password and update `SMTP_PASSWORD` environment variable

See GMAIL_SETUP.md for detailed steps.

---

### Issue: "Email delivery failed: connect ECONNREFUSED"

**Problem:** Can't connect to SMTP server (network issue or wrong host/port).

**Solution:**
```bash
# Verify SMTP configuration
echo "Host: $SMTP_HOST"
echo "Port: $SMTP_PORT"

# Should show: smtp.gmail.com and 587

# Test basic connectivity
nc -zv smtp.gmail.com 587

# If that fails, check network connection
ping -c 2 gmail.com
```

---

### Issue: "Briefing files not found"

**Problem:** Email delivery fails because briefing markdown/HTML files don't exist.

**Solution:**
```bash
# Check if briefing was generated
ls -la /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/briefings/

# If empty, generate a briefing manually
cd /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3
node briefing-generator.js

# Then send email
node email-delivery.js
```

---

### Issue: LaunchAgent Job Not Running at Scheduled Time

**Problem:** Job was loaded but didn't execute at 8:00 AM.

**Solution:**
```bash
# Verify job is still loaded
launchctl list com.elevationai.hyperscaler-update

# Check system logs for any errors
log stream --predicate 'eventMessage contains[c] "hyperscaler"' --level debug

# Check if Mac was asleep at 8:00 AM (LaunchAgent only runs when logged in and awake)
# Solution: Keep Mac awake or adjust time if needed

# Check plist syntax is valid
plutil -lint ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist
```

---

### Issue: Email Sent But Not Appearing in Inbox

**Problem:** Delivery succeeded (logs show "Message ID") but Tim doesn't see the email.

**Solution:**
1. Check spam folder (message might be flagged as spam initially)
2. Verify recipient email is correct: `echo $RECIPIENT_EMAIL`
3. Check sender email `lucy@elevationaiagents.com` is in allowed senders
4. Resend manually: `node email-delivery.js`

---

## 📖 Common Workflows

### "I want to send a briefing right now" (Manual Trigger)

```bash
cd /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3

# Generate and send today's briefing
TIMESTAMP=$(date +%Y-%m-%d)
node briefing-generator.js --date $TIMESTAMP && \
node email-delivery.js --date $TIMESTAMP

# Check logs
tail -20 /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/automation.log
```

**Time:** ~10 seconds  
**Result:** Tim receives briefing email immediately

---

### "I want to check if automation is working" (Status Check)

```bash
# 1. Check if job is loaded
launchctl list com.elevationai.hyperscaler-update

# 2. View recent logs
tail -20 /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/automation.log

# 3. Send a test email
node email-delivery.js --test

# 4. Check briefings directory for recent files
ls -lht /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/briefings/ | head
```

---

### "I want to disable briefings temporarily" (Pause)

```bash
# Unload the job
launchctl unload ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist

# Verify
launchctl list | grep hyperscaler  # Should return nothing

# Later, re-enable
launchctl load ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist
```

---

### "I want to see today's briefing without sending" (Preview)

```bash
cd /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3

# Generate briefing
node briefing-generator.js

# View markdown in terminal
cat /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/briefings/BRIEFING_$(date +%Y-%m-%d).md

# Or open HTML in browser
open /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/briefings/EMAIL_$(date +%Y-%m-%d).html
```

---

## 📞 Command Reference

### Briefing Generator

| Command | Purpose |
|---------|---------|
| `node briefing-generator.js` | Generate briefing for today |
| `node briefing-generator.js --date 2026-03-24` | Generate briefing for specific date |
| `node briefing-generator.js --dry-run` | Simulate generation (don't create files) |

### Email Delivery

| Command | Purpose |
|---------|---------|
| `node email-delivery.js` | Send today's briefing email |
| `node email-delivery.js --date 2026-03-24` | Send specific date's briefing |
| `node email-delivery.js --test` | Send test email (no briefing needed) |
| `node email-delivery.js --verify` | Test SMTP connectivity only |
| `node email-delivery.js --dry-run` | Simulate sending (don't connect SMTP) |

### LaunchAgent Management

| Command | Purpose |
|---------|---------|
| `launchctl list com.elevationai.hyperscaler-update` | Check job status |
| `launchctl load ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist` | Enable automation |
| `launchctl unload ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist` | Disable automation |
| `launchctl start com.elevationai.hyperscaler-update` | Force job to run now |

### Log Viewing

| Command | Purpose |
|---------|---------|
| `tail -50 logs/automation.log` | View recent automation logs |
| `tail -f logs/automation.log` | Watch logs in real-time |
| `ls -lh logs/` | List all log files |
| `ls -lh briefings/` | List all generated briefings |

---

## 📊 Monitoring Checklist (Weekly)

Every week, spot-check that automation is working:

- [ ] Check automation log for errors: `tail -20 logs/automation.log`
- [ ] Verify Tim received briefing emails on weekday mornings
- [ ] Confirm job is still loaded: `launchctl list com.elevationai.hyperscaler-update`
- [ ] Test manual trigger works: `node briefing-generator.js && node email-delivery.js --test`
- [ ] Review briefing quality: open latest `EMAIL_YYYY-MM-DD.html` in browser

If everything looks good, no action needed. Automation should run silently in background.

---

## 🚨 Emergency Commands

### Stop Everything (Emergency Disable)

```bash
# Unload the job immediately
launchctl unload ~/Library/LaunchAgents/com.elevationai.hyperscaler-update.plist

# Verify it's stopped
launchctl list | grep hyperscaler  # Should return nothing
```

---

### Clear Old Logs (Free Disk Space)

```bash
# Remove logs older than 30 days
find /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs -name "*.log" -mtime +30 -delete

# Or manually remove specific date
rm /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/generator-2026-02-01.log
```

---

### Verify System Compatibility

```bash
# Check Node.js version
node --version  # Should be v14+

# Check nodemailer is installed
node -e "console.log(require.resolve('nodemailer'))"

# Check shell is zsh (for environment variables)
echo $SHELL  # Should be /bin/zsh
```

---

## 📞 Support

- **Setup problems?** See DEPLOYMENT.md
- **Email config issues?** See GMAIL_SETUP.md
- **Schedule questions?** See SCHEDULE.md
- **For Tim's quick-start?** See TIM_BRIEFING.md

---

**That's it!** The automation is designed to run silently. Check logs weekly, use manual triggers when needed, and the briefing email should arrive in Tim's inbox every weekday morning at 8:00 AM EST.
