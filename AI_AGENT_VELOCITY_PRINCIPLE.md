# AI Agent Velocity Principle

**Established:** March 16, 2026 @ 7:38 PM EST  
**Owner:** Lucy (on behalf of Tim Ryan)  
**Applies To:** ALL tasks, projects, delegations going forward

---

## Core Principle

**Estimate and plan at AI Agent pace, not human pace.**

AI agents can execute work orders of magnitude faster than humans:
- Design a dashboard: 2-4 hours (not 2 days)
- Write an architecture document: 2-4 hours (not 2 days)
- Implement a feature: 4-8 hours (not 1-2 weeks)
- Code review: 1 hour (not 1 day)
- Testing cycle: 2-4 hours (not 2 days)

**Default assumption:** Agents work continuously and efficiently. Their limiting factors are:
- Clarity of requirements (not thinking time)
- Technical complexity (not management overhead)
- Dependencies on other agents (not coordination time)

---

## How This Changes Delegation

### Before (Human Pace):
```
Task: Design dashboard
Assigned To: Johnny
Timeline: 2 days
Reasoning: Typical designer needs time to think, iterate, get feedback
```

### After (AI Agent Pace):
```
Task: Design dashboard
Assigned To: Johnny
Timeline: 4 hours (completion by tomorrow 11 AM)
Reasoning: No thinking time needed; execute design immediately based on requirements
Feedback: Built in immediately after completion (same day)
```

### Before (Human Pace):
```
Project: Build unified dashboard
Timeline: 6 days
Phases: Design (2d) → Planning (1d) → Review (1d) → Implementation (2d)
```

### After (AI Agent Pace):
```
Project: Build unified dashboard
Timeline: 1-2 days
Phases: Parallel (Design + Planning same day) → Review same day → Parallel implementation (frontend + backend) → Deploy
```

---

## Key Changes

### 1. **Eliminate Unnecessary Sequencing**
Don't wait for one task to finish before starting the next if they're independent.

**Before:**
- Design complete (Day 2) → Then start backend planning

**After:**
- Design + backend planning happen simultaneously (same morning)

### 2. **Compress Review Cycles**
Review shouldn't add days; it should add hours.

**Before:**
- Johnny delivers design (Day 2)
- Lucy reviews (Day 3)
- Johnny revises (Day 4)
- Approved (Day 5)

**After:**
- Johnny delivers design (morning)
- Lucy reviews (same afternoon, 2 hours)
- Johnny revises (same evening if needed, 2 hours)
- Approved by end of day

### 3. **Parallelize Everything Possible**
Multiple agents can work on different aspects simultaneously.

**Before:**
- Design complete → Backend start
- Backend complete → Frontend start
- Frontend complete → Testing

