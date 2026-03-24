# DCWU Cron Setup Guide

**Status:** ✅ Production-Ready | **Updated:** March 22, 2026

---

## Overview

The Data Center Weekly Update (DCWU) sends automated emails to Tim every Friday @ 9:00 AM EST.

**Current Setup:**
- **Cron Endpoint:** `/api/cron/dcwu-send-email`
- **Schedule:** Every Friday, 9:00 AM EST
- **Sender:** lucy@elevationaiagents.com
- **Recipient:** tim.ryan@pro-tel.com
- **Content Source:** DCWU_FIRST_EMAIL_DRAFT.md (Week 1) → Scout/Steven pipeline (Week 2+)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│          DCWU Automation Pipeline                       │
└─────────────────────────────────────────────────────────┘

1. VERCEL CRON TRIGGER
   Every Friday @ 9:00 AM EST
   └─> POST /api/cron/dcwu-send-email

2. CONTENT LOADING
   └─> Check for weekly email content file
   └─> Default: DCWU_FIRST_EMAIL_DRAFT.md (Week 1)
   └─> Future: Dynamic content from Scout research → Steven draft pipeline

3. EMAIL FORMATTING
   └─> Markdown → HTML conversion
   └─> Embed subject, headers, footer
   └─> Gmail SMTP relay (f5zothoi@gmail.com account)

4. DELIVERY
   └─> Send from: lucy@elevationaiagents.com
   └─> Send to: tim.ryan@pro-tel.com
   └─> Track: Message ID, timestamp, delivery status

5. LOGGING
   └─> Write dispatch record to: logs/dcwu-dispatch.jsonl
   └─> Track: timestamp, recipient, subject, messageId, status, error
```

---

## Deployment Steps

### 1. Add Environment Variables to Vercel

Log into Vercel dashboard for your API project and add these environment variables:

```
GMAIL_USER              f5zothoi@gmail.com
GMAIL_PASSWORD          [from Google App Password - see below]
MAIL_FROM               lucy@elevationaiagents.com
DCWU_RECIPIENT          tim.ryan@pro-tel.com
DCWU_CONTENT_PATH       /Users/timothyryan/.openclaw/workspace/DCWU_FIRST_EMAIL_DRAFT.md
```

**Getting Gmail App Password:**

1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification (if not already done)
3. Create App Password:
   - Select "Mail"
   - Select "macOS" (or your device)
   - Generate new password (16 chars)
   - Copy to `GMAIL_PASSWORD` in Vercel
4. ⚠️ **Never commit this to git**

---

### 2. Update vercel.json with Cron Configuration

Add to your `vercel.json` in the project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/dcwu-send-email",
      "schedule": "0 9 * * 5" // Friday @ 9:00 AM UTC (adjust for EST)
    }
  ]
}
```

**Note:** Vercel crons run in UTC. For 9:00 AM EST:
- **Winter (EST):** UTC-5 → 2:00 PM UTC (14:00)
- **Summer (EDT):** UTC-4 → 1:00 PM UTC (13:00)

Update the schedule based on current time zone:

```json
{
  "crons": [
    {
      "path": "/api/cron/dcwu-send-email",
      "schedule": "0 14 * * 5"  // March-November (EST: 9 AM = 2 PM UTC)
    }
  ]
}
```

---

### 3. Deploy to Vercel

```bash
# In your Vercel project directory
git add .
git commit -m "feat: Add DCWU automated email endpoint with cron schedule"
git push origin main

# Vercel automatically deploys and activates cron
```

**Verify Deployment:**

1. Go to Vercel dashboard → Your API project
2. Navigate to → Settings → Crons
3. Confirm `/api/cron/dcwu-send-email` is listed
4. Confirm schedule shows: `Every Friday at 9:00 AM EST`

---

## Email Configuration

### SMTP Settings

| Setting | Value |
|---------|-------|
| **SMTP Host** | smtp.gmail.com |
| **SMTP Port** | 587 |
| **Security** | STARTTLS |
| **Username** | f5zothoi@gmail.com |
| **Password** | [Gmail App Password] |
| **From Address** | lucy@elevationaiagents.com |
| **Reply-To** | lucy@elevationaiagents.com |

### Email Headers

Each email includes:

```
X-Mailer: DCWU Automation
X-Campaign: DCWU-Weekly
X-Sent-By: Lucy AI Agent Orchestrator
```

This helps with tracking and deliverability.

---

## Content Pipeline

### Week 1 (March 28, 2026)

**Content File:** `DCWU_FIRST_EMAIL_DRAFT.md`

