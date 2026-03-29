# Unified Dashboard 3-Level Hierarchy - Redesign Guide

## Overview

The Unified Dashboard has been redesigned with a new 3-level hierarchy to provide better project visibility, status-based task organization, and streamlined approval workflows.

## Architecture

### LEVEL 1: Portfolio View
**What**: Project overview organized by PROJECT STATUS
- **Active Projects** - Currently running projects
- **Completed Projects** - Finished projects
- **Cancelled Projects** - Abandoned/cancelled projects

**Each Project Card Shows**:
- Project name & status
- Brief description (1-2 lines)
- **Orchestrator Plan Highlights**
  - Strategic objective
  - Key phases/milestones
  - Overall timeline
  - Success metrics
- Progress bar (% completion)
- Quick stats: Tasks Queued / In Progress / Completed

**Navigation**: Click "View Details" to enter Project Detail view

---

### LEVEL 2: Project Detail View
**What**: Full project information with task status organization

**Left Section - Task Organization (by STATUS)**:
- **📋 QUEUED** - Tasks waiting to start
- **⚙️ IN-PROGRESS** - Currently being worked on
- **🎯 WHAT'S NEXT** - Identified next tasks (planned/backlog)
- **✅ COMPLETED** - Done tasks

Each task shows:
- Title
- Assigned to
- Progress bar (if in progress)

**Right Section**:
- Full **Orchestrator Plan** display
  - Strategic objective (1-2 sentences)
  - Key phases (numbered list)
  - Overall timeline
  - Success metrics (checklist)

**Bottom Section - Approvals**:
- **APPROVALS NEEDED** section
- Shows all pending briefings for this project
- Inline approve/reject buttons for each briefing
- Timeline for each approval

**Navigation**: 
- Click project card to view full details
- Click task card to view Task Detail view
- Back button returns to Portfolio

---

### LEVEL 3: Task Detail View
**What**: Full task briefing with execution plan and inline approvals

**Sections**:
1. **Assignment** - Assigned to, Priority
2. **Execution Plan** - Timeline, Deliverables, Milestones
3. **Success Criteria** - What defines success
4. **Activity Log** - Recent changes

**Right Panel** (if status = "briefing"):
- **Ready for Approval** - Review & approve workflow
- Inline approval buttons
  - ✅ Approve & Queue
  - ❌ Request Changes

**Navigation**:
- Back button returns to Project Detail
- Close button returns to Project Detail

---

## Data Model Changes

### Required State Fields

#### For Projects
```javascript
project = {
  id: "project-1",
  name: "Project Name",
  description: "Brief description",
  
  // NEW: Project status
  status: "active",  // "active" | "completed" | "cancelled"
  
  // NEW: Orchestrator Plan
  orchestratorPlan: {
    objective: "High-level strategic goal (1-2 sentences)",
    phases: [
      "Phase 1: Discovery & Planning",
      "Phase 2: Development",
      "Phase 3: Testing & QA",
      "Phase 4: Deployment"
    ],
    timeline: "8 weeks",
    metrics: [
      "Performance improvement by 40%",
      "User adoption rate > 80%",
      "Support ticket reduction by 50%"
    ]
  },
  
  // Existing fields
  owner: "Owner Name",
  team: ["Team Member 1", "Team Member 2"],
  dueDate: "2024-04-30",
  // ... other fields
}
```

#### For Tasks
No changes needed - existing task structure remains compatible.

Task statuses used by the new view:
- `queued` - Task is queued
- `executing` - Task is in progress (mapped to "IN-PROGRESS")
- `planned` or `backlog` - Planned for future (mapped to "WHAT'S NEXT")
- `completed` - Task is done
- `briefing` - Briefing awaiting approval

---

## Migration Steps

### 1. Update Project Data

Add the `status` and `orchestratorPlan` fields to all existing projects:

```javascript
// In your API or state initialization
const projects = [
  {
    // ... existing fields
    status: "active",  // Set based on project state
    orchestratorPlan: {
      objective: "Describe the strategic goal",
      phases: ["Phase 1", "Phase 2", "Phase 3"],
      timeline: "X weeks",
      metrics: ["Metric 1", "Metric 2"]
    }
  }
];
```

