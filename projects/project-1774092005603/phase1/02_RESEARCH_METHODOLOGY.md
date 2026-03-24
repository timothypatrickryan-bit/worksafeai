# Hyperscaler Update - Research Methodology
**Phase 1 Deliverable: Framework for Source Analysis & Story Prioritization**
**Last Updated:** March 23, 2026

---

## Overview

This document describes a repeatable process for synthesizing hyperscaler infrastructure news across 12+ sources, prioritizing stories by impact and relevance, and validating information before inclusion in daily briefings.

**Goal:** Transform raw news stream into actionable, sourced briefing material in 60 minutes/day

---

## 1. Source Monitoring & Data Gathering (20 minutes)

### Phase 1a: Primary Sweep
**Timeline:** 9:00-9:15 AM ET (start of trading day, maximum news velocity)

**Method:**
1. Open Data Center Knowledge homepage → scan "Latest News" section (3-5 min)
2. Check Light Reading top stories (3-5 min)
3. Scan CNBC Technology & Energy sections for major announcements (2-3 min)
4. Total: ~12 articles sampled

**What to capture:**
- Headline + URL
- Publication + publish time
- Any hyperscaler names (AWS, Google Cloud, Azure, Meta, Alibaba, etc.)
- Key terms: "data center," "fiber," "construction," "capex," "deployment," "power," "AI"
- Byline (track reporters covering this beat)

**Tool:** Spreadsheet or note app (see template below)

### Phase 1b: Secondary Sweep
**Timeline:** Late morning or end of day (catch afternoon/overnight news)

**Method:**
1. Quick check of ZDNET cloud section (2 min)
2. Scan Fierce Telecom/Network alerts (2 min)
3. Check The Register infrastructure news (2 min)
4. Note any overnight international stories from TeleGeography/Omdia email alerts (1 min)

**Data capture:** Same as Phase 1a

---

## 2. Story Prioritization Framework (15 minutes)

### Scoring Matrix: Impact Classification

Each story gets scored 1-5 on three dimensions:

#### A. **Relevance Score** (1-5)
- **5:** Direct announcement of new DC site, fiber route, hyperscaler capex, or construction milestone
- **4:** Infrastructure investment, supply chain impact, regulation affecting construction
- **3:** Indirect impact (energy costs, chip availability, workforce, financing)
- **2:** Peripheral (feature on existing facility, historical trend, expert commentary)
- **1:** Tangential (general tech/business news with minor infra angle)

#### B. **Impact Scope** (1-5)
- **5:** Multi-region initiative, industry-wide standard shift, $1B+ capex announcement
- **4:** Major metro area (5+ major cities), 2-3 hyperscalers involved, $500M-$1B
- **3:** Single region expansion, single hyperscaler, $100M-$500M capex
- **2:** Single site, smaller scale, $10M-$100M
- **1:** Pilot, minor update, <$10M

#### C. **Newsworthiness/Freshness** (1-5)
- **5:** Breaking news (<2 hours old), exclusive, official announcement
- **4:** Same-day reporting, confirmed by official sources
- **3:** Same-day analysis, trade publication exclusive
- **2:** Overnight/delayed reporting, rehashed from other sources
- **1:** Old news (>24 hours), commentary only

### Composite Priority Score
**Formula:** (Relevance × 0.4) + (Impact × 0.35) + (Freshness × 0.25)

**Result Range:** 1.0 - 5.0

**Action Thresholds:**
- **4.5-5.0:** MUST INCLUDE — Featured story (300-400 words)
- **3.5-4.4:** SHOULD INCLUDE — Secondary story (150-200 words)
- **2.5-3.4:** CAN INCLUDE — Brief mention (50-75 words) or link-out
- **<2.5:** SKIP or archive for trends section

---

## 3. Source Cross-Validation (10 minutes)

### Verification Checklist

For stories scoring 3.5+, validate via:

