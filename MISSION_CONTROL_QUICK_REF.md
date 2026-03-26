# Mission Control Quick Reference

**Quick lookup for agents and Lucy**

---

## URLs & Access

| Item | URL/Path |
|------|----------|
| Dashboard | `http://localhost:3001` |
| Project [N] | `http://localhost:3001/projects/[N]` |
| Gap Analysis | `http://localhost:3001/gap-analysis` |
| Team | `http://localhost:3001/team` |
| Contacts | `http://localhost:3001/contacts` |
| Calendar | `http://localhost:3001/calendar` |
| Memory | `http://localhost:3001/memory` |
| Docs | `http://localhost:3001/docs` |

---

## Project IDs

| ID | Project | Owner |
|----|---------|-------|
| 1 | WorkSafeAI | Lucy |
| 2 | Mission Control | Lucy |
| 3 | Consensus | Lucy |
| 4 | LinkedIn Automation | Lucy |
| 5 | Hyperscaler Briefings | Lucy |
| 6 | Project Warp Speed | Tim |

---

## Briefing Types

| Type | When | Example |
|------|------|---------|
| Work Briefing | Ready to execute | "Ready to implement real-time updates — 2 hours" |
| Status Request | Need guidance | "Architecture decision: WebSocket or polling?" |

---

## Task Status Symbols

| Symbol | Status | Use When |
|--------|--------|----------|
| ⏳ | In Progress | Starting work on task |
| ✅ | Complete | Task finished |
| 🔵 | Queued | Task planned but not started |

---

## Quick Adjustments (Project Detail)

| Action | Button | Result |
|--------|--------|--------|
| Change status | ⏳ ✅ 🔵 | Updates task status immediately |
| Focus task | ⭐ | Highlights task as priority |
| Add feedback | Text box | Logs note with timestamp |
| View log | Show button | Expands adjustment history |

---

## Status Codes

| Status | Meaning |
|--------|---------|
| 🟢 Approved | Tim said yes — proceed |
| 🟡 Awaiting Approval | Waiting for Tim's decision |
| 🔴 Rejected | Tim said no — read feedback |
| 📝 Feedback Received | Tim provided guidance — adjust & resubmit |
| ⏳ Awaiting Response | Waiting for Tim to respond to question |

---

## API Endpoints (for debugging)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/projects` | List all projects |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project |
| GET | `/api/projects/:id/documents` | List project docs |
| GET | `/api/documents/content?path=...` | Read document |

---

## File Locations

| File | Purpose |
|------|---------|
| `/apps/mission-control-express/` | Main app directory |
| `client/src/pages/Dashboard.jsx` | Dashboard page |
| `client/src/pages/ProjectDetail.jsx` | Project view |
| `client/src/components/AgentBriefing.jsx` | Briefing system |
| `client/src/components/TaskManagement.jsx` | Task controls |
| `client/src/data/projects.json` | Project data (persistent) |
| `client/src/data/projectMetadata.js` | Task lists, metrics |
| `server/index.js` | Express backend |

---

## Decision Tree: Should I Brief?

```
Does this involve:
  - Architectural decision? → Brief ✅
  - Uncertain approach? → Brief ✅
  - >2 hours work? → Brief ✅
  - Reversible change? → Just do it ✅
  - Data deletion? → Brief first ✅
  - Simple bug fix? → Just do it ✅
  - New feature? → Brief ✅
  - Unsure of requirements? → Ask clarification ✅
```

---

## Workflow: The 5-Step Cycle

1. **Check Dashboard** — See briefings, approvals, project status
2. **Plan Work** — What's next? Do I need approval?
3. **Brief (if major)** — Create briefing if work is significant
4. **Wait for Approval** — Don't proceed until approved
5. **Execute** — Update status, add notes, mark complete

---

## Common Briefing Patterns

### Pattern 1: Simple Feature
```
Work Briefing: "Ready to implement [feature] — 2 hours"
→ Approved → Execute → Complete → Done
```

### Pattern 2: Decision Needed
```
Status Request: "Should we use [A] or [B]?"
→ Tim responds → Adjust plan → Work Briefing → Execute → Complete
```

### Pattern 3: Blocked Mid-Work
```
Feedback note: "Blocked on [issue] — need guidance"
→ Tim responds → Adjust → Continue → Complete
```

### Pattern 4: Rejection
```
Work Briefing → Rejected with feedback
→ Read feedback → Ask clarification if unclear
→ Adjust approach → Resubmit briefing → Approved → Execute
```

---

## Pro Tips

💡 **Briefings are async** — Don't wait in real-time. Do other work while Tim decides.

💡 **Update status in real-time** — Mark ⏳ when starting, ✅ when done. Real-time feedback > batch updates.

💡 **Ask clarification, don't assume** — Better to look uncertain than implement wrong.

💡 **Use Adjustment Log** — Document why decisions were made. Helps when debugging later.

💡 **Check documents** — Review project docs before coding. Avoid duplicate work.

💡 **Respect ⭐ focus** — If task is starred, prioritize it.

💡 **No silent failures** — If blocked, log immediately. Don't wait silently.

---

## Troubleshooting Quick Fixes

**Briefing not showing?**
→ Refresh browser

**Task status not updating?**
→ Check backend running: `ps aux | grep node`
→ Rebuild: `cd /apps/mission-control-express && npm run build && npm start`

**Can't see documents?**
→ Check document exists in workspace
→ Verify path in `projectMetadata.js`

**Approval stuck?**
→ Check dashboard for feedback
→ Ask Tim in Status Request if unsure

---

## Session Checklist

- [ ] Open dashboard: `http://localhost:3001`
- [ ] Check briefings for feedback
- [ ] Review project status
- [ ] Plan work
- [ ] Create briefing if major
- [ ] Wait for approval
- [ ] Mark task ⏳ In Progress
- [ ] Work → add notes
- [ ] Mark task ✅ Complete
- [ ] Document if needed

---

## Remember

✅ Act decisively on reversible decisions  
✅ Ask approval on irreversible decisions  
✅ Update status in real-time  
✅ Ask clarification when uncertain  
✅ Log everything in Adjustment Log  
✅ Respect Tim's focus priorities  
✅ Never proceed after rejection without asking  

---

**Save this file and reference it every session.**
