# DCWU Dispatch Log & Tracking

**Status:** ✅ Automated | **Format:** JSONL | **Updated:** March 22, 2026

---

## Overview

Every DCWU email send is automatically logged to track:
- ✅ Successful deliveries
- ❌ Failures and errors
- 📊 Delivery patterns
- 📈 Historical records

---

## Log Location & Format

### Log File

```
logs/dcwu-dispatch.jsonl
```

Each line is a JSON object (JSONL = JSON Lines format):

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

### Log Fields

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | ISO 8601 | When the email was sent (UTC) |
| `dayOfWeek` | String | Day name (always "Friday") |
| `recipient` | Email | Recipient address (tim.ryan@pro-tel.com) |
| `subject` | String | Email subject line |
| `messageId` | String | Gmail message ID (for tracking) |
| `status` | String | "success" or "failed" |
| `error` | String/null | Error message if status="failed" |

---

## Reading the Log

### View All Records

```bash
cat logs/dcwu-dispatch.jsonl | jq '.'
```

### View Recent Sends (Last 5)

```bash
tail -5 logs/dcwu-dispatch.jsonl | jq '.'
```

### Filter by Status

```bash
# All successful sends
grep '"status":"success"' logs/dcwu-dispatch.jsonl | jq '.'

# All failed sends
grep '"status":"failed"' logs/dcwu-dispatch.jsonl | jq '.'
```

### Count Sends by Month

```bash
grep '"status":"success"' logs/dcwu-dispatch.jsonl | \
  jq '.timestamp' | \
  cut -d'-' -f1-2 | \
  sort | uniq -c
```

### Find Specific Week

```bash
# Week of March 28, 2026
grep '2026-03-28' logs/dcwu-dispatch.jsonl | jq '.'
```

---

## Interpretation Guide

### Successful Send Log Entry

```json
{
  "timestamp": "2026-03-28T14:00:00.000Z",
  "dayOfWeek": "Friday",
  "recipient": "tim.ryan@pro-tel.com",
  "subject": "DCWU: Northeast Infrastructure Opportunity",
  "messageId": "<CAK7L8c7X8z9a@mail.gmail.com>",
  "status": "success",
  "error": null
}
```

✅ **Status:** success  
✅ **Error:** null  
✅ **Message ID present:** Yes (Gmail assigned this ID)

**Interpretation:** Email was sent successfully via Gmail SMTP. Tim should receive it in his inbox.

### Failed Send Log Entry

```json
{
  "timestamp": "2026-03-29T14:00:00.000Z",
  "dayOfWeek": "Friday",
  "recipient": "tim.ryan@pro-tel.com",
  "subject": "DCWU: Northeast Infrastructure Opportunity",
  "messageId": null,
  "status": "failed",
  "error": "535 5.7.8 Authentication failed. Please check your credentials"
}
```

❌ **Status:** failed  
❌ **Error:** Authentication failed  
❌ **Message ID:** null (email never reached Gmail)

**Interpretation:** Email failed to send. Gmail rejected the SMTP credentials. Action: Regenerate Gmail App Password and update Vercel.

---

## Common Error Messages & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "535 5.7.8 Authentication failed" | Wrong/expired App Password | Regenerate App Password, update GMAIL_PASSWORD in Vercel |
| "ECONNREFUSED smtp.gmail.com" | Network connectivity issue | Check if Vercel function can reach external SMTP |
| "File not found: DCWU_FIRST_EMAIL_DRAFT.md" | Content file missing | Update DCWU_CONTENT_PATH, verify file exists |
| "Invalid email address" | DCWU_RECIPIENT malformed | Verify `tim.ryan@pro-tel.com` format in env var |
| "ENOTFOUND smtp.gmail.com" | DNS resolution failed | Rare; usually transient. Retry will succeed. |

---

## Weekly Monitoring Checklist

Every Friday after 9:00 AM EST:

- [ ] Check `logs/dcwu-dispatch.jsonl` for latest entry
- [ ] Verify status is "success"
- [ ] Confirm error field is null
- [ ] Check message ID exists (format: `<...@mail.gmail.com>`)
- [ ] Verify Tim received email in inbox
- [ ] Check email wasn't marked as spam

**Quick Check Command:**

