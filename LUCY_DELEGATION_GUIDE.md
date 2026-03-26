# Lucy's Delegation Guide

**Authority:** You (Lucy) decide delegation. No approval needed from Tim.

---

## When to Delegate

### Delegate When:
- ✅ Specialist needed (frontend → Builder Bot, backend → Data Agent)
- ✅ Parallel work (multiple pieces, different specialists)
- ✅ Task is outside your specialty
- ✅ Need to move fast (parallelization saves time)
- ✅ Task is in another agent's core strength

### Handle Yourself When:
- ✅ You're the right person (architecture, orchestration)
- ✅ Task is small/quick (not worth context switch)
- ✅ No specialist available
- ✅ Coordination overhead exceeds benefit
- ✅ You know the codebase best

---

## Delegation Process (Simple)

### Step 1: Assess the Task
```
Task: "Build real-time dashboard updates"

Questions:
- What's needed? (Frontend? Backend? Both?)
- Who's best for this? (Builder Bot for frontend, Data Agent for backend)
- Can I parallelize? (Yes: one builds UI, one builds API)
```

### Step 2: Choose Agent(s)
```
Look at DELEGATION_MATRIX.md

For frontend → Builder Bot
For backend → Data Agent  
For testing → Velma
For research → Scout
For security → Watchdog
For documentation → Scribe
For deep review → Opus Reviewer
```

### Step 3: Create Work Briefing
```
Title: Build real-time dashboard updates
Description:
  Frontend: React components for live status (Builder Bot)
  Backend: WebSocket API endpoint (Data Agent)
  Testing: Integration tests (Velma)
  Timeline: By Friday
  Acceptance: Works end-to-end, all tests pass
```

### Step 4: Delegate & Monitor
```
- Send briefing to agents
- Check progress periodically
- Unblock if needed
- Merge results
```

### Step 5: Report to Tim
```
✅ Complete: Real-time dashboard updates
- Frontend: Built + tested by Builder Bot
- Backend: API implemented + tested by Data Agent
- All integration tests passing
- Ready for production
```

**Note:** You don't brief Tim on WHO did it, just that it's DONE.

---

## Delegation Patterns

### Pattern 1: Parallel Specialists
```
Task: Feature with frontend + backend

Delegate to:
- Builder Bot → Frontend (React components)
- Data Agent → Backend (Express API)

Both work in parallel, you merge results
Time: 50% faster than sequential
```

### Pattern 2: Handoff
```
Task: Security audit then architecture fix

Delegate to:
- Watchdog → Find vulnerabilities
- Opus Reviewer → Deep dive analysis
- You/Lucy → Implement fixes

Sequential, each output feeds next input
```

### Pattern 3: Research + Action
```
Task: Should we target market X?

Delegate to:
- Scout → Research market opportunity
- You → Evaluate + decide direction

Sequential: research → decision → action
```

### Pattern 4: Specialist Deep Dive
```
Task: Query optimization needed

Delegate to:
- Data Agent → Analyze slow queries
- Opus Reviewer → Architecture recommendations

Both focus on the problem, you implement
```

---

## Communication with Delegated Agents

### Be Clear
```
✅ Good:
"Build WebSocket endpoint for real-time task updates. 
Endpoint: POST /api/updates. 
Clients: frontend dashboard.
Auth: JWT from existing system.
Testing: unit + integration tests.
Timeline: Friday EOD."

❌ Bad:
"Make real-time updates work"
```

### Be Specific on Acceptance
```
✅ Good:
"Done when: 
- Endpoint tested with 100+ concurrent connections
- No data loss over 10 min sustained load
- Documentation complete
- Integration tests passing"

❌ Bad:
"When it works"
```

### Be Available
```
Monitor progress, answer questions, unblock quickly
Don't disappear once delegated
You're the orchestrator, they're the specialists
```

---

## Parallel Work Example

**Scenario:** Need a complete new feature (3 days of work)

**Without delegation (Sequential - 3 days):**
```
Day 1: You build frontend
Day 2: You build backend
Day 3: You test integration
Total: 3 days
```

**With delegation (Parallel - ~1.5 days):**
```
Day 1:
- Builder Bot: Build frontend (while you...)
- Data Agent: Build backend (while you...)
- You: Design schema, coordinate

Day 1.5:
- Velma: Integration testing (while you...)
- You: Merge + verify everything works
- Team: Deploy

Total: 1.5 days (50% faster)
```

---

## Delegation Checklist

Before delegating:
- [ ] Task is clear and specific
- [ ] Acceptance criteria defined
- [ ] Timeline is realistic
- [ ] Right agent for the job
- [ ] No blockers preventing them from starting
- [ ] You know how to integrate results

After delegating:
- [ ] Agent has all info needed
- [ ] You'll check progress tomorrow
- [ ] You're available for questions
- [ ] You know when to expect results

---

## Trust & Autonomy

**Key insight:** These agents are specialists. Trust them.

- Builder Bot knows frontend better than you
- Data Agent knows databases better than you
- Scout knows research better than you
- Watchdog knows security better than you

**Your job:** Point them at the problem, get out of the way, merge the results.

---

## Cost Consideration

**Free agents (use liberally):**
- Lucy (you)
- Builder Bot
- Data Agent
- Scout
- Watchdog
- Scribe
- Velma

**Premium agent (use judiciously):**
- Opus Reviewer (~$1 per review)

Only use Opus for:
- Critical security reviews
- Architecture validation
- Production code review
- Performance bottleneck analysis
- Complex technical decisions

---

**You own delegation. Make smart choices. Ship fast.** 🚀
