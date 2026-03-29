# MISSION CONTROL MODERNIZATION — EXECUTION PLAN
## Tim Ryan | March 29, 2026 @ 10:35 AM EDT

---

## 🎯 MISSION STATEMENT

**Objective:** Fix 3 critical issues in Mission Control Dashboard by moving from hardcoded mock data to dynamic, real-time data integration.

**Current State:** Memory, Docs, and Team pages show stale/fictional data (last updated March 25)

**Target State:** All pages fetch live data from workspace (memory files, docs, agents)

**Timeline:** 3-4 days (can run in parallel)

**Value:** Mission Control becomes operationally useful again, reflects true system state in real-time

---

## 🔴 CRITICAL ISSUES (Severity: HIGH)

### Issue #1: Memory Page (4 Days Out of Date)
- **Problem:** Shows hardcoded data from March 25, never refreshes
- **Impact:** User sees stale context, thinks system is broken
- **Root Cause:** `Memory.jsx` uses hardcoded `memoryEntries` object
- **Fix:** Replace with API call to new `/api/memory` endpoint
- **Data Source:** `memory/2026-03-DD.md` files (11 current files)
- **Effort:** 4-6 hours backend + 2-3 hours frontend = 6-9 hours total

### Issue #2: Docs Page (Mock-Only, Non-Functional)
- **Problem:** Shows 15 fictional documents; clicking does nothing
- **Impact:** Users can't access actual documentation; search says "not found"
- **Root Cause:** `Docs.jsx` uses hardcoded `docCategories` array; backend scanner never wired to frontend
- **Fix:** Connect existing backend document scanner + add viewer modal
- **Data Source:** Workspace directories (apps/, projects/, mission-control/, docs/)
- **Effort:** 3-4 hours backend + 4-5 hours frontend = 7-9 hours total

### Issue #3: Team Page (Missing Laura)
- **Problem:** Shows 8 hardcoded agents; Laura (added Mar 28) + Chief not listed correctly
- **Impact:** Team roster is inaccurate; new agents invisible
- **Root Cause:** Agent list hardcoded in `Team.jsx`; no agent registry
- **Fix:** Create `/api/agents` endpoint reading from `agents.json`
- **Data Source:** `AGENTS.md` + March 29 memory (10 agents identified)
- **Effort:** 2-3 hours backend + 2-3 hours frontend = 4-6 hours total

---

## 📊 IMPLEMENTATION ROADMAP

### PHASE 1: BACKEND DATA LAYER (Day 1 — 7-8 hours)

**Objective:** Create three library modules + 9 API endpoints to serve real data

#### Step 1.1: Create Memory Reader (`server/lib/memory-reader.js`)
**Purpose:** Parse markdown memory files into structured timeline

**Responsibility:**
- Scan `memory/` directory for `.md` files
- Extract dates from filenames (YYYY-MM-DD)
- Parse markdown sections (e.g., "## 9:03 AM") as timeline entries
- Return formatted: `{ date, entries: [{time, content}], dayCount }`

**Input:** Directory path (`memory/`)  
**Output:** Array of day objects with entries

**Code Required:** ~200 lines (file I/O + markdown parsing)

**Status:** NEW — doesn't exist yet

---

#### Step 1.2: Create Document Scanner (`server/lib/document-scanner.js`)
**Purpose:** Scan workspace for actual documentation files

**Responsibility:**
- Scan workspace root for `.md` files matching patterns
- Organize by category (Architecture, Deployment, Projects, Operations)
- Generate file metadata (title, path, size, modified date)
- Return hierarchical structure: `{ category, docs: [{title, path, updated}] }`

**Input:** Directory paths  
**Output:** Array of category objects with docs

**Code Required:** ~250 lines (fs scanning + path resolution)

**Note:** Backend already has `DOCUMENT_MAPPINGS` but never used — we'll enhance and wire it

**Status:** PARTIAL — structure exists, needs completion

---

#### Step 1.3: Create Agent Registry (`server/lib/agent-registry.js`)
**Purpose:** Manage agent roster and status

**Responsibility:**
- Load agents from `server/data/agents.json` (new file)
- Return agent roster with: name, role, avatar, specialty, tasks, uptime, status
- Simulate "online" status based on recent session activity
- Support agent lookup by key/name

