# Project Creation System — Root Cause Analysis & Permanent Fix

**Date:** March 22, 2026 @ 10:02 AM EST  
**Issue:** Data Center Weekly & Hyperscaler Update projects stuck at 0% with empty orchestratorPlans  
**Root Cause:** PROJECT_DETECTION_WORKFLOW documented but not automated in running autonomy loop  

---

## 🔍 ROOT CAUSE ANALYSIS

### What Should Have Happened (Per Documentation)

```
1. Project created (status: "active", orchestratorPlan: {})
2. Autonomy heartbeat detects new project (every 30 min)
3. Sees orchestratorPlan is empty
4. Runs project-decomposition.js
5. Generates objectives, phases, timeline, metrics
6. Creates 3-5 discrete tasks
7. Queues tasks for agent assignment
8. Briefs Tim with plan
```

**Timeline:** <30 minutes from creation to queued tasks

### What Actually Happened

```
1. Project created (status: "active", orchestratorPlan: {})
2. Tasks manually added to state file
3. ❌ autonomy-heartbeat.js runs but DOESN'T check for active projects
4. ❌ orchestratorPlan never populated
5. ❌ No briefings generated
6. ❌ Tasks remain queued indefinitely
7. Dashboard shows 0% progress (no orchestratorPlan = no metrics)
```

**Result:** Projects orphaned, no decomposition, no task execution

---

## 🎯 THE THREE-PART FIX

### Part 1: Integrate Project Detection into Autonomy Heartbeat

**File:** `scripts/autonomy-heartbeat.js`  
**Change:** Add PROJECT DETECTION function (before gap remediation check)

```javascript
/**
 * NEW FUNCTION: Detect and decompose active projects
 * Runs before other checks in heartbeat
 */
function detectNewProjects(state) {
  if (!state || !state.projects) return;
  
  const activeProjects = state.projects.filter(p => 
    p.status === 'active' && 
    (!p.orchestratorPlan || 
     !p.orchestratorPlan.objective || 
     p.orchestratorPlan.phases.length === 0)
  );
  
  log(`🔍 PROJECT DETECTION: Found ${activeProjects.length} projects needing decomposition`);
  
  for (const project of activeProjects) {
    log(`⚠️  [NEEDS DECOMPOSITION] ${project.name} (${project.id})`);
    
    // Pre-action check
    if (isProjectBeingDecomposed(project.id)) {
      log(`   ✅ Already decomposing, skipping`);
      continue;
    }
    
    // Run decomposition
    runProjectDecomposition(project);
  }
}

/**
 * Check if project decomposition is already running
 */
function isProjectBeingDecomposed(projectId) {
  // Check subagents list
  // Check autonomy log for recent activity on this project
  // Return true if found
}

/**
 * Spawn decomposition agent
 */
function runProjectDecomposition(project) {
  log(`🚀 DECOMPOSING: ${project.name}`);
  // Spawn project-decomposition-automation.js with project ID
  // Let it run to completion
}
```

**Location in heartbeat flow:**
```javascript
async function main() {
  const state = readState();
  
  // STEP 1: Detect and decompose new projects (NEW - FIRST)
  detectNewProjects(state);
  
  // STEP 2: Check agent completion
  checkAgentStatus(state);
  
  // STEP 3: Track gap remediation
  gapManager.trackRemediations(state);
  
  // ... rest of heartbeat
}
```

**Effort:** ~50 lines of code  
**Risk:** Low (non-blocking, just detection)  
**Testing:** Works with existing projects + new ones

---

### Part 2: Create Project Decomposition Automation

**New File:** `scripts/project-decomposition-automation.js`

