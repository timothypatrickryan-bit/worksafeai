# Mission Control — Documentation Index

**Last Updated:** March 25, 2026  
**Status:** Complete system documentation ready

---

## Overview

Mission Control is the operational hub for managing projects, agents, briefings, and decisions. It integrates project management, agent communication, and work approval into a single dashboard.

**Access:** `http://localhost:3001`

---

## Documentation Map

### For Everyone
- **MISSION_CONTROL_QUICK_REF.md** — Fast lookup (URLs, project IDs, briefing types, task statuses)
- **This file** — Navigation guide

### For Agents & Lucy
- **MISSION_CONTROL_AGENT_GUIDE.md** (9,465 words)
  - Complete system architecture
  - How to use Mission Control
  - Workflow for agents
  - API reference
  - Best practices
  - Troubleshooting
  
- **LUCY_OPERATIONAL_PLAYBOOK.md** (9,945 words)
  - How Lucy operates daily
  - Daily startup sequence
  - When to brief vs just act
  - Communication patterns
  - Decision-making framework
  - Real-world workflow examples
  - Escalation protocol
  - Session checklists

### For Tim (Project Owner)
- **TIM_MISSION_CONTROL_GUIDE.md** (10,206 words)
  - Dashboard navigation
  - How to approve/reject briefings
  - How to respond to questions
  - Real-time task management
  - Monitoring progress
  - Common scenarios
  - Quick start guide
  - Troubleshooting

---

## Quick Navigation

### I am... Lucy (AI Agent)
**Read in this order:**
1. MISSION_CONTROL_QUICK_REF.md (5 min)
2. LUCY_OPERATIONAL_PLAYBOOK.md (15 min)
3. MISSION_CONTROL_AGENT_GUIDE.md (20 min)
4. Bookmark: `http://localhost:3001`

**Remember:**
- Check dashboard every session
- Brief before major work
- Ask clarification if unsure
- Update task status in real-time
- Log everything in adjustment log

---

### I am... Another Agent
**Read in this order:**
1. MISSION_CONTROL_QUICK_REF.md (5 min)
2. MISSION_CONTROL_AGENT_GUIDE.md (20 min)
3. Bookmark: `http://localhost:3001`

**Remember:**
- Always get approval before work
- Create briefing with clear title/description
- Wait for Tim's response
- Update task status as you work
- Use adjustment log for blockers

---

### I am... Tim (Project Owner)
**Read in this order:**
1. MISSION_CONTROL_QUICK_REF.md (5 min)
2. TIM_MISSION_CONTROL_GUIDE.md (15 min)
3. Bookmark: `http://localhost:3001`

**Remember:**
- Check dashboard daily
- Approve/reject briefings promptly
- Update task status when work finishes
- Use star (⭐) to focus priorities
- Provide feedback on rejections

---

## System Components

### Frontend (React + Vite)
- **Location:** `/apps/mission-control-express/client/`
- **Components:**
  - AgentBriefing.jsx — Briefing system
  - TaskManagement.jsx — Task controls
  - DocumentViewer.jsx — Document display
- **Pages:** Dashboard, Projects, Gap Analysis, Team, Contacts, Calendar, Memory, Docs

### Backend (Express.js)
- **Location:** `/apps/mission-control-express/server/`
- **APIs:**
  - GET /api/projects — List all
  - GET/PUT /api/projects/:id — Project CRUD
  - GET /api/projects/:id/documents — Project docs
  - GET /api/documents/content — Read document
- **Data:** JSON file persistence
- **Port:** 3001

### Data Files
- **Projects:** `/client/src/data/projects.json`
- **Metadata:** `/client/src/data/projectMetadata.js`
- **Documents:** Linked to workspace directories

---

## Briefing Workflow (Visual)

```
Agent/Lucy Creates Briefing
  ↓
Tim sees on Dashboard
  ↓
  ├→ Approves → Status: ✅ Approved → Agent Executes
  ├→ Rejects → Status: ❌ Rejected → Agent Reads Feedback → Adjusts → Resubmits
  └→ Responds (for Status Request) → Status: 📝 Feedback Received → Agent Adjusts → Resubmits

All history logged in Adjustment Log with timestamps
```

---

## Task Status Lifecycle

```
🔵 Queued (not started)
  ↓ (agent starts work)
⏳ In Progress
  ↓ (agent finishes work)
✅ Complete

At any point:
- Add notes/feedback
- Change priority (⭐)
- Update in Adjustment Log
```

---

## Key Files to Know

