# Tim's Mission Control Guide

**How to use Mission Control to manage Lucy and agents, approve work, and steer projects**

---

## What is Mission Control?

Mission Control is your central command center at `http://localhost:3001` for managing:
- **All 6 projects** with current status, progress, and tasks
- **Lucy's work briefings** (what she wants to do)
- **Agent approvals** (what needs your yes/no)
- **Project adjustments** (real-time task status updates)
- **Document access** (view research, specs, code reviews)

**Key benefit:** You see everything agents are working on + what needs your decision.

---

## The Dashboard View

Open `http://localhost:3001` and you'll see:

### 1. Stats Bar
- **Active:** Number of active projects
- **Tasks:** Total tasks across all projects
- **Completion:** Average % complete
- **Pending:** How many approvals waiting for you

### 2. Lucy's Briefings & Feedback Section
This is where you manage agent work:
- **Work Briefings** — Lucy has a plan and wants approval
- **Status Requests** — Lucy needs your guidance/clarification
- **Feedback Received** — You gave feedback and work is adjusting
- **Approved** — Work you've approved (now executing)

### 3. Active Projects Table
- All 6 projects with status badges
- Progress bars for each
- Quick actions (View/Edit buttons)

### 4. Recent Updates
- Timeline of recent activity across all projects

---

## How to Approve/Reject Briefings

### When Lucy Creates a Work Briefing

You'll see:
```
Title: "Ready to implement real-time task updates"
Description: "Adding WebSocket support for live status. Est: 2-3 hours"
Status: ⏳ Awaiting Approval
Action: ✅ Approve or ❌ Reject
```

**Your decision options:**

1. **✅ Approve** — Lucy can proceed immediately
   - No feedback needed
   - Work starts
   - Task status updates as work progresses

2. **❌ Reject** — Lucy won't proceed
   - You'll be prompted to add feedback
   - Type why (too complex, wrong priority, need different approach)
   - Lucy sees feedback → Adjusts → Resubmits
   - Better than silently blocking

3. **No action needed** — Leave it for now
   - Briefing stays in "Awaiting Approval"
   - Lucy will check back later
   - You can approve anytime

---

## How to Respond to Status Requests

### When Lucy Asks a Question

You'll see:
```
Title: "Architecture decision: WebSocket vs Polling?"
Description: "Need to know which approach you prefer for real-time updates"
Status: ⏳ Awaiting Response
Action: Provide feedback
```

**How to respond:**

1. Click the briefing
2. Type your response in the feedback box
3. Click "Submit Feedback"

Lucy will see your response immediately (or when she checks next) and proceed accordingly.

**Examples of good responses:**
- ✅ "Go with WebSocket — we need real-time for this"
- ✅ "Start with polling — simpler, we can optimize later if needed"
- ✅ "Either works, but WebSocket scales better long-term"
- ✅ "Not sure — what do you recommend given the time budget?"

---

## How to Use Project Detail Pages

Open any project (e.g., `http://localhost:3001/projects/6` for Project Warp Speed)

### What You See

1. **Project Header**
   - Name, description, current status
   - Key stats: Progress %, # of tasks, owner

2. **Progress Bar**
   - Visual representation of completion %
   - Shows at-a-glance health

3. **Metrics Section**
   - Key numbers (revenue, market size, timeline)
   - Updated as project progresses

4. **Milestones/Status Items**
   - Current phase
   - Completed items with links to docs
   - Next milestones

5. **Tasks List**
   - All tasks with status (⏳ In Progress, ✅ Complete, 🔵 Queued)
   - Who's assigned to each
   - One-line descriptions

6. **Quick Adjustments** (Below Tasks)
   - Real-time task status changes
   - Add project feedback/notes
   - Focus mode (star tasks as priority)
   - View adjustment log

7. **Documents Section**
   - All associated files
   - View inline (Markdown rendering)
   - Market research, API docs, specs, etc.

---

## Real-Time Task Management

### Updating Task Status

**On any project detail page:**

1. Scroll to "🎯 Quick Adjustments"
2. See list of all tasks
3. Click status button for a task:
   - ⏳ = In Progress
   - ✅ = Complete
   - 🔵 = Queued
4. Status updates immediately

**Use this to:**
- Mark task complete when you hear work finished
- Update Lucy on what you want marked in progress
- Adjust priorities by starring tasks

### Adding Feedback/Notes

**In Quick Adjustments section:**

1. Type in "Add Project Feedback" box
2. Press Enter or click "Add"
3. Feedback logged with timestamp
4. Appears in Adjustment Log below

**Examples:**
- "Focus on the API this week"
- "Good progress! Keep velocity up"
- "Blocked on Stripe — need different approach"
- "Ready to review when done"

### Focus Mode (⭐)

**To mark a task as priority:**

1. In Quick Adjustments, see task list
2. Click ⭐ next to task name
3. Task becomes highlighted in yellow above
4. Team knows it's important

**Use this to:**
- Signal what matters most right now
- Prevent context switching (focus > multitask)
- Keep everyone aligned on priority

---

## Monitoring Progress

