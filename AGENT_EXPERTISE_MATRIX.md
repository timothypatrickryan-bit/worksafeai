# Agent Expertise Matrix & Auto-Routing Config

**Purpose:** Enable intelligent task routing to best-fit agents based on task type + agent expertise

**Last Updated:** March 27, 2026 @ 9:05 AM EST

---

## Agent Profiles

### Scout
**Role:** Research & Intelligence Specialist  
**Expertise Scores:**
- Market research: 9/10
- Competitive analysis: 9/10
- Company deep-dives: 8/10
- Data collection: 9/10
- Industry analysis: 8/10
- Technical research: 6/10
- Content creation: 5/10

**Preferred Tasks:**
- Competitive analysis
- Market opportunity assessment
- Customer research
- Industry trends
- Company profiling
- Vendor evaluation

**Workload Capacity:** 3-4 concurrent tasks  
**Typical Task Time:** 2-5 hours per deliverable  
**Last Active:** March 27 (queued for Pro-Tel research)

---

### Velma
**Role:** QA/QC & Quality Assurance Lead  
**Expertise Scores:**
- Code review: 9/10
- Testing: 9/10
- QC gating: 9/10
- Bug diagnosis: 8/10
- Security testing: 7/10
- Performance testing: 7/10
- Documentation: 6/10

**Preferred Tasks:**
- Code review & QC submission
- Bug investigation
- Test plan creation
- Security audit
- API testing
- Deployment verification

**Workload Capacity:** 2-3 reviews per cycle (30 min)  
**Typical Task Time:** 30 min - 1.5 hours per review  
**Last Active:** March 19 (QA testing)

---

### Chief
**Role:** Full-Stack Architect & Infrastructure Lead  
**Expertise Scores:**
- System architecture: 9/10
- Full-stack development: 8/10
- Database design: 8/10
- API design: 8/10
- DevOps: 7/10
- Backend (Node/Express): 8/10
- Frontend (React): 7/10

**Preferred Tasks:**
- Architecture design
- System design review
- Database schema
- API endpoint design
- Infrastructure setup
- Performance optimization
- Complex backend features

**Workload Capacity:** 2-3 complex tasks  
**Typical Task Time:** 4-8 hours per deliverable  
**Last Active:** March 19

---

### Johnny
**Role:** Full-Stack Developer & Implementation Lead  
**Expertise Scores:**
- Full-stack development: 8/10
- Frontend (React/Vite): 8/10
- Backend (Express): 8/10
- Database (Supabase/PostgreSQL): 7/10
- Testing: 6/10
- Git/CI-CD: 7/10
- UI/UX implementation: 7/10

**Preferred Tasks:**
- Feature implementation
- Bug fixes
- UI/UX building
- API endpoint coding
- Database queries
- Component refactoring
- Form implementation

**Workload Capacity:** 3-4 features per sprint  
**Typical Task Time:** 1-3 hours per feature  
**Last Active:** March 18

---

### Laura
**Role:** Brand Strategy & Product Positioning Lead  
**Expertise Scores:**
- Brand strategy: 9/10
- Product positioning: 9/10
- Market positioning: 8/10
- Competitive positioning: 8/10
- Content strategy: 8/10
- Go-to-market: 7/10
- Pricing strategy: 7/10

**Preferred Tasks:**
- Brand positioning
- Product strategy
- Marketing messaging
- Competitive positioning
- Content strategy
- Go-to-market planning
- Pricing analysis

**Workload Capacity:** 2-3 strategic tasks  
**Typical Task Time:** 2-4 hours per deliverable  
**Last Active:** March 18

---

### Opus
**Role:** Deep Reasoning & Advanced Architecture  
**Expertise Scores:**
- Deep reasoning: 10/10
- Complex problem-solving: 10/10
- Code review (complex): 9/10
- Security architecture: 8/10
- System design: 9/10
- Algorithm design: 8/10
- Performance analysis: 8/10

**Preferred Tasks:**
- Complex code review
- Security audits
- Architecture deep-dives
- Hard technical problems
- Performance troubleshooting
- Algorithm optimization
- Advanced debugging

**Workload Capacity:** 1-2 per week (high-context, expensive)  
**Typical Task Time:** 1-3 hours per deep dive  
**Cost:** ~$1 per use vs $0.01-0.10 for others  
**Last Active:** Available

---

### Jarvis
**Role:** DevOps & Infrastructure Automation  
**Expertise Scores:**
- Linux/macOS administration: 8/10
- Docker/Kubernetes: 7/10
- CI/CD automation: 8/10
- Monitoring & logging: 7/10
- Backup/recovery: 7/10
- Network configuration: 6/10
- Script automation: 8/10

**Preferred Tasks:**
- Infrastructure setup
- CI/CD configuration
- Monitoring/alerting
- Backup verification
- Script automation
- Server management
- Log analysis

