# DCWU Automation: Quick Start

**Deploy in 5 minutes** (assumes Vercel project exists)

---

## Deployment (5 minutes)

### 1. Get Gmail App Password

1. Go: https://myaccount.google.com/apppasswords
2. Select Mail + your device
3. Copy 16-character password

### 2. Add to Vercel

Vercel Dashboard → API Project → Settings → Environment Variables

```
GMAIL_USER              f5zothoi@gmail.com
GMAIL_PASSWORD          [paste 16-char] ← Mark Sensitive!
MAIL_FROM               lucy@elevationaiagents.com
DCWU_RECIPIENT          tim.ryan@pro-tel.com
DCWU_CONTENT_PATH       /Users/timothyryan/.openclaw/workspace/DCWU_FIRST_EMAIL_DRAFT.md
```

### 3. Copy Endpoint Code

```bash
mkdir -p api/cron
cp /Users/timothyryan/.openclaw/workspace/api/cron/dcwu-send-email.js api/cron/
```

### 4. Add Cron Config

Add to `vercel.json`:

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

### 5. Deploy

```bash
git add .
git commit -m "feat: Add DCWU automated email"
git push origin main
```

### 6. Test

Vercel Dashboard → Functions → `/api/cron/dcwu-send-email` → **Run**

Verify:
- ✅ Response shows `"success": true`
- ✅ Email arrives in inbox (tim.ryan@pro-tel.com)

---

## First Send

**Friday, March 28 @ 9 AM EST:** First email automatically sends

No manual work needed. Vercel handles it.

---

## Weekly Cadence

```
Thursday EOD:  Steven drafts new email
Friday 9 AM:   Cron sends automatically
Friday 9:15 AM: Lucy verifies delivery
```

---

## Monitor

```bash
# Check dispatch log
tail logs/dcwu-dispatch.jsonl | jq '.'

# Should show status: "success"
```

---

## Troubleshoot

| Issue | Fix |
|-------|-----|
| Email not sending | Check GMAIL_PASSWORD in Vercel |
| Auth failed | Regenerate App Password, update Vercel |
| Content missing | Check DCWU_CONTENT_PATH exists |

---

## Docs

| Need | Read |
|------|------|
| Full setup | DCWU_DEPLOYMENT_GUIDE.md |
| Cron details | DCWU_CRON_SETUP.md |
| Email config | DCWU_SMTP_CONFIG.md |
| Logs | DCWU_DISPATCH_LOG.md |

---

**Status:** ✅ Production Ready  
**Estimated Deployment:** 5 minutes  
**Go-Live:** Friday, March 28, 2026

---

That's it. Deploy it. You're done.
