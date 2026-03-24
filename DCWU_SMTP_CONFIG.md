# DCWU SMTP Configuration Guide

**Status:** ✅ Configured | **Provider:** Gmail | **Updated:** March 22, 2026

---

## Email Service Configuration

### Overview

DCWU emails are sent via Gmail's SMTP relay using a dedicated account. This ensures:
- Professional delivery from `lucy@elevationaiagents.com`
- High deliverability (Gmail is trusted)
- Automatic retry on transient failures
- SPF/DKIM compliance (Gmail handles it)

---

## SMTP Server Details

### Connection Settings

```
SMTP Server:   smtp.gmail.com
SMTP Port:     587 (STARTTLS - preferred)
              or 465 (SSL - alternative)
Security:      STARTTLS (recommended) or SSL
Username:      f5zothoi@gmail.com
Password:      [Gmail App-Specific Password]
```

### TLS/SSL Configuration

**Recommended:** Port 587 with STARTTLS
- Initiates unencrypted connection, then upgrades to TLS
- More compatible with firewalls/proxies
- Standard for modern email

**Alternative:** Port 465 with SSL
- Full encryption from start
- Slightly more secure but less common

---

## Gmail Account Setup

### Primary Account Details

| Setting | Value |
|---------|-------|
| Gmail Account | f5zothoi@gmail.com |
| Display Name | Lucy (optional, set in headers) |
| From Address | lucy@elevationaiagents.com |
| Recovery Email | tim.ryan@pro-tel.com |

### App-Specific Password (Required)

Gmail requires an app-specific password (not your main account password) for:
- SMTP relay
- IMAP access
- Third-party applications

**Generate New App Password:**

1. Go to Google Account: https://myaccount.google.com/security
2. Scroll to "Your devices" section
3. Click "App passwords"
4. Select:
   - App: Mail
   - Device: macOS (or your environment)
5. Click "Generate"
6. Google displays a 16-character password (format: `xxxx xxxx xxxx xxxx`)
7. Copy and paste into `GMAIL_PASSWORD` env var in Vercel

**⚠️ Important:**
- Each app/device gets a unique password
- Password is shown ONCE—copy immediately
- Never share or commit this password to git
- If lost, delete and generate a new one

**For Vercel Deployment:**

```bash
# In Vercel dashboard for API project:
# Settings → Environment Variables → New

Name:  GMAIL_PASSWORD
Value: [paste 16-char password without spaces]
```

---

## Cloudflare Email Routing (Incoming)

DCWU uses Cloudflare Email Routing to handle incoming mail:

```
lucy@elevationaiagents.com
  ↓ (via Cloudflare Email Routing)
  ↓
f5zothoi@gmail.com (inbox)
```

**Setup Status:** ✅ Configured (March 16, 2026)

**Verify:**
1. Go to Cloudflare Dashboard: https://dash.cloudflare.com
2. Select domain: elevationaiagents.com
3. Navigate to: Email → Email Routing
4. Confirm rule: lucy → f5zothoi@gmail.com

**To Send from lucy@elevationaiagents.com:**
- Use Gmail SMTP relay with f5zothoi@gmail.com credentials
- Set `From:` header to lucy@elevationaiagents.com (MAIL_FROM env var)
- Gmail's SMTP relay respects this and allows spoofing for verified domains

---

## Email Headers Configuration

### Required Headers

DCWU cron sets these headers automatically:

```
From:          lucy@elevationaiagents.com
To:            tim.ryan@pro-tel.com
Reply-To:      lucy@elevationaiagents.com
Subject:       [dynamic from email content]
X-Mailer:      DCWU Automation
X-Campaign:    DCWU-Weekly
X-Sent-By:     Lucy AI Agent Orchestrator
```

### SPF/DKIM/DMARC

Gmail automatically signs emails with:
- **SPF:** gmail.com SPF record
- **DKIM:** Google's DKIM signature
- **DMARC:** Aligned with gmail.com

This means:
✅ Emails are cryptographically verified  
✅ Gmail's reputation = high deliverability  
✅ Unlikely to hit spam folder  

---

## Environment Variables

### Vercel API Project Configuration

Set these in Vercel dashboard → Settings → Environment Variables:

| Variable | Value | Type |
|----------|-------|------|
| `GMAIL_USER` | f5zothoi@gmail.com | Plaintext |
| `GMAIL_PASSWORD` | [App Password] | **Sensitive** |
| `MAIL_FROM` | lucy@elevationaiagents.com | Plaintext |
| `DCWU_RECIPIENT` | tim.ryan@pro-tel.com | Plaintext |
| `DCWU_CONTENT_PATH` | `/workspace/DCWU_*.md` | Plaintext |

