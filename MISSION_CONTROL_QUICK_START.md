# Mission Control - Quick Start

**TL;DR:** Central coordination hub for all your subagents. One file, one CLI tool, complete audit trail.

---

## 🚀 Quick Test

```bash
cd ~/.openclaw/workspace

# View current state
node scripts/mission-control.js

# Output:
# ═══════════════════════════════════════
#   MISSION CONTROL STATUS
# ═══════════════════════════════════════
# 
# 📋 AGENTS:
#   ⏸️  Laura (Brand Strategy Manager)
#   🟢 LinkedIn Auto-Poster
#   ⏸️  Opus Code Review
# 
# 🗂️  PROJECTS:
#   ⚠️ worksafeai
#   ⚠️ consensus
```

---

## 📋 Common Commands

### View State
```bash
node scripts/mission-control.js read
```

### Add Inbox Item (Async Task)
```bash
node scripts/mission-control.js inbox add laura kelly strategy-memo "Q2 positioning analysis complete"
```

### List Inbox
```bash
node scripts/mission-control.js inbox list
```

### Mark Item as Sent
```bash
node scripts/mission-control.js inbox send inbox-1773591008745
```

### Update Agent Status
```bash
node scripts/mission-control.js agent set laura status working
node scripts/mission-control.js agent set laura status idle
```

---

## 🔄 Agent Flow

### How Agents Use Mission Control:

1. **On Startup**
   ```javascript
   const state = JSON.parse(
     fs.readFileSync('.mission-control-state.json')
   );
   // Read what other agents have done
   ```

2. **During Work**
   ```javascript
   // Use other agents' outputs
   const lauraVoice = state.agents.laura.output;
   const linkedinEngagement = state.agents['linkedin-bot'].lastPost.engagement;
   ```

3. **On Completion**
   ```javascript
   state.agents.myAgent.status = 'complete';
   state.agents.myAgent.output = myOutput;
   state.inbox.push({
     from: 'myAgent',
     to: 'kelly',
     type: 'memo',
     status: 'ready-to-send',
     message: 'Work complete'
   });
   fs.writeFileSync('.mission-control-state.json', JSON.stringify(state));
   ```

---

## 📍 The Inbox Concept

**Inbox items** = async tasks that need human action or delivery

```json
{
  "id": "inbox-1773591008745",
  "from": "laura",
  "to": "kelly",
  "type": "strategy-memo",
  "status": "ready-to-send",  // or: sent
  "message": "Q2 positioning analysis complete",
  "ttl": "2026-03-16T16:10:08.746Z"
}
```

**Heartbeat processes inbox:**
- Items for Kelly → send via WhatsApp
- Items for Tim → send via Telegram
- Update status to "sent"

---

## 🎯 Example: Laura Works with Mission Control

### Laura Spawn Code:
```javascript
const state = JSON.parse(fs.readFileSync('.mission-control-state.json'));

const lauraTask = `
You are Laura, brand strategy expert.

## Current Intelligence:
- Consensus research: ${JSON.stringify(state.projects.consensus)}
- LinkedIn engagement: ${state.agents['linkedin-bot'].lastPost.engagement}
- Recent posts: ${state.agents['linkedin-bot'].lastPost.title}

## Task:
Analyze Q2 brand positioning for elevated children's apparel.

Output JSON with: analysis, recommendations, nextSteps
`;

const result = await spawnSubagent({ agentId: 'laura', task: lauraTask });

// Update Mission Control
state.agents.laura.output = result;
state.agents.laura.status = 'complete';
state.inbox.push({
  from: 'laura',
  to: 'kelly',
  type: 'strategy-memo',
  status: 'ready-to-send',
  message: 'Q2 positioning analysis ready'
});
fs.writeFileSync('.mission-control-state.json', JSON.stringify(state));
```

### LinkedIn Bot Reads Laura:
```javascript
const state = readState();

// Get brand voice from Laura
const brandVoice = state.agents.laura.output?.content;

// Generate post matching that voice
const post = generatePost(brandVoice, state.projects.consensus.alerts);

// Update state with result
state.agents['linkedin-bot'].lastPost = {
  title: post.title,
  timestamp: new Date(),
  engagement: { views: 0, reactions: 0 }
};
writeState(state);
```

---

## 🔐 State Structure

```
.mission-control-state.json
├── agents
│   ├── laura
│   │   ├── status: "idle" | "working" | "complete"
│   │   ├── output: { type, content, timestamp }
│   │   └── lastActivity: timestamp
│   ├── linkedin-bot
│   │   ├── status: "scheduled"
│   │   └── lastPost: { title, content, engagement }
│   └── code-reviewer
│       └── lastReview: { findings, fixed, status }
├── projects
│   ├── worksafeai: { status, alerts, healthCheck }
│   └── consensus: { status, alerts, healthCheck }
├── inbox: [{ from, to, type, status, message }]
└── alerts: [{ level, message, timestamp }]
```

---

## ✅ Files to Read

1. **`MISSION_CONTROL_SETUP.md`** ← Start here
   - Full overview of what was built
   - Why it matters
   - Integration checklist

2. **`AGENT_COORDINATION.md`** ← Read before spawning agents
   - How each agent uses Mission Control
   - Code examples for Laura, LinkedIn, code reviewer
   - Full example flow

3. **`MISSION_CONTROL.md`** ← Deep dive
   - Complete architecture
   - All agent integration points
   - Communication protocol

---

## 🎮 Testing Your Setup

```bash
# 1. View state
node scripts/mission-control.js

# 2. Add test item
node scripts/mission-control.js inbox add laura kelly test-memo "This is a test message"

# 3. List inbox
node scripts/mission-control.js inbox list

# 4. Mark as sent
node scripts/mission-control.js inbox send inbox-XXXXX

# 5. Verify it's sent
node scripts/mission-control.js inbox list
# (Item should show status: "sent")
```

---

## 🚀 Next Steps

1. **Read `MISSION_CONTROL_SETUP.md`** (5 min)
2. **Review `AGENT_COORDINATION.md`** (10 min)
3. **Integrate with Laura** (30 min)
   - Spawn Laura with Mission Control context
   - Have her write output to state
   - Have her add inbox items
4. **Test end-to-end** (15 min)
   - Ask Laura a question
   - See output in inbox
   - Manually process or integrate with heartbeat

---

## 💡 Key Insight

**Mission Control = Nervous System**

- **Agents** = Muscles (doing work)
- **Mission Control** = Brain (coordinating effort)
- **Tim** = Consciousness (making strategic decisions)

Agents can work 24/7, but they're coordinated through Mission Control.

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| View state | `node scripts/mission-control.js` |
| Add inbox item | `node scripts/mission-control.js inbox add <from> <to> <type> <msg>` |
| List inbox | `node scripts/mission-control.js inbox list` |
| Send item | `node scripts/mission-control.js inbox send <id>` |
| Check alerts | Read `.mission-control-state.json` → alerts array |
| Agent status | Read `.mission-control-state.json` → agents.{name}.status |

---

**Status:** ✅ Ready to Use  
**Next:** Laura Integration  
**Docs:** See MISSION_CONTROL_SETUP.md for full guide