**✓ Multi-source confirmation:**
- Does another tier-1 source report the same story? (Don't need identical angles, need corroborating facts)
- Example: If Data Center Knowledge reports Google expanding Iowa data center, verify via LinkedIn announcement, Google blog, or CNBC confirmation

**✓ Attribution trail:**
- Primary source: Official company announcement (press release, earnings, exec interview)
- Secondary: Reporting citing company statement or credible industry source
- Tertiary: Analysis/expert commentary (acceptable for trend context, not as primary evidence)
- **Red flag:** Story claims facts but cites only anonymous sources or competing company allegations

**✓ Factual accuracy checks:**
- Do the numbers align? (Check capex amounts, facility sizes, timeline against prior company statements)
- Geographic accuracy: Confirm region/country/metro correct
- Company/project names: Exact spelling, correct ownership

**✓ Conflict-of-interest check:**
- Does source have financial stake? (e.g., vendor promoting own solution)
- Is analyst affiliated with company being covered?
- Note bias but don't disqualify—flag in briefing if relevant

### Escalation Rule
- If story can't be cross-validated but scores 4.0+, **include with caveat** ("According to [source], citing [original attribution]") rather than exclude
- Example phrasing: "According to reporting by Data Center Knowledge, citing company sources, AWS plans..."

---

## 4. Story Synthesis & Writing (15 minutes)

### Analysis Framework

For each story, ask:

**1. Why now?**
- What triggered this announcement or story?
- Market dynamics (AI demand, power constraints, competition)?
- Regulatory drivers?
- Seasonal capex cycles?

**2. Who is affected?**
- Which hyperscalers?
- Which regions/markets?
- Supplier/vendor impact?
- Competitive implications?

**3. What are the implications?**
- Capex trend direction?
- Competitive dynamics shift?
- Infrastructure capacity angle?
- Market concentration?

**4. What's the data story?**
- Quantifiable metrics (MW, square footage, investment amount)?
- Timeline for deployment/completion?
- Impact on current capacity/capability?

### Writing Template

```
[HEADLINE - 8-12 words, action-oriented]

[LEDE - 1-2 sentences establishing the fact, why it matters]

[BODY - 3-5 sentences covering:
  - What happened (announcement/milestone)
  - Why (market driver, competitive response)
  - Scale/scope (numbers, regions, companies)
  - Implications (what it means for hyperscaler strategy)
]

[SOURCE ATTRIBUTION]
- Primary: Link to original announcement/press release
- Cross-reference: Other outlets' coverage (optional)

[ANALYST NOTE (if applicable)]
- Trend connection to prior stories
- Competitive context
```

### Tone & Style Guidelines

- **Audience:** Infrastructure investors, tech strategists, telecom executives
- **Voice:** Direct, informed, analytical (not sensational)
- **Length:** 200 words per story (featured), 75-100 words (secondary)
- **Data-first:** Lead with numbers when available
- **Attribution:** Always cite source; link out
- **Avoid:** Speculation without expert/analyst backing; exclusive claims without cross-check

---

## 5. Daily Briefing Assembly (5 minutes)

### Structure

1. **Opening Context (50 words)**
   - Market mood (bullish capex, cautious, regional variation)
   - Day's dominant theme (AI acceleration? Supply chain? Geography shift?)

2. **Featured Stories (2-3 @ 300-400 words each)**
   - Scored 4.5+
   - Major announcements, capex news, significant milestones

3. **Secondary Stories (3-5 @ 150-200 words each)**
   - Scored 3.5-4.4
   - Support context for featured stories

4. **Brief Items / Quick Hits (5-8 @ 50-75 words)**
   - Scored 2.5-3.4 but worth noting
   - Earnings guidance, supply chain notes, geographic expansion

5. **Trend Tracker (100-150 words)**
   - Synthesis across the week's stories
   - Pattern identification (capex acceleration? Geopolitical shift? Tech standardization?)

6. **Resource Links**
   - Direct URLs to original sources
   - Archive reference for future analysis

---

## 6. Quality Control Checklist (Before Publishing)

- [ ] All claims are attributed to source or multi-source confirmed
- [ ] Numbers (capex, MW, sq ft) cross-checked against company statements
- [ ] No speculation without expert attribution
- [ ] Geographic claims verified (correct regions, countries, facility types)
- [ ] Hyperscaler names spelled correctly, ownership verified if new companies
- [ ] Competitive dynamics contextualized fairly (not favoring one vendor)
- [ ] No promotional language for vendors/solutions
- [ ] Links tested and live
- [ ] Tone is consistent across pieces
- [ ] Lede hook is clear in each story

---

## 7. Weekly & Monthly Rollup Process

### Weekly (Friday end-of-day)
- Scan all 5 daily briefings for patterns
- Identify top 2-3 stories that broke the trend
- Note competitive dynamics shifts
- Highlight major capex announcements vs. expectations
- Flag any supply chain, geographic, or regulatory surprises

### Monthly (Last Friday)
- Aggregate capex announcements from all 4 weeks
- Identify top hyperscalers by investment activity
- Geographic heatmap (where is money flowing?)
- Technology trends (cooling, power, AI-specific infrastructure)
- Forecast next month's likely focus areas based on earnings calendars, industry events

---

## 8. Adaptation & Evolution

### Quarterly Review
- Which sources consistently break stories first? (weight them higher)
- Which sources add most context? (keep for analysis)
- Which sources are redundant? (consider replacing)
- Missing coverage angles? (add sources or monitoring)
- Scoring thresholds working? (adjust if missing stories or over-indexing noise)

### Annual Audit
- Full source list refresh
- Methodology update based on lessons learned
- New analyst/reporter relationships to develop
- Coverage gaps to address

---

## Appendix: Quick Reference Checklists

### Daily Briefing Checklist
```
[ ] 9:00 AM: Primary source sweep (Tier 1)
[ ] 10:00 AM: Secondary source scan (Tier 2-3)
[ ] 10:15 AM: Score & prioritize all stories
[ ] 10:30 AM: Cross-validate high-priority stories
[ ] 10:45 AM: Write/synthesize top stories
[ ] 11:00 AM: Assemble briefing, quality check
[ ] 11:15 AM: Final proofread, link test
[ ] 11:30 AM: Publish/distribute
```

### Story Validation Checklist
```
[ ] Original source identified and verified
[ ] Numbers cross-checked (capex, MW, square footage)
[ ] Company names/ownership correct
[ ] Geography accurate (region, country, metro)
[ ] Timeline claims verified against prior statements
[ ] Competitive context fair/balanced
[ ] No attribution to anonymous sources as primary evidence
[ ] Analyst backing for any claims of significance
[ ] Caveat added if unconfirmed but newsworthy
```

### Quality Gate Before Publish
```
[ ] All hyperscaler names accurate
[ ] All URLs tested and live
[ ] Tone consistent with Tim's briefing style
[ ] No speculative language without attribution
[ ] Featured stories lead with data/numbers
[ ] Sources clearly cited
[ ] Trend context provided for major stories
[ ] Briefing structure follows template
```

---

## Notes for Implementation

- **Day 1-3:** Expect 90 minutes/day until process flows naturally
- **Week 2+:** Target 60 minutes/day; some stories will repeat across sources, reducing write time
- **Staffing:** One person can manage; consider backup for vacation/illness
- **Automation:** Consider RSS feed aggregation tool to reduce manual source checking, but human review remains critical