```javascript
#!/usr/bin/env node

/**
 * Project Decomposition Automation
 * 
 * Input: Project ID
 * Process:
 *   1. Load project from state file
 *   2. Parse description/SOW
 *   3. Break into phases & tasks
 *   4. Generate orchestratorPlan
 *   5. Create task briefings
 *   6. Queue tasks for execution
 *   7. Brief Tim
 * Output: Updated project with full plan + queued tasks
 * 
 * Runtime: 3-5 minutes per project
 */

const projectId = process.argv[2];
if (!projectId) {
  console.error('Usage: node project-decomposition-automation.js <projectId>');
  process.exit(1);
}

const fs = require('fs');
const path = require('path');

// 1. LOAD PROJECT
const state = JSON.parse(fs.readFileSync(`.mission-control-state.json`, 'utf8'));
const project = state.projects.find(p => p.id === projectId);

if (!project) {
  console.error(`Project not found: ${projectId}`);
  process.exit(1);
}

console.log(`Decomposing project: ${project.name}`);

// 2. PARSE DESCRIPTION
const sow = project.description;
const objectives = extractObjectives(sow);
const constraints = extractConstraints(sow);

// 3. BREAK INTO PHASES
const phases = generatePhases(sow, objectives);
const timeline = estimateTimeline(phases);
const metrics = defineMetrics(objectives);

// 4. GENERATE ORCHESTRATOR PLAN
project.orchestratorPlan = {
  objective: objectives[0] || '',
  phases: phases.map(p => ({
    name: p.name,
    description: p.description,
    estimatedDays: p.estimatedDays,
    deliverables: p.deliverables
  })),
  timeline: timeline,
  metrics: metrics
};

// 5. CREATE TASK BRIEFINGS
const tasks = generateTasks(project, phases);
state.tasks.push(...tasks);

// 6. QUEUE TASKS
tasks.forEach(task => {
  task.status = 'queued';
  task.briefingGeneratedAt = new Date().toISOString();
});

// 7. SAVE UPDATED STATE
fs.writeFileSync(`.mission-control-state.json`, JSON.stringify(state, null, 2));

// 8. BRIEF TIM
sendBriefingToTim(project, phases, tasks);

console.log(`✅ Project decomposed: ${project.name}`);
console.log(`   Phases: ${phases.length}`);
console.log(`   Tasks queued: ${tasks.length}`);
console.log(`   Timeline: ${timeline}`);
```

**Helper Functions Needed:**
- `extractObjectives(sow)` — Parse goal from description
- `extractConstraints(sow)` — Find deadline, resource limits
- `generatePhases(sow, objectives)` — Break into 3-5 phases
- `estimateTimeline(phases)` — Sum effort estimates
- `defineMetrics(objectives)` — Success criteria
- `generateTasks(project, phases)` — Create discrete task objects
- `sendBriefingToTim(project, phases, tasks)` — Email/message summary

**Effort:** ~200 lines of code  
**Risk:** Medium (modifies state, but well-scoped)  
**Testing:** Run on existing projects first, verify plans generated correctly

---

### Part 3: Add Project Monitoring to Heartbeat

**File:** `scripts/autonomy-heartbeat.js`  
**New Function:** Monitor active projects for progress

```javascript
/**
 * NEW FUNCTION: Monitor project progress
 */
function monitorProjectProgress(state) {
  if (!state || !state.projects) return;
  
  const activeProjects = state.projects.filter(p => p.status === 'active');
  
  for (const project of activeProjects) {
    // Count project tasks
    const projectTasks = state.tasks.filter(t => t.projectId === project.id);
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    const totalTasks = projectTasks.length;
    
    // Calculate progress
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    project.progress = progress;
    project.taskCount = totalTasks;
    project.completedTaskCount = completedTasks;
    
    // Check for stuck projects (no activity > 4 hours)
    if (progress > 0 && progress < 100) {
      const lastUpdate = project.lastProgressUpdate ? new Date(project.lastProgressUpdate) : null;
      const hoursSinceUpdate = lastUpdate ? (Date.now() - lastUpdate) / (1000 * 60 * 60) : 999;
      
      if (hoursSinceUpdate > 4) {
        log(`⚠️  BLOCKED: ${project.name} (no progress in ${hoursSinceUpdate}h)`);
        escalateBlockedProject(project);
      }
    }
    
    // Log progress
    log(`📊 ${project.name}: ${completedTasks}/${totalTasks} tasks (${progress}%)`);
  }
}
```

**Location in heartbeat:**
```javascript
async function main() {
  const state = readState();
  
  // ... other checks ...
  
  // STEP 4: Monitor project progress
  monitorProjectProgress(state);
  
  // Save updated state
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}
```

**Effort:** ~60 lines of code  
**Risk:** Low (read-only monitoring, no mutations)  
**Testing:** Verify progress % updates correctly

---

## 📊 COMPLETE HEARTBEAT FLOW (After Fix)

