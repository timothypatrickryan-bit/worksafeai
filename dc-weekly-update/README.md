# Data Center Weekly Update

Professional market intelligence automation for the Northeast data center ecosystem (NY/NJ/PA).

**What it does:** Every Friday at 9 AM EST, generates and sends a curated email with the week's top data center construction news, market trends, investment angles, and competitive landscape intelligence.

---

## 📋 Quick Start

### 1. Install Dependencies

```bash
cd /Users/timothyryan/.openclaw/workspace/dc-weekly-update
npm install
```

### 2. Configure Email

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then update `.env` with your Gmail credentials:

```bash
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx  # 16-char app password
EMAIL_TO=tim.ryan@pro-tel.com
```

**How to get Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Factor Authentication if needed
3. Scroll to "App passwords" → Select "Mail" + "Mac"
4. Copy the 16-character password into `.env`

### 3. Test Generate Email

```bash
npm run generate
```

Output: `logs/draft-YYYY-MM-DD.html` — open in browser to preview.

### 4. Test Send Email

```bash
npm run test
```

Sends a test email to the address in `EMAIL_TEST_TO` (.env).

### 5. Install Scheduler (launchd)

```bash
# Copy plist to launchd directory
cp com.pro-tel.dc-weekly-update.plist ~/Library/LaunchAgents/

# Load the job
launchctl load ~/Library/LaunchAgents/com.pro-tel.dc-weekly-update.plist

# Verify it's loaded
launchctl list | grep dc-weekly
```

---

## 🚀 Usage

### Generate Only (No Email)

```bash
npm run generate
```

Creates an HTML draft in `logs/` for manual review.

### Generate & Send to Test Recipient

```bash
npm run send:test
```

Sends to `EMAIL_TEST_TO` to verify everything works.

### Generate & Send to Production

```bash
npm run send
```

Sends to `EMAIL_TO` (tim.ryan@pro-tel.com). Used by launchd scheduler.

### View Logs

```bash
npm run logs
```

Tail all log files in real-time.

---

## 📁 File Structure

```
dc-weekly-update/
├── scripts/
│   └── dc-weekly-update.js        # Main generator & mailer
├── templates/
│   └── dc-weekly-email.html       # HTML email template
├── data/
│   ├── dc-sources.json            # Data sources & mock data
│   └── collected-data.json        # Stored weekly insights (optional)
├── logs/
│   ├── dc-weekly-YYYY-MM-DD.log   # Daily activity logs
│   ├── draft-YYYY-MM-DD.html      # Generated email drafts
│   ├── launchd-stdout.log         # launchd output
│   ├── launchd-stderr.log         # launchd errors
│   └── send-history.json          # Send event tracking
├── .env                            # Configuration (secrets)
├── .env.example                    # Config template
├── package.json                    # Dependencies
├── README.md                       # This file
└── com.pro-tel.dc-weekly-update.plist  # launchd scheduler
```

---

## ⚙️ Configuration (.env)

```bash
# Gmail SMTP
GMAIL_SMTP_HOST=smtp.gmail.com
GMAIL_SMTP_PORT=587
GMAIL_SMTP_SECURE=false
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# Email recipients
EMAIL_FROM=lucy@elevationaiagents.com
EMAIL_TO=tim.ryan@pro-tel.com
EMAIL_TEST_TO=lucy@elevationaiagents.com

# Data retention
DATA_RETENTION_DAYS=30
MOCK_DATA_ENABLED=true
```

---

## 📊 How It Works

### Data Collection (Currently Mock)

The system loads sample data from `data/dc-sources.json`. In production, you would:

1. **Scrape permit databases** (NYC DOB, NJ labor, PA real estate)
2. **Monitor industry news** (ColoSpace, DataCenterDynamics)
3. **Track real estate** (Redfin, LoopNet, Zillow)
4. **Deduplicate** and store in `data/collected-data.json`

### Weekly Synthesis

Every email includes:

