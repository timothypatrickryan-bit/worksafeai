# 🎯 UNIFIED PROJECT MANAGEMENT DASHBOARD — SPECIFICATION

**Status:** Ready for Design Execution  
**Timeline:** 12 days (Plan → Design → Implement → Test → Deploy)  
**Team:** Johnny (Design), Chief (Implementation & QA)

---

## EXECUTIVE SUMMARY

**Objective:** Consolidate 4 fragmented pages (Task Progress, Tasks, Briefings, Projects) into a single, unified project management hub.

**Problem Solved:**
- ❌ Context switching between 4 pages (wasted time)
- ❌ Disconnected information (hard to see big picture)
- ❌ Approval workflow buried in modal (slows decisions)
- ❌ No clear project-to-task-to-progress linkage

**Solution:**
- ✅ Single hub for all project management work
- ✅ 4-level hierarchical navigation (Portfolio → Project → Task → Approval)
- ✅ Real-time progress tracking (WebSocket)
- ✅ Inline approval workflow (fast decision-making)
- ✅ Kanban board for task state management

---

## INFORMATION ARCHITECTURE

### Level 1: Portfolio View (Landing Page)
**Purpose:** See all projects at a glance, health status, next actions

**Components:**
- Project cards (grid layout, 3 per row)
  - Project name & description
  - Health indicator (color-coded: 🟢 Green / 🟡 Yellow / 🔴 Red)
  - Progress bar (0-100%)
  - Task summary (Queued: X, Executing: Y, Completed: Z)
  - Latest update timestamp
  - "View Details" button
  - Quick action buttons (Add Task, View Briefings)

- Top summary stats
  - Total projects, total tasks, completion rate
  - Active agents, blocked items
  - Next milestone due date

**Interactions:**
- Click project card → Level 2 (Project Detail)
- Click "View Briefings" → Level 4 (Approval Workflow)
- Hover shows project owner, team, current blockers

---

### Level 2: Project Detail View
**Purpose:** See all tasks in a single project, managed as Kanban board

**Layout:** Kanban board (columns by task status)
```
┌─────────────────┬──────────────────┬─────────────┬──────────────┐
│   BRIEFING      │     QUEUED       │  EXECUTING  │  COMPLETED   │
├─────────────────┼──────────────────┼─────────────┼──────────────┤
│                 │                  │             │              │
│ • Task Card 1   │ • Task Card 3    │ • Task 5    │ • Task 8 ✅  │
│   [Approve]     │   [Drag to Q]    │ ▓▓▓░ 75%    │ • Task 9 ✅  │
│                 │                  │ [30m left]  │              │
│ • Task Card 2   │ • Task Card 4    │             │ • Task 10 ✅ │
│   [Approve]     │                  │ • Task 6    │              │
│                 │                  │ ▓▓░░ 50%    │              │
│                 │                  │             │              │
└─────────────────┴──────────────────┴─────────────┴──────────────┘
```

**Task Card Layout:**
```
┌─────────────────────────────┐
│ 📋 Task Title              │
│ Johnny (Designer)           │
│                             │
│ Status: Executing           │
│ Progress: ▓▓▓░░░░░░ 45%     │
│ Assignee: Chief             │
│                             │
│ Next Milestone:             │
│ - Component Design (due 2d) │
│                             │
│ [View Details] [Quick Approve] │
└─────────────────────────────┘
```

**Controls:**
- Drag tasks between columns (Briefing → Queued → Executing → Completed)
- Right-click for more options (Delete, Edit, Details)
- Color-coded by priority (Red=Critical, Orange=High, Yellow=Medium, Green=Low)
- Progress bars show time remaining (auto-calculated from milestones)

**Sidebar Info:**
- Project overview (owner, description, dates)
- Team members assigned
- Blockers / risks
- Recent activity log
- Links to briefings (unread count badge)

---

### Level 3: Task Detail Modal
**Purpose:** Deep-dive into a single task, see full briefing and deliverables

