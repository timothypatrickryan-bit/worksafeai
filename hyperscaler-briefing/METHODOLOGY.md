# Research Methodology - Hyperscaler Infrastructure Daily Briefing

**Version:** 1.0  
**Last Updated:** March 23, 2026  
**Owner:** Scout (Research Specialist)  

---

## 1. DAILY RESEARCH CADENCE

### Morning Scan (Primary - 6:00-8:00 AM EST)
- Check all Tier 1 sources (DCK, Light Reading, Datacenter Dynamics, Fierce Telecom)
- Scan official blogs (AWS, Google, Meta, Azure)
- Skim TeleGeography blog for subsea updates
- **Output:** Identify 3-7 top stories by 8 AM

### Midday Check (Secondary - 12:00-1:00 PM EST)
- Tier 1 sources for breaking news
- Twitter/LinkedIn infrastructure hashtags (#datacenter #fiber #subsea)
- **Output:** Catch any urgent announcements

### Evening Review (Tertiary - 4:00-5:00 PM EST)
- Final pass on Tier 1 sources
- Tier 2 sources (Reuters, Bloomberg, Protocol weekly)
- **Output:** Daily briefing finalized

**Total Time Investment:** 60-90 minutes daily

---

## 2. SOURCE VERIFICATION PROTOCOL

### Trust Hierarchy

**Tier A (Primary Sources - 100% Confidence)**
- Official press releases from AWS, Google, Meta, Microsoft
- SEC filings (10-K, 8-K, proxy statements)
- Official infrastructure blog posts
- Cable landing station filings (FCC, ITU)

**Tier B (Industry Specialists - 95% Confidence)**
- Data Center Knowledge (named reporter, infrastructure beat)
- Light Reading (24+ year telecom specialist, cable market authority)
- TeleGeography (market leader, direct operator interviews)
- Datacenter Dynamics (facility expertise)

**Tier C (Reputable but Broader - 85% Confidence)**
- Reuters, Bloomberg, Fierce Telecom
- Major industry conferences (speaking slots, announcements)
- Analyst firms (Gartner, IDC, Forrester on infrastructure themes)

**Tier D (Secondary/Social - 60% Confidence)**
- LinkedIn posts from industry practitioners
- Twitter from verified infrastructure accounts
- Reddit r/DataCenter, r/Telecom
- **Always flag as rumor/unverified**

### Verification Checklist

Before including in briefing, answer:
- [ ] Is there an attributed source? (company, analyst, journalist)
- [ ] Is the story about **infrastructure/construction/fiber specifically?** (not AI hype or general tech news)
- [ ] Does it affect **hyperscaler capacity, cost, or expansion timeline?**
- [ ] Can it be cross-referenced with another Tier A/B source?
- [ ] Is the announcement date clear and recent (<30 days)?

**If 3+ checked = Include in briefing**  
**If 2 or fewer = Flag as "Under Monitoring" or exclude**

---

## 3. WHAT COUNTS AS "HYPERSCALER NEWS" vs NOISE

### IN SCOPE ✅
- **Data Center Construction:** Announcements of new facilities, expansions, closing timelines
- **Fiber Deployment:** Subsea cables, terrestrial fiber, long-haul projects, landing station news
- **Capacity Planning:** Power, cooling, interconnect capacity announcements
- **Infrastructure Partnerships:** Partnerships with utilities, carriers, equipment vendors affecting scale
- **Regional Expansion:** New markets, new countries, strategic geographic moves
- **Sustainability/Power:** Only if it impacts construction timeline or capacity (e.g., renewable power requirement adds 12 months)
- **Vendor Partnerships:** Only if infrastructure-critical (chip shortages, HVAC tech, cable manufacturing)

### OUT OF SCOPE ❌
- AI/ML breakthroughs (covered elsewhere)
- Software product launches
- Quarterly earnings (unless specific infrastructure callouts)
- Stock price movements
- CEO/executive changes (unless infrastructure division-specific)
- General cloud service announcements (unless tied to physical capacity)
- Competitor analysis not tied to infrastructure
- Industry commentary without specific news peg

### BORDERLINE (Use Judgment) ⚠️
- Chip shortages that affect data center builds → INCLUDE (capacity impact)
- Microsoft hiring 500 engineers → EXCLUDE (unless facility-specific)
- Google sustainability pledge → INCLUDE only if tied to facility timeline
- Meta custom silicon announcement → INCLUDE (affects infrastructure design)

---

## 4. DATA FRESHNESS EXPECTATIONS

### Standard Lag Time
- **Official announcements:** Same-day coverage expected
- **Construction permits/filings:** 2-7 day lag (need discovery)
- **Cable landing notices:** 3-5 day lag (regulatory filing time)
- **Industry analysis:** 1-2 week lag after announcement

### Handling Stale News
- Only include stories published in last **30 days**
- Exception: Multi-phase announcements (phase 2 of announced facility = newsworthy)
- Flag "anniversary" stories (e.g., "2 years ago Google opened...") as history, not news

### Embargo Handling
- If story is under embargo, note embargo date
- Include in briefing only on embargo lift date
- Track embargo calendar separately

---

## 5. DAILY BRIEFING RESEARCH WORKFLOW

### Step 1: Collection (45 minutes)
1. Open all Tier 1 source feeds
2. Scan headlines for IN SCOPE keywords:
   - "announces," "unveils," "launches," "expands," "construction," "fiber," "subsea," "facility," "data center," "capacity," "region," "opens"
3. Create initial list of 5-10 candidate stories

### Step 2: Verification (20 minutes)
1. For each story, find primary source
2. Confirm Tier A or B source
3. Check publication date (within 30 days?)
4. Verify IN SCOPE criteria
5. Cross-reference with 1-2 other sources if possible

### Step 3: Contextualization (15 minutes)
1. Rank by impact (see TEMPLATE.md for scoring)
2. Group by theme (construction, fiber, capacity, partnerships)
3. Note any follow-ups on previous announcements
4. Identify gaps or patterns (e.g., "all announcements from Asia this week")

### Step 4: Output (10 minutes)
1. Format into email template (see TEMPLATE.md)
2. Add 1-2 sentence context for each story
3. Include direct links and source attribution
4. Add brief editor's note if theme is relevant

**Total Time:** 90 minutes daily

---

## 6. ESCALATION & SPECIAL CASES

### Urgent/Breaking News
- If major announcement (hyperscaler enters new region, announces $X billion capex, subsea cable consortium forms):
  - Send immediate alert (don't wait for full daily briefing)
  - Include URGENT tag in subject line
  - Verify story is in Tier A/B before alerting

### Conflicting Information
- If two sources report different details (e.g., facility timeline, capacity specs):
  - Note both versions
  - Cite each source explicitly
  - Flag as "pending clarification"
  - Follow up when official statement issued

### Rumors & Speculation
- Include only if from established industry analyst (Tier C)
- Always preface with "rumor" or "pending confirmation"
- Mark with ⚠️ emoji
- Remove if official announcement contradicts within 7 days

### Regional Expertise Gaps
- If announcement in non-English market (Asia, Europe):
  - Translate key info
  - Note original source language
  - Include link to original (not just English coverage)

---

## 7. QUALITY GATES BEFORE PUBLISHING

Each briefing must pass:

- [ ] **Completeness:** All Tier 1 sources checked since last briefing?
- [ ] **Accuracy:** Each story has attributed Tier A/B source?
- [ ] **Relevance:** All stories meet IN SCOPE criteria?
- [ ] **Freshness:** All stories <30 days old?
- [ ] **Formatting:** Template structure followed? Links working?
- [ ] **Tone:** Neutral, factual, no opinion injected?
- [ ] **Impact Scoring:** Importance scores assigned for each story?

**If any gate fails: Revise before sending**

---

## 8. METRICS & TRACKING

### Weekly Metrics to Monitor
- **Stories published:** Target 15-25 per week
- **Source breakdown:** % from each Tier 1 source (should be balanced)
- **Accuracy rate:** Track any corrections needed (target: >99%)
- **Time to publication:** Track consistency (should be <30 min deviation)
- **Reader feedback:** Note which stories get follow-up questions

### Monthly Review
- Audit 1-2 briefings against source feeds (did we miss anything major?)
- Update SOURCES.md if sources underperform or new sources emerge
- Adjust cadence if gaps identified
- Archive old briefings with topic tags for search

---

## 9. TOOLS & WORKFLOW SETUP

### Recommended Setup
- **Feed reader:** Feedly or NewsBlur (subscribe to all Tier 1/2 sources)
- **Tracking:** Airtable or Notion (template for daily briefing)
- **Archive:** Google Drive folder (monthly folders for briefings)
- **Escalation:** Slack integration (urgent break alerts) OR email filter tags

### Current Setup (Phase 2 Implementation)
- Workspace: `/Users/timothyryan/.openclaw/workspace/hyperscaler-briefing/`
- Daily briefings: `memory/YYYY-MM-DD-briefing.md`
- Archive: `archive/` folder (monthly)

---

## 10. HANDOFF TO PHASE 2

**Phase 2 will automate:**
- RSS feed aggregation (pull from all 14 sources)
- Keyword filtering (IN SCOPE detection)
- Verification checks (cross-reference sources)
- Template generation (auto-format output)
- Archive & tagging (maintain searchable history)

**This methodology document** ensures Phase 2 automation aligns with human judgment rules.

---

**Last Review:** March 23, 2026  
**Next Review:** April 23, 2026 (post Phase 2 implementation, assess automation gaps)