**Sensitive Variables:** Check the "Sensitive" checkbox for `GMAIL_PASSWORD` so it's encrypted in transit.

---

## Testing Email Configuration

### Test 1: SMTP Connectivity

```javascript
// Quick Node.js test
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'f5zothoi@gmail.com',
    pass: process.env.GMAIL_PASSWORD
  }
});

transporter.verify((err, valid) => {
  if (err) {
    console.log('SMTP Error:', err);
  } else {
    console.log('✅ SMTP connection successful');
  }
});
```

### Test 2: Send Test Email

```bash
# Via Vercel cron endpoint (after deployment)
curl -X POST https://your-api-domain.com/api/cron/dcwu-send-email

# Response should be:
# {
#   "success": true,
#   "message": "DCWU email sent successfully",
#   "data": {...}
# }
```

### Test 3: Check Delivery

1. Check Tim's inbox: tim.ryan@pro-tel.com
2. Verify email came from: lucy@elevationaiagents.com
3. Check headers in email client (usually View → Message Source)
4. Confirm X-Mailer and X-Campaign headers are present

---

## Troubleshooting SMTP Issues

### Authentication Failed (535 5.7.8)

**Cause:** Incorrect or expired App Password

**Fix:**
1. Regenerate App Password in Google Account:
   - https://myaccount.google.com/security → App passwords
   - Delete old password, generate new one
2. Update `GMAIL_PASSWORD` in Vercel
3. Retry

### Connection Refused

**Cause:** Port 587 blocked by firewall, or network issue

**Fix:**
- Try port 465 (SSL) instead of 587 (STARTTLS)
- Check if Vercel functions can reach external SMTP (usually yes)
- Verify GMAIL_USER and GMAIL_PASSWORD are set

### Message Not Appearing in Inbox

**Cause:** Likely spam folder or delivery issue

**Fix:**
1. Check Tim's spam/junk folder
2. View email headers to see delivery path
3. Check Gmail deliverability in Google Workspace admin (if applicable)
4. Enable "Less secure app access" if it's a Gmail setting (should be off for App Passwords)

### Wrong "From" Address

**Cause:** MAIL_FROM env var not set, or transporter.from not configured

**Fix:**
1. Verify `MAIL_FROM=lucy@elevationaiagents.com` in Vercel
2. Verify cron endpoint sets `from: process.env.MAIL_FROM`
3. Test with hardcoded value first, then switch to env var

---

## Security Best Practices

### Password Storage

✅ **DO:**
- Store App Password in Vercel as Sensitive env var
- Regenerate App Password quarterly
- Use different App Passwords for different apps

❌ **DON'T:**
- Commit password to git repository
- Share password in email or Slack
- Use main Gmail password for SMTP
- Hardcode password in code

### Credential Rotation

**Schedule:**
- App Password: Rotate every 3-6 months
- Vercel env var: Update immediately after rotation

**Process:**
1. Generate new App Password in Google Account
2. Update Vercel `GMAIL_PASSWORD` env var
3. Verify with test send
4. Delete old App Password from Google Account

### Access Control

- Only Tim has write access to Vercel project
- Only Tim can view sensitive env vars
- GitHub has no secrets (all in Vercel)

---

## Advanced Configuration

### Multiple Recipients (Future)

To send to multiple email addresses:

```javascript
to: [
  'tim.ryan@pro-tel.com',
  'other.recipient@company.com'
].join(',')
```

### CC/BCC (Future)

```javascript
cc: 'cc@example.com',
bcc: 'archive@example.com'
```

### Custom SMTP (If Needed)

For higher volume, consider:
- SendGrid (higher limits, better API)
- AWS SES (very cheap at scale)
- Mailgun (advanced tracking)

Replace nodemailer transport config accordingly.

---

## References

- **Endpoint Code:** `/api/cron/dcwu-send-email.js`
- **Vercel Env Vars:** https://vercel.com/docs/environment-variables
- **Gmail SMTP Setup:** https://support.google.com/accounts/answer/185833
- **Nodemailer Docs:** https://nodemailer.com/
- **App Passwords:** https://myaccount.google.com/apppasswords

---

**Last Updated:** March 22, 2026  
**Tested:** ✅ (before deployment)  
**Production Status:** ✅ Ready to deploy
