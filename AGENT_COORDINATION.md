# Agent Coordination Guide

How subagents read/write Mission Control to coordinate autonomously.

---

## 🎯 How It Works

**Every agent follows this pattern:**

```
1. STARTUP
   └─ Read .mission-control-state.json
   └─ Check own status
   └─ Read inbox items meant for you

2. WORK
   └─ Do your job
   └─ Read other agents' latest outputs
   └─ Use those outputs to inform decisions

3. HANDOFF
   └─ Update your status → "complete"
   └─ Write output to agents.{your-name}.output
   └─ If work is for another agent/human → add to inbox
   └─ Write updated state back
```

---

## 📍 Laura (Brand Strategy Manager)

**When Kelly asks Laura about brand strategy via WhatsApp:**

### Laura's startup (in the spawn call):
```javascript
// Spawn Laura with Mission Control context
const state = JSON.parse(fs.readFileSync('.mission-control-state.json'));

// Laura sees:
// - Latest consensus research (projects.consensus.research-queue)
// - What LinkedIn is posting (agents.linkedin-bot.lastPost)
// - Any pending strategy requests (inbox items for laura)
```

### Laura's work:
```javascript
// 1. Read inbox items meant for her
const inboxForMe = state.inbox.filter(i => i.to === 'laura' && i.status === 'pending');

// 2. Read Consensus research to inform strategy
const consensusResearch = state.projects.consensus;

// 3. Read LinkedIn engagement to match tone
const linkedinVibe = state.agents['linkedin-bot'].lastPost.engagement;

// 4. Do strategic analysis
// (Write memo, think about market positioning, etc.)

// 5. Write back to Mission Control
state.agents.laura.status = 'complete';
state.agents.laura.output = {
  type: 'strategy-memo',
  content: '...',
  timestamp: new Date().toISOString()
};

// 6. Queue message for Kelly
state.inbox.push({
  id: `inbox-${Date.now()}`,
  from: 'laura',
  to: 'kelly',
  type: 'strategy-memo',
  status: 'ready-to-send',
  message: 'Q2 brand positioning memo complete'
});

// 7. Write state back
fs.writeFileSync('.mission-control-state.json', JSON.stringify(state, null, 2));
```

---

## 🔗 LinkedIn Bot

**When it's time to post (Tue/Thu/Sat @ 9 AM):**

### Reads:
```javascript
const state = readState();

// 1. What's Laura been writing (brand voice)
const lauraLatestOutput = state.agents.laura.output;

// 2. Any newsworthy alerts from projects
const worksafeAlerts = state.projects.worksafeai.alerts;
const consensusNews = state.projects.consensus.alerts;

// 3. Last post's engagement (to understand what resonated)
const lastEngagement = state.agents['linkedin-bot'].lastPost.engagement;
```

### Writes:
```javascript
// 1. Generate post (using Laura's brand voice if available)
const post = generatePost(lauraLatestOutput, consensusNews);

// 2. Update own status
state.agents['linkedin-bot'].status = 'posted';
state.agents['linkedin-bot'].lastPost = {
  title: post.title,
  content: post.content,
  timestamp: new Date().toISOString(),
  linkedinUrl: '...',
  engagement: { views: 0, reactions: 0, comments: 0 }
};

// 3. Queue notification for Tim (optional)
state.inbox.push({
  from: 'linkedin-bot',
  to: 'tim',
  type: 'post-published',
  status: 'info',
  message: `Posted: "${post.title}"`
});

fs.writeFileSync('.mission-control-state.json', JSON.stringify(state, null, 2));
```

---

## 🔍 Code Reviewer (Opus)

**Runs every hour (or on-demand):**

### Reads:
```javascript
const state = readState();

// 1. Which projects need review
const projects = state.projects;

// 2. Last deploy timestamps (know what changed)
const lastDeploys = {
  worksafeai: projects.worksafeai.lastDeploy,
  consensus: projects.consensus.lastDeploy
};
```

### Writes:
```javascript
// For each project:
// 1. Run code review on recent commits
const findings = reviewCode(projectName, since: lastDeploys[projectName]);

// 2. Update state with findings
state.agents['code-reviewer'].status = 'reviewed';
state.agents['code-reviewer'].lastReview = {
  project: projectName,
  timestamp: new Date().toISOString(),
  findingsCount: findings.length,
  fixed: findings.filter(f => f.status === 'fixed').length,
  status: findings.length > 0 ? 'issues-found' : 'all-clear'
};

// 3. If critical issues found, add alert
if (findings.some(f => f.severity === 'critical')) {
  state.alerts.push({
    level: 'critical',
    message: `Code review found ${findings.length} issues in ${projectName}`,
    timestamp: new Date().toISOString()
  });
  
  // Queue alert for Tim
  state.inbox.push({
    from: 'code-reviewer',
    to: 'tim',
    type: 'code-alert',
    status: 'critical',
    message: `Critical issues found in ${projectName}`
  });
}

fs.writeFileSync('.mission-control-state.json', JSON.stringify(state, null, 2));
```

