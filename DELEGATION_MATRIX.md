# Delegation Matrix — Team Capabilities

**Updated:** March 25, 2026  
**Purpose:** Who can do what. Use this to delegate work effectively.

---

## Core Team (Available for Delegation)

### 🍀 Lucy (Lead AI Agent)
**Role:** Full-stack development, project orchestration  
**Status:** Online (24/7)  
**Can Do:**
- ✅ Full-stack development (frontend + backend)
- ✅ Project orchestration & coordination
- ✅ Strategic decision-making (within CEO-level scope)
- ✅ Code review approval
- ✅ Process design & optimization
- ✅ Architecture decisions

**Delegate to Lucy when:**
- Multi-layer feature implementation needed
- Project needs orchestration across multiple systems
- CEO-level decisions needed
- Quality assurance on deliverables

**Not ideal for:**
- Hyper-specialized deep dives (has generalist view)
- Long research projects (better with Scout)

---

### 🔨 Builder Bot (Frontend Engineer)
**Role:** Frontend implementation, UI/UX  
**Status:** Online  
**Can Do:**
- ✅ React component development
- ✅ UI/UX design & implementation
- ✅ Tailwind CSS styling
- ✅ Frontend performance optimization
- ✅ Responsive design
- ✅ Component library creation

**Delegate to Builder Bot when:**
- Frontend features need building
- UI needs redesign/improvement
- Component library work
- Frontend-heavy projects

**Not ideal for:**
- Backend work (not specialized)
- Complex database design
- Security audits

---

### 📊 Data Agent (Backend / Data)
**Role:** APIs, databases, data pipelines  
**Status:** Online  
**Can Do:**
- ✅ Express/Node.js API development
- ✅ Database design & optimization
- ✅ Data pipeline creation
- ✅ Query optimization
- ✅ Schema design
- ✅ Backend infrastructure

**Delegate to Data Agent when:**
- Backend APIs need building
- Database optimization needed
- Data processing pipelines
- Complex queries needed
- API design work

**Not ideal for:**
- Frontend work (not specialized)
- Security audits
- User-facing features

---

### 🔍 Scout (Research & Analysis)
**Role:** Market research, competitive analysis  
**Status:** Online  
**Can Do:**
- ✅ Web research & data gathering
- ✅ Competitive analysis
- ✅ Market trends analysis
- ✅ Data synthesis & insights
- ✅ Report generation
- ✅ Industry benchmarking

**Delegate to Scout when:**
- Market research needed
- Competitor analysis required
- Industry trends research
- Data gathering & synthesis
- Insights generation
- Strategic research

**Not ideal for:**
- Code implementation
- System design
- Hands-on execution

---

### 🛡️ Watchdog (Security & Monitoring)
**Role:** Security, monitoring, incident response  
**Status:** Online (24/7)  
**Can Do:**
- ✅ Security audits
- ✅ Vulnerability scanning
- ✅ Monitoring setup & maintenance
- ✅ Incident response
- ✅ Security hardening
- ✅ Compliance checking

**Delegate to Watchdog when:**
- Security audit needed
- Vulnerabilities must be scanned
- Monitoring setup required
- Incident response needed
- Security-critical work
- Compliance review needed

**Not ideal for:**
- Feature development
- Research work
- Long-term projects

---

### 📝 Scribe (Documentation)
**Role:** Technical writing, knowledge base  
**Status:** Offline (activate as needed)  
**Can Do:**
- ✅ Technical documentation
- ✅ API documentation
- ✅ README & getting started guides
- ✅ Knowledge base articles
- ✅ Architecture documentation
- ✅ Process documentation

**Delegate to Scribe when:**
- Documentation needs writing
- API docs needed
- Knowledge base articles
- Architecture guides
- Process documentation
- User guides needed

**Not ideal for:**
- Real-time work
- Code implementation
- Decision-making

---

### 🧪 Velma (QA & Testing)
**Role:** QA testing, test automation  
**Status:** Online  
**Can Do:**
- ✅ Test automation (Jest, Cypress, etc.)
- ✅ Manual QA testing
- ✅ Bug detection & reporting
- ✅ Performance testing
- ✅ Integration testing
- ✅ Edge case discovery

**Delegate to Velma when:**
- QA testing needed
- Test automation required
- Bug detection & verification
- Performance testing
- Integration testing
- Regression testing

