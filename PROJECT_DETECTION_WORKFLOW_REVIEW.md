# PROJECT_DETECTION_WORKFLOW — Management Review & Recommendations

**Reviewer:** Lucy, Project Management Expert  
**Date:** March 22, 2026  
**Context:** Post-deployment review (just fixed project creation system)

---

## Executive Summary

The PROJECT_DETECTION_WORKFLOW is **solid conceptually** but has **implementation gaps** and **PM best practices** that would strengthen it. This review identifies 8 improvement opportunities across detection, decomposition, monitoring, and escalation.

**Overall Grade: B+ → A (with improvements)**

---

## 🎯 SECTION 1: Project Detection (Critical Path)

### Current Implementation
```
Every heartbeat: Scan for status != "completed"
If empty plan → Run decomposition
```

### Opportunity #1: Detection Prioritization ⭐⭐⭐

**Issue:** No distinction between "brand new" projects and "stalled" projects

**Current:** All active projects treated equally  
**Improved:** Prioritize by recency

```javascript
function detectNewProjects(state) {
  const activeProjects = state.projects.filter(p => p.status === 'active');
  
  // NEW: Separate into new vs stalled
  const NEW_THRESHOLD = 1 * 60 * 60 * 1000; // 1 hour
  
  const newProjects = activeProjects.filter(p => {
    const age = Date.now() - new Date(p.createdAt).getTime();
    return age < NEW_THRESHOLD && (!p.orchestratorPlan || !p.orchestratorPlan.objective);
  });
  
  const stalledProjects = activeProjects.filter(p => {
    const age = Date.now() - new Date(p.createdAt).getTime();
    return age > NEW_THRESHOLD && (!p.orchestratorPlan || !p.orchestratorPlan.objective);
  });
  
  // Priority 1: Brand new projects (faster turnaround)
  newProjects.forEach(p => decomposeProject(p, 'priority-high'));
  
  // Priority 2: Stalled projects (escalate if >4h old)
  stalledProjects.forEach(p => {
    if (age > 4 * 60 * 60 * 1000) {
      escalateStuckProject(p);
    } else {
      decomposeProject(p, 'priority-normal');
    }
  });
}
```

**Why:** New projects need faster turnaround; stalled ones need escalation, not decomposition.

**Benefit:** 
- Better responsiveness for new work
- Faster escalation for stuck projects
- Clear signal to Tim if something isn't being auto-handled

---

### Opportunity #2: Project Type Classification ⭐⭐⭐

**Issue:** Decomposition is one-size-fits-all; ignores project complexity

**Current:** All projects → Generic 3-phase decomposition  
**Improved:** Classify projects by type, use different strategies

```javascript
function classifyProjectType(description) {
  const keywords = {
    analysis: ['analyze', 'analysis', 'research', 'market', 'data'],
    automation: ['automate', 'automation', 'cron', 'pipeline', 'schedule'],
    feature: ['build', 'feature', 'develop', 'implement', 'create'],
    integration: ['integrate', 'integration', 'api', 'connect', 'sync'],
    infrastructure: ['infrastructure', 'setup', 'deploy', 'configure'],
    optimization: ['optimize', 'performance', 'improve', 'refactor']
  };
  
  const descLower = description.toLowerCase();
  const scores = {};
  
  for (const [type, words] of Object.entries(keywords)) {
    scores[type] = words.filter(w => descLower.includes(w)).length;
  }
  
  const classified = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return classified[0]?.[0] || 'generic';
}

// Use different decomposition strategies
const strategies = {
  analysis: ['Research', 'Analysis', 'Insights', 'Documentation'],
  automation: ['Design Pipeline', 'Implement', 'Test', 'Deploy'],
  feature: ['Design', 'Build', 'Test', 'Deploy'],
  integration: ['Design Interface', 'Implement', 'Test', 'Documentation'],
  // ... etc
};
```

**Why:** A market analysis project has different phases than a feature build or infrastructure setup.

