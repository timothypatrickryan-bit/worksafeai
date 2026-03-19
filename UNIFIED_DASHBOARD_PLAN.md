# Unified Project/Task Status Dashboard - Planning Document

**Status:** 🟡 PLANNING PHASE  
**Started:** March 16, 2026 @ 7:31 PM EST  
**Next Milestone:** Design & Execution Plans Due (March 18)

---

## Problem Statement

Currently, Mission Control has **three separate but overlapping pages:**

1. **Tasks Page** — Task board (Kanban view, task creation, drag-and-drop)
2. **Task Progress Dashboard** — Real-time tracking with timelines, progress bars, agent assignments
3. **Projects Page** — Project overview and management

**Issues:**
- User bounces between 3 pages to get full context
- Duplicated functionality (both show tasks, both track progress)
- No unified view of projects → tasks → progress
- Task-to-project relationship unclear
- Timeline and dependencies scattered across pages

---

## Solution: Unified Project/Task Status Dashboard

**Goal:** One powerful page that combines all three into a cohesive view

### What Should It Show?

**Left Side: Project List**
- All projects with status badges
- Quick stats (# tasks, # completed, % progress)
- Expand/collapse to see tasks in each project
- Filter by status (active, completed, on-hold)

**Main Area: Task View**
- All tasks (or filtered by selected project)
- Kanban columns (Backlog → Design → Dev → Testing → Complete)
- Task cards with:
  - Title + description preview
  - Assigned agent
  - Progress bar
  - Due date
  - Status badge
  - Priority indicator

**Right Side: Task Details + Timeline**
- When task selected: full details panel
- Agent's execution plan (if submitted)
- Progress tracking
- Timeline view showing task dependencies
- Latest updates

**Top: Filters & Views**
- Filter by: project, agent, status, priority
- View toggle: Kanban | Timeline | Table | Calendar

---

## Delegation: Planning Phase

### Task 1: Johnny (Senior Designer)
**Title:** Design: Unified Project/Task Status Dashboard

**Scope:**
- Design a merged dashboard UI combining:
  - Projects overview (left sidebar or panel)
  - Task board (Kanban with task management)
  - Task progress (real-time tracking, timelines)
- Single cohesive layout
- Clear information hierarchy
- Mobile-responsive considerations
- Interaction patterns (drag-drop, filtering, expanding)

**Deliverables (Due March 18):**
1. **Figma Mockup** — High-fidelity designs
   - Desktop layout (projects + tasks + timeline)
   - Task card designs
   - Details panel layout
   - Filter bar design
2. **Design Specification** — Colors, spacing, typography, components
3. **Interaction Patterns** — How dragging, filtering, expanding work
4. **Mobile Considerations** — How it adapts to smaller screens

**Success Criteria:**
- Clear visual hierarchy
- Intuitive navigation between projects/tasks
- Modern, professional appearance
- Ready for handoff to frontend dev

---

### Task 2: Chief (Infrastructure Overseer)
**Title:** Plan: Unified Project/Task Status Backend & Logic

**Scope:**
- Define backend architecture for merged dashboard
- API design & data structure
- State management strategy
- Performance & optimization
- Integration with existing systems

**Deliverables (Due March 18):**
1. **Architecture Diagram** — How projects, tasks, delegations relate
2. **API Design** — Endpoints needed, data shape, aggregation logic
3. **Database Design** — Query optimization for merged view
4. **Frontend State Model** — How to manage complex state
5. **Implementation Roadmap** — Steps to build it
6. **Risk Assessment** — Potential issues and mitigation

**Success Criteria:**
- Clear data model
- Efficient queries (no N+1 problems)
- Scalable to 100+ tasks
- Real-time capable (WebSocket integration)
- Backward compatible with existing features

---

## Lucy's Review Process

Once both plans are submitted:

1. **Read both plans** — Understand design + execution approach
2. **Check for conflicts** — Do they align? Any issues?
3. **Assess feasibility** — Can design be implemented per the architecture?
4. **Identify gaps** — Missing pieces or unclear requirements?
5. **Recommend changes** (if needed) — Request revisions or clarifications
6. **Approve** — Green light to implement

**Timeline:**
- Plans due: March 18 (noon EST)
- Lucy review: March 18 (afternoon)
- Approval/revisions: March 18 (evening)
- Ready to implement: March 19

---

## Expected Outcome

### Final Dashboard Will Have:

✅ **Single unified view** of projects + tasks + progress  
✅ **Projects panel** showing all projects with quick stats  
✅ **Task board** with Kanban columns  
✅ **Real-time progress** tracking integrated  
✅ **Timeline/Gantt** for task dependencies  
✅ **Agent assignments** visible throughout  
✅ **Multiple views** (Kanban, Timeline, Table, Calendar)  
✅ **Filtering & search** across projects, agents, status  
✅ **Mobile responsive**  

### Replaces:
- ❌ Task Board (merged into unified dashboard)
- ❌ Task Progress Dashboard (merged into unified dashboard)
- ❌ Projects Page (merged into unified dashboard)

### Keeps (unchanged):
- ✅ Task creation/editing
- ✅ Agent briefing submission
- ✅ Activity log
- ✅ Other Mission Control sections

---

## Timeline

| Date | Phase | Owner |
|------|-------|-------|
| Mar 16 @ 7:31 PM | Planning initiated | Lucy |
| Mar 18 (noon) | Design + Execution plans due | Johnny + Chief |
| Mar 18 (afternoon) | Lucy review | Lucy |
| Mar 18 (evening) | Approved / revisions requested | Lucy |
| Mar 19 | Backend implementation | Chief |
| Mar 19-20 | Frontend implementation | Jarvis (or Johnny) |
| Mar 21 | Testing & deployment | Velma + Lucy |
| Mar 22 | Live in production | All |

---

## Files to Update/Create

**Backend:**
- `scripts/mission-control-server.js` — New API endpoint for merged data
- Database query optimization

**Frontend:**
- `apps/mission-control/src/components/sections/UnifiedDashboard.js` — Main component
- `Dashboard.js` — Add new section
- `Sidebar.js` — Update navigation
- Remove old components (or deprecate)

**Documentation:**
- `UNIFIED_DASHBOARD_SPEC.md` — Final design + implementation spec
- `UNIFIED_DASHBOARD_PLAN.md` (this file) — Planning document

---

## Success Metrics

✅ Users can see all projects + tasks in one page  
✅ No need to switch between 3 different pages  
✅ Real-time progress visible throughout  
✅ Task-project relationships clear  
✅ Performance maintained (sub-2s load time)  
✅ Mobile experience good  

---

## Next Steps

1. **Johnny** — Start designing the merged dashboard
2. **Chief** — Start planning the backend architecture
3. **Lucy** — Prepare review checklist for both plans
4. **Monitor** — Track progress toward March 18 deadline

---

**Document Version:** 1.0  
**Last Updated:** March 16, 2026 @ 7:31 PM EST  
**Owner:** Lucy (Orchestrator) on behalf of Tim Ryan