**Not ideal for:**
- Feature development
- Architecture decisions
- Strategic work

---

### 👓 Opus Reviewer (Code Quality)
**Role:** Deep code review, security analysis  
**Status:** Online (review-on-demand)  
**Can Do:**
- ✅ Deep code review (architectural level)
- ✅ Security analysis
- ✅ Architecture validation
- ✅ Best practices review
- ✅ Performance bottleneck identification
- ✅ Technical debt assessment

**Delegate to Opus Reviewer when:**
- Critical code review needed
- Security review required
- Architecture validation
- Performance problems identified
- Technical debt assessment
- Best practices audit

**Perfect for:**
- Production code review
- Security-critical features
- Architectural decisions
- Performance optimization

**Cost:** ~$1 per review (use judiciously)

---

## Delegation Rules

### Rule 1: Choose by Specialty
Match task to agent's specialty. Don't ask Builder Bot to do database work.

### Rule 2: Parallel Work
Delegate parallel work to different agents (same task list, different specialties).

### Rule 3: Escalation
If task is above an agent's level → escalate to Lucy or Opus Reviewer.

### Rule 4: Async
All delegation is async. Lucy monitors, agents report results, work continues.

### Rule 5: Clear Requirements
Brief agents clearly. Bad input = bad output.

---

## Example Delegations

### Example 1: New Feature (Multi-Layer)
```
Feature: Real-time dashboard update

Delegate to Lucy:
- Orchestrate the work
- Design architecture
- Ensure all pieces fit together

Or split to specialists:
- Builder Bot: Frontend components
- Data Agent: WebSocket API endpoint
- Velma: Integration testing
```

### Example 2: Security Audit
```
Work: Security audit needed

Delegate to Watchdog:
- Scan for vulnerabilities
- Test security hardening
- Report findings

Then to Opus Reviewer:
- Deep dive on critical findings
- Architecture security review
```

### Example 3: Market Research
```
Work: Competitive analysis needed

Delegate to Scout:
- Research top 5 competitors
- Analyze their features
- Generate insights

Scribe (optional):
- Write up findings as document
```

### Example 4: Complex Performance Issue
```
Work: Dashboard slow, need optimization

Delegate to Data Agent:
- Identify database bottlenecks
- Optimize queries

Then to Opus Reviewer:
- Deep dive on architecture
- Recommend long-term fixes

Then to Builder Bot:
- Implement frontend optimizations
```

---

## Creating a Delegation Work Briefing

**Template:**

```
Title: [Task description]
Description: 
  Who: [Suggested agent name]
  What: [Task details]
  Why: [Business context]
  When: [Deadline if any]
  Acceptance: [How you'll know it's done]
```

**Example:**

```
Title: Build WebSocket API endpoint for real-time updates
Description:
  Who: Data Agent
  What: Create /api/updates endpoint with WebSocket support
  Why: Dashboard needs real-time task updates (CEO decision)
  When: By Friday EOD
  Acceptance: Endpoint tested, documentation complete, performance acceptable

Action: Approve/Reject
```

---

## Team Capacity

| Agent | Current Load | Availability | Notes |
|-------|--------------|--------------|-------|
| Lucy | High | 24/7 | Core orchestrator, handle strategic work |
| Builder Bot | Medium | High | Ready for frontend work |
| Data Agent | Medium | High | Ready for backend/database work |
| Scout | Low | High | Research-on-demand |
| Watchdog | Low | 24/7 | Alert-driven, ready for security work |
| Scribe | Low | Medium | Async doc work, activate as needed |
| Velma | Low | High | Testing-on-demand, always available |
| Opus Reviewer | Very Low | On-Demand | Use for critical reviews only (cost) |

---

## How Lucy Delegates (For Reference)

When Lucy gets work:

1. **Assess task scope**
   - Can I do this myself? (most things)
   - Need specialist help? (some things)
   - Need multiple specialists? (rare)

2. **Choose agent(s)**
   - Match to specialty
   - Check availability
   - Consider cost (Opus Reviewer)

3. **Create delegation briefing**
   - Clear requirements
   - Expected outcome
   - Timeline

4. **Monitor & merge**
   - Track progress
   - Integrate results
   - Report to Tim

---

**Use this matrix to delegate work effectively. The right agent for the right task = faster, better results.**