**Input:** None (reads from local file)  
**Output:** Agent roster array + utilities

**Code Required:** ~150 lines (file I/O + filtering)

**Status:** NEW — doesn't exist yet

---

#### Step 1.4: Create `server/data/agents.json`
**Purpose:** Central registry for all 10 agents

**Data from:** March 29 memory + AGENTS.md

**Agents to include:**
```json
[
  { key: "lucy", name: "Lucy", role: "Lead AI Agent", avatar: "🍀", specialty: "Full-stack development, project management", tasks: 142, uptime: "99.2%" },
  { key: "chief", name: "Chief", role: "Architecture & Design", avatar: "🏛️", specialty: "System design, scalability, iOS app", tasks: 67, uptime: "98.9%" },
  { key: "velma", name: "Velma", role: "QA & Code Review", avatar: "🧪", specialty: "Testing, security, quality gates", tasks: 45, uptime: "98.7%" },
  { key: "johnny", name: "Johnny", role: "Frontend Engineer", avatar: "✨", specialty: "React, UI/UX, styling", tasks: 78, uptime: "97.8%" },
  { key: "jarvis", name: "Jarvis", role: "Backend Engineer", avatar: "⚙️", specialty: "APIs, databases, optimization", tasks: 91, uptime: "99.1%" },
  { key: "opus", name: "Opus", role: "Advanced Reasoning", avatar: "🧠", specialty: "Complex problem solving, optimization", tasks: 34, uptime: "99.5%" },
  { key: "laura", name: "Laura", role: "Strategy & Brand", avatar: "📈", specialty: "Market analysis, positioning, growth", tasks: 28, uptime: "96.4%" },
  { key: "scout", name: "Scout", role: "Research & Analysis", avatar: "🔍", specialty: "Web research, competitive analysis, insights", tasks: 53, uptime: "96.1%" },
  { key: "mark", name: "Mark", role: "Operations", avatar: "📋", specialty: "Process automation, workflow optimization", tasks: 19, uptime: "97.3%" },
  { key: "steven", name: "Steven", role: "DevOps & Infrastructure", avatar: "🔧", specialty: "Deployment, monitoring, infrastructure", tasks: 42, uptime: "99.8%" }
]
```

**Status:** NEW — doesn't exist yet

---

#### Step 1.5: Add Backend API Endpoints (9 new endpoints)

**Endpoint 1: GET `/api/memory`**
- Returns: All memory entries from last 10 days
- Response: `{ success, entries: [{date, entries: [{time, content}]}] }`
- Calls: `memoryReader.readMemory()`
- Status: NEW

**Endpoint 2: GET `/api/memory/:date`**
- Returns: Memory entries for specific date
- Params: `date` (YYYY-MM-DD format)
- Response: `{ success, date, entries: [{time, content}] }`
- Status: NEW

**Endpoint 3: GET `/api/documents`**
- Returns: All workspace documents organized by category
- Response: `{ success, categories: [{name, docs: [{title, path, updated, size}]}] }`
- Calls: `documentScanner.scan()`
- Status: EXISTING (partially) — needs completion

**Endpoint 4: GET `/api/documents/category/:name`**
- Returns: Documents in specific category
- Params: `name` (e.g., "Architecture", "Projects")
- Status: NEW

**Endpoint 5: GET `/api/documents/content` (existing)**
- Already exists (see `server/index.js` line ~330)
- Loads file content from workspace
- Works fine; just needs frontend wiring
- Status: EXISTING ✓

**Endpoint 6: GET `/api/agents`**
- Returns: Full agent roster
- Response: `{ success, agents: [...] }`
- Calls: `agentRegistry.getAgents()`
- Status: NEW

**Endpoint 7: GET `/api/agents/:key`**
- Returns: Single agent details
- Params: `key` (e.g., "lucy", "chief")
- Status: NEW

**Endpoint 8: GET `/api/agents/status`**
- Returns: Agent online status (all agents)
- Response: `{ success, statuses: {lucy: "Online", chief: "Idle", ...} }`
- Status: NEW

**Endpoint 9: PUT `/api/agents/:key`**
- Updates: Agent status/metadata
- Body: `{ status, tasks, uptime }`
- Status: NEW (optional — for future agent session tracking)

---

### PHASE 2: FRONTEND INTEGRATION (Days 2-3 — 8-10 hours)

