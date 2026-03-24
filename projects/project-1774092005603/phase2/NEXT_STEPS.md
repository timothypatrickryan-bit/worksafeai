# NEXT_STEPS.md — Phase 3: Automation & Production
## Hyperscaler Update Daily Briefing — Daily Operations

---

## Phase 3 Overview: "Daily Operations" (Timeline: April 1, 2026 onward)

Once Tim approves the format (Phase 2 deliverable), Phase 3 will automate the daily briefing workflow.

**Scope:** Replace manual research/writing with fully automated daily email delivery  
**Frequency:** Every morning, 6:00 AM EST (adjustable)  
**Output:** HTML email delivered to Tim's inbox via lucy@elevationaiagents.com  
**Management:** Cron job + OpenClaw subagent that runs unattended daily

---

## Architecture: How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  6:00 AM EST — Daily Cron Trigger                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ↓ OpenClaw spawns SUBAGENT (Scout, the research specialist)│
│                                                              │
│  Scout:                                                      │
│  1. Monitors 12 tier-1/tier-2 sources (parallel fetch)      │
│  2. Scores + prioritizes stories using framework            │
│  3. Cross-validates top 4-5 stories (fact-check)            │
│  4. Synthesizes markdown briefing                            │
│  5. Generates HTML email from template                      │
│  6. Delivers HTML email to Tim's inbox                      │
│  7. Logs briefing to archive (timestamped)                  │
│                                                              │
│  ↓ Returns to main agent with summary                       │
│                                                              │
│  Main agent:                                                 │
│  - Archives briefing metadata (what stories ran today)      │
│  - Logs execution time + story count                        │
│  - Alerts Tim if > 6 hours to complete (failsafe)          │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Time Budget:
- Source monitoring: 20 min
- Story prioritization: 15 min
- Synthesis + delivery: 15 min
- Total: ~50 min (well under 2 hour SLA)
```

---

## Phase 3 Implementation Checklist

### **3.1 — Setup (1 day)**

- [ ] Create OpenClaw cron config for 6:00 AM EST daily trigger
- [ ] Verify lucy@elevationaiagents.com email identity (test send)
- [ ] Set up email delivery via Elevation AI SMTP relay
- [ ] Create briefing archive directory: `/workspace/projects/hyperscaler-update/archive/`
- [ ] Document email subject line template: "Hyperscaler Update: [Date] – [Top Story]"

**Deliverable:** Cron config file + email delivery test log

---

### **3.2 — Source Configuration (1 day)**

Populate Tier 1 source URLs + monitoring instructions:

**Primary Sources (check every briefing):**
- [ ] Data Center Knowledge (https://www.datacenterknowledge.com) → Parse "Latest News" section
- [ ] Light Reading (https://www.lightreading.com) → Scan "News & Views"
- [ ] CNBC Technology (https://www.cnbc.com/technology/) + Energy desk → Breaking stories
- [ ] ZDNET Cloud (https://www.zdnet.com/topic/cloud/) → Cloud infrastructure angle

**Secondary Sources (check if needed for depth):**
- [ ] Fierce Telecom / Fierce Network → Carrier infrastructure news
- [ ] The Register → Operational details + supply chain
- [ ] Protocol → Analysis pieces
- [ ] TeleGeography → International infrastructure (weekly summary)

**Store as JSON config:**
```json
{
  "sources": [
    {
      "name": "Data Center Knowledge",
      "url": "https://www.datacenterknowledge.com",
      "tier": 1,
      "check_frequency": "daily",
      "parsing_hint": "Look for /latest-news and /hyperscalers sections"
    },
    // ... other sources
  ]
}
```

**Deliverable:** sources.json configuration file

---

### **3.3 — Story Scoring & Prioritization Automation (2 days)**

Implement the scoring framework as code:

**What to automate:**
1. **Relevance Score (1-5):** Given a headline + summary, score based on keywords (data center, fiber, capex, construction, hyperscaler, power, AI)
2. **Impact Scope (1-5):** Extract numbers (capex amount, region count, company count) and map to impact
3. **Freshness (1-5):** Publish date vs. current time
4. **Composite Score:** Formula = (Relevance × 0.4) + (Impact × 0.35) + (Freshness × 0.25)
5. **Action Threshold:** Score ≥ 4.5 = Featured | 3.5-4.4 = Secondary | < 3.5 = Skip or archive

**Implementation approach:**
- Use Claude API to analyze each story headline + snippet → scoring prompt
- Store scores in CSV for transparency (Tim can audit why stories were selected)
- Return top 4-6 stories sorted by score

**Example scoring prompt:**
```
Analyze this hyperscaler infrastructure story for relevance:
---
HEADLINE: "{headline}"
SOURCE: {source}
PUBLISHED: {date}
SNIPPET: "{snippet}"
---

Score (1-5) on:
1. Relevance (data center / fiber / capex / hyperscaler focus?)
2. Impact Scope (number of regions/companies/capex amount?)
3. Freshness (how recent?)