### Daily Check
```
1. Open http://localhost:3001
2. Scan briefings section (anything needing approval?)
3. Check stats (Pending approvals count)
4. Click on project (any tasks updated since yesterday?)
5. Skim recent updates timeline
```

### Weekly Check
```
1. Review each project detail page
2. Check progress % (moving forward?)
3. Read adjustment log (what changed?)
4. Review document updates (new docs added?)
5. Identify if any projects are stalled
```

### Monthly Review
```
1. Review all 6 projects in detail
2. Check against roadmap (on track?)
3. Identify blockers (adjustments needed?)
4. Approve/prioritize next month's work
5. Provide feedback on velocity
```

---

## Common Scenarios

### Scenario 1: Lucy Wants to Build Feature X
```
1. Lucy creates briefing: "Ready to implement feature X — 2 hours"
2. You see it on dashboard
3. You approve (or request changes)
4. Lucy starts work
5. You see task marked ⏳ In Progress
6. Hours later: task marked ✅ Complete
7. You can review if needed
```

### Scenario 2: Lucy is Blocked
```
1. Lucy marks task as ⏳ In Progress
2. She adds feedback: "Blocked on Stripe API rate limit"
3. You see note on dashboard
4. You respond in feedback box: "Use sandbox account instead"
5. Lucy sees response and continues
6. Task gets marked ✅ Complete
```

### Scenario 3: Lucy Asks a Decision
```
1. Lucy creates Status Request: "WebSocket or Polling?"
2. You see it on dashboard
3. You add feedback: "WebSocket — we need real-time"
4. Lucy sees response → designs accordingly
5. Lucy creates Work Briefing: "Ready to implement WebSocket — 3 hours"
6. You approve
7. Work proceeds
```

### Scenario 4: You Want to Reprioritize
```
1. Open project detail page
2. See task you want prioritized
3. Click ⭐ to star it
4. Task becomes highlighted
5. Lucy sees it and focuses there
```

### Scenario 5: You Want to Check Progress
```
1. Open project detail page
2. Scroll down to "Quick Adjustments" → "Adjustment Log"
3. See all changes made: status updates, notes, timestamps
4. Understand what changed and when
```

---

## Briefing Types Explained

### Work Briefing
**Purpose:** Lucy has a plan and wants approval to execute

**What you do:**
- ✅ Approve (Lucy starts immediately)
- ❌ Reject + feedback (Lucy adjusts and resubmits)
- Wait (Lucy can proceed anyway if urgent)

**Timeline:** Could take hours or days for approval

**Example:**
```
Title: "Implement JWT refresh token rotation"
Description: "Improving security by rotating tokens every 30 min. Est: 1.5 hours"
```

### Status Request
**Purpose:** Lucy needs your guidance, decision, or feedback

**What you do:**
- Add feedback box response (Lucy adjusts based on your answer)
- Respond within 24h (Lucy can't proceed without guidance)

**Timeline:** Usually quick (needs your input to move forward)

**Example:**
```
Title: "Architecture: Store tokens in HTTP-only cookies or localStorage?"
Description: "Need your preference given our security posture"
```

---

## Key Principles

### Trust Agents to Code
- Don't approve implementation details
- You approve direction, not syntax
- Agents are skilled — let them figure out the how

### Be Clear on Rejections
- If you say no, explain why
- "No" without context = Lucy guesses and resubmits
- "No — use simpler approach" = Lucy knows what to fix

### Approve Quickly
- If briefing is good, approve same day
- Don't let agents wait days (kills momentum)
- If unsure, ask clarification question

### Update Task Status
- Mark complete when work finishes
- Mark in progress if you're directing mid-work
- Status = real-time project health

### Use Focus Mode
- Star 1-2 critical tasks per project
- Too many stars = no focus
- Stars mean "this is the priority right now"

---

## Troubleshooting

### Briefing Won't Appear
- Refresh browser
- Check that Mission Control server is running
- Restart if needed: `cd /apps/mission-control-express && npm start`

### Can't Approve a Briefing
- Click the briefing card to open it
- Look for green "Approve" button
- If no button, briefing might already be approved

### Document Not Showing
- Check that document exists in workspace
- Verify path is correct in project page
- Try refreshing

### Task Status Not Updating
- Check server running: `ps aux | grep node`
- Refresh browser
- Try restarting Mission Control

---

## Files to Know

| File | Purpose |
|------|---------|
| `MISSION_CONTROL_AGENT_GUIDE.md` | Complete guide for agents |
| `LUCY_OPERATIONAL_PLAYBOOK.md` | How Lucy operates |
| `MISSION_CONTROL_QUICK_REF.md` | Quick reference lookup |
| `/apps/mission-control-express/` | Main app location |

---

## Quick Start

1. Open `http://localhost:3001`
2. Check "Lucy's Briefings & Feedback" section
3. Review any pending approvals
4. Approve/reject/provide feedback as needed
5. Click on projects to see detailed status
6. Update task status or add feedback if needed
7. Check documents for any project
8. Done!

---

**Mission Control keeps you in sync with agents without constant back-and-forth. It's async, organized, and transparent.**