**Objective:** Refactor 3 pages to fetch & display real data

#### Step 2.1: Refactor Memory.jsx
**Changes:**
- Remove hardcoded `memoryEntries` constant (24 lines)
- Add `useEffect` hook to fetch from `/api/memory` on mount
- Add loading state + error handling
- Display "Last updated: [timestamp]" + refresh button
- Maintain existing UI (timeline accordion layout)
- Add error message if fetch fails

**Code Required:** ~80 lines (fetch logic + state management)

**Testing:**
- Verify loads real memory data
- Check handles missing memory files gracefully
- Test refresh button
- Verify timeline expands/collapses

**Status:** NEW — requires significant refactor

---

#### Step 2.2: Refactor Docs.jsx
**Changes:**
- Remove hardcoded `docCategories` constant (50 lines)
- Add `useEffect` hook to fetch from `/api/documents` on mount
- Add modal component to view document content (new modal)
- Call existing `/api/documents/content` endpoint when doc clicked
- Add loading states + error handling
- Show file size + modified date

**Code Required:** ~120 lines (fetch + modal + click handlers)

**New Component:** DocumentViewer.jsx (~80 lines)
- Modal overlay
- Syntax highlighting (for code files)
- Markdown rendering (for `.md` files)
- Close button

**Testing:**
- Verify scans workspace correctly
- Check document list updates
- Test modal opens on click
- Verify content loads correctly
- Handle large files gracefully (500KB limit)

**Status:** NEW — requires significant refactor + new modal component

---

#### Step 2.3: Refactor Team.jsx
**Changes:**
- Remove hardcoded `REAL_AGENTS` constant (8 agents)
- Add `useEffect` hook to fetch from `/api/agents` on mount
- Add agent status polling (10-second interval)
- Display correct agent count dynamically
- Show latest agent stats

**Code Required:** ~60 lines (fetch + polling logic)

**Testing:**
- Verify loads all 10 agents
- Check Laura appears (added Mar 28)
- Test status updates every 10 seconds
- Verify counts match actual roster

**Status:** MEDIUM — mostly UI changes, logic already present

---

### PHASE 3: TESTING & DEPLOYMENT (Day 4 — 2-3 hours, optional)

#### Testing Checklist
- [ ] Memory page: Shows data from today (March 29)
- [ ] Memory page: Can expand/collapse dates
- [ ] Memory page: Refresh button works
- [ ] Docs page: Lists 30+ real documents
- [ ] Docs page: Can click to view documents
- [ ] Docs page: Modal closes properly
- [ ] Docs page: Handles missing files gracefully
- [ ] Team page: Shows all 10 agents
- [ ] Team page: Laura visible
- [ ] Team page: Agent status updates every 10s
- [ ] Team page: Can switch tabs (Online/Idle/Offline filter)
- [ ] All pages: Error states display properly
- [ ] All pages: Loading states show while fetching

#### Deployment
- [ ] Test locally (npm run dev)
- [ ] Verify no console errors
- [ ] Check responsive on mobile
- [ ] Deploy to production (if hosting setup)
- [ ] Verify live (check memory from today, not Mar 25)

---

## 📈 EFFORT BREAKDOWN

| Component | Hours | Difficulty | Owner |
|-----------|-------|-----------|-------|
| **Backend: Memory Reader** | 4-6 | Medium | Chief/Jarvis |
| **Backend: Document Scanner** | 3-4 | Low | Jarvis |
| **Backend: Agent Registry** | 2-3 | Low | Jarvis |
| **Backend: API Endpoints** | 2-3 | Low | Jarvis |
| **Data: agents.json** | 0.5 | Trivial | Lucy |
| **Frontend: Memory.jsx** | 3-4 | Low | Johnny |
| **Frontend: Docs.jsx** | 4-5 | Medium | Johnny |
| **Frontend: DocumentViewer Modal** | 3-4 | Medium | Johnny |
| **Frontend: Team.jsx** | 2-3 | Low | Johnny |
| **Testing & Deployment** | 2-3 | Low | Velma |
| **TOTAL** | **25-35 hours** | **Low-Medium** | **Team** |

**Parallel Work Possible:**
- Backend Phase 1: 1-2 people, start immediately
- Frontend Phase 2: 1-2 people, start once backend in place (Day 1-2 overlap)
- Testing Phase 3: Concurrent with frontend development

