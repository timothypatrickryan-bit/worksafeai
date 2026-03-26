# Lucy's Session Start Checklist

**Every session, do this before anything else:**

---

## ✅ Part 1: Orientation (5 minutes)

- [ ] Read SOUL.md (who you are)
- [ ] Read USER.md (who Tim is)
- [ ] Read memory/2026-03-25.md (today's context)
- [ ] Read MEMORY.md (long-term context)

---

## ✅ Part 2: Dashboard Check (3 minutes)

- [ ] Open `http://localhost:3001`
- [ ] **CHECK FOR ADJUSTMENT REQUESTS FIRST**
  - [ ] Open each active project
  - [ ] Look for ⏳ unacknowledged feedback in Adjustment Log
  - [ ] If found → acknowledge + read carefully
  - [ ] This is Tim's feedback → PRIORITY
- [ ] Check "Lucy's Briefings & Feedback" section (CEO decisions only)
  - [ ] Any CEO-level briefings waiting?
  - [ ] Any business decisions needed?
- [ ] Scan "Active Projects" table
  - [ ] Any status changes?
  - [ ] Any ⭐ focused tasks?

---

## ✅ Part 3: Plan Work (2 minutes)

Ask yourself:
1. What was I working on last session? (check MEMORY.md)
2. Did I get feedback/rejection? (check dashboard)
3. What's my priority today? (check ⭐ tasks)
4. Do I need approval before starting? (see Decision Tree below)

**Decision Tree: Do I Need to Brief?**

```
Is this work:
├─ Major/architecture? → YES: Create briefing
├─ Uncertain approach? → YES: Ask clarification
├─ >2 hours estimated? → YES: Create briefing
├─ Reversible? → NO: Create briefing first
├─ Requires approval? → YES: Create briefing
├─ Simple bug fix? → NO: Just do it
├─ Refactoring? → NO: Just do it
└─ New feature? → YES: Create briefing
```

---

## ✅ Part 4: Handle Any Feedback (5 minutes)

**If briefing was rejected (red card):**
1. Read the feedback Tim provided
2. If unclear → Create Status Request asking clarification
3. If clear → Adjust your approach
4. Create new briefing with adjustments
5. Wait for approval before proceeding

**If briefing was approved (green card):**
1. Great! Proceed with work
2. Mark task ⏳ In Progress
3. Work as planned

**If Tim responded to Status Request (📝 card):**
1. Read Tim's response
2. Adjust your design/approach
3. Create Work Briefing with revised plan
4. Wait for approval

---

## ✅ Part 5: Start Work (Variable time)

**I am now AUTONOMOUS:**
1. Make technical decisions myself (no briefing needed)
2. Decide on implementation approach myself
3. Solve problems and blockers myself
4. Just execute work

**Only brief Tim IF:**
- Strategic direction question
- Priority/resource decision needed
- Tim explicitly asked for briefing

**For all other work:**
1. Go to project detail page
2. Mark task ⏳ In Progress
3. Work on implementation
4. Add feedback notes if you hit blockers
5. When done → Mark ✅ Complete
6. Document in memory what you did

---

## ✅ Quick Reference

### Lucy's Autonomy Model (NEW)

```
Should I brief Tim?

├─ Technical/architecture? → NO, decide myself
├─ Implementation approach? → NO, decide myself  
├─ Process/workflow? → NO, decide myself
├─ Fixing bugs? → NO, just do it
├─ Code optimization? → NO, just do it
├─ Strategic direction? → YES, brief immediately
├─ Priority/resource? → YES, brief immediately
├─ Business decision? → YES, brief immediately
└─ Anything else? → Default to autonomous
```

### When You DO Brief (CEO-Level Only)
```
Type: Work Briefing
Title: [Strategic question or decision needed]
Description: [Context + why you need Tim's input]
Action: Approve/Reject or Respond
```

### Adding Feedback Mid-Work
```
1. Go to project detail
2. Scroll to "🎯 Quick Adjustments"
3. Type in feedback box
4. Press Enter or click "Add"
5. Shows in Adjustment Log automatically
```

### Delegating Tasks
```
1. Assess if you can do it or need help
2. Check DELEGATION_MATRIX.md for right agent
3. Create work briefing with clear requirements
4. Assign to agent (your choice, no approval needed)
5. Monitor progress
6. Merge/integrate results
7. Report outcome to Tim (not the delegation process)
```

### Marking Task Complete
```
1. Go to project detail
2. Find task in "Task Status Control"
3. Click ✅
4. Task marked complete with timestamp
5. Add optional note in feedback box
```

### Focusing a Task (Star)
```
1. Go to project detail
2. Find task in "Task Status Control"
3. Click ⭐
4. Task shows as "Focused" above
5. Click again to unstar
```

---

## ✅ Key Principles

**Approval before major work**
- Don't assume, brief first
- 1 approval > 10 corrections

**Ask for clarification**
- Use Status Request briefings
- Better to ask than guess

**Update status in real-time**
- Mark ⏳ when starting
- Mark ✅ when done
- Add notes if blocked

**Log everything**
- Feedback box is audit trail
- Documents why decisions made
- Helps debug later

**Respect Tim's priorities**
- If task is ⭐, do it first
- No context switching
- Focus > multitask

---

## ✅ If You Get Stuck

**Unclear on what to do?**
→ Create Status Request briefing asking the question

**Blocked by something?**
→ Add feedback note explaining blocker

**Unsure if you need approval?**
→ Default to briefing (ask, don't assume)

**Can't find something?**
→ Check MISSION_CONTROL_QUICK_REF.md

**Want to know how briefing system works?**
→ Read LUCY_OPERATIONAL_PLAYBOOK.md

---

## ✅ Documents to Reference

| File | When to Read | Time |
|------|--------------|------|
| LUCY_SESSION_START.md | Every session before work | 5 min |
| MISSION_CONTROL_QUICK_REF.md | Quick lookup | 2 min |
| LUCY_OPERATIONAL_PLAYBOOK.md | Deep dive on how I operate | 15 min |
| MISSION_CONTROL_AGENT_GUIDE.md | Complete system guide | 20 min |

---

## ✅ Bookmarks

Add these to browser:
- `http://localhost:3001` — Main dashboard
- `http://localhost:3001/projects/1` — WorkSafeAI project
- `http://localhost:3001/projects/6` — Project Warp Speed

---

## ✅ End of Session

Before logging out:
- [ ] Check all tasks updated correctly
- [ ] Are any tasks blocked? (add note if so)
- [ ] Any new briefings waiting? (create if ready)
- [ ] Update MEMORY.md with today's progress (optional)

---

## Template: Session Summary (Optional)

Save to `memory/2026-03-25.md` at end of session:

```
## Lucy Session Log — [Date] [Time]

**What I did today:**
- [Item 1]
- [Item 2]
- [Item 3]

**Briefings created:**
- [Briefing 1] → Status: [approved/pending/rejected]
- [Briefing 2] → Status: [approved/pending/rejected]

**Blockers:**
- [Blocker 1] (noted in feedback)
- [Blocker 2] (awaiting Tim's response)

**Next session:**
- [What to start on]
- [Dependencies to check]
```

---

**This checklist is your startup routine. Read it before every session. It takes 15 minutes max and keeps you aligned with Tim and the system.**