- **7 Key Insights** — Highest-impact developments from the week
- **Market Themes** — Aggregated categories (trends, projects, investments, permits)
- **Summary Stats** — Quick overview of region activity
- **Professional Design** — Clean, branded HTML optimized for all email clients

### Email Template

The template in `templates/dc-weekly-email.html` includes:

- Dynamic placeholder replacement (`{{PLACEHOLDER}}`)
- Responsive design (mobile-friendly)
- Color-coded importance indicators
- Region and source metadata
- Call-to-action button
- Professional footer with compliance links

### Scheduling

`com.pro-tel.dc-weekly-update.plist` runs every Friday at 9:00 AM EST via macOS launchd.

---

## 🔧 Troubleshooting

### Email not sending?

```bash
# Check Gmail credentials
echo $GMAIL_USER
echo $GMAIL_APP_PASSWORD

# Test SMTP connection
node -e "
const nodemailer = require('nodemailer');
const t = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD }
});
t.verify().then(() => console.log('✅ Connected')).catch(e => console.error('❌', e.message));
"
```

### launchd not running?

```bash
# Check if job is loaded
launchctl list | grep dc-weekly

# Check for errors
cat ~/Library/LaunchAgents/com.pro-tel.dc-weekly-update.plist

# View job output
tail -f /Users/timothyryan/.openclaw/workspace/dc-weekly-update/logs/launchd-*.log

# Manually trigger the job (for testing)
launchctl start com.pro-tel.dc-weekly-update
```

### Email looks broken?

1. Open `logs/draft-YYYY-MM-DD.html` in a browser
2. Check template placeholders in `templates/dc-weekly-email.html`
3. Verify insight data in `data/dc-sources.json`

---

## 📧 Email Configuration Details

### SMTP (Gmail)

The system uses Gmail's SMTP relay. You need:

1. **Gmail account** with 2FA enabled
2. **App password** (16 characters, not your regular password)
3. **Less secure apps** disabled (use App Password instead)

### Sender Identity

All emails appear to come from: `lucy@elevationaiagents.com`

Configure in `.env`:

```bash
EMAIL_FROM=lucy@elevationaiagents.com
```

### Recipient Tracking

Each send is logged to `logs/send-history.json`:

```json
[
  {
    "timestamp": "2026-03-22T09:00:15.234Z",
    "recipient": "tim.ryan@pro-tel.com",
    "success": true,
    "messageId": "<abc123@gmail.com>",
    "error": null
  }
]
```

---

## 🎯 Next Steps

### Before Going Live

- [ ] Copy `.env.example` → `.env` and configure
- [ ] Run `npm install`
- [ ] Run `npm run test` and verify email arrives
- [ ] Review email design in `logs/draft-*.html`
- [ ] Copy launchd plist and load it
- [ ] Test scheduler manually: `launchctl start com.pro-tel.dc-weekly-update`

### To Make It Production-Ready

1. **Real data collection**: Implement web scrapers for permit databases and news sources
2. **Deduplication**: Add logic to prevent duplicate insights in weekly emails
3. **Archive system**: Store sent emails for historical reference
4. **Delivery tracking**: Log opens, clicks, and unsubscribes
5. **Multi-recipient**: Support multiple distribution lists
6. **Customization**: Allow per-recipient topic filtering

---

## 📝 Data Sources (Future Implementation)

Currently configured but not active (using mock data):

- **Permits**: NYC DOB, NJ Labor, PA Real Estate Commission
- **Industry News**: ColoSpace, DataCenterDynamics, Business Journals
- **Real Estate**: Redfin, Zillow, LoopNet (CoStar)
- **Regional**: Upstate NY Business, NJ Tech Council, PA Realtors

Add API keys in `.env` when ready to implement:

```bash
COLOSPACE_API_KEY=your-key
DATACENTERDYNAMICS_API_KEY=your-key
```

---

## 📞 Support

For issues or questions:

- Check `logs/dc-weekly-YYYY-MM-DD.log` for errors
- Review `logs/send-history.json` for delivery status
- Verify `.env` configuration matches `.env.example`

---

## License

MIT — Built with ❤️ for Pro-Tel and the Northeast data center market.
