# Task Delegation UI - Quick Start Guide

## 🚀 Get Started in 30 Seconds

### Access the Application
```bash
# Application is already running!
# Open in browser: http://localhost:3001/team
```

### Use the Delegation Feature

**Option 1: Via UI (Fastest)**
1. Go to: http://localhost:3001/team
2. Click any blue "📋 Delegate Task" button
3. Fill in task details
4. Click "Create Task"
5. Done! Task assigned immediately

**Option 2: Via API**
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your task name",
    "priority": "High",
    "estimatedHours": 8,
    "assignedTo": "lucy"
  }'
```

---

## 📋 Form Fields Explained

| Field | Required | Example | Notes |
|-------|----------|---------|-------|
| **Task Name** | Yes | "Build API endpoint" | Max 200 chars |
| **Description** | No | "Create REST endpoint for user login" | Max 1000 chars |
| **Priority** | Yes | "High" | Low, Medium, High, Critical |
| **Estimated Hours** | Yes | "8" | Decimal OK (e.g., 4.5) |
| **Due Date** | No | "2026-04-05" | Optional, YYYY-MM-DD |
| **Assign To** | Yes | "lucy" | Select from dropdown |

---

## 🎯 Quick Examples

### Example 1: Urgent Task
```javascript
{
  name: "Critical bug fix",
  description: "Fix login page crash",
  priority: "Critical",
  estimatedHours: 2,
  dueDate: "2026-03-30",
  assignedTo: "johnny"
}
```

### Example 2: Feature Development
```javascript
{
  name: "Implement payment system",
  description: "Stripe integration for subscriptions",
  priority: "High",
  estimatedHours: 16,
  dueDate: "2026-04-10",
  assignedTo: "jarvis"
}
```

### Example 3: Quick Task
```javascript
{
  name: "Update documentation",
  priority: "Low",
  estimatedHours: 1,
  assignedTo: "velma"
}
```

---

## 🔍 Check Agent Availability

### View All Agents
```bash
curl http://localhost:3001/api/agents | jq '.'
```

### Available Agents:
- 🍀 **lucy** - Lead AI Agent (Full-stack, management)
- 🏛️ **chief** - Architecture & Design
- 🧪 **velma** - QA & Code Review
- ✨ **johnny** - Frontend Engineer
- ⚙️ **jarvis** - Backend Engineer
- 🧠 **opus** - Advanced Reasoning
- 📈 **laura** - Strategy & Brand
- 🔍 **scout** - Research & Analysis
- 📋 **mark** - Operations
- 🔧 **steven** - DevOps & Infrastructure

---

## 📊 Track Your Tasks

### Get All Tasks
```bash
curl http://localhost:3001/api/tasks
```

### Get Agent's Tasks
```bash
curl http://localhost:3001/api/agents/lucy/tasks
```

### Get Specific Task
```bash
curl http://localhost:3001/api/tasks/TASK_ID
```

---

## ✏️ Update/Complete Tasks

### Update Task Status
```bash
curl -X PUT http://localhost:3001/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress",
    "priority": "High"
  }'
```

### Complete Task
```bash
curl -X PUT http://localhost:3001/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "complete",
    "completedAt": "2026-03-29T17:00:00Z"
  }'
```

### Delete Task
```bash
curl -X DELETE http://localhost:3001/api/tasks/TASK_ID
```

---

## 🆘 Troubleshooting

### Task Not Creating?
- [ ] Check Task Name is filled in
- [ ] Check Agent is selected in dropdown
- [ ] Ensure both are required fields
- [ ] Check browser console for errors

### Modal Won't Open?
- [ ] Refresh the page (F5)
- [ ] Click the button again
- [ ] Check developer console
- [ ] Server running? http://localhost:3001

### API Calls Failing?
```bash
# Check server is running
curl http://localhost:3001/api/agents

# Check server logs
tail -20 /tmp/mission-control-prod.log

# Restart if needed
pkill -f "node server"
cd mission-control-express-organized
npm start
```

---

## 📁 Key Files

**Component:**
- `client/src/components/TaskDelegationModal.jsx`

**Page:**
- `client/src/pages/Team.jsx`

**Server:**
- `server/index.js` (6 new endpoints added)

**Data:**
- `server/data/tasks.json`

---

## 🚀 Run Instructions

### Production (Already Running)
```bash
cd mission-control-express-organized
npm start
# Available at http://localhost:3001
```

### Development
```bash
# Terminal 1: Start API
npm run server

# Terminal 2: Start UI
npm run client

# UI at http://localhost:5173
# API at http://localhost:3001
```

### Build Only
```bash
npm run build
```

---

## 💡 Pro Tips

1. **Batch Assign:** Can delegate to multiple agents from UI one by one
2. **API Automation:** Write scripts to bulk-assign tasks via API
3. **Future Hours:** Can use decimals like 4.5, 8.25, etc.
4. **No Description:** Description is optional, name is enough
5. **Monitor Progress:** Check agent tasks anytime via API
6. **Bulk Updates:** Update multiple tasks via loop with API

---

## 🎯 Typical Workflow

1. **Create Task** - Via UI or API
2. **Assign Agent** - Select from dropdown or in POST body
3. **Monitor** - Check agent workload
4. **Track** - Update status as work progresses
5. **Complete** - Mark done when finished

---

## 📞 Support

### Check System Status
```bash
# Is server running?
curl http://localhost:3001/api/agents

# How many tasks?
curl http://localhost:3001/api/tasks | jq '.count'

# Agent workload?
curl http://localhost:3001/api/agents/lucy/tasks
```

### View Logs
```bash
tail -f /tmp/mission-control-prod.log
```

### Full Documentation
See `TASK_DELEGATION_BUILD_SUMMARY.md` for complete details

---

## ✅ You're Ready!

- ✅ Server running on port 3001
- ✅ UI at http://localhost:3001/team
- ✅ API at http://localhost:3001/api
- ✅ Data persisting to JSON
- ✅ 10 agents ready for tasks

**Start delegating now!** 🚀

---

*Last Updated: March 29, 2026*