Steven has pre-written the first email. The cron will:
1. Load the markdown content
2. Extract subject line (first H1)
3. Convert to HTML with professional styling
4. Send via Gmail SMTP
5. Log the delivery

### Week 2+ (April 4, 2026 onwards)

**Content Pipeline:**

1. **Scout** → Research new weekly data, create research notes
2. **Steven** → Draft polished email from Scout's research
3. **Lucy (Cron)** → Automatically send Steven's email Friday @ 9 AM

**Expected Workflow:**
- Thursday EOD: Steven completes email draft
- Friday 9:00 AM: Cron automatically sends it
- Tim receives it in inbox

**Content Location Convention:**

For future weeks, name files:
- `DCWU_EMAIL_WEEK_20260404.md` (April 4)
- `DCWU_EMAIL_WEEK_20260411.md` (April 11)
- etc.

The cron can be updated to dynamically load the most recent file.

---

## Monitoring & Logging

### Dispatch Log Format

Each send is recorded in `logs/dcwu-dispatch.jsonl`:

```json
{
  "timestamp": "2026-03-28T14:00:00.000Z",
  "dayOfWeek": "Friday",
  "recipient": "tim.ryan@pro-tel.com",
  "subject": "DCWU: Northeast Infrastructure Opportunity...",
  "messageId": "<CAK7L8c7X8z9a@mail.gmail.com>",
  "status": "success",
  "error": null
}
```

**View Recent Sends:**

```bash
tail -f logs/dcwu-dispatch.jsonl | jq '.'
```

### Vercel Logs

Monitor in Vercel dashboard:
1. Project → Functions
2. Click `/api/cron/dcwu-send-email`
3. View recent invocations

---

## Troubleshooting

### Email Not Sending?

**Check:**
1. ✅ Vercel env vars set correctly (GMAIL_USER, GMAIL_PASSWORD)
2. ✅ Gmail App Password (not main account password)
3. ✅ "Less secure app access" enabled in Gmail (if using old method)
4. ✅ Email content file exists at DCWU_CONTENT_PATH
5. ✅ Vercel cron schedule is enabled

**Common Errors:**

| Error | Fix |
|-------|-----|
| "535 5.7.8 Authentication failed" | Gmail password expired or incorrect. Regenerate App Password. |
| "ECONNREFUSED smtp.gmail.com" | Network issue. Check Vercel function timeout. |
| "File not found: DCWU_FIRST_EMAIL_DRAFT.md" | Update DCWU_CONTENT_PATH in env vars. |
| "Invalid email address" | Check DCWU_RECIPIENT and MAIL_FROM. |

### Testing the Endpoint

You can test manually via curl:

```bash
curl -X POST https://your-api-domain.com/api/cron/dcwu-send-email \
  -H "Content-Type: application/json" \
  -d '{}'
```

Or use Vercel's test invocation in the dashboard.

---

## Maintenance

### Weekly Checks

Every Friday after send:
- [ ] Check `logs/dcwu-dispatch.jsonl` for successful send
- [ ] Verify Tim received email in inbox
- [ ] Check for any errors in Vercel logs

### Monthly Review

- [ ] Review all sends for delivery success rate
- [ ] Update email content file for next week
- [ ] Check Gmail App Password hasn't expired
- [ ] Verify DCWU_RECIPIENT and MAIL_FROM still correct

### Credential Rotation

**Gmail App Password:**
- Generated fresh every 6 months (or when rotating passwords)
- Update Vercel `GMAIL_PASSWORD` env var
- Revoke old password in Google account

---

## Future Enhancements

1. **Dynamic Content Loading**
   - Query Supabase for weekly content
   - Support multiple email templates
   - A/B test subject lines

2. **Advanced Tracking**
   - Open rate tracking (via pixel)
   - Click tracking on links
   - Delivery/bounce feedback

3. **Conditional Delivery**
   - Skip if content is empty/incomplete
   - Escalate errors via Slack notification
   - Schedule adjustments for holidays

4. **Multi-Recipient**
   - Support CC/BCC
   - Different content for different audiences

---

## References

- **Endpoint Code:** `/api/cron/dcwu-send-email.js`
- **Email Template:** `DCWU_FIRST_EMAIL_DRAFT.md`
- **Logging:** `logs/dcwu-dispatch.jsonl`
- **Vercel Cron Docs:** https://vercel.com/docs/crons
- **Gmail SMTP Relay:** https://support.google.com/accounts/answer/185833

---

**Last Updated:** March 22, 2026  
**Maintained by:** Lucy  
**Next Review:** March 29, 2026 (post-first-send)
