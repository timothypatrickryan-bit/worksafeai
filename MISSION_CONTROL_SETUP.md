# Mission Control - Setup Complete ✅

**Status:** Ready to deploy (March 15, 2026)

---

## What We Built

A **central coordination system** for all your subagents (Laura, LinkedIn bot, code reviewer, etc.) to:
- Share outputs with each other
- Post tasks to an inbox
- Communicate asynchronously
- Maintain a complete audit trail

---

## The Three Pieces

### 1️⃣ **State File** (`.mission-control-state.json`)
```json
{
  "agents": {
    "laura": { "status": "...", "output": "..." },
    "linkedin-bot": { "lastPost": "...", },
    "code-reviewer": { "lastReview": "..." }
  },
  "projects": {
    "worksafeai": { "status": "production", "alerts": [] },
    "consensus": { "status": "staging", "alerts": [] }
  },
  "inbox": [
    { "from": "laura", "to": "kelly", "status": "ready-to-send", "message": "..." }
  ],
  "alerts": []
}
```

### 2️⃣ **CLI Tool** (`scripts/mission-control.js`)
```bash
# View current state
node scripts/mission-control.js read

# Add inbox item (Laura → Kelly)
node scripts/mission-control.js inbox add laura kelly strategy-memo "message"

# List inbox
node scripts/mission-control.js inbox list

# Mark item as sent
node scripts/mission-control.js inbox send inbox-1773591008745

# Update agent status
node scripts/mission-control.js agent set laura status working
```

### 3️⃣ **Integration Guide** (`AGENT_COORDINATION.md`)
Shows how each agent:
- Reads Mission Control state at startup
- Uses outputs from other agents to inform decisions
- Writes results back when done
- Posts to inbox for humans/other agents

---

## How It Works in Practice

### **Example: Kelly asks Laura about brand strategy**

```
1. Kelly (via WhatsApp): "What's our Q2 positioning for premium kids' apparel?"

2. Lucy (main session) receives message

3. Lucy spawns Laura with Mission Control context:
   - Passes .mission-control-state.json as part of the prompt
   - Laura sees: latest Consensus research, LinkedIn engagement data
   
4. Laura thinks & writes analysis

5. Laura updates Mission Control:
   - Sets own status → "complete"
   - Writes output → agents.laura.output
   - Adds inbox item: (from: laura, to: kelly, status: ready-to-send)

6. Heartbeat runs (Lucy's main loop):
   - Reads Mission Control
   - Finds inbox item for Kelly
   - Sends to Kelly via WhatsApp
   - Marks inbox item as "sent"

7. LinkedIn bot (Tue/Thu/Sat @ 9 AM):
   - Reads agents.laura.output
   - Gets brand voice: "premium, intentional, sustainable"
   - Generates post matching that tone
   - Posts to LinkedIn
   - Updates lastPost with engagement

8. Tim sees everything:
   - Can read .mission-control-state.json anytime
   - Knows what Laura wrote, when it was sent, LinkedIn engagement
   - Can intervene at any step
```

---

## Files Created

| File | Purpose |
|------|---------|
| `.mission-control-state.json` | Current state (agent status, inbox, alerts) |
| `scripts/mission-control.js` | CLI to read/write state |
| `MISSION_CONTROL.md` | Architecture & design |
| `AGENT_COORDINATION.md` | How agents use it |
| `MISSION_CONTROL_SETUP.md` | This file |

---

## Integration Checklist

### ✅ Phase 1: Ready Now
- [x] State file structure designed
- [x] CLI tool created & tested
- [x] Documentation complete
- [x] Example inbox item created & verified

### ⏳ Phase 2: Integrate with Laura (Next)
- [ ] Modify Laura spawn to pass Mission Control context
- [ ] Have Laura write output to state.agents.laura.output
- [ ] Have Laura add inbox items for Kelly

### ⏳ Phase 3: Heartbeat Integration (After Laura)
- [ ] Add Mission Control check to HEARTBEAT.md
- [ ] Process inbox items every heartbeat
- [ ] Send inbox items to Kelly (via WhatsApp when ready)

