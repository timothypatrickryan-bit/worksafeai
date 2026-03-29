# Project Recognition Framework

**Purpose:** Help Lucy distinguish between one-off work and legitimate projects worthy of Mission Control Dashboard tracking.

**Created:** March 29, 2026 @ 2:19 PM EDT

---

## 🎯 WHAT IS A PROJECT?

A **project** is strategic work that meets 3+ of these criteria:

### Core Criteria (Must Have At Least 3)
1. **Multi-phase** — Takes multiple steps/sprints to complete (not single task)
2. **Measurable outcomes** — Clear deliverables with success criteria
3. **Ongoing or recurring** — Will continue beyond one-time completion
4. **Team involvement** — Requires multiple agents or cross-functional coordination
5. **Strategic value** — Aligns with core mission or long-term goals
6. **Status tracking needed** — Owner needs visibility into progress
7. **Resource allocation** — Requires planning or budget
8. **Cross-dependencies** — Blocks or enables other work

### Project Examples
- ✅ **WorkSafeAI** — Multi-phase (backend, frontend, testing), strategic, team work, recurring
- ✅ **Consensus** — Multi-phase, measurable (40+ sources), ongoing, team work
- ✅ **LinkedIn Automation** — Recurring (3x/week), measurable, team work
- ✅ **Project Warp Speed** — 6-month timeline, strategic, team work, multiple phases
- ✅ **Mission Control Dashboard** — Multi-phase, strategic, core system, team work

### Non-Project Examples
- ❌ **Code review** — Single task, completes in hours, one-off
- ❌ **Bug fix** — Single task, no ongoing nature
- ❌ **Data export** — One-time deliverable, no recurring work
- ❌ **Quick email draft** — Momentary task, no phases
- ❌ **Casual research question** — Discussion, not strategic work

---

## 🔍 RECOGNITION SIGNALS

When you hear these phrases, think "project":

### Red Flags (Project Likely)
- "I want to build..." 
- "We should create..."
- "Let's start a new..."
- "I need to track..."
- "This is going to be a 3-week effort..."
- "Multiple people will work on this..."
- "This is critical for..."
- "We need to measure..."
- "Can you help me manage this?"
- "Ongoing work on..."

### Green Flags (Probably Not a Project)
- "Can you quickly...?"
- "Just fix the..."
- "One-time task..."
- "This should take an hour..."
- "Can you look into...?"
- "Quick question about..."
- "Just a one-off..."

---

## 📋 LUCY'S DECISION FRAMEWORK

When Tim mentions work, Lucy asks herself:

```
Does this work meet 3+ project criteria?
    ├─ YES → "This sounds like a project. Should I add it to Mission Control?"
    │        (Ask Tim for confirmation, then add)
    │
    └─ NO → "This is one-off work. Execute as a task."
             (No dashboard addition needed)
```

---

## 💬 LUCY'S RECOGNITION QUESTIONS

When something is ambiguous, Lucy asks Tim **one of these** to clarify:

### Quick Clarification Questions
1. **"Is this a one-time task or ongoing work?"**
   - Ongoing → likely project
   - One-time → likely task

2. **"Will this need tracking/status updates?"**
   - Yes → likely project
   - No → likely task

3. **"Will multiple people/agents work on this?"**
   - Yes → likely project
   - Just me → likely task

4. **"What's the timeline?"**
   - Days/weeks → likely project
   - Hours → likely task

5. **"Is this strategic/core to your mission?"**
   - Yes → likely project
   - No → likely task

### Full Project Assessment (If Still Uncertain)
**"Let me check: Is this a project?"**
- Multi-phase work? (Y/N)
- Measurable deliverables? (Y/N)
- Strategic value? (Y/N)
- Team involvement? (Y/N)
- Need tracking? (Y/N)

**3+ "Yes" answers = Project → Add to Mission Control**

---

## ✅ WHEN LUCY ADDS A PROJECT AUTONOMOUSLY

Lucy can autonomously add a project to Mission Control if Tim says:

**Explicit signals:**
- "Create a new project for..."
- "Add this to the dashboard..."
- "I need to track this..."
- "Start a project to..."

**Implicit signals (3+ criteria met):**
- Tim describes multi-phase work with team coordination
- Strategic importance is clear
- Timeline is weeks/months
- Recurring or ongoing nature mentioned

---

## ⚠️ WHEN LUCY ASKS FIRST

Lucy asks for confirmation before adding if:

- Ambiguous whether it's a project or task
- Only 2 project criteria met (borderline)
- Tim hasn't explicitly said to track it
- Unclear if it's strategic or one-off

**Example dialog:**
```
Tim: "We should organize our financial data better"
Lucy: "Is this an ongoing project to build a financial system, or a one-time cleanup task?"
Tim: "Ongoing — we'll need it for quarterly reviews"
Lucy: "Got it. I'll create a 'Financial Data Organization' project in Mission Control. [ADDED]"
```

---

## 📊 PROJECT METADATA TO CAPTURE

When Lucy adds a project, she includes:

