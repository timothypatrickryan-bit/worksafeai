---
name: linkedin-writer
description: Generate authentic, human-sounding LinkedIn posts for industry insights and thought leadership. Autonomously creates 3 posts per week (Tue/Wed/Thu @ 8-9 AM EST) focused on data center infrastructure and fiber optics trends. Pulls real-time trending topics via Brave Search API, auto-selects optimal post format (Story, Contrarian, List, Lesson, or Behind-the-Scenes), and includes industry-specific hashtag strategy + optimal posting times. Outputs ready-to-post copy with engagement hooks. Use when: generating thought leadership content for Pro-Tel audience (customers, prospects, telecom/data center professionals), driving LinkedIn engagement with authentic industry insights, or establishing brand authority in data center + fiber infrastructure space.
---

# LinkedIn Writer

Generates authentic, human-sounding LinkedIn posts for industry insights and thought leadership. Autonomously creates 3 posts per week focused on data center infrastructure and fiber optics trends.

## Core Workflow

1. **Trigger**: Tue/Wed/Thu @ 8-9 AM EST (automated via launchd)
2. **Search**: Pull trending topics from Brave Search API (data center + fiber optics keywords)
3. **Analyze**: Pick 1 compelling trend/insight
4. **Format Selection**: Auto-choose best format (Story, Contrarian, List, Lesson, Behind-the-Scenes)
5. **Generate**: Write 1 post using your framework (no corporate speak, no buzzwords)
6. **Strategy**: Add 5-8 industry hashtags + engagement hook + optimal posting tips
7. **Quality Check**: Verify against 9-point checklist
8. **Output**: Save ready-to-post copy to `.linkedin-post-[date].txt`

## Post Format Selection Logic

Auto-select based on topic type:

- **Data center news/milestone** → Story Post (hook + narrative + lesson + question)
- **Industry trend/statistic** → Contrarian Take (challenge assumption + evidence + nuance)
- **Emerging technology** → List Post (5-10 key points + closer)
- **Lesson from experience** → Lesson Learned ("I used to think X..." format)
- **Behind-the-scenes/process** → Behind-the-Scenes (pull back curtain on decision/failure)

## Hook Formulas (Auto-Selected by Format)

Use these based on chosen format:

- Story: "I [did something]. Here's what happened:"
- Contrarian: "Most people get [topic] wrong. Here's what actually works:"
- List: "[Number] things I learned from [experience]:"
- Lesson: "I used to think [X]. Then [Y] happened. Now I think [Z]."
- Behind-the-Scenes: "Stop doing [common practice]. Do this instead:"

## Formatting Rules

- Short paragraphs. 1-2 sentences max.
- Line breaks between every paragraph (white space matters on LinkedIn).
- No hashtags in body. All hashtags at bottom.
- One emoji per post max (if any).
- First line is everything (shows in preview before "...see more").
- End with engagement question to drive comments.
- Under 1300 characters for optimal reach (can exceed for Story posts).

## Voice Rules

- Write like a person, not a brand.
- No buzzwords: "synergy," "leverage," "ecosystem," "disrupt," "game-changer."
- Specific > generic. "We grew from 12 to 47 customers" beats "significant growth."
- First person. This is their voice.
- Contractions. "Don't," not "do not." "It's," not "it is."
- No humble brags or corporate platitudes.

## Hashtag Strategy

Include 5-8 industry-specific hashtags at bottom:

**Core hashtags** (use 3-4):
- #DataCenter
- #FiberOptics
- #Telecom
- #Infrastructure

**Trending/supplemental** (pick 2-3 based on post):
- #EdgeComputing
- #NetworkResiliency
- #Hyperscaler
- #5G
- #CriticalInfrastructure
- #TelecomInnovation

**Professional** (optional, 1):
- #ThoughtLeadership
- #IndustryInsights

## Engagement Strategy

**Optimal posting times:**
- Tue/Wed/Thu 8-9 AM EST (highest B2B engagement)
- Post includes question or clear CTA to drive comments

**Engagement hooks** (end each post with one):
- Direct question: "What's your take on [topic]?"
- Provocative statement: "Disagree? Drop a comment 👇"
- Call to experience: "Have you seen this trend in your org?"
- Invitation: "What would you add?"

## Quality Checklist

Before shipping, verify:

- [ ] Hook would make you stop scrolling
- [ ] Sounds like a person, not a brand
- [ ] Has white space (short paragraphs + line breaks)
- [ ] Contains specific detail (numbers, names, dates, real trends)
- [ ] Ends with engagement driver (question or CTA)
- [ ] No cringe buzzwords
- [ ] Under 1300 characters (unless Story format)
- [ ] Hashtags are relevant + not overused
- [ ] Post format matches topic naturally

## Industry Keywords & Context

Refer to `references/industry-keywords.md` for:
- Data center terminology (edge, hyperscale, colocation, DCI)
- Fiber optics terminology (DWDM, latency, bandwidth, redundancy)
- Current industry trends (AI infrastructure, resilience, sustainability)
- Pro-Tel positioning context

## Example Posts

See `references/example-posts.md` for 3 real examples:
1. Data center sustainability trend (List Post)
2. Fiber resilience lesson (Lesson Learned)
3. AI infrastructure opportunity (Contrarian Take)

Use these as voice/tone reference, not templates.

## Output Files

Generated posts save to:
- `.linkedin-post-[YYYY-MM-DD].txt` (human-readable post copy)
- `.linkedin-posts-published.log` (tracking + timestamps)

## Automation

Runs via launchd job `com.openclaw.linkedin-writer`:
- Schedule: Tue/Wed/Thu @ 8-9 AM EST
- Script: `scripts/generate-linkedin-post.js`
- Logging: `.linkedin-writer.log`

Manual trigger:
```bash
node scripts/generate-linkedin-post.js
```

Check automation status:
```bash
launchctl list | grep linkedin-writer
tail -50 .linkedin-writer.log
cat .linkedin-post-*.txt
```
