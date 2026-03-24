# DCWU Automation: One-Page Reference Card

**Print this. Keep it handy.**

---

## What Is This?

Automated weekly emails every Friday @ 9 AM EST. No manual work after deployment.

---

## Deploy in 30 Minutes

### Step 1: Gmail App Password (5 min)
```
1. Go: https://myaccount.google.com/apppasswords
2. Select: Mail + macOS
3. Copy: 16-char password
```

### Step 2: Vercel Environment Variables (5 min)
Add to Vercel dashboard Settings → Environment Variables:
```
GMAIL_USER              f5zothoi@gmail.com
GMAIL_PASSWORD          [16-char password] ← Mark Sensitive!
MAIL_FROM               lucy@elevationaiagents.com
DCWU_RECIPIENT          tim.ryan@pro-tel.com
DCWU_CONTENT_PATH       /Users/timothyryan/.openclaw/workspace/DCWU_FIRST_EMAIL_DRAFT.md
```

### Step 3: Deploy (15 min)
```bash
mkdir -p api/cron
cp /Users/timothyryan/.openclaw/workspace/api/cron/dcwu-send-email.js api/cron/

# Edit vercel.json, add:
{
  "crons": [
    {
      "path": "/api/cron/dcwu-send-email",
      "schedule": "0 14 * * 5"
    }
  ]
}

git add .
git commit -m "feat: Add DCWU automated email"
git push origin main
```

### Step 4: Test (5 min)
```
Vercel Dashboard → Functions → /api/cron/dcwu-send-email → Run
Check inbox: Should receive test email
```

---

## Ongoing (Every Friday)

```bash
# 9:00 AM — Cron triggers automatically
# 9:05 AM — Check logs:
tail -1 logs/dcwu-dispatch.jsonl | jq '.status'

# Should show: "success"
# Email should be in Tim's inbox
# Done!
```

---

## If Something Breaks

| Issue | Fix |
|-------|-----|
| Email not sending | Regenerate Gmail App Password, update Vercel |
| Cron not triggering | Check Vercel dashboard (is cron enabled?) |
| Wrong recipient | Update DCWU_RECIPIENT env var |

---

## Key Files

| File | Purpose |
|------|---------|
| `README_DCWU_AUTOMATION.md` | Overview |
| `DCWU_QUICK_START.md` | Quick deployment |
| `DCWU_DEPLOYMENT_GUIDE.md` | Full instructions |
| `DCWU_SMTP_CONFIG.md` | Email issues |
| `DCWU_DISPATCH_LOG.md` | Log questions |

---

## Schedule

- **Friday 3/28 @ 9 AM:** First automatic email
- **Every Friday @ 9 AM:** Repeat
- **Total effort:** 30 min deployment + 5 min/week monitoring

---

## Tech Stack

- **Trigger:** Vercel cron
- **Code:** Node.js serverless function
- **Email:** Gmail SMTP relay
- **Logging:** JSONL text file
- **Cost:** Free

---

## Status

✅ Code complete  
✅ Documentation complete  
✅ Ready to deploy  
✅ Go live Friday 3/28  

---

**That's it. Questions? See full docs.**
