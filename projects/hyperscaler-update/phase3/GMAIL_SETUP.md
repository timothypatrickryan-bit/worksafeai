# GMAIL_SETUP.md — Email Delivery Configuration

**Purpose:** Step-by-step guide to configure Gmail SMTP for the briefing automation  
**SMTP Server:** smtp.gmail.com (Gmail)  
**Required:** Gmail account + app password (NOT your regular password)  
**Last Updated:** March 23, 2026

---

## 🎯 Quick Summary

To send emails via Gmail:

1. Enable 2-factor authentication on your Gmail account
2. Generate a "Gmail app password"
3. Add credentials to environment variables
4. Test SMTP connection

**Time required:** 5–10 minutes  
**Cost:** Free

---

## 📋 Prerequisites

- Gmail account (or any Google account with Gmail enabled)
- Access to Gmail security settings
- Ability to enable 2-factor authentication
- Terminal access

---

## Step-by-Step Setup

### Step 1: Enable 2-Factor Authentication (If Not Already Enabled)

Gmail requires 2-factor authentication before you can generate app passwords.

1. Go to **Google Account settings:** https://myaccount.google.com/
2. Click **"Security"** in the left sidebar
3. Scroll to **"How you sign in to Google"** section
4. Click **"2-Step Verification"**
5. Follow the prompts to enable 2FA (use your phone)
6. Once enabled, you'll see a green checkmark

**Note:** This is required for all Gmail SMTP access. You won't be able to use app passwords without 2FA enabled.

---

### Step 2: Generate Gmail App Password

Once 2FA is enabled, you can create an "app password" specifically for the briefing automation.

1. Go to **Google Account settings:** https://myaccount.google.com/
2. Click **"Security"** in the left sidebar
3. Scroll to **"How you sign in to Google"** → **"App passwords"**
4. You may need to sign in again (verify your identity)
5. Select **"Mail"** and **"Windows Computer"** (or any non-Gmail application)
6. Google will generate a 16-character app password
7. **Copy this password** — you'll use it in the next step

**Example app password:** `abcd efgh ijkl mnop` (16 characters with space)

**Important:** This is a unique, single-use password. You won't see it again, so save it somewhere safe or complete Step 3 immediately.

---

### Step 3: Add Credentials to Environment

Add Gmail SMTP credentials to your shell configuration so the briefing automation can access them.

#### Option A: Add to ~/.zshrc (Recommended)

Open your shell configuration file:

```bash
nano ~/.zshrc
```

Add these lines at the end:

```bash
# Hyperscaler Update — Gmail SMTP Configuration
export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USER="your-gmail@gmail.com"
export SMTP_PASSWORD="abcd efgh ijkl mnop"
export FROM_EMAIL="lucy@elevationaiagents.com"
export FROM_NAME="Hyperscaler Update"
export RECIPIENT_EMAIL="tim@work-email.com"
```

**Replace:**
- `your-gmail@gmail.com` with your actual Gmail address
- `abcd efgh ijkl mnop` with the app password you generated
- `tim@work-email.com` with Tim's work email address

Save the file (Ctrl+X, then Y, Enter).

Reload your shell:

```bash
source ~/.zshrc
```

#### Option B: If Using Bash

If you use bash instead of zsh:

```bash
nano ~/.bash_profile
```

Add the same lines, then reload:

```bash
source ~/.bash_profile
```

**To check which shell you're using:**
```bash
echo $SHELL
```

---

### Step 4: Verify Credentials Are Set

Check that environment variables are configured correctly:

```bash
# Should output your Gmail address
echo $SMTP_USER

# Should output your app password
echo $SMTP_PASSWORD

# Should output Tim's email
echo $RECIPIENT_EMAIL
```

If any are empty, go back to Step 3 and verify you edited the correct file.

---

### Step 5: Test SMTP Connection

Verify Gmail SMTP accepts your credentials:

```bash
cd /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3

# Install nodemailer if not already installed
npm install nodemailer

# Test SMTP connection
node email-delivery.js --verify
```

**Expected output:**
```
[timestamp] [INFO] SMTP connection verified successfully
[timestamp] [INFO] Logs saved to: /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/logs/delivery.log
✅ SMTP verification successful
Host: smtp.gmail.com:587
```

**If verification fails, see Troubleshooting below.**

---

### Step 6: Send Test Email

Once SMTP verification succeeds, send a test email:

```bash
cd /Users/timothyryan/.openclaw/workspace/projects/hyperscaler-update/phase3

# Send test email
node email-delivery.js --test
```

**Expected output:**
```
[timestamp] [INFO] Sending test email...
[timestamp] [INFO] Test email sent successfully: <message-id@gmail.com>
[timestamp] [INFO] Logs saved to: ...
✅ Test email sent successfully
Message ID: <message-id@gmail.com>
```

**Check Tim's inbox:** You should receive a test email from `Hyperscaler Update <lucy@elevationaiagents.com>` within 1–2 minutes.

If the email doesn't arrive, check spam folder. Once verified, Gmail should recognize future emails as legitimate.

---

## 🔧 Troubleshooting

### Issue: "SMTP verification failed: 535 Invalid credentials"

**Problem:** Username or password is incorrect.

