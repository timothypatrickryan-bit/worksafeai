# LinkedIn Auto-Post Workflow & Guidance

**Last Updated:** March 26, 2026 @ 1:18 PM EST

## Overview

Your LinkedIn automation generates **executive market commentary posts** focused on Northeast data center and fiber infrastructure announcements. Posts are published **automatically Tue/Thu/Sat @ 9 AM EST** and rotate through 3 writing formats.

## How It Works

### The Complete Flow

```
Every Tue/Thu/Sat @ 9:00 AM EST
            ↓
    launchd triggers job
            ↓
    linkedin-auto-post-northeast.sh runs
            ↓
    Determines post type (insight → observation → leadership)
            ↓
    Calls linkedin-post-northeast-dc.js
            ↓
    Generator:
      1. Picks random Northeast market angle
      2. Searches for real PA/NY DC/Fiber announcements
      3. Generates executive commentary
      4. Picks engagement question
      5. Saves to .linkedin-current-post.json
            ↓
    Post logged to .linkedin-posts-archive.log
            ↓
    READY FOR MANUAL POSTING (or auto-post if relay integrated)
```

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| **Scheduler** | launchd plist | Triggers every Tue/Thu/Sat @ 9 AM EST |
| **Shell Script** | `linkedin-auto-post-northeast.sh` | Rotates post types, runs generator, logs output |
| **Generator** | `linkedin-post-northeast-dc.js` | Searches for real announcements, generates commentary |
| **Knowledge Base** | `NORTHEAST_DC_ANNOUNCEMENTS.md` | YOU maintain this with real market data |
| **Output** | `.linkedin-current-post.json` | Post ready for posting (copy to LinkedIn) |
| **Archive** | `.linkedin-posts-archive.log` | Historical record of all posts |

## Post Types (Rotate Every Post)

### 1. **Insight** — Direct Market Observation
**Tone:** Sharp, analytical, strategic
```
**ANGLE NAME**

Market context/announcement.

Here's what this means:
• Implication 1
• Implication 2  
• Implication 3

The question isn't [X]. It's [Y].

Real engagement question specific to market.
```

### 2. **Observation** — First-Person Market Watch
**Tone:** Experienced perspective, "I've been tracking this"
```
**Market Watch: ANGLE NAME**

I've been tracking [angle topic] across the Northeast. Here's what stands out:

Specific market observation backed by context.

For infrastructure operators, this changes everything.

Real engagement question.
```

### 3. **Leadership** — Strategic Direction
**Tone:** Thought leader positioning winners vs followers
```
**Leading Through Change**

In my experience, [market transitions] separate winners from followers.

Market observation with strategic implication.

The question isn't whether this happens. It's whether you're ahead of it.

Real engagement question tied to competitive positioning.
```

## 5 Market Angles (Randomly Selected)

