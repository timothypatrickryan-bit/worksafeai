# Zernio LinkedIn Automation Setup

## Account Configuration ✅

**Status:** Ready for Automation  
**API Key:** sk_211156c59836adee0f77d6f9bd471ede9dfc827bb5da4aa2eae7a5acf6c0c2c6  
**LinkedIn Account ID:** 69cf1a7439fec1d579eb91c5  
**Dashboard:** https://zernio.com/dashboard

---

## ⚠️ MANUAL SETUP REQUIRED

Zernio is a **managed service platform**, not a self-serve API for direct automation. To post via Zernio:

### Step 1: Use Zernio Dashboard (Not Direct API)
1. Go to **https://zernio.com/dashboard**
2. Sign in with your Zernio account
3. Navigate to **"Connected Accounts"** → **LinkedIn**
4. Select your LinkedIn account (ID: `69cf1a7439fec1d579eb91c5`)

### Step 2: Create Posts Manually
1. Click **"Create Post"**
2. Copy your generated post content (from `.linkedin-post-2026-04-02.txt`)
3. Paste into Zernio dashboard
4. Click **"Schedule"** or **"Post Now"**

### Step 3: Schedule Multiple Posts
Repeat Step 2 for any additional posts you want to schedule.

---

## Environment Variables

For reference, save these in your shell profile or `.env`:

```bash
export ZERNIO_API_KEY="sk_211156c59836adee0f77d6f9bd471ede9dfc827bb5da4aa2eae7a5acf6c0c2c6"
export ZERNIO_LINKEDIN_ACCOUNT_ID="69cf1a7439fec1d579eb91c5"
export ZERNIO_DASHBOARD="https://zernio.com/dashboard"
```

---

## LinkedIn Writer Integration

**Current Workflow:**
1. LinkedIn Writer generates post file daily
2. Post saved to `.linkedin-post-YYYY-MM-DD.txt`
3. You copy to Zernio dashboard manually

**Scripts Available:**
- `scripts/zernio-post-to-linkedin.sh` — Helper script (shows readiness)

**Future Option:** If Zernio adds public API or webhook support, can automate fully.

---

## Dashboard Quick Links

- **Main:** https://zernio.com/dashboard
- **Accounts:** https://zernio.com/dashboard/accounts
- **Schedule:** https://zernio.com/dashboard/schedule
- **Analytics:** https://zernio.com/dashboard/analytics

---

## Why Manual?

Zernio's platform:
- ✅ Handles OAuth/authentication automatically
- ✅ Manages LinkedIn's strict rate limits
- ✅ Provides analytics & engagement tracking
- ✅ Offers content approval workflows
- ❌ Doesn't expose full REST API for automation (yet)

**Workaround:** Copy-paste workflow is simple for daily posts. If you need full automation, Postiz (already installed) has CLI support.

---

## See Also

- Postiz (alternative, already installed): `/Users/timothyryan/.openclaw/workspace/skills/postiz/`
- LinkedIn Writer: Generates posts daily @ 8 AM
- API Docs: https://docs.zernio.com (limited public API)