**Solution:**
1. Double-check Gmail address: `echo $SMTP_USER`
2. Verify app password is correct (copy from Google Account settings again)
3. Make sure it's an **app password**, NOT your regular Gmail password
4. Update environment variables: `nano ~/.zshrc`
5. Reload: `source ~/.zshrc`
6. Test again: `node email-delivery.js --verify`

---

### Issue: "SMTP verification failed: 534 Application-specific password required"

**Problem:** You're using your regular Gmail password instead of an app password.

**Solution:**
1. Go to https://myaccount.google.com/security
2. Scroll to **"App passwords"**
3. Generate a new app password (16 characters)
4. Update `SMTP_PASSWORD` in ~/.zshrc
5. Reload shell: `source ~/.zshrc`
6. Test: `node email-delivery.js --verify`

---

### Issue: "SMTP verification failed: No response code received"

**Problem:** Network connectivity issue or Gmail SMTP server temporarily unavailable.

**Solution:**
1. Check internet connection: `ping -c 2 gmail.com`
2. Check SMTP host and port: `echo $SMTP_HOST && echo $SMTP_PORT`
3. Wait a few minutes and try again
4. Test with: `node email-delivery.js --verify`

---

### Issue: Test Email Sent But Not Appearing in Inbox

**Problem:** Email was sent successfully but not visible in recipient's inbox.

**Solution:**
1. Check spam folder (Gmail's filters might flag unfamiliar senders)
2. Create an email filter to mark future emails as trusted:
   - In Gmail, search for `from:lucy@elevationaiagents.com`
   - Click the three dots (⋯)
   - Select "Create filter"
   - Check "Never send to spam"
3. Mark the sender as "Not spam"
4. Wait 5 minutes and send another test: `node email-delivery.js --test`

---

### Issue: "SMTP verification failed: 453 Too many login attempts"

**Problem:** Too many failed authentication attempts. Gmail temporarily blocked access.

**Solution:**
1. Wait 5–10 minutes before trying again
2. Go to https://myaccount.google.com/security
3. Check for "unusual activity" alerts
4. Scroll down and click "Allow less secure apps" or review app passwords
5. Try again: `node email-delivery.js --verify`

---

### Issue: "SMTP Host: localhost" (Wrong Configuration)

**Problem:** Environment variables didn't load, defaults are being used.

**Solution:**
1. Verify you're in the right directory: `pwd` should be phase3
2. Check environment variables: `echo $SMTP_HOST` should be `smtp.gmail.com`
3. Reload shell: `source ~/.zshrc`
4. Try again: `node email-delivery.js --verify`

---

## 🔐 Security Notes

### App Passwords vs. Regular Passwords

- **App password:** Unique, single-use token generated specifically for the briefing automation
- **Regular password:** Your Gmail login password (never share this)

**Why use app passwords?**
- Safer: If compromised, attacker can only send emails via the automation (not access Gmail)
- Revocable: Delete the app password at any time to revoke automation access
- Limited scope: App password can only be used for SMTP, not Gmail access

### Protecting Your App Password

1. **Store in environment variables** (not in code)
2. **Use shell configuration file** (~/.zshrc) — not version controlled
3. **Don't share** SMTP_PASSWORD in emails, messages, or code
4. **Revoke if compromised:** Go to Google Account → App passwords → delete it

### If Password Is Compromised

1. Go to https://myaccount.google.com/security
2. Click "App passwords"
3. Delete the compromised app password
4. Generate a new one
5. Update environment variables: `nano ~/.zshrc`
6. Reload: `source ~/.zshrc`

---

## 📝 Gmail SMTP Reference

**SMTP Server Details:**
- **Host:** smtp.gmail.com
- **Port:** 587 (TLS) or 465 (SSL)
- **Current setup uses:** Port 587 (TLS)
- **Authentication:** Username (Gmail address) + app password

**Alternative Providers:**

If you want to use a different email provider instead of Gmail:

| Provider | SMTP Host | Port | Notes |
|----------|-----------|------|-------|
| Gmail | smtp.gmail.com | 587 | Uses app password |
| Microsoft 365 | smtp.office365.com | 587 | Uses regular email password |
| SendGrid | smtp.sendgrid.net | 587 | Requires API key |
| Mailgun | smtp.mailgun.org | 587 | Requires API key |

To switch providers, update SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD in ~/.zshrc.

---

## ✅ Verification Checklist

Before deploying the briefing automation, verify:

- [ ] 2-factor authentication enabled on Gmail account
- [ ] App password generated and copied
- [ ] Environment variables added to ~/.zshrc
- [ ] Shell reloaded: `source ~/.zshrc`
- [ ] Environment variables confirmed: `echo $SMTP_USER`
- [ ] SMTP verification passed: `node email-delivery.js --verify`
- [ ] Test email delivered to inbox: `node email-delivery.js --test`
- [ ] Test email visible in Tim's inbox
- [ ] No spam folder issues (create filter if needed)

Once all checkboxes are complete, proceed to DEPLOYMENT.md Step 6 (Install LaunchAgent).

---

## 📞 Support

- **Setup issues:** This file (GMAIL_SETUP.md)
- **Deployment steps:** DEPLOYMENT.md
- **Daily operations:** OPERATIONS.md
- **Scheduling:** SCHEDULE.md

---

**You're ready!** Once SMTP verification succeeds, the briefing automation is ready to deploy.

Next step: See DEPLOYMENT.md Step 6 to install the LaunchAgent job.