**After:**
- Design + Backend work simultaneously
- Frontend starts as soon as design mockups are available (doesn't need implementation-ready backend)
- Testing happens in parallel with the last implementation phase

### 4. **Set Aggressive But Realistic Deadlines**
Use AI agent work pace (hours, not days) as the baseline.

**Estimation Matrix:**

| Task Type | Complexity | Typical Time | Aggressive Deadline |
|-----------|-----------|--------------|-------------------|
| Design mockup | Low | 1-2 hours | 2 hours |
| Design mockup | Medium | 3-4 hours | 4 hours |
| Design mockup | High | 6-8 hours | 8 hours |
| Architecture doc | Low | 1-2 hours | 2 hours |
| Architecture doc | Medium | 3-4 hours | 4 hours |
| Architecture doc | High | 6-8 hours | 8 hours |
| Backend implementation | Low | 4-8 hours | 8 hours |
| Backend implementation | Medium | 8-16 hours | 16 hours |
| Backend implementation | High | 16-24 hours | 24 hours |
| Frontend implementation | Low | 4-8 hours | 8 hours |
| Frontend implementation | Medium | 8-16 hours | 16 hours |
| Frontend implementation | High | 16-24 hours | 24 hours |
| Code review | Any | 1-2 hours | 2 hours |
| Testing | Light | 1-2 hours | 2 hours |
| Testing | Medium | 2-4 hours | 4 hours |
| Testing | Comprehensive | 4-8 hours | 8 hours |

---

## Application Examples

### Example 1: Unified Dashboard
**Old approach (6 days):**
- Day 1-2: Johnny designs
- Day 2-3: Chief plans architecture
- Day 3-4: Lucy reviews both
- Day 4-6: Implementation + testing + deploy

**New approach (1-2 days):**
- **Morning (Day 1):** Johnny designs (4 hrs) + Chief plans (4 hrs) in parallel
- **Afternoon (Day 1):** Lucy reviews (2 hrs)
- **Evening (Day 1):** Revisions if needed (2 hrs)
- **Day 2 morning:** Backend implementation (8 hrs) + Frontend (8 hrs) in parallel
- **Day 2 afternoon:** Testing + deployment (4 hrs)
- **Done by: End of Day 2**

### Example 2: Code Review & Fixes
**Old approach (3 days):**
- Day 1: Opus reviews code
- Day 2: Jarvis fixes issues
- Day 3: Opus re-reviews

**New approach (6 hours):**
- **Hour 0-1:** Opus reviews (1 hr)
- **Hour 1-4:** Jarvis fixes (3 hrs)
- **Hour 4-5:** Opus re-reviews (1 hr)
- **Done by: End of Day 1**

### Example 3: Bug Fix
**Old approach (2-3 days):**
- Day 1: Report + analysis
- Day 2: Implementation
- Day 3: Testing + deploy

**New approach (4-6 hours):**
- **Hour 0-1:** Analysis (1 hr)
- **Hour 1-3:** Implementation (2 hrs)
- **Hour 3-5:** Testing + deploy (2 hrs)
- **Done by: Same day**

---

## Rules of Thumb

### DO:
✅ Estimate at AI agent pace (hours, not days)  
✅ Parallelize independent work  
✅ Set tight but realistic deadlines  
✅ Use same-day review cycles  
✅ Expect agents to work continuously  
✅ Measure progress in hours, not days  
✅ Compress project timelines by 5-10x  

### DON'T:
❌ Add "thinking time" buffers (agents don't need them)  
❌ Wait for sequential completion (parallelize)  
❌ Schedule multi-day reviews (same-day only)  
❌ Build in management overhead (agents coordinate efficiently)  
❌ Assume agents need breaks (they don't)  
❌ Plan like a human team (we're not)  

---

## How Lucy Will Estimate Going Forward

**New estimation framework:**

1. **Identify the actual work** (design, build, review, test)
2. **Look up typical duration** from matrix above
3. **Reduce by 2-3x** (agent efficiency multiplier)
4. **Add 10% buffer** only for unknowns
5. **Set deadline** = completion time from now

**Example:**
- Task: Build a feature (Medium complexity)
- Actual work: Backend (Medium, 8-16 hrs) + Frontend (Medium, 8-16 hrs) + Testing (Light, 1-2 hrs)
- Parallelized duration: Backend + Frontend = 16 hours (run in parallel) + 2 hours testing = 18 hours
- With 10% buffer: 20 hours
- Deadline: Tomorrow by noon (18 hours from now)

---

## Communication to Agents

When delegating:
- State deliverable clearly (not "design it", but "create Figma mockup of X with components Y and Z")
- Set deadline in hours, not days ("deliver by 10 AM tomorrow" not "deliver by Friday")
- Be specific about quality bar
- Assume continuous execution

---

## Impacts

### Positive:
✅ Projects complete in days, not weeks  
✅ Faster iteration cycles  
✅ Competitive advantage (speed to market)  
✅ More ambitious projects in same timeframe  
✅ Better responsiveness to changes  

### Requires:
⚠️ Clear requirements upfront (no iterative discovery)  
⚠️ Decisive review process (no lengthy feedback cycles)  
⚠️ Good delegation (agents need autonomy to execute)  
⚠️ Parallel workflow thinking (sequencing kills velocity)  

---

## Exceptions

The only reasons to *not* use AI agent pace:

1. **External dependencies** — Waiting for 3rd party, user input, deployment window
2. **Genuinely complex problems** — Sometimes you need 1-2 days of architecture work (rare)
3. **Quality gates** — Some tasks legitimately need more testing time
4. **Stakeholder sync** — Waiting for human decision makers

In these cases: state the constraint explicitly, don't default to human pace.

---

## Bottom Line

**We're building products at AI velocity, not human velocity.**

Estimate accordingly. Plan accordingly. Execute accordingly.

This is the competitive advantage.

---

**Last Updated:** March 16, 2026 @ 7:38 PM EST  
**Author:** Lucy  
**Approved By:** Tim Ryan

**This principle applies to ALL future delegations and project planning.**