```bash
tail -1 logs/dcwu-dispatch.jsonl | jq '{status, error, messageId}'

# Output should be:
# {
#   "status": "success",
#   "error": null,
#   "messageId": "<CAK7L...>"
# }
```

---

## Historical Analysis

### Monthly Success Rate

```bash
# Count successes and failures by month
jq '.timestamp, .status' logs/dcwu-dispatch.jsonl | \
  paste - - | \
  awk '{split($1, a, "-"); month=a[1]"-"a[2]; status=$NF; month_status[month][status]++} END {for (m in month_status) print m, "Success:", month_status[m]["success"], "Failed:", month_status[m]["failed"]}'
```

Expected: 100% success rate for healthy configuration

### Average Response Time

The cron endpoint typically completes in 100-500ms:
- SMTP connection: ~50ms
- Email send: ~200ms
- Logging: ~50ms
- Total: ~300ms

---

## Archiving & Retention

### Keep Active Log

`logs/dcwu-dispatch.jsonl` should grow indefinitely (one line per week = 52 lines/year).

**Estimated Growth:**
- Lines per year: 52 (one Friday per week)
- Bytes per line: ~250 bytes
- Annual size: ~13 KB
- No archival needed for 5+ years

### Archive Old Records (Optional)

Every 12 months, optionally archive to dated file:

```bash
# Archive 2026 records to dated file
grep '2026-' logs/dcwu-dispatch.jsonl > logs/dcwu-dispatch-2026.jsonl.archive

# Clear main log (optional, but keep for ongoing)
# Don't actually clear unless you have backup
```

---

## Integration with Monitoring

### Slack Notification (Future)

Auto-post weekly send status to Slack:

```javascript
// In cron endpoint, after logging:
const slackWebhook = process.env.SLACK_WEBHOOK_URL;
if (result.status === 'success') {
  fetch(slackWebhook, {
    method: 'POST',
    body: JSON.stringify({
      text: `✅ DCWU sent to ${process.env.DCWU_RECIPIENT}`
    })
  });
}
```

### Email Delivery Tracking (Future)

Integrate with:
- **SendGrid** (includes bounce/open tracking)
- **Google Analytics** (track email opens via pixel)
- **Mailgun** (advanced tracking API)

Currently, we only track send success via SMTP response.

---

## Sample Log Extract

Here's what the first few weeks of logs might look like:

```jsonl
{"timestamp":"2026-03-28T14:00:00.000Z","dayOfWeek":"Friday","recipient":"tim.ryan@pro-tel.com","subject":"DCWU: Northeast Infrastructure Opportunity","messageId":"<CAK7L8c7X8z9a@mail.gmail.com>","status":"success","error":null}
{"timestamp":"2026-04-04T14:00:00.000Z","dayOfWeek":"Friday","recipient":"tim.ryan@pro-tel.com","subject":"DCWU: Power Constraints Drive Market Stratification","messageId":"<CAK7L8c7X8z9b@mail.gmail.com>","status":"success","error":null}
{"timestamp":"2026-04-11T14:00:00.000Z","dayOfWeek":"Friday","recipient":"tim.ryan@pro-tel.com","subject":"DCWU: Hyperscaler Expansion Accelerates Northeast Demand","messageId":"<CAK7L8c7X8z9c@mail.gmail.com>","status":"success","error":null}
```

---

## Reporting

### Weekly Report Template

Create a weekly report (optional):

```markdown
# DCWU Week of [DATE] — Delivery Report

**Send Timestamp:** [timestamp]  
**Recipient:** tim.ryan@pro-tel.com  
**Subject:** [subject]  
**Status:** ✅ Success  
**Message ID:** [messageId]  

**Email Verified Received:** Yes/No  
**Any Issues:** None

---
```

---

## References

- **Log File:** `logs/dcwu-dispatch.jsonl`
- **Cron Endpoint:** `/api/cron/dcwu-send-email.js`
- **Cron Setup:** `DCWU_CRON_SETUP.md`
- **SMTP Config:** `DCWU_SMTP_CONFIG.md`

---

**Last Updated:** March 22, 2026  
**Log Creation:** Automated (started first send)  
**Review Frequency:** Weekly (every Friday)