| File | Purpose | Who Reads |
|------|---------|-----------|
| MISSION_CONTROL_QUICK_REF.md | Fast lookup | Everyone |
| MISSION_CONTROL_AGENT_GUIDE.md | Comprehensive agent guide | Agents |
| LUCY_OPERATIONAL_PLAYBOOK.md | Lucy's operating procedures | Lucy |
| TIM_MISSION_CONTROL_GUIDE.md | How Tim uses system | Tim |
| MISSION_CONTROL_INDEX.md | This navigation doc | Everyone |
| HEARTBEAT.md | Automated jobs + daily tasks | Lucy, automated systems |

---

## Project Status (as of March 25, 2026)

| ID | Project | Status | Progress | Owner | Documents |
|----|---------|--------|----------|-------|-----------|
| 1 | WorkSafeAI | Active | 85% | Lucy | 6 docs |
| 2 | Mission Control | Active | 95% | Lucy | 1 doc |
| 3 | Consensus | Active | 70% | Lucy | 2 docs |
| 4 | LinkedIn Automation | Active | 100% | Lucy | 1 doc |
| 5 | Hyperscaler Briefings | Active | 100% | Lucy | 1 doc |
| 6 | Project Warp Speed | Active | 40% | Tim | 5 docs |

---

## Daily Operations Checklist

### Lucy (Every Session)
- [ ] Open dashboard
- [ ] Check for feedback/rejections
- [ ] Review project priorities
- [ ] Plan work for session
- [ ] Brief if major work planned
- [ ] Wait for approval
- [ ] Update task status in real-time
- [ ] Log blockers immediately
- [ ] Mark complete when done

### Tim (Daily)
- [ ] Open dashboard
- [ ] Check for pending approvals
- [ ] Approve/reject briefings
- [ ] Respond to status requests
- [ ] Update task status if work complete
- [ ] Provide feedback if needed

### Tim (Weekly)
- [ ] Review all 6 project pages
- [ ] Check progress percentages
- [ ] Read adjustment logs
- [ ] Identify any stalled projects
- [ ] Update priorities with ⭐

---

## Decision Tree: To Brief or Not to Brief

```
Is this work:
├─ Architectural decision? → YES: Brief
├─ Uncertain approach? → YES: Brief or Ask Clarification
├─ >2 hours estimated? → YES: Brief
├─ Reversible? → NO: Brief
├─ Requires data deletion? → YES: Brief
├─ Simple bug fix? → NO: Just do it
├─ New feature? → YES: Brief
├─ Style/refactoring? → NO: Just do it
└─ Unsure of requirements? → YES: Ask Clarification
```

---

## API Quick Reference

**Base URL:** `http://localhost:3001/api`

### Projects
```bash
# Get all
GET /projects

# Get one
GET /projects/:id

# Update
PUT /projects/:id
Body: { status, progress, description, owner }
```

### Documents
```bash
# List project docs
GET /projects/:id/documents

# Read document
GET /documents/content?path=/path/to/file.md
```

---

## Troubleshooting Guide

### Issue: Briefing not appearing
- **Fix 1:** Refresh browser
- **Fix 2:** Check server running: `ps aux | grep node`
- **Fix 3:** Restart: `cd /apps/mission-control-express && npm start`

### Issue: Can't approve briefing
- **Fix 1:** Click briefing card to expand
- **Fix 2:** Look for green "Approve" button
- **Fix 3:** Check if already approved

### Issue: Document not showing
- **Fix 1:** Verify file exists in workspace
- **Fix 2:** Check path in projectMetadata.js
- **Fix 3:** Test API: `/api/projects/6/documents`

### Issue: Task status not updating
- **Fix 1:** Refresh browser
- **Fix 2:** Check server: `ps aux | grep node`
- **Fix 3:** Try again (might be network issue)

---

## Version History

| Date | Version | What Changed |
|------|---------|--------------|
| 2026-03-25 | 1.0 | Initial release: Dashboard, projects, documents, briefing system |

---

## Next Steps

1. **Lucy:** Read LUCY_OPERATIONAL_PLAYBOOK.md
2. **Tim:** Read TIM_MISSION_CONTROL_GUIDE.md
3. **All agents:** Read MISSION_CONTROL_AGENT_GUIDE.md
4. **Everyone:** Bookmark MISSION_CONTROL_QUICK_REF.md
5. **Start using:** `http://localhost:3001`

---

**Mission Control is live and ready for operations. All documentation is complete and agents are trained on the system.**
