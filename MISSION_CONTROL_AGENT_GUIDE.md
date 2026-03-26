# Mission Control Agent Guide

**Last Updated:** March 25, 2026, 7:50 PM EST  
**Version:** 1.0

This guide is for Lucy and all agents running work on Tim's behalf. It explains how to use Mission Control and the new briefing system to stay organized and communicate effectively.

---

## What is Mission Control?

**Mission Control** is the central dashboard at `http://localhost:3001` that:
- Displays all 6 active projects with status, progress, and tasks
- Manages task feedback, adjustments, and focus prioritization
- Shows Lucy's briefings, approvals, and feedback requests
- Provides document access for all projects
- Tracks all decisions and changes in audit logs

**Key Rule:** Mission Control is the source of truth for project status. Check it before starting work.

---

## System Architecture

### Frontend
- **Tech:** React + Vite (SPA)
- **Components:** Dashboard, Projects, Gap Analysis, Team, Contacts, Calendar, Memory, Docs
- **Port:** 3001 (`http://localhost:3001`)
- **Location:** `/apps/mission-control-express/client/`

### Backend
- **Tech:** Express.js (Node.js)
- **API Routes:** `/api/projects/`, `/api/documents/`, etc.
- **Port:** 3001 (same as frontend)
- **Data:** JSON file persistence (no database)
- **Location:** `/apps/mission-control-express/server/`

### Data Files
- **Projects:** `client/src/data/projects.json` (persistent state)
- **Metadata:** `client/src/data/projectMetadata.js` (task lists, metrics, docs)
- **Documents:** Linked to workspace directories (e.g., `/projects/warp-speed-research/`)

---

## For Agents: How to Use Mission Control

### 1. **Check Dashboard on Startup**

Before starting work, always:
```
1. Open http://localhost:3001
2. Review "Lucy's Briefings & Feedback" section
3. Check for any pending approvals or feedback from Tim
4. Review "Active Projects" table for current priorities
```

### 2. **Create a Briefing When Ready to Work**

When you have a plan and are ready to execute:

```
Briefing Format:
- Type: "Work Briefing" or "Status Request"
- Title: What you're proposing (e.g., "Add real-time notifications")
- Description: Brief summary (3-4 sentences max)
- Expected Action: "Approve/Reject" or "Respond"
```

**Example Briefing:**
```
Type: Work Briefing
Title: Implement Real-time Task Updates
Description: Ready to add WebSocket support to Mission Control for live task status updates. Will include frontend listeners + backend broadcast system. Estimated: 2-3 hours.
Action Required: Approve/Reject
```

### 3. **Wait for Approval**

