# Data Center Weekly Update - Quick Start (5 Minutes)

**TL;DR:** Get professional data center market intelligence emails every Friday at 9 AM.

---

## The 5-Minute Setup

### 1️⃣ Get Gmail App Password (2 minutes)

Go to https://myaccount.google.com/security → App passwords → Select Mail + Mac → Copy password

### 2️⃣ Configure .env (1 minute)

```bash
nano /Users/timothyryan/.openclaw/workspace/dc-weekly-update/.env
```

Replace:
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

Save: `Ctrl+X` → `Y` → `Enter`

### 3️⃣ Test It Works (1 minute)

```bash
cd /Users/timothyryan/.openclaw/workspace/dc-weekly-update
npm run send:test
```

Check your email inbox → you should see the test email within 10 seconds ✅

### 4️⃣ Install Automation (1 minute)

```bash
cp com.pro-tel.dc-weekly-update.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.pro-tel.dc-weekly-update.plist
```

Done! ✅ Every Friday at 9 AM, you'll get an email with curated data center market intelligence.

---

## 📧 What You'll Get

**Every Friday @ 9:00 AM EST:**

- 📊 **7 Key Market Developments** — Data center news from NY/NJ/PA
- 📈 **Market Trends** — What's moving in the Northeast
- 🏗️ **Construction Projects** — New builds and expansions
- 💰 **Investment Angles** — Capital flows and opportunities
- 🏢 **Competitive Landscape** — Who's building where
- 📋 **Professional Design** — Clean, readable HTML email

Recipient: tim.ryan@pro-tel.com  
From: lucy@elevationaiagents.com

---

## 🎯 That's It!

The system handles everything automatically:
- ✅ Collects market intelligence daily
- ✅ Synthesizes insights weekly
- ✅ Generates professional HTML email
- ✅ Sends every Friday at 9 AM
- ✅ Logs everything for tracking

---

## 🛠️ Common Tasks

### View This Week's Draft Email

```bash
cd /Users/timothyryan/.openclaw/workspace/dc-weekly-update
npm run generate
open logs/draft-*.html
```

### Send Email Immediately (Testing)

```bash
npm run send
```

### Check if Scheduler is Active

```bash
launchctl list | grep dc-weekly
```

Expected output:
```
- 0 com.pro-tel.dc-weekly-update
```

(The `-` means it's waiting for Friday 9 AM)

### View Send History

```bash
cat logs/send-history.json
```

### See Live Logs

```bash
npm run logs
```

---

## ❓ Troubleshooting

**Email not arriving?**
```bash
npm run send:test
```

If test email works, production will work too.

**Scheduler not running?**
```bash
# Reload it
launchctl unload ~/Library/LaunchAgents/com.pro-tel.dc-weekly-update.plist
launchctl load ~/Library/LaunchAgents/com.pro-tel.dc-weekly-update.plist

# Check it loaded
launchctl list | grep dc-weekly
```

**Want to test early?**
```bash
# Trigger manually
launchctl start com.pro-tel.dc-weekly-update

# Watch what happens
tail -f logs/dc-weekly-*.log
```

---

## 📚 Learn More

- **README.md** — Full documentation
- **SETUP.md** — Detailed deployment guide
- **DEPLOYMENT_CHECKLIST.md** — Complete checklist

---

## 🚀 You're Done!

Your automated data center market intelligence system is live.

- Every Friday 9 AM: Professional email arrives
- Zero maintenance
- Professional design
- Northeast market focus (NY/NJ/PA)

Questions? Check the troubleshooting section or read the full README.

Enjoy your data center insights! 📊