---

## 💫 Main Session (Lucy) - Heartbeat Integration

**Every heartbeat check:**

```javascript
// 1. Read Mission Control state
const state = readState();

// 2. Check for critical alerts
if (state.alerts.filter(a => a.level === 'critical').length > 0) {
  notifyTim('🚨 Critical alerts in Mission Control');
}

// 3. Process inbox items ready-to-send
const pendingItems = state.inbox.filter(i => i.status === 'ready-to-send');

for (const item of pendingItems) {
  if (item.to === 'kelly') {
    // Send to Kelly via WhatsApp
    sendWhatsAppMessage('kelly', item.message);
  } else if (item.to === 'tim') {
    // Send to Tim via Telegram
    sendTelegramMessage('tim', item.message);
  }
  
  // Mark as sent
  item.status = 'sent';
}

// 4. Write back
fs.writeFileSync('.mission-control-state.json', JSON.stringify(state, null, 2));

// 5. Log activity
appendLog(`Heartbeat: Processed ${pendingItems.length} inbox items, ${state.alerts.length} active alerts`);
```

---

## 🚀 Spawning Agents with Mission Control

### How to spawn Laura with Mission Control context:

```javascript
// In main session (Lucy)
const state = JSON.parse(fs.readFileSync('.mission-control-state.json'));

// Pass state as context when spawning
const lauraContext = `
You are Laura, an expert in elevated children's apparel strategy.

## Current Mission Control State:
${JSON.stringify(state, null, 2)}

## Your Task:
Read the context above, then respond to Kelly's question about Q2 brand positioning.

Make sure to:
1. Check what Consensus has researched (state.projects.consensus)
2. Match the tone of recent LinkedIn posts (state.agents.linkedin-bot.lastPost)
3. Propose positioning that differentiates from commodity kids' brands

When you're done, I will update Mission Control with your output.
`;

await spawnSubagent({
  agentId: 'main', // Laura's ID
  task: `${lauraContext}\n\nKelly's Question: How should we position elevated kids' apparel in Q2?`
});
```

---

## 📊 Example Flow: Laura → LinkedIn → Tim

**Timeline:**

```
12:00 PM - Kelly asks Laura: "Q2 positioning?"
├─ Lucy spawns Laura with Mission Control context
│
12:05 PM - Laura completes analysis
├─ Writes output to agents.laura.output
├─ Adds inbox item: (laura → kelly, ready-to-send)
└─ Lucy reads inbox, sends to Kelly via WhatsApp
│
12:30 PM - LinkedIn bot checks (scheduled)
├─ Reads agents.laura.output
├─ Gets brand voice: "premium, intentional, sustainable"
├─ Generates post matching that tone
├─ Posts to LinkedIn
└─ Updates agents.linkedin-bot.lastPost
│
12:30 PM (hourly) - Code reviewer runs
├─ No issues found
├─ Updates agents.code-reviewer.status = "all-clear"
│
13:00 PM - Next heartbeat
├─ Lucy reads Mission Control
├─ Checks inbox: all items sent ✓
├─ Checks alerts: none 🟢
├─ Logs: "All systems normal"
```

---

## 🎮 Testing Mission Control

### Initialize:
```bash
node scripts/mission-control.js read
```

### Add inbox item:
```bash
node scripts/mission-control.js inbox add laura kelly strategy-memo "Test message"
```

### List inbox:
```bash
node scripts/mission-control.js inbox list
```

### Mark item as sent:
```bash
node scripts/mission-control.js inbox send inbox-1773591008745
```

### Update agent status:
```bash
node scripts/mission-control.js agent set laura status "working"
```

---

## 🔐 Security & Cleanup

- **Inbox TTL:** Items auto-expire after 24 hours
- **Sensitive data:** Don't store passwords/tokens in state
- **Audit trail:** Mission Control logs all activity
- **Rollback:** State is a JSON file (version control friendly)

---

## ✅ Next Steps

1. **Integrate into spawns:** Pass Mission Control state when spawning Laura
2. **Add heartbeat check:** Process inbox items every heartbeat
3. **Test end-to-end:** Kelly asks Laura → Laura responds → shows up in inbox
4. **Monitor:** Watch `.mission-control-state.json` for coordination
5. **Scale:** Add more agents (researcher, analyst, publisher) as needed

---

**Goal:** Agents talk to each other through Mission Control, not directly.  
**Benefit:** Tim can see all activity, understand dependencies, and intervene when needed.