### 2. Verify Task Statuses

Ensure tasks use the correct status values:
- `briefing` - Pending approval
- `queued` - Ready to execute
- `executing` - In progress
- `planned` or `backlog` - Future tasks
- `completed` - Done

### 3. Test Locally

```bash
# Navigate to mission-control app
cd apps/mission-control

# Install dependencies
npm install

# Start dev server
npm run dev

# Test the dashboard
# - Portfolio tabs should show Active/Completed/Cancelled projects
# - Click "View Details" to see project-level view
# - Click task cards to view task details
# - Test approval workflow on briefing tasks
```

### 4. Verify Navigation Flow

- [ ] Portfolio → Project Detail (click "View Details")
- [ ] Project Detail → Task Detail (click task card)
- [ ] Task Detail → Project Detail (click "Back")
- [ ] Project Detail → Portfolio (click "Back")
- [ ] Approval workflow works for briefing tasks
- [ ] Tasks organize correctly by status in Project Detail

---

## Component Reference

### UnifiedDashboardSection Props
```javascript
<UnifiedDashboardSection
  state={{
    projects: [/* ... */],
    tasks: [/* ... */]
  }}
  onApprove={(taskId) => { /* Handle approval */ }}
  onReject={(taskId) => { /* Handle rejection */ }}
  onUpdateTask={(taskId, updates) => { /* Handle updates */ }}
/>
```

### CSS Module Classes

Key classes for customization:

**Portfolio View**:
- `.tabNav` - Tab navigation container
- `.tab` - Individual tab
- `.projectCard` - Project card container
- `.orchestratorHighlight` - Orchestrator plan section

**Project Detail**:
- `.projectInfoSection` - Full orchestrator plan display
- `.tasksSection` - Task status columns
- `.statusColumn` - Individual status column
- `.approvalsSection` - Approvals pending section

**Task Detail**:
- `.taskDetailLayout` - Main layout
- `.approvalPanel` - Approval workflow panel

---

## Features Implemented

✅ **3-Level Navigation**
- Portfolio (status-based tabs)
- Project Detail (full orchestrator plan + tasks by status)
- Task Detail (full briefing + approval)

✅ **Status-Based Organization**
- Tasks organized by status (queued, in-progress, what's next, completed)
- Not by internal workflow status

✅ **Orchestrator Plan Visibility**
- Highlighted on portfolio cards
- Full display in project detail view
- Includes objective, phases, timeline, metrics

✅ **Approvals Workflow**
- Approvals needed section in project detail
- Inline approve/reject buttons
- Approval panel in task detail

✅ **Progress Tracking**
- Progress bars on cards and tasks
- Task count statistics
- Health indicators (green/yellow/red)

✅ **Responsive Design**
- Mobile-friendly layout
- Flexible grid systems
- Adapts to different screen sizes

---

## Future Enhancements

- [ ] Orchestrator plan editing capability
- [ ] Phase progress tracking
- [ ] Task dependencies visualization
- [ ] Milestone timeline view
- [ ] Export project plan to PDF
- [ ] Approval notifications
- [ ] Bulk actions on tasks
- [ ] Custom project templates

---

## Troubleshooting

### Issue: Tasks not showing in correct status column
**Solution**: Check that task status values match expected values:
- `queued`, `executing`, `planned`, `backlog`, `completed`, `briefing`

### Issue: Orchestrator plan not displaying
**Solution**: Ensure project has `orchestratorPlan` object with required fields:
- `objective` (string)
- `phases` (array of strings)
- `timeline` (string)
- `metrics` (array of strings)

### Issue: Approvals section not showing
**Solution**: Verify tasks have `status: "briefing"` to appear in approvals section

### Issue: Navigation not working
**Solution**: Check browser console for errors; ensure state is properly initialized

---

## Performance Notes

- Component uses `useMemo` to optimize re-renders
- Avoid frequent project/task updates during display
- For >100 tasks, consider pagination
- Consider virtualizing long task lists if needed

---

## Contact & Support

For questions about the redesign or implementation issues, refer to the component documentation in UnifiedDashboardSection.js.
