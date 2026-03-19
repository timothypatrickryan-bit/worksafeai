# LinkedIn Posting Automation Setup

**Status:** Awaiting posting method decision  
**Generated:** March 14, 2026 @ 8:31 AM EST

---

## Schedule

**Frequency:** Tuesday, Thursday, Saturday @ 9:00 AM EST

**Post Sequence:**
1. Tuesday → Industry Insight
2. Thursday → Trending Topic
3. Saturday → Industry Insight
4. (Cycle repeats)

**Signature:** Lucy, Tim's AI Agent

---

## Implementation Path

### Option A: Manual Click-to-Post (Recommended)
```
Cron Job (9:00 AM) 
  → Generate post (trending/insight based on schedule)
  → Send to Telegram with one-click share button
  → You click → LinkedIn native app/web opens with pre-filled text
  → You hit Post (2 seconds)
```

**Advantages:**
- No API credentials needed
- Maintains editorial control
- Can tweak text before posting
- Works immediately

**Implementation:**
1. Create `linkedin-post-gen.js` script
2. Set up cron: `0 9 * * 2,4,6` (Tue, Thu, Sat)
3. Script generates + sends to Telegram

---

### Option B: Full Auto-Post via API
```
Cron Job (9:00 AM)
  → Generate post
  → Post directly to LinkedIn via API
  → Confirmation to Telegram
```

**Advantages:**
- Completely hands-free
- No manual posting needed
- Consistent timing

**Requirements:**
- LinkedIn API access token
- OAuth setup for tim.ryan@pro-tel.com account
- Credentials stored in `.env` (never committed)

**Implementation:**
1. Get OAuth credentials from LinkedIn
2. Create `linkedin-post-gen.js` with API integration
3. Set up cron job
4. Test posting flow

---

## Files Needed

Once method is decided:

1. **linkedin-post-gen.js** — Post generation script
   - Alternates between Insight/Trending based on day
   - Pulls latest industry news/trends
   - Generates 2-3 paragraph post
   - Includes "Lucy, Tim's AI Agent" signature

2. **Cron config** — Schedule execution
   - Time: 9:00 AM EST, Tue/Thu/Sat
   - Method: GitHub Actions, system cron, or OpenClaw cron

3. **.env variables** — Credentials
   - LinkedIn API token (if Option B)
   - Telegram bot token (if Option A)

---

## Next Steps

**Decision:** Option A or Option B?

Once chosen:
1. Create generation script
2. Set up cron schedule
3. Generate first test post
4. Verify posting works
5. Enable recurring automation

---

## Testing Checklist

- [ ] Script generates correct post format (2-3 paragraphs)
- [ ] Signature includes "Lucy, Tim's AI Agent"
- [ ] Alternation pattern correct (Insight → Trending → Insight)
- [ ] Time zone correct (9:00 AM EST)
- [ ] Post delivers/posts successfully
- [ ] First 3 test posts reviewed before enabling recurring cycle