**Modal Layout:**
```
Task Detail Modal (modal width: 800px)
├─ Header
│  └─ Task Title + Status Badge + Progress Bar
├─ Main Content (scrollable)
│  ├─ Assignment
│  │  └─ Assigned to: [Agent] | [Change]
│  │  └─ Priority: [Icon] High
│  ├─ Briefing Execution Plan
│  │  ├─ Timeline: 2.5 days
│  │  ├─ Deliverables (checklist)
│  │  │  ☐ Wireframes (due Day 1)
│  │  │  ☐ Design system (due Day 2)
│  │  │  ☐ Prototype (due Day 2.5)
│  │  └─ Milestones (timeline view)
│  │     • Analyze (Day 0.5)
│  │     • Design (Day 1-2)
│  │     • Handoff (Day 2.5)
│  ├─ Success Criteria
│  │  □ All deliverables completed
│  │  □ Design quality verified
│  │  □ Responsive specs defined
│  ├─ Activity Log
│  │  14:32 - Task created by Tim
│  │  14:35 - Assigned to Johnny
│  │  (...)
└─ Footer (sticky)
   ├─ [Cancel] [Edit] [Approve & Execute] (if briefing)
   ├─ [Cancel] [Decline] (if briefing)
   └─ [Back to Board]
```

---

### Level 4: Approval Workflow (Inline)
**Purpose:** Review briefing, approve/reject execution plan

**Integration:** Can appear as:
- **Option A:** Inline in Task Detail modal (button: "Review Briefing")
- **Option B:** Dedicated "Briefings" section in sidebar navigation
- **Option C:** Both (flexibility)

**Briefing Review Panel:**
```
Briefing for: "Implement Unified Dashboard"
Assigned to: Johnny (Designer)
Status: Ready for Approval

📋 Execution Plan
   Timeline: 2 days
   
   Deliverables:
   ✓ Information Architecture Document
   ✓ Wireframe Sketches
   ✓ User Journey Map
   ✓ Data Flow Diagram
   ✓ Feature Priority Matrix
   
   Milestones:
   1. Analyze Current Pages (0.5 days)
   2. Create IA & Wireframes (1.0 days)
   3. Define Interactions (0.5 days)
   
   Success Criteria:
   • Clear, documented design ready
   • All 4 view levels defined
   • Flows documented

[✅ Approve & Queue] [❌ Request Changes] [📝 Add Notes]
```

**Actions:**
- ✅ Approve & Queue (task moves to queued, Task Executor picks it up)
- ❌ Request Changes (task stays in briefing, feedback sent to agent)
- 📝 Add Notes (leave comments/feedback for agent)

---

## VISUAL DESIGN SPECIFICATIONS