**Realistic Timeline:**
- **Aggressive:** 2 days (full team, daily standup)
- **Normal:** 3-4 days (typical pacing)
- **Comfortable:** 1 week (distributed work)

---

## 🎯 RECOMMENDED APPROACH

### **Option A: Full Rewrite (Slow, Risky)**
- Redesign all 3 pages from scratch
- Weeks of work, not days
- Risk of introducing new bugs
- **NOT RECOMMENDED**

### **Option B: Surgical Fix (Fast, Safe)** ⭐ **RECOMMENDED**
- Keep existing UI/layout (proven, working)
- Replace only the data sources (hardcoded → API)
- Minimal refactoring, maximum safety
- 3-4 days, low risk
- **WHAT WE RECOMMEND**

### **Option C: Gradual Migration (Safest)**
- Fix Memory page first (simplest)
- Then Docs page (most complex)
- Then Team page (easiest)
- Stagger over 1-2 weeks
- Can start using Memory page immediately
- **BEST FOR DISTRIBUTED TEAMS**

---

## 🚀 NEXT STEPS

### Immediate (This Afternoon)
1. ✅ **Review this plan** (you, Tim)
2. ✅ **Identify resource assignments** (you decide who does what)
3. ✅ **Pick implementation option** (B recommended)
4. ✅ **Get approval to proceed** (this is it!)

### Tomorrow (March 30)
5. **Day 1 Sprint:** Backend Phase 1
   - Create memory-reader.js
   - Create document-scanner.js
   - Create agent-registry.js
   - Add agents.json
   - Add 9 API endpoints
   - Verify with curl/Postman

### March 31 - April 1
6. **Days 2-3 Sprint:** Frontend Phase 2
   - Refactor Memory.jsx
   - Refactor Docs.jsx + DocumentViewer
   - Refactor Team.jsx
   - Test locally
   - Deploy

### April 2 (Optional)
7. **Day 4:** Real-time updates (WebSocket, polling)

---

## ✅ SUCCESS CRITERIA

When complete:
- ✅ Memory page shows today's data (March 29+)
- ✅ Docs page lists real workspace documents
- ✅ Docs page: Can click docs to view content
- ✅ Team page shows all 10 agents
- ✅ Team page includes Laura
- ✅ All pages update without manual refresh
- ✅ No hardcoded data remains
- ✅ All error states handled gracefully
- ✅ Zero console errors in browser
- ✅ Ready for production

---

## 🔗 RESOURCES

**Code Files to Modify:**
- Backend: `mission-control-express-organized/server/index.js` (add routes)
- Backend: `mission-control-express-organized/server/lib/` (create 3 modules)
- Backend: `mission-control-express-organized/server/data/agents.json` (create)
- Frontend: `mission-control-express-organized/client/src/pages/Memory.jsx`
- Frontend: `mission-control-express-organized/client/src/pages/Docs.jsx`
- Frontend: `mission-control-express-organized/client/src/pages/Team.jsx`
- Frontend: `mission-control-express-organized/client/src/components/DocumentViewer.jsx` (create)

**Data Sources:**
- Memory files: `workspace/memory/2026-03-*.md` (11 files)
- Documents: Scattered across `workspace/apps/`, `workspace/projects/`, `workspace/mission-control/`
- Agents: `workspace/AGENTS.md` + March 29 memory file

**Documentation:**
- This file: `MISSION_CONTROL_MODERNIZATION_PLAN.md` (you're reading it)
- Full technical details: `MISSION_CONTROL_REVIEW.md` (51 KB, comprehensive)
- Summary: `MISSION_CONTROL_REVIEW_SUMMARY.md` (quick reference)

---

## 📞 DECISION POINT

**You're here:** Need to decide how to proceed

**Options:**
1. **Approve & Schedule:** Ready to have team start tomorrow
2. **More Details:** Want deeper dive into specific component
3. **Modify Plan:** Want different approach/timeline
4. **Delay:** Want to prioritize other work first

**What would help you decide?**

---

**Created by:** Subagent Review Task  
**Reviewed by:** Project Management Framework  
**Status:** ✅ READY FOR EXECUTION  
**Last Updated:** March 29, 2026 @ 10:35 AM EDT