**Workload Capacity:** 2-3 infrastructure tasks  
**Typical Task Time:** 1-4 hours  
**Last Active:** Feb 28 (likely needs reactivation)

---

## Task Type Matrix

### Research Tasks → **Scout** (Primary) | Johnny (Secondary)
- Competitive analysis
- Market research
- Customer interviews
- Vendor evaluation
- Industry trends
- Technical specification research

**Routing Score Formula:**
```
score = (task_research_intensity * scout.research_score) 
      + (task_time_estimate / scout.capacity_hours)
      + scout.current_availability
```

---

### Development Tasks → **Johnny** (Primary) | Chief (Secondary)
- Feature implementation
- Bug fixes
- UI/UX coding
- API endpoints
- Component refactoring
- Database queries

**Routing Score Formula:**
```
score = (task_complexity * 0.6 + task_size * 0.4) * johnny.dev_score
      + (availability_window - task_time_estimate)
```

---

### Architecture Tasks → **Chief** (Primary) | Opus (Complex)
- System design
- Database schema
- API design
- Infrastructure planning
- Complex refactoring
- Performance optimization

**Routing Score Formula:**
```
score = task_complexity_score * chief.architecture_score
      + availability_hours / task_estimate
```

---

### QA/Testing Tasks → **Velma** (Primary) | Johnny (Secondary)
- Code review
- QC gating
- Bug diagnosis
- Test planning
- Security testing
- Performance testing

**Routing Score Formula:**
```
score = (task_qa_intensity * velma.qa_score)
      + (1 - velma.current_workload / velma.capacity)
```

---

### Strategy/Brand Tasks → **Laura** (Primary) | Scout (Secondary)
- Brand positioning
- Product strategy
- Marketing messaging
- Go-to-market planning
- Pricing analysis
- Competitive positioning

**Routing Score Formula:**
```
score = (task_strategy_intensity * laura.strategy_score)
      + laura.market_expertise
```

---

### Deep Problem-Solving → **Opus** (Primary) | Chief (Secondary)
- Complex code review (>5h expected)
- Security architecture
- Hard technical problems
- Advanced optimization
- Algorithm design

**Routing Score Formula:**
```
score = task_complexity_score * opus.reasoning_score
      + (task_importance * 0.3)
      - (opus_cost_factor * 0.2)  # Only route high-impact items
```

---

### Infrastructure/Automation → **Jarvis** (Primary) | Chief (Secondary)
- CI/CD setup
- Monitoring configuration
- Backup verification
- Script automation
- Server administration
- DevOps tooling

**Routing Score Formula:**
```
score = (task_infrastructure_intensity * jarvis.devops_score)
      + jarvis.automation_expertise
```

---

## Auto-Routing Decision Tree

**Input:** New task with properties (type, complexity, time_estimate, skills_required, urgency)

```
IF complexity > 8 AND time_estimate > 4h AND (type IN [architecture, security])
  → Opus  (cost justified by complexity)

ELSE IF type = research
  → Scout

ELSE IF type = feature_implementation OR type = bug_fix
  → Johnny (if availability_ok)
  → Chief (if Johnny overloaded)

ELSE IF type = qa_testing OR type = code_review
  → Velma

ELSE IF type = strategy
  → Laura

ELSE IF type = infrastructure
  → Jarvis

ELSE
  → Default to generalist (Johnny)
```

---

## Availability Tracking

**Current Workload (Last Updated: March 27 @ 9:00 AM EST):**

| Agent | Current Load | Capacity | Available For | Idle Days |
|-------|--------------|----------|---------------|-----------|
| Scout | 2 tasks | 4 | 2 more | 0 (just requeued) |
| Velma | Idle | 3 | 3 tasks | 8 |
| Chief | Idle | 3 | 3 tasks | 8 |
| Johnny | Idle | 4 | 4 tasks | 9 |
| Laura | Idle | 3 | 3 tasks | 9 |
| Opus | Available | 2/wk | High-complexity | Available |
| Jarvis | Idle | 3 | 2-3 tasks | 27 days |

---

## Implementation Checklist

**Phase 1: Routing Logic (Today)**
- ✅ Define expertise matrix (this file)
- ⏳ Code auto-routing function in autonomy loop
- ⏳ Test routing decisions on existing tasks
- ⏳ Integrate into briefing generation

**Phase 2: Workload Tracking (Tomorrow)**
- ⏳ Add workload tracking to `.mission-control-state.json`
- ⏳ Update availability in real-time as tasks complete
- ⏳ Add predictive capacity forecasting

**Phase 3: Monitoring (Next Week)**
- ⏳ Add routing dashboard to Mission Control
- ⏳ Track routing accuracy (% correct assignment)
- ⏳ Identify misroutes and refine scoring

---

## Notes

- Scores normalized to 0-10 scale for decision-making
- Threshold: Score ≥ 7 triggers auto-assignment
- If no agent > threshold, flag for manual triage
- Re-route if agent overloaded mid-task
- Track routing accuracy for continuous improvement