Do NOT proceed until Tim approves. Possible responses:
- ✅ **Approved** → Execute the work
- ❌ **Rejected** → Provide feedback (you'll see why)
- 📝 **Feedback** → Tim provided clarification → Adjust and resubmit

### 4. **Request Clarification When Blocked**

If you need input to move forward:
```
Type: Status Request
Title: Architecture question - Real-time sync approach?
Description: Should we use WebSockets or Server-Sent Events (SSE) for real-time updates?
Action Required: Respond
```

**Tim will respond with guidance.** Don't guess — ask.

### 5. **Update Project Status on Task Completion**

When a task finishes:
1. Go to `/projects/[id]`
2. Use **Quick Adjustments** → Task Status Control
3. Click ✅ to mark complete
4. Add a note in feedback box (optional)
5. Log in Adjustment Log is automatic

### 6. **Track Decisions in Adjustment Log**

Every change is logged with timestamp:
- Task status change
- Feedback added
- Focus prioritization
- Project updates

**This is your audit trail.** Reference it when questions arise.

---

## Active Projects (as of March 25, 2026)

| ID | Project | Owner | Status | Progress | Tasks | Documents |
|----|---------|-------|--------|----------|-------|-----------|
| 1 | WorkSafeAI | Lucy | Active | 85% | 12 | README, Code Reviews, Stripe Docs |
| 2 | Mission Control | Lucy | Active | 95% | 6 | README.md |
| 3 | Consensus | Lucy | Active | 70% | 8 | Strategy, Research |
| 4 | LinkedIn Automation | Lucy | Active | 100% | 4 | Setup Guide |
| 5 | Hyperscaler Briefings | Lucy | Active | 100% | 3 | API Docs |
| 6 | Project Warp Speed | Tim | Active | 40% | 22 | TAM, Competitor, Segments, Trends, Research |

---

## Document Viewer

**How to Access:**
1. Open any project detail page (`/projects/[id]`)
2. Scroll to "📚 Documents" section
3. Click document name to expand
4. Read inline with formatting preserved

**Supported Formats:**
- Markdown (.md) — Full formatting
- Plain text (.txt) — Raw display
- PDF (.pdf) — Listed with link

**Security:** Only workspace files accessible. Path traversal protection enabled.

---

## Task Management Controls

**Quick Adjustments Section** on project detail pages:

### Status Change
- Click ⏳ (In Progress), ✅ (Complete), or 🔵 (Queued)
- Changes save immediately
- Logged to Adjustment Log with timestamp

### Focus Mode
- Click ⭐ to mark task as priority
- Shows highlighted above task list
- Use when task needs team focus

### Add Feedback
- Type in feedback box
- Enter pressed or "Add" button
- Auto-logged with timestamp

### Adjustment Log
- Collapsible section showing all changes
- Shows: Type, Task, Action, Timestamp
- Use for history/audit trail

---

## API Reference

### Get All Projects
```bash
GET /api/projects
Response: { projects: [...], pendingApprovals: N }
```

### Get Project Details
```bash
GET /api/projects/:id
Response: { project: { id, name, status, progress, ... } }
```

### Update Project
```bash
PUT /api/projects/:id
Body: { status, progress, description, owner }
Response: { success: true, project: {...} }
```

### Get Project Documents
```bash
GET /api/projects/:id/documents
Response: { documents: [ { name, size, type, path, ... } ] }
```

### Get Document Content
```bash
GET /api/documents/content?path=/path/to/file.md
Response: { content: "...", type: "markdown" }
```

---

## Workflow: The Ideal Cycle

### Step 1: Check Dashboard
```
Lucy logs in → Opens http://localhost:3001
→ Reviews briefings & approvals → Checks project status
```

### Step 2: Create Briefing
```
Lucy: "Ready to implement feature X in Project Y"
→ Briefing created with status "Awaiting Approval"
```

### Step 3: Get Approval
```
Tim sees briefing on Dashboard
→ Approves / Rejects / Provides feedback
→ Lucy sees response immediately (page refreshes or she checks again)
```

### Step 4: Execute Work
```
If approved:
  Lucy starts work → Updates task status as progresses
  → Adds feedback/notes → Marks tasks complete

If rejected:
  Lucy sees feedback → Asks clarification if needed
  → Adjusts approach → Resubmits briefing
```

### Step 5: Final Status
```
Work completes → All tasks marked ✅
→ Adjustment log shows full history
→ Documents updated/added to project
→ Ready for next cycle
```

---

## Best Practices for Agents

1. **Always get approval before major work**
   - Don't assume, brief first
   - 1 approval > 10 corrections after

2. **Ask for clarification when unclear**
   - Use Status Request briefings
   - Better to ask than guess

3. **Update task status in real-time**
   - Don't wait until work finishes
   - Mark "In Progress" when starting
   - Mark "Complete" when done

4. **Use Adjustment Log as audit trail**
   - Documents why decisions were made
   - Helpful for debugging later
   - Shows work progression

5. **Add descriptive feedback**
   - "Started implementation" (good)
   - Completed X, blocked on Y, need approval for Z (better)

6. **Check documents before coding**
   - Review related docs on project
   - Understand context
   - Avoid duplicate work

7. **Respect focus priorities**
   - If task is starred (⭐), prioritize it
   - It means Tim flagged it as important
   - No context switching if focus is on

---

## Troubleshooting

### "Briefing system not showing"
- Refresh browser: `http://localhost:3001`
- Check server running: `ps aux | grep node`
- Rebuild if needed: `npm run build && npm start`

### "Document viewer blank"
- Check file exists in workspace
- Verify path in projectMetadata.js
- Test API: `/api/projects/6/documents`

### "Task status change not saving"
- Check backend API: `curl http://localhost:3001/api/projects/1`
- Verify JSON file writable: `ls -l client/src/data/projects.json`
- Check browser console for errors

### "Briefing got rejected, unsure why"
- Tim provided feedback in red feedback box
- Open the briefing → Read the feedback
- Ask clarification briefing if still unclear

---

## Key Files to Know

- **Main app:** `/apps/mission-control-express/`
- **Frontend:** `/apps/mission-control-express/client/src/`
- **Backend:** `/apps/mission-control-express/server/`
- **Projects data:** `/apps/mission-control-express/client/src/data/projects.json`
- **Project metadata:** `/apps/mission-control-express/client/src/data/projectMetadata.js`
- **Briefing component:** `/apps/mission-control-express/client/src/components/AgentBriefing.jsx`
- **Task management:** `/apps/mission-control-express/client/src/components/TaskManagement.jsx`

---

## Quick Start Checklist for New Agent Sessions

- [ ] Open `http://localhost:3001`
- [ ] Check "Lucy's Briefings & Feedback" section
- [ ] Review project status & priorities
- [ ] Read relevant project documents
- [ ] Create briefing if ready to work
- [ ] Wait for approval before executing
- [ ] Update task status as you work
- [ ] Add feedback/notes when blocking
- [ ] Mark complete when done

---

**This guide is living documentation. Update it as the system evolves.**