Return JSON: {"relevance": X, "impact": X, "freshness": X, "reasoning": "..."}
```

**Deliverable:** Scoring module + scoring log CSV (timestamped daily)

---

### **3.4 — Cross-Validation Module (1 day)**

For stories scoring 3.5+, validate before including in briefing:

**Automated checks:**
1. **Multi-source confirmation:** Does another Tier 1 source report similar story? (Simple: search other sources for company/project name mentioned in story)
2. **Attribution trail:** Is claim attributed to official announcement, analyst, or anonymous source? (Flag if anonymous-only)
3. **Number verification:** If story mentions capex/MW/square footage, check against prior company statements (if available in archives)

**Validation rules:**
- ✅ If verified across 2+ sources → include with confidence
- ✅ If single-source but from Tier 1 → include with source attribution
- ⚠️ If unconfirmed but newsworthy (4.0+) → include with caveat ("According to [source]...")
- ❌ If unable to verify + score < 4.0 → archive for trends section

**Deliverable:** Validation checklist log (per-briefing)

---

### **3.5 — Content Generation & Templating (2 days)**

Automate story synthesis + HTML email generation:

**Story synthesis (Claude API):**
```
Given a validated story, write a briefing summary:

HEADLINE: "{headline}"
SOURCE: "{source}"
KEY FACTS: {bullet_points}
YOUR TASK:
1. Write lede (1-2 sentences establishing fact + why it matters)
2. Write body (3-5 sentences covering: what happened, why, scale, implications)
3. Extract 3-5 key data points
4. Note Northeast implication if relevant
5. Return JSON with all fields