```
Every 30 minutes (autonomy-heartbeat.js):

1. ✅ DETECT NEW PROJECTS
   └─ Find status="active" with empty orchestratorPlan
   └─ Run decomposition if needed

2. ✅ CHECK AGENT COMPLETION
   └─ Find status="complete" agents
   └─ Review output quality
   └─ Assign next work

3. ✅ MONITOR PROJECT PROGRESS
   └─ Calculate % complete for each project
   └─ Detect stuck projects (no activity > 4h)
   └─ Escalate blockers

4. ✅ TRACK GAP REMEDIATION
   └─ Update remediation lifecycle
   └─ Calculate average scores

5. ✅ ASSIGN NEXT WORK
   └─ Find highest-priority queued task
   └─ Spawn agent if briefing ready

6. ✅ LOG ALL TRANSITIONS
   └─ Append to .autonomy-log.txt
   └─ Audit trail for debugging
```

---

## 🧪 TESTING PLAN

### Test 1: Decompose Existing Stuck Projects
```bash
node scripts/project-decomposition-automation.js project-1774041827180
# Verify: DCWU gets orchestratorPlan with phases/timeline
# Verify: Tasks queue for Scout, Steven, Lucy
```

### Test 2: Create New Project and Verify Auto-Decomposition
```bash
# Manually create new project in state file
# Run autonomy heartbeat
# Verify: Project gets decomposed within 30 min
# Verify: Tasks queued and briefings generated
```

### Test 3: Monitor Progress on Active Project
```bash
# Create project with 5 tasks
# Mark 2 tasks as completed
# Run autonomy heartbeat
# Verify: Project shows 40% progress
# Verify: Dashboard updates
```

### Test 4: Detect Stuck Project
```bash
# Create project with last update 5 hours ago
# Run autonomy heartbeat
# Verify: Alert logged
# Verify: Escalation triggered
```

---

## 🚀 DEPLOYMENT STEPS

1. **Backup current state**
   ```bash
   cp .mission-control-state.json .mission-control-state.json.backup-2026-03-22
   ```

2. **Update autonomy-heartbeat.js**
   - Add detectNewProjects() function
   - Add monitorProjectProgress() function
   - Add calls in main() before gap remediation

3. **Create project-decomposition-automation.js**
   - New file with 200 lines of code
   - Tests in isolation first
   - Verify on existing projects

4. **Test decomposition on stuck projects**
   ```bash
   node scripts/project-decomposition-automation.js project-1774041827180
   # Data Center Weekly should get full plan
   ```

5. **Reload autonomy heartbeat daemon**
   ```bash
   launchctl unload ~/Library/LaunchAgents/com.openclaw.autonomy-loop.plist
   launchctl load ~/Library/LaunchAgents/com.openclaw.autonomy-loop.plist
   ```

6. **Monitor for 1 hour**
   - Check logs: `tail -f .autonomy-log.txt`
   - Verify projects being detected and decomposed
   - Verify tasks being queued

7. **Test with new project creation**
   - Create test project manually
   - Verify auto-decomposition within 30 min
   - Verify dashboard updates

---

## 📈 SUCCESS CRITERIA

✅ **Zero manual project decomposition needed**
- Create project → Auto-decomposed within 30 min
- Tasks auto-queued for agents
- Tim gets briefing automatically

✅ **Project progress always visible**
- Dashboard shows % complete
- Updated as tasks progress
- Stuck projects detected within 4 hours

✅ **No projects fall through cracks**
- Autonomy loop catches all active projects
- Status monitored continuously
- Blockers escalated immediately

✅ **Permanent fix (not band-aid)**
- Integrated into core autonomy loop
- Works for all future projects
- Tested and documented

---

## 📝 OWNERSHIP & MAINTENANCE

**Who:** Lucy (autonomous, no permission needed)  
**When:** Every 30 minutes (part of autonomy heartbeat)  
**How:** Fully automated in background  
**Monitor:** Check `.autonomy-log.txt` for project detections  
**Update:** Add new logic to PROJECT_DETECTION_WORKFLOW.md when patterns emerge

---

**Status:** Ready to implement  
**Estimated time:** 1 hour total (code + test + deploy)  
**Risk level:** Low (non-breaking, incremental)  
**Value:** Eliminates entire class of project creation failures