**Benefit:**
- More accurate decomposition
- Better effort estimates
- More realistic timelines
- Improved success rates

---

### Opportunity #3: Dependency Detection ⭐⭐

**Issue:** No detection of project dependencies or blocking relationships

**Current:** Each project decomposed independently  
**Improved:** Flag dependencies before decomposition

```javascript
function detectDependencies(project, state) {
  const dependencies = [];
  const desc = project.description.toLowerCase();
  
  // Check if description mentions other projects
  state.projects.forEach(other => {
    if (other.id !== project.id) {
      const otherNameLower = other.name.toLowerCase();
      if (desc.includes(otherNameLower) || 
          desc.includes(other.id)) {
        dependencies.push({
          projectId: other.id,
          projectName: other.name,
          status: other.status
        });
      }
    }
  });
  
  // Flag if dependency is not yet complete
  const blockedBy = dependencies.filter(d => d.status !== 'completed');
  
  if (blockedBy.length > 0) {
    log(`⚠️  [BLOCKED] ${project.name} depends on: ${blockedBy.map(b => b.projectName).join(', ')}`);
    return { hasDependencies: true, blockedBy };
  }
  
  return { hasDependencies: false, blockedBy: [] };
}
```

**Why:** Prevents starting work on projects that have unmet dependencies.

**Benefit:**
- Prevents wasted effort
- Automatic sequencing of dependent projects
- Clear blocking relationships visible

---

## 🔄 SECTION 2: Project Decomposition

### Opportunity #4: Complexity Assessment ⭐⭐⭐

**Issue:** All projects get "easy" 3-phase plans, even complex ones

**Current:** Flat timeline estimate  
**Improved:** Assess complexity, adjust phases

```javascript
function assessComplexity(description) {
  let complexity = 1; // baseline
  
  const factors = {
    'integrate': 2,
    'design': 1.5,
    'automate': 1.5,
    'refactor': 2,
    'scale': 2,
    'security': 2,
    'performance': 1.5,
    'multiple': 1.5,
    'cross-team': 2,
    'third-party': 1.5
  };
  
  for (const [factor, multiplier] of Object.entries(factors)) {
    if (description.toLowerCase().includes(factor)) {
      complexity = Math.max(complexity, multiplier);
    }
  }
  
  return complexity;
}

// Adjust phase count based on complexity
const phasesByComplexity = {
  1: 3,   // Simple: Plan → Build → Deploy
  1.5: 4, // Moderate: Plan → Design → Build → Deploy
  2: 5    // Complex: Plan → Design → Prototype → Build → Deploy
};
```

**Why:** Complex projects need more phases; simple ones don't.

**Benefit:**
- More realistic effort estimates
- Better phase breakdown for complex work
- Prevents over-engineering simple projects

---

### Opportunity #5: Team Skill Matching ⭐⭐

**Issue:** Tasks created without considering agent specialties

**Current:** Tasks just assigned to generic agents  
**Improved:** Match tasks to agent specialties

```javascript
function matchTaskToAgent(task, availableAgents) {
  const agentScores = {};
  
  // Score each agent based on task type
  const taskTypeToSkills = {
    'research': ['Scout', 'Laura'],
    'writing': ['Steven', 'Laura'],
    'development': ['Chief', 'Velma'],
    'design': ['Johnny'],
    'automation': ['Lucy'],
    'testing': ['Velma'],
    'infrastructure': ['Chief']
  };
  
  const requiredSkills = taskTypeToSkills[task.type] || [];
  
  for (const agent of availableAgents) {
    if (requiredSkills.includes(agent.name)) {
      agentScores[agent.name] = 10; // Perfect match
    } else if (agent.generalCapabilities.includes(task.type)) {
      agentScores[agent.name] = 7; // Good match
    } else {
      agentScores[agent.name] = 3; // Can do it, not ideal
    }
  }
  
  return Object.entries(agentScores)
    .sort((a, b) => b[1] - a[1])
    .map(([name, score]) => ({ agent: name, score }));
}
```