- **Name** — Clear, action-oriented (e.g., "WorkSafeAI", "Project Warp Speed")
- **Description** — What is it, why does it matter
- **Owner** — Who's responsible (usually Tim or delegated agent)
- **Status** — Active, In Progress, Paused, Completed
- **Timeline** — Start/end dates or "Ongoing"
- **Team** — Who's working on it (agents or team members)
- **Goals** — Success criteria, measurable outcomes
- **Progress** — Initial estimate (0%, can be updated)

---

## 🚀 EXAMPLE SCENARIOS

### Scenario 1: Clear Project
```
Tim: "I want to build a mobile app for our team"
Lucy: "This is a multi-phase project. Adding to Mission Control..."
[ADDED] "Team Mobile App" project
- Status: Starting
- Timeline: 8-12 weeks
- Team: Johnny (frontend), Jarvis (backend), Chief (architecture)
- Goals: iOS + Android, authentication, core features
```

### Scenario 2: One-Off Task
```
Tim: "Can you fix the login page styling?"
Lucy: "One-off bug fix. Executing as task."
[EXECUTED] Fixed login page (no dashboard entry needed)
```

### Scenario 3: Ambiguous — Lucy Asks
```
Tim: "We should improve our documentation"
Lucy: "Is this a one-time documentation cleanup, or an ongoing system to keep docs current?"
Tim: "Ongoing — we need to maintain it"
Lucy: "[ADDED] 'Documentation System Maintenance' project"
- Status: Active
- Timeline: Ongoing
- Goals: Keep all docs current, auto-generate APIs
```

### Scenario 4: Borderline — Lucy Confirms
```
Tim: "I want better analytics on the dashboard"
Lucy: "This could be a project (analytics system) or a feature request (one-off improvement). Which?"
Tim: "Project — we'll expand it over time with more metrics"
Lucy: "[ADDED] 'Analytics Dashboard' project"
```

---

## 📏 PROJECT THRESHOLDS

**This IS a project if:**
- Timeline: ≥ 1 week
- Phases: ≥ 2
- Team: ≥ 2 people
- Deliverables: ≥ 2
- Strategic impact: High or Medium

**This is NOT a project if:**
- Timeline: < 1 day
- One-phase, one-person work
- One deliverable
- Tactical/ad-hoc nature
- Low strategic impact

---

## 🎯 LUCY'S OPERATING RULES

**Rule 1: Default to asking when uncertain**
- If borderline → Ask Tim for 10 seconds of clarification
- Better to confirm than add wrong projects

**Rule 2: Err on the side of tracking**
- When in doubt, add to Mission Control
- Tim can archive it if it wasn't a project
- Better tracked than missed

**Rule 3: Capture the context**
- When adding a project, capture Tim's exact intent
- Include quotes or paraphrasing in project description
- Makes it clear why it's a project

**Rule 4: Update as you learn**
- If a "task" becomes a project mid-execution → Add it
- If a "project" completes as one task → Note it for learning
- Projects can evolve; tracking can follow

---

## 📝 DOCUMENTATION

When Lucy adds a project, she:

1. **Adds to Mission Control Dashboard** (automatically in next heartbeat)
2. **Logs to memory** — Why it's a project, criteria met
3. **Creates initial briefing** (if multi-team work)
4. **Sets up tracking** — Status, owner, timeline

---

## 🔄 FEEDBACK LOOP

Tim can tell Lucy:

- **"This shouldn't be a project"** → Lucy marks as archived, learns pattern
- **"This should be a project"** → Lucy adds immediately, captures why
- **"Make it a project"** → Explicit signal, Lucy adds instantly

---

## 🧪 TESTING LUCY'S RECOGNITION

Tim can validate Lucy's project recognition by:

1. **Mention hypothetical work**: "What if we built a chatbot?"
2. **Listen for Lucy's response**: Does she ask clarifying questions or assume?
3. **Provide feedback**: "Yes, that would be a project" or "No, just exploratory"
4. **Lucy learns**: Pattern gets stronger over time

---

## ⚡ QUICK REFERENCE

| Signal | Lucy Does | Confidence |
|--------|-----------|------------|
| "Build X" | Add as project | 95% |
| "Create X" | Add as project | 95% |
| "Fix bug" | Execute as task | 95% |
| "Quick..." | Execute as task | 90% |
| "Track this" | Add as project | 100% |
| "Ongoing X" | Ask → likely project | 80% |
| "One-time X" | Execute as task | 85% |
| Ambiguous | Ask clarifying question | — |

---

## 🎯 NEXT LEVEL: SMART DETECTION

Over time, Lucy learns Tim's patterns:

- Tim says "quarterly planning" → Recognizes as recurring project
- Tim mentions "client request" → Flags as strategic
- Tim talks about "team coordination" → Marks as team project
- Lucy gets better at context understanding

This framework evolves as Lucy learns Tim's work style.

---

**Status:** Framework ready for immediate use  
**Last Updated:** March 29, 2026 @ 2:19 PM EDT  
**Lucy's Authority:** Add projects autonomously using this framework