Tone: Professional, analytical, data-driven. 200 words for featured; 75-100 for secondary.
```

**HTML template generation:**
- Use Jinja2 or similar templating to inject stories into HTML_TEMPLATE.html
- Replace placeholders: {DATE}, {TOP_STORY_TITLE}, {STORY_CONTENT}, etc.
- Automatically generate summary paragraph from story list
- Add timestamp footer

**Deliverable:** Content generation module + template variables reference

---

### **3.6 — Archive & Logging (1 day)**

Store every briefing for reference + trend analysis:

**Archive structure:**
```
/hyperscaler-update/archive/
├── 2026-03-24/
│   ├── BRIEFING_2026-03-24.md
│   ├── BRIEFING_2026-03-24.html
│   ├── scores.csv              (what stories scored, why)
│   ├── validation.log          (cross-checks performed)
│   └── execution.json          (run time, story count, etc.)
├── 2026-03-25/
│   └── ... (same structure)
└── weekly_summary.md           (Friday rollup of top stories)
```

**Log metadata:**
- Execution start/end time
- Source monitoring time
- Story count (submitted vs. included)
- Highest/lowest scores
- Validation flags (if any unconfirmed stories included)
- Email delivery confirmation
- Tim's feedback (if he comments on specific stories)

**Deliverable:** Archive structure + logging module

---

### **3.7 — Failsafe & Error Handling (1 day)**

Handle edge cases gracefully:

**What can go wrong:**
1. **No stories found:** If < 3 stories score above 2.5, send alert to main agent instead of briefing ("Slow news day; monitoring continues")
2. **Source unavailable:** If > 2 Tier 1 sources unreachable, retry with exponential backoff; log as "partial monitoring day"
3. **Scoring timeout:** If Claude API takes > 30 min, return pre-scored briefing from yesterday's methodology
4. **Email delivery fails:** Retry SMTP 3x; if fails, escalate alert to main agent
5. **Content generation error:** If synthesis fails, deliver raw story list with links (basic fallback format)

**SLA:** Briefing should complete by 7:30 AM EST (1.5 hour buffer before Tim's likely wake-up time)

**Deliverable:** Error handling module + alerting logic

---

### **3.8 — Analytics & Weekly Rollup (1 day)**

Track trends across weeks:

**Weekly report (every Friday 5 PM EST):**
- Top 3 stories of the week (by score + engagement)
- Hottest hyperscalers mentioned (AWS, Google, Meta, Microsoft count)
- Top geography (which regions dominated this week's news)
- Key themes (capex, power, fiber, AI, connectivity)
- Northeast-specific stories (separate section)
- Forecast for next week (based on earnings calendars + industry events)

**Monthly report (first Friday of month):**
- Aggregate capex announced (sum of announced capex across all stories)
- Geographic heatmap (which states/regions got most investment news)
- Technology trends (cooling, power, AI-specific infrastructure innovations)
- Competitive dynamics (which hyperscalers most active in news)
- Forecast next month (based on earnings + major industry events)

**Deliverable:** Weekly/monthly rollup templates + aggregation logic

---

## Phase 3 Dependencies & Prerequisites

**Technical:**
- ✅ OpenClaw cron job capability (verify available)
- ✅ Lucy email identity (lucy@elevationaiagents.com) configured
- ✅ Claude API access (for scoring + synthesis)
- ✅ Email delivery via Elevation AI SMTP relay
- ✅ File archive storage (local filesystem OK)

**Data:**
- ✅ Phase 2 briefing template (BRIEFING_2026-03-23.md) approved by Tim
- ✅ HTML email template (EMAIL_TEMPLATE.html) approved by Tim
- ✅ Tier 1 source list (01_SOURCE_LIST.md) from Phase 1
- ✅ Scoring methodology (02_RESEARCH_METHODOLOGY.md) from Phase 1

**Human approval:**
- ⏳ Tim reviews Phase 2 deliverables (briefing format, story selection, tone)
- ⏳ Tim approves content format for daily email
- ⏳ Tim confirms 6:00 AM EST delivery time works
- ⏳ Tim provides feedback on coverage (what to prioritize, what regions to track)

---

## Implementation Timeline

**Week of March 25-29:**
- Day 1: Setup + source configuration
- Day 2: Scoring automation + validation module
- Day 3: Content generation + templating
- Day 4: Archive + logging
- Day 5: Testing + failsafe configuration

**Week of April 1-5:**
- April 1: Go live (6:00 AM EST daily briefing starts)
- April 2-4: Monitor + adjust (watch for edge cases, timing, quality)
- April 5: First weekly rollup report

**Contingency:** If issues arise during first week, revert to semi-manual mode (subagent runs daily, but human reviews before sending) until stabilized.

---

## Phase 3 Subagent Profile

**Subagent name:** Scout  
**Purpose:** Daily hyperscaler news research + briefing generation  
**Triggers:** Cron job at 6:00 AM EST daily  
**Inputs:** Phase 1 source list, Phase 2 briefing template, current date  
**Outputs:** HTML email + markdown briefing + archive logs  
**SLA:** Complete within 2 hours; alert main agent if > 1.5 hours  
**Fallback:** If Scout fails, send alert to Tim instead of partial briefing  

---

## Expected Daily Load & Cost

**API calls per briefing:**
- Source monitoring: 5 web_fetch calls (to Tier 1 sources)
- Story processing: ~6 Claude API calls (scoring + synthesis)
- Email delivery: 1 outbound email

**Estimated cost (assuming Anthropic Claude pricing ~$3/M input tokens):**
- Research + scoring + synthesis: ~15,000 tokens/day → ~$0.05/day
- Email delivery: ~$0.02/day (depending on email provider)
- **Daily cost:** ~$0.07
- **Monthly cost:** ~$2

**Storage:**
- Archive per briefing: ~50 KB (markdown + HTML + logs)
- Monthly archive: ~1.5 MB
- Annual archive: ~18 MB
- **No storage concerns**

---

## Success Metrics

After Phase 3 launches, measure success:

✅ **Reliability:** Briefing delivered > 99% of days (allow 1-2 skipped days/month for edge cases)  
✅ **Speed:** < 2 hours from 6 AM trigger to inbox delivery  
✅ **Quality:** Tim approves story selection > 90% of time (1-2 per month may get feedback)  
✅ **Coverage:** Northeast stories identified when they occur (track separately)  
✅ **Engagement:** Tim reads & retains briefing (measure by feedback/questions asked about stories)  

---

## Iteration & Adjustment

Once Phase 3 runs for 2-4 weeks, revisit:

1. **Timing:** Is 6:00 AM EST optimal? Should it be earlier/later?
2. **Story count:** 4 stories ideal? More/fewer?
3. **Depth:** Are 300-word feature stories too long? Too short?
4. **Sources:** Any Tier 1 sources not breaking stories? Should we adjust?
5. **Categories:** Should we organize by hyperscaler (AWS, Google, etc.) instead of by story type?
6. **Northeast focus:** Do we need dedicated Northeast section? Separate briefing?
7. **Frequency:** 7 days/week? Or weekdays only?

---

## Post-Launch Support

Once Phase 3 is running, the operation is:
- **Fully automated** (no human daily intervention)
- **Self-documenting** (archive logs + metadata explain what happened each day)
- **Adjustable** (Tim can request changes; implementation time ~1 day per change)
- **Low-maintenance** (monitor exception logs; retrain if source URLs change)

---

## 🎯 READY FOR HANDOFF TO PHASE 3

✅ Phase 2 complete: Template briefing created, format approved (pending Tim review)  
✅ Framework documented: Scoring, validation, synthesis ready to automate  
✅ Architecture designed: Subagent-based daily automation ready to build  
✅ Timeline: 1 week implementation → April 1 launch  
✅ Success metrics: Defined and measurable  

**Next action:** Tim reviews Phase 2 deliverables → approves template → Phase 3 kicks off March 25.

---

*Phase 3 planning complete: March 23, 2026, 2:00 PM ET*  
*Ready for approval and implementation: YES*