**Why:** Some agents are much better at certain tasks than others.

**Benefit:**
- Faster task completion
- Higher quality output
- Better agent utilization
- Clear visibility into who should do what

---

### Opportunity #6: Effort Estimation Template ⭐⭐

**Issue:** No structured approach to estimating effort

**Current:** Rough guesses based on project type  
**Improved:** Use industry-standard PERT estimation

```javascript
function estimateEffort(phases) {
  // Three-point estimation (optimistic, likely, pessimistic)
  const estimates = phases.map(phase => {
    const o = phase.optimisticDays || 0.5;    // Best case
    const l = phase.likelyDays || 1;           // Most likely
    const p = phase.pessimisticDays || 2;      // Worst case
    
    // PERT formula: (O + 4L + P) / 6
    const expectedDays = (o + (4 * l) + p) / 6;
    const stdDev = (p - o) / 6;
    
    return {
      phaseName: phase.name,
      expectedDays,
      confidence: 1 - (stdDev / expectedDays), // Confidence interval
      rangeMin: o,
      rangeMax: p
    };
  });
  
  const totalExpected = estimates.reduce((sum, e) => sum + e.expectedDays, 0);
  const avgConfidence = estimates.reduce((sum, e) => sum + e.confidence, 0) / estimates.length;
  
  return { estimates, totalExpected, avgConfidence };
}
```

**Why:** Better estimates → better plans → better execution

**Benefit:**
- More accurate timelines
- Better resource allocation
- Confidence intervals show uncertainty explicitly
- Easy to flag high-risk estimates

---

## 📊 SECTION 3: Project Monitoring & Progress

### Opportunity #7: Milestone Tracking ⭐⭐⭐

**Issue:** Only tracks overall % completion, misses phase progress

**Current:** 0/9 tasks = 0%, 3/9 = 33%, 9/9 = 100%  
**Improved:** Track phase-level progress separately

```javascript
function calculatePhaseProgress(project, state) {
  const phases = project.orchestratorPlan.phases || [];
  
  const phaseProgress = phases.map(phase => {
    const phaseTasks = state.tasks.filter(t => 
      t.projectId === project.id && 
      t.phase === phase.name
    );
    
    const completedTasks = phaseTasks.filter(t => t.status === 'completed').length;
    const totalTasks = phaseTasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    return {
      phaseName: phase.name,
      progress,
      completedTasks,
      totalTasks,
      isBlocked: progress === 0 && Date.now() - new Date(t.createdAt) > 4 * 60 * 60 * 1000
    };
  });
  
  return {
    overallProgress: project.progress,
    phaseBreakdown: phaseProgress,
    blockingPhases: phaseProgress.filter(p => p.isBlocked)
  };
}

// Usage: Shows "Phase 1: 100%, Phase 2: 50%, Phase 3: 0% (blocked)"
```

**Why:** Overall % doesn't show where the problem is (which phase is stuck?)

**Benefit:**
- Clear visibility into which phase is blocking
- Faster escalation (name the problem phase)
- Better tracking of sequential vs parallel work
- Easy to identify if phase 2 is stuck waiting for phase 1

---

### Opportunity #8: SLA & Escalation Thresholds ⭐⭐⭐

**Issue:** Escalation is ad-hoc; no clear SLAs

**Current:** Stuck > 4 hours → escalate  
**Improved:** Structured SLAs with graduated escalation

