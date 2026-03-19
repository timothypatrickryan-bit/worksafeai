# Mission Control - Subagent Coordination System

**Purpose:** Central nervous system for all autonomous agents. Agents post their outputs here; other agents read and respond.

**Architecture:**
```
┌─────────────────────────────────────────┐
│        MISSION CONTROL STATE            │
│  (Shared JSON + activity logs)          │
└─────────────────────────────────────────┘
         ↑           ↑           ↑           ↑
         │           │           │           │
      Laura      LinkedIn      Code        Work
    (Strategy)    (Posts)     Review      Monitor
```

---

## 1. Shared State File (Heartbeat-Updated)

**Location:** `.mission-control-state.json`

```json
{
  "lastUpdate": "2026-03-15T16:09:00Z",
  "agents": {
    "laura": {
      "name": "Laura (Brand Strategy Manager)",
      "status": "idle",
      "lastActivity": "2026-03-15T15:30:00Z",
      "currentTask": "children's apparel Q2 strategy",
      "output": {
        "type": "strategy_memo",
        "content": "Premium positioning analysis + market gaps",
        "timestamp": "2026-03-15T15:30:00Z",
        "consumers": ["kelly-whatsapp", "tim-review"]
      }
    },
    "linkedin-bot": {
      "name": "LinkedIn Auto-Poster",
      "status": "scheduled",
      "nextRun": "2026-03-18T13:00:00Z",
      "lastPost": {
        "title": "Data Sovereignty Isn't Just Compliance—It's Competitive",
        "timestamp": "2026-03-14T15:54:43Z",
        "engagement": {
          "views": 234,
          "reactions": 12,
          "comments": 3
        }
      }
    },
    "code-reviewer": {
      "name": "Opus Code Review",
      "status": "reviewing",
      "targetRepo": "worksafeai",
      "lastReview": {
        "timestamp": "2026-03-15T10:00:00Z",
        "findings": 3,
        "fixed": 3,
        "status": "all-clear"
      }
    }
  },
  "projects": {
    "worksafeai": {
      "status": "production",
      "lastDeploy": "2026-03-08T12:24:00Z",
      "healthCheck": "passing",
      "alerts": []
    },
    "consensus": {
      "status": "staging-live",
      "lastDeploy": "2026-03-11T14:45:00Z",
      "healthCheck": "passing",
      "research-queue": ["Wirecutter Home", "ATK", "Outside"]
    }
  },
  "inbox": [
    {
      "from": "laura",
      "to": "kelly",
      "type": "strategy-output",
      "status": "ready-to-send",
      "message": "Q2 brand positioning analysis complete"
    }
  ],
  "alerts": []
}
```

---

## 2. Agent Integration Points

### **Laura (Brand Strategy Manager)**
- **Reads:** `projects.consensus` research queue, `agents.linkedin-bot.lastPost` for brand tone insights
- **Writes:** `agents.laura.output` with strategy documents, `inbox` messages for Kelly
- **Triggers:** When Kelly asks about brand strategy via WhatsApp

### **LinkedIn Bot**
- **Reads:** `agents.laura.output` to match brand voice, `projects.worksafeai.alerts` for newsworthy items
- **Writes:** `agents.linkedin-bot.lastPost` with engagement metrics
- **Triggers:** Tue/Thu/Sat @ 9 AM, or manually from `inbox.pending`

### **Code Reviewer (Opus)**
- **Reads:** Git commit logs, `projects[].lastDeploy`, `agents[].status`
- **Writes:** `agents.code-reviewer.lastReview` with findings
- **Triggers:** Hourly heartbeat check, or on-demand

### **WorkSafeAI Monitor**
- **Reads:** `projects.worksafeai.healthCheck`, deployment logs
- **Writes:** `projects.worksafeai.alerts` if issues detected
- **Triggers:** Every 30 minutes (heartbeat)

---

## 3. Communication Protocol

### **When Agent Completes Work:**
```
1. Update its status in MISSION_CONTROL_STATE
2. Write output to the `inbox` with:
   - from: agent name
   - to: target audience (kelly, tim, laura, etc.)
   - type: strategy/code-review/post/alert
   - status: ready-to-send / needs-approval / published
   - message: human-readable summary
3. Set TTL (time-to-live) for automatic cleanup (24h default)
```

### **When Agent Needs Input from Another:**
```
1. Check MISSION_CONTROL_STATE for the other agent's recent output
2. Use that output in your decision-making
3. Log cross-agent dependency in comments
```

---

## 4. Heartbeat Integration

Add this to `HEARTBEAT.md`:

```markdown
## Mission Control Check (Every Heartbeat)

1. Read `.mission-control-state.json`
2. Check for `inbox` items needing action
3. Review `alerts` (critical!)
4. Update agent statuses
5. Execute any pending tasks (inbox items with status="ready-to-send")
6. Write back updated state
```

---

## 5. Setup Instructions

### **Step 1: Initialize State File**
```bash
# Create empty mission control state
cat > .mission-control-state.json << 'EOF'
{
  "lastUpdate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "agents": {},
  "projects": {},
  "inbox": [],
  "alerts": []
}
EOF
```

### **Step 2: Create Mission Control CLI**
Create `scripts/mission-control.js` for reading/writing state

### **Step 3: Update Subagent Spawns**
When spawning Laura or code review:
```
1. Pass MISSION_CONTROL_STATE as context
2. Agent reads it at start
3. Agent writes updates before exiting
4. Tim's main session merges changes
```

### **Step 4: Add to Heartbeat**
Check inbox every heartbeat, execute pending tasks

---

## 6. Example: Laura Gets a Question from Kelly via WhatsApp

**Flow:**
1. Kelly messages Laura: "What's our Q2 positioning for premium kids' apparel?"
2. **Lucy (main agent)** receives message, reads MISSION_CONTROL_STATE
3. **Laura spawns** with context: "Kelly's question + latest consensus research"
4. Laura thinks + writes strategy memo
5. Laura updates MISSION_CONTROL_STATE:
   ```json
   {
     "from": "laura",
     "to": "kelly",
     "type": "strategy-memo",
     "status": "ready-to-send",
     "content": "..."
   }
   ```
6. **Heartbeat checks inbox**, sees Laura's output
7. **Lucy sends** memo to Kelly via WhatsApp
8. **LinkedIn bot** reads Laura's memo (same day), adjusts next post tone to match

---

## 7. Benefits

✅ **Laura knows what's trending** (reads LinkedIn engagement)  
✅ **LinkedIn bot matches brand voice** (reads Laura's strategy)  
✅ **Code reviewer catches deployment issues** (reads health checks)  
✅ **Everything's logged** (full audit trail)  
✅ **Async coordination** (agents don't need to wait for each other)  
✅ **Easy to debug** (just read `.mission-control-state.json`)  

---

**Next:** Build the CLI tool to manage this state file.