### ⏳ Phase 4: LinkedIn Integration (After Heartbeat)
- [ ] Have LinkedIn bot read state.agents.laura.output
- [ ] Match brand voice from Laura's latest output
- [ ] Update engagement metrics in lastPost

### ⏳ Phase 5: Code Reviewer Integration (Optional)
- [ ] Spawn code reviewer with Mission Control context
- [ ] Write findings to state.agents['code-reviewer'].lastReview
- [ ] Add critical alerts to state.alerts

---

## Next Steps: Laura Integration

When you're ready, here's how to spawn Laura with Mission Control:

```javascript
// In your main session (Lucy)
const fs = require('fs');

// 1. Read Mission Control state
const missionControl = JSON.parse(
  fs.readFileSync('.mission-control-state.json', 'utf8')
);

// 2. Spawn Laura with context
const lauraTask = `
You are Laura, expert in elevated children's apparel strategy.

## Current Mission Control State:
${JSON.stringify(missionControl, null, 2)}

## Your Task:
Respond to Kelly's question about Q2 brand positioning.

When complete, write your analysis as JSON to stdout:
{
  "analysis": "...",
  "recommendations": ["...", "..."],
  "nextSteps": ["..."]
}

After spawning, Lucy will update Mission Control with your output.
`;

// 3. Spawn Laura
const result = await spawnSubagent({
  agentId: 'laura-session-id',  // Your Laura subagent
  task: lauraTask
});

// 4. Parse result & update Mission Control
const lauraOutput = JSON.parse(result);
missionControl.agents.laura = {
  ...missionControl.agents.laura,
  status: 'complete',
  output: {
    type: 'strategy-analysis',
    content: lauraOutput,
    timestamp: new Date().toISOString()
  }
};

// 5. Add inbox item for Kelly
missionControl.inbox.push({
  id: `inbox-${Date.now()}`,
  from: 'laura',
  to: 'kelly',
  type: 'strategy-memo',
  status: 'ready-to-send',
  message: 'Q2 brand positioning analysis complete',
  ttl: new Date(Date.now() + 24*60*60*1000).toISOString()
});

// 6. Write back
fs.writeFileSync(
  '.mission-control-state.json',
  JSON.stringify(missionControl, null, 2)
);
```

---

## Quick Reference

### Test Mission Control
```bash
cd ~/.openclaw/workspace

# View state
node scripts/mission-control.js

# Add test inbox item
node scripts/mission-control.js inbox add laura kelly memo "test"

# List inbox
node scripts/mission-control.js inbox list

# Mark as sent
node scripts/mission-control.js inbox send inbox-XXX
```

### Read State Programmatically
```javascript
const state = JSON.parse(
  require('fs').readFileSync('.mission-control-state.json')
);

// Check Laura's latest output
console.log(state.agents.laura.output);

// Check inbox items for Kelly
console.log(state.inbox.filter(i => i.to === 'kelly'));

// Check alerts
console.log(state.alerts);
```

---

## Why This Matters

**Before Mission Control:**
- Agents operated in isolation
- No way for Laura to know what LinkedIn posted
- LinkedIn bot couldn't match brand voice
- Hard to track what happened and when

**After Mission Control:**
- Laura reads Consensus research + LinkedIn engagement
- LinkedIn bot reads Laura's brand voice
- Code reviewer knows project health
- Tim can see full coordination history
- Everything is logged, auditable, debuggable

---

## The Vision

Mission Control is the **nervous system** of your autonomous operation:
- Agents are the muscles (doing work)
- Mission Control is the brain (coordinating effort)
- Tim is the conscious mind (making strategic decisions)

Agents can work 24/7, but they're not isolated. They're part of a coordinated team.

---

## Questions?

- **How do I add a new agent?** → Add entry to `state.agents` in Mission Control
- **How do agents find each other's work?** → Read `.mission-control-state.json` at startup
- **What if something fails?** → Check inbox + alerts, check agent status
- **How do I debug?** → Read `.mission-control-state.json` directly
- **Can agents communicate directly?** → No, always via Mission Control (better for auditing)

---

**Status:** ✅ Setup Complete  
**Ready for:** Laura integration  
**Next:** Spawn Laura with Mission Control context, test inbox flow