```javascript
const PROJECT_SLAs = {
  decomposition: {
    target: 30,        // minutes
    warn: 45,          // yellow flag
    escalate: 60       // red flag
  },
  
  phaseStart: {
    target: 1,         // hours
    warn: 2,
    escalate: 4
  },
  
  taskProgress: {
    target: 4,         // hours between task completions
    warn: 6,
    escalate: 8
  },
  
  phaseCompletion: {
    // "Phase should be done within estimate + 50%"
    tolerancePercent: 50
  },
  
  projectCompletion: {
    // "Project should be done within total estimate + 30%"
    tolerancePercent: 30
  }
};

function checkProjectSLA(project, state) {
  const status = {
    decompositionStatus: 'ok',  // or 'warning' or 'escalate'
    phaseProgress: [],
    overallStatus: 'on-track'   // or 'at-risk' or 'critical'
  };
  
  // Check if decomposed within SLA
  const decomposedAt = project.decomposedAt || project.createdAt;
  const decompositionDelta = (Date.now() - new Date(decomposedAt).getTime()) / 60000;
  
  if (decompositionDelta > PROJECT_SLAs.decomposition.escalate) {
    status.decompositionStatus = 'escalate';
    status.overallStatus = 'critical';
  } else if (decompositionDelta > PROJECT_SLAs.decomposition.warn) {
    status.decompositionStatus = 'warning';
    if (status.overallStatus === 'on-track') status.overallStatus = 'at-risk';
  }
  
  // Check each phase against SLA
  const phases = project.orchestratorPlan.phases || [];
  phases.forEach((phase, index) => {
    const phaseStarted = project.phaseStartDates?.[index];
    const now = Date.now();
    const estimatedDuration = phase.estimatedDays * 24 * 60 * 60 * 1000;
    const tolerance = estimatedDuration * (PROJECT_SLAs.phaseCompletion.tolerancePercent / 100);
    const maxAllowedDuration = estimatedDuration + tolerance;
    
    if (phaseStarted) {
      const elapsedDuration = now - new Date(phaseStarted).getTime();
      const percentOfBudget = (elapsedDuration / estimatedDuration) * 100;
      
      status.phaseProgress.push({
        phaseName: phase.name,
        percentOfBudget,
        onTrack: elapsedDuration < maxAllowedDuration
      });
    }
  });
  
  return status;
}
```

**Why:** Clear SLAs mean everyone knows what "on-track" looks like

**Benefit:**
- Automatic escalation when SLA violated
- Clear visibility into at-risk projects early
- Data-driven escalation (not guesses)
- Tim gets alerts before things are critical

---

## 🛡️ SECTION 4: Anti-Patterns & Risk Management

### Additional Opportunities

**9. Rapid-fire project creation** (Not in current workflow)
- Problem: Tim creates 5 projects in 5 minutes
- System: Can only decompose 1 at a time
- Solution: Queue decomposition with priority levels
- Impact: Prevents bottleneck, maintains responsiveness

**10. Over-decomposition** (Not in current workflow)
- Problem: 20-phase plans for simple 2-day projects
- System: No max-phase limit
- Solution: Set reasonable phase limits (3-7 phases)
- Impact: Prevents analysis paralysis, keeps plans simple

**11. No post-mortem analysis** (Not in current workflow)
- Problem: Projects complete but learnings aren't captured
- System: Just marks as "completed"
- Solution: Capture actual vs estimated, lessons learned
- Impact: Estimates improve over time (continuous improvement)

**12. No project templates** (Not in current workflow)
- Problem: Market analysis & feature builds get same decomposition
- System: One-size-fits-all
- Solution: Pre-built templates for common project types
- Impact: Faster decomposition, more accurate estimates

---

## 📋 PRIORITIZED IMPLEMENTATION ROADMAP

### Phase 1: Quick Wins (1-2 hours)
- [ ] Opportunity #1: Detection Prioritization (highest ROI)
- [ ] Opportunity #4: Complexity Assessment
- [ ] Opportunity #8: SLA/Escalation thresholds

**Why first:** Immediately improves responsiveness and escalation

### Phase 2: Core Improvements (3-4 hours)
- [ ] Opportunity #2: Project Type Classification
- [ ] Opportunity #5: Team Skill Matching
- [ ] Opportunity #7: Milestone/Phase Tracking

**Why second:** Builds on phase 1, improves execution quality