### Color Palette
- **Primary:** Blue (#0066FF) — Actions, links, primary buttons
- **Success:** Green (#00AA44) — Completed tasks, approved status
- **Warning:** Orange (#FF9900) — In-progress, at-risk tasks
- **Danger:** Red (#DD3333) — Blocked, critical issues
- **Neutral:** Gray (#666666) — Secondary text, borders
- **Background:** Light gray (#F5F5F5) — Page background
- **Card:** White (#FFFFFF) — Task cards, modal backgrounds

### Typography
- **Header:** Inter Bold, 24px (project name)
- **Subheader:** Inter Semi-Bold, 16px (section titles)
- **Body:** Inter Regular, 14px (task descriptions)
- **Caption:** Inter Regular, 12px (metadata, timestamps)
- **Monospace:** Courier, 12px (technical details, code)

### Spacing & Layout
- Grid: 16px base unit
- Cards: 16px padding, 8px border-radius, 2px shadow
- Columns: 3 cards per row (desktop), 2 (tablet), 1 (mobile)
- Kanban: Minimum 300px width per column

### Animation
- Task card drag: smooth 200ms transition
- Progress bar: animate from current to target (500ms)
- Modal: fade in 150ms, scale from center
- Status badges: color transition 200ms

---

## USER WORKFLOWS

### Workflow 1: Daily Project Check-in
```
1. Land on Portfolio View (Level 1)
2. Scan project cards for status
3. Click red/orange project for details (Level 2)
4. See Kanban board with task status
5. Drag queued tasks to executing
6. Check each task for blockers (Level 3)
7. Update notes or escalate if needed
```

### Workflow 2: Approve & Execute Work
```
1. See briefings notification (count badge)
2. Navigate to Briefings section
3. Review briefing details (Timeline, Deliverables, Milestones)
4. Click [Approve & Queue]
5. Task Executor detects queued task
6. Agent begins execution
7. Real-time progress updates on dashboard
```

### Workflow 3: Monitor Execution
```
1. Go to Project Detail (Level 2)
2. Watch task progress in Kanban
3. See real-time progress bars (WebSocket)
4. Click executing task for details (Level 3)
5. View activity log, current milestone
6. Watch completion → move to Completed column
```

### Workflow 4: Project Health Check
```
1. Portfolio View shows all project health
2. Green/Yellow/Red indicators tell story
3. Blocked tasks highlighted in red
4. Click project to drill down
5. See which task is blocking progress
6. Resolve blocker or reassign task
```

---

## TECHNICAL REQUIREMENTS

### Frontend (React/Next.js)
- ✅ Responsive (desktop, tablet, mobile)
- ✅ Real-time WebSocket updates (< 100ms latency)
- ✅ Drag-and-drop task management
- ✅ Keyboard shortcuts for power users
- ✅ Dark mode support (future)
- ✅ Accessibility (WCAG 2.1 AA)

### Data Model
```javascript
Project {
  id, name, description, status, health (%, color),
  ownerId, teamIds[], startDate, dueDate,
  tasks: [Task[]],
  metrics: { queued, executing, completed, blockedCount }
}

Task {
  id, title, description, status (briefing|queued|executing|completed),
  priority (1-5), progress (0-100%),
  assignedTo, assignedBy, createdAt,
  briefing: {
    executionPlan: {
      timeline, deliverables[], milestones[], successCriteria[]
    }
  },
  activity: [ActivityLog[]]
}

Milestone {
  name, description, estimatedDays, dueDate, status
}

Deliverable {
  title, description, completed (bool), dueDate
}
```

### API Endpoints Used
- `GET /api/projects` — List all projects
- `GET /api/projects/:id` — Project detail with tasks
- `GET /api/tasks` — All tasks (filtered by project)
- `POST /api/tasks/:id/approve` — Approve briefing
- `POST /api/tasks/:id/status` — Update task status/progress
- `WebSocket /api/tasks/stream` — Real-time updates

---

## SUCCESS CRITERIA

### Functionality (Phase 3)
- ✅ All 4 view levels working
- ✅ Kanban drag-and-drop functional
- ✅ Real-time updates < 100ms
- ✅ Briefing approval inline

### Performance (Phase 4)
- ✅ Page load: < 2 seconds
- ✅ Task update: < 100ms (WebSocket)
- ✅ Drag-drop: smooth 60fps animation
- ✅ Mobile: < 1.5MB bundle

### Quality (Phase 4)
- ✅ 40+ E2E test scenarios passing
- ✅ WCAG 2.1 AA accessibility
- ✅ Zero critical bugs
- ✅ Mobile responsiveness verified

### Adoption (Post-Launch)
- ✅ Replaces 4 separate pages
- ✅ Context switching eliminated
- ✅ Approval time reduced by 50%
- ✅ Team finds unified view faster

---

## ROLLOUT PLAN

**Phase 5 Deployment (1.5 days):**

1. **Day 1 (Staging):** Deploy to staging environment
   - Smoke tests pass
   - Team reviews on staging
   - Performance benchmarks verified

2. **Day 1 (Monitoring):** Set up monitoring & alerting
   - APM (Application Performance Monitoring) active
   - Error tracking (Sentry) configured
   - User analytics initialized
   - Rollback procedure tested

3. **Day 2 (Production):** Go live
   - Deploy to production
   - Verify all monitoring
   - Monitor for 24h before full announcement
   - Team trained on new dashboard

---

## NEXT STEPS

1. ✅ **Johnny starts NOW:** Phase 1 (Plan)
   - Review current pages
   - Create IA & wireframes
   - Define 4 levels + interactions

2. **Day 2:** Johnny transitions to Phase 2 (Design)
   - Create visual design system
   - Design all components
   - Build interactive prototype

3. **Day 4:** Chief takes over Phase 3 (Implement)
   - Build React components
   - Integrate with backend
   - Implement real-time WebSocket

4. **Day 6:** Chief starts Phase 4 (Test) in parallel
   - E2E testing
   - Performance benchmarks
   - Accessibility audit

5. **Day 8:** Chief Phase 5 (Deploy)
   - Staging validation
   - Monitoring setup
   - Production rollout

---

**Timeline:** 12 days to production  
**Status:** 🟢 Ready to execute  
**Location:** Go to http://localhost:3001 → Approve briefings
