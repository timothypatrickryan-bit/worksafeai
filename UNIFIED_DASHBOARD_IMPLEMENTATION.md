# Unified Project/Task Status Dashboard — Implementation Plan

**Status:** 📋 PLANNING PHASE (Waiting for Johnny's design + Chief's architecture)  
**Timeline:** Start implementation immediately upon plan approval (estimated 5 PM EST today)  
**Target:** Deploy by March 19, 2026

---

## Current State (Pre-Planning)

### What Exists NOW
- **Task Board** (`TasksSection.js`) — Kanban view, task creation/editing
- **Task Progress Dashboard** (`TaskProgressDashboard.js`) — Real-time tracking with filters
- **Projects Page** (`ProjectsSection.js`) — Project management
- **Mission Control API** (localhost:3000) — Full REST endpoints for tasks, delegations, team

### What Needs to Merge
These three pages need to consolidate into ONE unified view while keeping their best features.

---

## Implementation Readiness Checklist

### Backend (Chief's Responsibility)
**When plan arrives, verify:**
- [ ] Single API endpoint that returns projects + tasks + progress in one call
- [ ] Efficient queries (no N+1 problems)
- [ ] WebSocket integration for real-time updates
- [ ] Filtering and aggregation logic

**Database optimization needed:**
- [ ] Index on projects.id + tasks.projectId
- [ ] Index on tasks.status + tasks.dueDate
- [ ] Denormalized progress field on tasks table

### Frontend (Johnny's Design + Frontend Dev)
**When design arrives, verify:**
- [ ] Responsive layout (desktop first, mobile second)
- [ ] Left panel: Project list with status indicators
- [ ] Center: Task board or task list (switchable)
- [ ] Right panel: Task details + timeline
- [ ] Top bar: Filters, view toggle, search

**Implementation steps:**
1. Create `UnifiedDashboard.js` component
2. Build left panel: Project sidebar
3. Build center: Task display (Kanban or list)
4. Build right panel: Details + timeline
5. Wire up data fetching from API
6. Add filtering and search
7. Add view toggles (Kanban/Timeline/Table)

---

## Data Structure (Proposed)

### API Response: GET /api/dashboard/unified
```json
{
  "projects": [
    {
      "id": "proj-1",
      "name": "iOS Mission Control",
      "status": "active",
      "completionPercent": 45,
      "taskCount": 5,
      "completedCount": 2,
      "tasks": [
        {
          "id": "task-1",
          "title": "Design Phase 1",
          "status": "in-progress",
          "progress": 75,
          "agent": { "id": "johnny", "name": "Johnny" },
          "dueDate": "2026-03-19T23:59:59Z",
          "priority": "high"
        }
        // ... more tasks
      ]
    }
    // ... more projects
  ],
  "filters": {
    "statuses": ["queued", "in-progress", "completed", "rejected"],
    "agents": [/* agent list */],
    "priorities": ["low", "medium", "high", "critical"]
  }
}
```

---

## Frontend Component Structure

```
<UnifiedDashboard>
  ├─ <ProjectSidebar>          // Left: Project list
  ├─ <TaskViewContainer>       // Center: Main content
  │  ├─ <ViewToggle />         // Kanban | Timeline | Table | Calendar
  │  ├─ <FilterBar />          // Status, agent, priority filters
  │  └─ <TaskDisplay />        // Dynamic based on view type
  │     ├─ <KanbanView />      // Drag-drop columns
  │     ├─ <TimelineView />    // Gantt-style
  │     ├─ <TableView />       // Data grid
  │     └─ <CalendarView />    // Calendar layout
  └─ <TaskDetailsPanel>        // Right: Details + timeline + briefing
```

---

## Implementation Timeline (Post-Approval)

**5:00 PM - 8:00 PM (3 hours): Backend Setup**
- Chief finalizes API design
- Update Mission Control API with unified endpoint
- Database optimizations
- WebSocket integration

**8:00 PM - 11:00 PM (3 hours): Frontend Components**
- Create UnifiedDashboard.js skeleton
- Build ProjectSidebar component
- Build basic TaskDisplay with routing
- Wire up data fetching

**11:00 PM - 2:00 AM (3 hours): Views & Features**
- Implement Kanban view
- Implement Timeline view
- Add filtering and search
- Add view toggles

**2:00 AM - 4:00 AM (2 hours): Testing & Polish**
- E2E testing across views
- Performance optimization
- Visual polish
- Bug fixes

**4:00 AM - 6:00 AM (2 hours): Deployment**
- Build and deploy to Vercel (if applicable)
- Smoke testing on production
- Documentation update
- Launch!

**Total: 13 hours from 5 PM Monday to 6 AM Tuesday morning**

---

## Contingencies

**If either plan is delayed past 5 PM:**
- Start with backend only (implement API structure)
- Start frontend with mock data (design can be injected later)
- Parallelize both tracks

**If approval requires revisions:**
- Tim reviews plans at 5:15 PM
- Request revisions (1-hour turnaround)
- Begin implementation at 6:15 PM
- Still deliver by 6 AM (adjusted timeline)

**If deployment issues arise:**
- Have rollback plan ready
- Deploy to staging first
- Smoke test on staging before prod

---

## Success Criteria

✅ Single unified page replaces Tasks + Task Progress + Projects pages  
✅ All task data visible in one view (project overview + task details)  
✅ Real-time progress tracking working  
✅ Filtering across projects/agents/status working  
✅ Multiple views (Kanban, Timeline, Table) functional  
✅ Mobile responsive (desktop priority first)  
✅ Performance: <2s page load, <100ms filter updates  
✅ Zero data loss from old pages  
✅ Deployed and live  

---

## Files to Create/Modify

**New Components:**
- `apps/mission-control/src/components/sections/UnifiedDashboard.js`
- `apps/mission-control/src/components/sections/ProjectSidebar.js`
- `apps/mission-control/src/components/sections/TaskViewContainer.js`
- `apps/mission-control/src/components/views/KanbanView.js`
- `apps/mission-control/src/components/views/TimelineView.js`
- `apps/mission-control/src/components/views/TableView.js`
- `apps/mission-control/src/components/views/CalendarView.js`

**Backend Updates:**
- `scripts/mission-control-server.js` — New `/api/dashboard/unified` endpoint
- Database: Add indexes and optimize queries

**Integration:**
- `Dashboard.js` — Add case for 'unified-dashboard' section
- `Sidebar.js` — Add new menu item (replace Tasks/Projects/Task Progress with Unified Dashboard)
- `index.js` — Update title mapping

**Deprecation:**
- TasksSection, ProjectsSection, TaskProgressDashboard can be kept as read-only references or removed

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Plans arrive too late | Start with skeleton + mock data |
| API design conflicts with frontend | Weekly sync meetings (already planned) |
| Performance issues with merged data | Index optimization + query caching |
| Mobile layout breaks | Progressive enhancement (desktop first) |
| User confusion (old pages gone) | Smooth migration, keep help docs |

---

## Next Steps (RIGHT NOW, while waiting for plans)

1. ✅ Create this document (implementation roadmap)
2. ⏳ Prepare database schema review (once Chief's plan arrives)
3. ⏳ Prepare Figma design review (once Johnny's plan arrives)
4. ⏳ Set up implementation branches in Git
5. ⏳ Brief team on timeline (5 PM approval → 6 AM delivery)
6. ⏳ Identify any blockers before 5 PM

---

**Last updated:** March 17, 2026 @ 1:02 PM EST  
**Owner:** Lucy (Orchestrator)  
**Status:** Ready to execute upon plan approval