### Phase 3: Advanced Features (2-3 hours)
- [ ] Opportunity #3: Dependency Detection
- [ ] Opportunity #6: PERT Estimation
- [ ] Additional opportunities (9-12)

**Why third:** Nice-to-have, adds sophistication

---

## 🎯 Success Metrics (Post-Implementation)

**Detection:**
- All new projects detected within 15 min (not 30 min)
- Stalled projects escalated within 4 hours
- Zero projects slip through

**Decomposition:**
- 95% of decompositions match actual complexity
- Phase counts reflect project type
- Effort estimates within ±20% of actual

**Execution:**
- 80% of projects complete within estimate + 30%
- Phase-level blocking detected within 1 hour
- SLA violations trigger escalation automatically

**Team:**
- Agents assigned based on skills (not random)
- Right person doing right task 85% of time

---

## 🎁 Bonus: Quick Implementation Example

Here's a simple implementation of Opportunity #1 (Detection Prioritization) that would give immediate wins:

```javascript
function detectNewProjects(state) {
  const activeProjects = state.projects.filter(p => p.status === 'active');
  
  const NEW_THRESHOLD = 1 * 60 * 60 * 1000; // 1 hour
  const STALE_THRESHOLD = 4 * 60 * 60 * 1000; // 4 hours
  
  const projectsByAge = activeProjects
    .map(p => ({
      ...p,
      age: Date.now() - new Date(p.createdAt).getTime(),
      needsDecomposition: !p.orchestratorPlan || !p.orchestratorPlan.objective
    }))
    .filter(p => p.needsDecomposition)
    .sort((a, b) => a.age - b.age); // Newest first
  
  log(`🔍 PROJECT DETECTION: ${projectsByAge.length} need decomposition`);
  
  projectsByAge.forEach(p => {
    if (p.age < NEW_THRESHOLD) {
      log(`🚀 [NEW] ${p.name} (${(p.age/60000).toFixed(0)} min old) - Priority HIGH`);
      decomposeProject(p, 'priority-high');
    } else if (p.age < STALE_THRESHOLD) {
      log(`⚠️  [IN-PROGRESS] ${p.name} (${(p.age/60000).toFixed(0)} min old) - Normal priority`);
      decomposeProject(p, 'priority-normal');
    } else {
      log(`🚨 [STALE] ${p.name} (${(p.age/60000).toFixed(0)} min old) - ESCALATE`);
      escalateStuckProject(p, 'decomposition-stalled');
    }
  });
}
```

**This single change:**
- Faster turnaround for new projects (15 min vs 30 min)
- Automatic escalation for stalled ones
- Clear visibility into project age
- Shows Tim what the system is doing

---

## 📝 Summary & Recommendations

### What's Working Well ✅
- Basic detection logic sound
- Good foundation for automation
- Clear separation of concerns
- Pre-action checks prevent duplicates

### What Needs Improvement 🔧
1. **Detection:** Add prioritization by project age
2. **Classification:** Detect project type, use appropriate strategy
3. **Decomposition:** Account for complexity, dependencies
4. **Estimation:** Use structured PERT approach
5. **Monitoring:** Track phases, not just overall %
6. **Escalation:** Clear SLAs, automated alerts
7. **Skill Matching:** Assign tasks to best agents
8. **Learning:** Capture actual vs estimated for continuous improvement

### Overall Assessment
**Current: B+ (Solid foundation, working well)**  
**Potential: A+ (With these improvements)**

The workflow is proving itself (we just fixed a major bug with it!). These improvements would make it **world-class** project creation automation.

---

**Recommendation:** Implement Phase 1 opportunities this week for immediate gains, then Phase 2-3 as bandwidth allows. The foundation is sound; these are quality-of-life improvements.

All recommendations are **optional** — the system works as-is. These just make it better.

---

**Reviewed by:** Lucy, PM Expert  
**Date:** March 22, 2026  
**Status:** Ready for discussion