Posts randomly select one of these Northeast-specific angles. Each has:
- Real market context (what's happening)
- Strategic implication (why it matters)
- 3 engagement questions (pick one randomly)

### 1. **Hyperscaler Rush**
- **Context:** AWS, Google, Microsoft accelerating Northeast expansion due to AI capex + East Coast proximity
- **Implication:** Operators who deploy fiber/cabling fast will own this cycle
- **Questions:**
  - Which hyperscaler are you seeing most aggressive in your territory?
  - How are you positioning to serve this wave of data center construction?
  - What's your capacity to handle 5-10 new hyperscaler projects simultaneously?

### 2. **Fiber Gold Rush**
- **Context:** Fiber deployment accelerating in PA/NY—interconnect + broadband + undersea cables landing
- **Implication:** Fiber expertise becomes critical differentiator
- **Questions:**
  - How deep is your team's fiber deployment experience?
  - Are you positioning fiber as a service or just installation?
  - What's your strategy for competing with national fiber operators?

### 3. **Power Constraints**
- **Context:** Northeast power grid stressed; power availability limiting factor for expansion
- **Implication:** Locations with power solutions become premium
- **Questions:**
  - How are your locations solving the power constraint problem?
  - Are you seeing power availability reject deals in your market?
  - What's your power redundancy story to customers?

### 4. **Regional Consolidation**
- **Context:** Smaller operators consolidating/being acquired; market moving toward scale
- **Implication:** Operators must scale fast or specialize deeply; middle ground disappears
- **Questions:**
  - How are you positioning against consolidation pressure?
  - What's your defensible market position?
  - Is scale or specialization your growth strategy?

### 5. **Edge vs Core**
- **Context:** AI workloads driving demand for both massive core facilities AND edge compute
- **Implication:** Operators need capability across full spectrum
- **Questions:**
  - How are you serving both hyperscale core AND edge compute markets?
  - What's the margin profile difference between core and edge?
  - How do you staff/skill for both segments?

## How to Keep Posts Current & Authentic

### The Critical Step: Update NORTHEAST_DC_ANNOUNCEMENTS.md

**This is where the magic happens.** The generator searches for real market developments. To make posts reference actual PA/NY projects and announcements:

1. **Monitor these sources:**
   - DataCenterDynamics (DC news)
   - RCR Wireless (infrastructure trends)
   - Local PA/NY business journals
   - LinkedIn news feed (competitors, industry)
   - Company press releases (AWS, Google, Microsoft, hyperscalers)
   - Regional fiber operator announcements

2. **Add announcements to NORTHEAST_DC_ANNOUNCEMENTS.md:**

```markdown
### AWS Northeast Data Center Expansion
**Date:** 2026-03-15
**Location:** Pennsylvania (Scranton area)
**Type:** Data Center Expansion
**Details:** AWS announces $500M investment for new hyperscale facility in PA, focused on AI workload capacity. Expected operational by Q4 2026.
**Relevance:** Major hyperscaler investing in Northeast = demand for infrastructure partners, structured cabling, fiber interconnect, colocation
**Source:** https://example.com/announcement
```

3. **Generator will:**
   - Search for these announcements by keyword
   - Reference them in posts (real examples, real projects)
   - Make your commentary credible and market-grounded

### Example: How It Works

**You add to NORTHEAST_DC_ANNOUNCEMENTS.md:**
```
### Google Data Center — Hudson Valley, NY
**Date:** 2026-03-20
**Details:** Google announces multi-billion dollar facility investment in Hudson Valley for AI compute infrastructure
**Relevance:** Hyperscaler capex accelerating in Northeast
```

**Then next post generates:**
```
**HYPERSCALER RUSH**

Google just announced a multi-billion dollar facility investment in Hudson Valley for AI compute. 
AWS and Microsoft are equally aggressive in the region.

This matters: Every hyperscaler expansion needs fiber, structured cabling, and fast execution.

The question isn't whether hyperscalers expand in the Northeast. It's whether YOU'RE ready to serve them at scale.

Which hyperscaler are you seeing most aggressive in your territory?

— Tim Ryan, Pro-Tel
```

**Much more credible.** Real project, real implications, real engagement.

## Workflow Guidance: What You Should Do

### Daily (5 min)
- Scan industry news for Northeast DC/Fiber announcements
- Spot anything worth tracking? Add to NORTHEAST_DC_ANNOUNCEMENTS.md

### Weekly (10 min)
- Review last 3 posts (in .linkedin-posts-archive.log)
- Check if they're credible and specific to Northeast
- Are engagement questions generating discussion?

### Before Major Market News (anytime)
- If AWS/Google/Microsoft announce Northeast expansion → add immediately
- If major fiber project launches in PA/NY → add immediately
- If consolidation/M&A affects Northeast operators → add immediately
- Posts generated within hours will reference it

### Monthly (20 min)
- Review NORTHEAST_DC_ANNOUNCEMENTS.md
- Update context/implications if market dynamics shift
- Clean up old announcements (keep last 3 months)
- Assess if the 5 angles still match reality

## Quality Checks

### Before a Post Goes Live, Verify:

- ✅ **Specific to Northeast?** (PA/NY mentioned or clear regional angle)
- ✅ **Grounded in real developments?** (references actual projects/trends, not generic)
- ✅ **Credible executive voice?** (Your perspective, not "AI generated blog post")
- ✅ **Engagement question is real?** (Prompts actual discussion, not generic)
- ✅ **Implication is strategic?** (Why this matters for YOUR business, not just interesting)

If a post doesn't meet these, don't post it. Better to skip one than post something generic.

## Current Status

**Schedule:** Tue/Thu/Sat @ 9:00 AM EST  
**Last Run:** Thursday, March 26 @ 9:26 AM EST  
**Next Run:** Tuesday, March 28 @ 9:00 AM EST  

**Current Knowledge Base:** NORTHEAST_DC_ANNOUNCEMENTS.md  
**Status:** ⚠️ NEEDS YOUR INPUT — Add real 2026 announcements for posts to be credible

**Posting Method:** Manual (copy from .linkedin-current-post.json to LinkedIn)  
**Future:** Can integrate browser relay for auto-posting once posts are consistently good

## Files Reference

```
/scripts/
  ├── linkedin-auto-post-northeast.sh    ← Main automation script
  ├── linkedin-post-northeast-dc.js      ← Post generator
  
/.linkedin-current-post.json             ← Current post (ready to copy)
/.linkedin-posts-archive.log             ← Historical posts
/.linkedin-launchd.log                   ← Automation logs
/.linkedin-launchd-error.log             ← Error logs

/NORTHEAST_DC_ANNOUNCEMENTS.md           ← YOUR knowledge base (UPDATE THIS)
```

## Next Steps

1. **Review your market** — What real PA/NY DC/Fiber announcements should Tim know about?
2. **Populate NORTHEAST_DC_ANNOUNCEMENTS.md** — Add 3-5 current real announcements
3. **Generate a post** — Next Tuesday @ 9 AM will reference your data
4. **Check quality** — Is it specific? Credible? Engaging?
5. **Post to LinkedIn** — Copy from .linkedin-current-post.json
6. **Keep it fresh** — Add announcements as they happen throughout the week

---

**Goal:** Posts should read like you (Tim) genuinely commenting on Northeast market developments, not like AI regurgitating news. The more real announcements you feed it, the more authentic the output.
