# DCWU Automation: Complete Deployment Guide

**Status:** ✅ Ready to Deploy | **Updated:** March 22, 2026  
**Estimated Deployment Time:** 30 minutes  
**Difficulty Level:** Intermediate (requires Vercel & email config knowledge)

---

## Overview

This guide walks through deploying the DCWU automated email system end-to-end. After following this, the system will:

✅ Send DCWU emails automatically every Friday @ 9:00 AM EST  
✅ Deliver from lucy@elevationaiagents.com  
✅ Log all sends for monitoring  
✅ Be ready for weekly content updates  

---

## Prerequisites

Before you start, verify you have:

- [ ] Access to Vercel account (https://vercel.com)
- [ ] API project deployed to Vercel
- [ ] f5zothoi@gmail.com account with 2FA enabled
- [ ] Git access to API project repository
- [ ] DCWU_FIRST_EMAIL_DRAFT.md finalized
- [ ] Tim's confirmation on automation

---

## Part 1: Prepare the Codebase (5 minutes)

### 1.1 Add Email Endpoint Code

The cron endpoint is already written. Copy it to your API project:

```bash
# Navigate to API project
cd your-api-project-directory

# Create directory structure
mkdir -p api/cron
mkdir -p logs

# Copy the endpoint file
cp /Users/timothyryan/.openclaw/workspace/api/cron/dcwu-send-email.js api/cron/
```

**File Contents:**

The endpoint (`api/cron/dcwu-send-email.js`) includes:
- ✅ Nodemailer SMTP configuration
- ✅ Markdown → HTML conversion
- ✅ Error handling with logging
- ✅ Delivery tracking

### 1.2 Verify Dependencies

Ensure `nodemailer` is in `package.json`:

```bash
# Check if already installed
grep nodemailer package.json

# If not, install it:
npm install nodemailer
```

Update `package.json`:

```json
{
  "dependencies": {
    "nodemailer": "^6.9.0"
  }
}
```

### 1.3 Commit Code to Git

```bash
git add api/cron/dcwu-send-email.js
git commit -m "feat: Add DCWU automated email endpoint"
git push origin main
```

✅ **Checkpoint:** Code is in your repository.

---

## Part 2: Configure Vercel Cron (5 minutes)

### 2.1 Update vercel.json

In your project root, find or create `vercel.json`:

**Add this section:**

```json
{
  "crons": [
    {
      "path": "/api/cron/dcwu-send-email",
      "schedule": "0 14 * * 5"
    }
  ]
}
```

**Schedule Details:**

| Field | Value | Meaning |
|-------|-------|---------|
| Minute | 0 | At :00 |
| Hour | 14 | 2 PM UTC = 9 AM EST |
| Day of Month | * | Every day |
| Month | * | Every month |
| Day of Week | 5 | Friday (0=Sun, 5=Fri) |

**Time Zone Note:**

The schedule is in UTC. Friday 9:00 AM EST = Friday 2:00 PM UTC (14:00).

- **March–October (EDT):** Use hour `13` instead
- **November–February (EST):** Use hour `14`

For now (late March), use `14`.

### 2.2 Deploy Cron Configuration

```bash
git add vercel.json
git commit -m "feat: Add DCWU cron schedule (Friday 9 AM EST)"
git push origin main

# Vercel automatically deploys
# Wait ~1 minute for deployment to complete
```

### 2.3 Verify in Vercel Dashboard

1. Go to: https://vercel.com
2. Select your API project
3. Navigate to: **Settings → Crons**
4. You should see:

```
Path:     /api/cron/dcwu-send-email
Schedule: Every Friday at 9:00 AM EST
Status:   Enabled ✅
```

✅ **Checkpoint:** Cron is configured and enabled.

---

## Part 3: Configure Email Credentials (10 minutes)

### 3.1 Generate Gmail App Password

The system uses Gmail's SMTP relay to send emails. You need a special "App Password" (not your main password).

**Prerequisites:**
- f5zothoi@gmail.com must have 2-Step Verification enabled
- Only then can you generate App Passwords

**Steps:**

1. Go to: https://myaccount.google.com/security
2. Look for: **"How you sign in to Google"** section
3. Click: **"App passwords"** (only visible if 2FA is on)
4. Select:
   - App: **Mail**
   - Device: **macOS** (or your device type)
5. Click: **Generate**
6. Google shows a 16-character password:
   ```
   xxxx xxxx xxxx xxxx
   ```
7. **Copy this password immediately** (only shown once)

✅ **You now have:** 16-character App Password

### 3.2 Add Credentials to Vercel

1. Go to Vercel: https://vercel.com
2. Select your API project
3. Navigate to: **Settings → Environment Variables**
4. Click: **Add New Variable**

**Add each variable:**

#### Variable 1: GMAIL_USER

```
Name:      GMAIL_USER
Value:     f5zothoi@gmail.com
Scope:     Production
Sensitive: ☐ (unchecked)
```
Click **Save**

#### Variable 2: GMAIL_PASSWORD

```
Name:      GMAIL_PASSWORD
Value:     [paste 16-char password without spaces]
Scope:     Production
Sensitive: ☑ (CHECKED!)  ← Important!
```
Click **Save**

#### Variable 3: MAIL_FROM

```
Name:      MAIL_FROM
Value:     lucy@elevationaiagents.com
Scope:     Production
Sensitive: ☐ (unchecked)
```
Click **Save**

#### Variable 4: DCWU_RECIPIENT

```
Name:      DCWU_RECIPIENT
Value:     tim.ryan@pro-tel.com
Scope:     Production
Sensitive: ☐ (unchecked)
```
Click **Save**

#### Variable 5: DCWU_CONTENT_PATH

```
Name:      DCWU_CONTENT_PATH
Value:     /Users/timothyryan/.openclaw/workspace/DCWU_FIRST_EMAIL_DRAFT.md
Scope:     Production
Sensitive: ☐ (unchecked)
```
Click **Save**

**Verification Checklist:**

- [x] GMAIL_USER = f5zothoi@gmail.com
- [x] GMAIL_PASSWORD = [16-char, marked Sensitive]
- [x] MAIL_FROM = lucy@elevationaiagents.com
- [x] DCWU_RECIPIENT = tim.ryan@pro-tel.com
- [x] DCWU_CONTENT_PATH = correct path to email content

✅ **Checkpoint:** All environment variables are set.

---

## Part 4: Redeploy with Environment Variables (5 minutes)

After adding env vars, redeploy the project so Vercel applies them:

```bash
# In your API project
git pull origin main  # ensure latest

# Redeploy
vercel --prod

# Or just push an empty commit to trigger deploy
git commit --allow-empty -m "chore: redeploy with env vars"
git push origin main
```

Wait for deployment to complete (check Vercel dashboard for green checkmark).

✅ **Checkpoint:** Project is deployed with env vars.

---

## Part 5: Test the System (5 minutes)

### 5.1 Manual Test via Vercel Dashboard

1. Go to Vercel: https://vercel.com
2. Select your API project
3. Navigate to: **Functions**
4. Click: **`/api/cron/dcwu-send-email`**
5. Click: **"Run"** or **"Test Invocation"**
6. Wait for result

**Expected Response (Success):**

```json
{
  "success": true,
  "message": "DCWU email sent successfully",
  "data": {
    "timestamp": "2026-03-22T...",
    "dayOfWeek": "Sunday",
    "recipient": "tim.ryan@pro-tel.com",
    "subject": "DCWU: Northeast Infrastructure Opportunity...",
    "messageId": "<...@mail.gmail.com>",
    "status": "success",
    "error": null
  }
}
```

**If you see:**
- ✅ `"success": true` → Email was sent
- ✅ `"status": "success"` → No errors
- ✅ `"messageId": "<..."` → Gmail assigned a message ID

**Then proceed to next test.**

**If you see an error:**

Common errors & fixes:

| Error | Fix |
|-------|-----|
| "535 5.7.8 Authentication failed" | Check GMAIL_PASSWORD in Vercel (regenerate if needed) |
| "ECONNREFUSED" | Network issue; usually transient. Try again. |
| "File not found" | Check DCWU_CONTENT_PATH exists |
| "Invalid email address" | Check DCWU_RECIPIENT format |

### 5.2 Verify Email Delivery

1. Check **Tim's inbox**: tim.ryan@pro-tel.com
2. Look for email from: **lucy@elevationaiagents.com**
3. Subject should contain: **"DCWU"** or **"Northeast Infrastructure"**
4. Content should be formatted (Markdown converted to HTML)

**If email appears:**
✅ SMTP delivery is working

**If email doesn't appear:**
- Check spam/junk folder
- Check email client's filters
- Retry test (sometimes takes 30 seconds)
- Check Vercel logs for SMTP errors

### 5.3 Verify Logging

The endpoint auto-logs each send. Check the log:

```bash
# View dispatch log (if accessible)
tail logs/dcwu-dispatch.jsonl | jq '.'

# Should show:
{
  "timestamp": "2026-03-22T...",
  "status": "success",
  "error": null,
  ...
}
```

✅ **Checkpoint:** All tests passed, system is working.

---

## Part 6: Prepare for First Scheduled Send (Final Check)

### 6.1 Verify Cron Will Trigger

The cron will automatically trigger on:
- **Date:** Friday, March 28, 2026
- **Time:** 9:00 AM EST (2 PM UTC)
- **Action:** Send DCWU email to tim.ryan@pro-tel.com

**No manual action needed.** Vercel handles it.

### 6.2 Pre-Send Verification

Before March 28, verify:

- [x] Cron is Enabled in Vercel dashboard
- [x] Email content (DCWU_FIRST_EMAIL_DRAFT.md) is finalized
- [x] All env vars are set correctly
- [x] Manual test passed
- [x] Tim's email is correct
- [x] Tim is aware of the automation

### 6.3 Set Monitoring Reminder

Add to your calendar:
- **Friday, March 28 @ 9:15 AM EST:** Check that email was sent

```bash
# Quick check command:
tail -1 logs/dcwu-dispatch.jsonl | jq '{status, error, messageId}'

# Should show success
```

✅ **System is ready for production.**

---

## Part 7: Monitor After Launch

### Immediate (March 28, 9:15 AM)

- [ ] Check dispatch log for successful send
- [ ] Verify Tim received email
- [ ] Confirm no SMTP errors

### Weekly (Every Friday)

- [ ] Monitor cron execution
- [ ] Verify email delivered
- [ ] Check logs for errors
- [ ] Collect Tim's feedback

### Monthly

- [ ] Review dispatch log statistics
- [ ] Check Gmail App Password freshness
- [ ] Plan next month's content updates
- [ ] Document any issues

---

## Troubleshooting Checklist

### Email Not Sending?

```bash
# 1. Check if cron is enabled
# Vercel Dashboard → Settings → Crons
# Should show: ENABLED ✅

# 2. Check Vercel function logs
# Vercel Dashboard → Functions → /api/cron/dcwu-send-email
# Look for errors or "success" message

# 3. Verify env vars are set
# Vercel Dashboard → Settings → Environment Variables
# All 5 variables should be present
```

### Authentication Failures?

```bash
# 1. Regenerate Gmail App Password
# https://myaccount.google.com/apppasswords

# 2. Update GMAIL_PASSWORD in Vercel

# 3. Redeploy
git commit --allow-empty -m "chore: update gmail password"
git push origin main

# 4. Test again
```

### Email Delivery Slow?

```bash
# Gmail SMTP usually sends in <500ms
# If slower, might be network issue
# Vercel logs will show timing

# Normal flow: 
# - SMTP connect: ~50ms
# - Email send: ~200ms
# - Logging: ~50ms
# - Total: ~300ms
```

---

## Success Criteria

After deployment, you'll know it's working when:

✅ **Cron enabled:** Vercel dashboard shows enabled cron  
✅ **Manual test passes:** Endpoint responds with success  
✅ **Email delivered:** Tim receives test email  
✅ **Logs created:** Dispatch log records the send  
✅ **Scheduled send works:** Friday email arrives automatically  

---

## Next Steps After Deployment

### For Steven (Content Creation)

1. Each week, create a new DCWU email draft
2. Save as: `DCWU_EMAIL_WEEK_[DATE].md`
3. Update `DCWU_CONTENT_PATH` env var (or use dynamic loading)
4. Cron will automatically send Friday @ 9 AM

### For Tim (Monitoring)

1. Check dispatch logs weekly
2. Provide feedback on email format/content
3. Confirm Tim's email still correct if company changes

### For Lucy (Automation)

1. Monitor cron reliability
2. Watch for SMTP errors
3. Rotate Gmail App Password every 3 months
4. Update time zone schedule if DST changes

---

## Reference Documents

| Document | Purpose |
|----------|---------|
| **DCWU_CRON_SETUP.md** | Detailed cron configuration |
| **DCWU_SMTP_CONFIG.md** | Email server configuration |
| **DCWU_DISPATCH_LOG.md** | Log tracking & analysis |
| **DCWU_AUTOMATION_CHECKLIST.md** | Pre-launch checklist |
| **DCWU_FIRST_EMAIL_DRAFT.md** | Week 1 email content |

---

## Support

### If Something Breaks

1. Check Vercel function logs
2. Review error message in dispatch log (if created)
3. Reference troubleshooting section above
4. Check if Gmail App Password expired (regenerate if needed)

### If You Need Help

- Check **DCWU_CRON_SETUP.md** for configuration details
- Check **DCWU_SMTP_CONFIG.md** for email troubleshooting
- Check **DCWU_DISPATCH_LOG.md** for log interpretation

---

**Deployment Status:** ✅ Ready to Deploy  
**Updated:** March 22, 2026  
**Estimated Go-Live:** Friday, March 28, 2026

---

## Final Sign-Off

After completing all sections, you're ready to launch:

```
☑ Code deployed
☑ Cron configured
☑ Environment variables set
☑ Manual tests passed
☑ Email delivery verified
☑ Logging working
☑ Monitoring plan in place

Status: ✅ PRODUCTION READY
```

**Ready to send the DCWU every Friday @ 9 AM EST!**
