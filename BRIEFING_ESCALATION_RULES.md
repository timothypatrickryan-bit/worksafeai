# Briefing Escalation Rules

**Effective:** March 25, 2026  
**Purpose:** Determine what gets auto-handled vs escalated to Tim

---

## AUTO-HANDLED (Lucy decides)

### ✅ Technical Decisions
- "WebSocket vs Polling?" → Lucy decides
- "Which framework?" → Lucy decides  
- "How to optimize this?" → Lucy decides
- "Which library for X?" → Lucy decides
- "How should we structure this?" → Lucy decides

**System response:** Auto-approve + document decision

### ✅ Process Decisions
- "How should I test this?" → Lucy decides
- "What's the best approach?" → Lucy decides
- "How to organize the code?" → Lucy decides
- "What's the implementation strategy?" → Lucy decides

**System response:** Auto-approve + document decision

### ✅ Status Requests
- "What's the status?" → Lucy answers
- "How is progress?" → Lucy answers
- "Are we on track?" → Lucy answers
- "What's happening?" → Lucy answers

**System response:** Auto-respond with update

### ✅ Execution Questions
- "Should I fix this bug?" → Lucy decides
- "What order should I work?" → Lucy decides (if no explicit priority)
- "How long will this take?" → Lucy estimates
- "What's blocking me?" → Lucy solves or escalates

**System response:** Auto-approve + execute

---

## ESCALATED TO TIM (CEO-Level)

### 🚨 Strategic Direction
- "Should we pivot?" → Tim decides
- "Should we change focus?" → Tim decides
- "Should we target this market?" → Tim decides
- "Should we stop working on X?" → Tim decides

**System response:** Queue for Tim's review (no auto-response)

### 🚨 Priority/Resource Allocation
- "Which project should I focus on?" → Tim decides
- "Should we shift resources?" → Tim decides
- "Is X still a priority?" → Tim decides
- "Which is more important, X or Y?" → Tim decides

**System response:** Queue for Tim's review

### 🚨 Business/Revenue Decisions
- "How much should we charge?" → Tim decides
- "What should our business model be?" → Tim decides
- "Should we partner with X?" → Tim decides
- "Should we expand to Z?" → Tim decides

**System response:** Queue for Tim's review

### 🚨 Major Resource Decisions
- "Should we hire?" → Tim decides
- "Should we change team structure?" → Tim decides
- "Should we acquire X tool?" → Tim decides

**System response:** Queue for Tim's review

---

## Pattern Matching (Automatic Detection)

### AUTO-HANDLE Keywords
- `websocket|polling|architecture|framework|library|database|approach|implementation|process|test|structure|optimize|fix|bug|error|refactor|performance|design|pattern|method|workflow|how should|how to|what's the`

→ **Auto-approve + execute**

### ESCALATE Keywords
- `pivot|strategy|direction|focus|priority|should we|market|business|revenue|partner|hire|team|structure|expand|allocate|resource|urgent`

→ **Queue for Tim's review**

### DEFAULT
If keywords don't match, escalate (safer to ask than assume)

---

## Tim's Workflow

### Daily/As-Needed
Open http://localhost:3001 → See CEO-level briefings

**Actions:**
- Approve/Reject strategic decisions
- Provide guidance on priorities
- Clarify business direction

### Result
Lucy executes immediately once approved. Work doesn't wait.

---

## Lucy's Workflow

### Autonomous Path (90% of work)
1. See task that needs doing
2. Make technical decision
3. Execute
4. Update status
5. Done

### Escalation Path (10% of work)
1. Need Tim's strategic input
2. Create Work Briefing (CEO-level)
3. Tim responds with direction
4. Execute based on guidance
5. Done

---

## Success

✅ Tim only sees high-level decisions  
✅ Lucy moves fast on technical work  
✅ No bottlenecks on technical decisions  
✅ Clear escalation path for strategic questions  
✅ Full transparency on all decisions  

---

**This is how we scale: Lucy decides technical, Tim decides strategic.**
