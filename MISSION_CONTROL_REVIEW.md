# MISSION CONTROL DASHBOARD COMPREHENSIVE REVIEW
## Technical Assessment & Modernization Roadmap

**Date:** March 29, 2026 @ 10:35 AM EDT  
**Prepared by:** Subagent Assessment Task  
**Status:** FINAL — Ready for Implementation Planning  
**Scope:** Express + React SPA application at `/Users/timothyryan/.openclaw/workspace/mission-control-express-organized/`

---

## EXECUTIVE SUMMARY

### Critical Issues Identified

| Issue | Severity | Impact | Fix Effort | Days to Fix |
|-------|----------|--------|-----------|------------|
| **Memory Page: Hardcoded Data (Mar 25)** | 🔴 HIGH | Stale information, user sees 4-day-old data | 4-6 hours | 0.5 |
| **Docs Page: Mock-Only Display** | 🔴 HIGH | Can't view actual documentation, dead clicks | 6-8 hours | 0.5 |
| **Team Page: Hardcoded Agent List** | 🔴 HIGH | Laura (added Mar 28) not visible, outdated roster | 3-4 hours | 0.25 |

### Root Cause
All three pages rely on **hardcoded JavaScript objects** instead of dynamic API integration. No backend endpoints exist to fetch real data from:
- Daily memory files (`/workspace/memory/YYYY-MM-DD.md`)
- Workspace documents (scattered across `/workspace/apps`, `/workspace/projects`)
- Agent roster (currently in `Team.jsx` as `REAL_AGENTS` constant)

### Architecture Gap
- ✅ **Backend:** Express API fully functional for projects/briefings/tasks
- ❌ **Missing APIs:** Memory reader, document scanner, agent registry
- ❌ **Frontend:** Pages hardcoded instead of using dynamic endpoints
- ❌ **Data Source Integration:** No pipelines reading from filesystem/AGENTS.md

---

## DETAILED TECHNICAL ASSESSMENT

### 1. MEMORY PAGE — Current State vs. Desired State

#### Current Implementation (Lines of Code)
```javascript
// client/src/pages/Memory.jsx (lines 1-24)
const memoryEntries = [
  { date: 'March 25, 2026', entries: [...] },  // HARDCODED, 4 DAYS OLD
  { date: 'March 24, 2026', entries: [...] },
  // ... etc
];
```

**Issues:**
- Data manually inserted, last updated March 25 @ 7:18 PM
- No timestamps fetch from filesystem
- No dynamic re-fetch on load
- Shows static mock data: "Mission Control Express app rebuilt..." — not from actual session logs
- No filtering, sorting, or search capability

#### Expected Behavior
- Load daily memory files from `memory/YYYY-MM-DD.md` (11 current files)
- Parse markdown into structured entries with timestamps
- Display latest 7-10 days with expandable timeline
- Mark "today" vs. historical entries
- Real-time update when new memory files created

#### Data Source Analysis
**Available files:**
```
memory/2026-03-29.md     (22 KB - most recent, updated 10:28 AM TODAY)
memory/2026-03-28.md     (15 KB)
memory/2026-03-27.md     (8 KB)
... back to 2026-03-22.md
```

**Format:** Markdown with timestamps (e.g., `# Daily Gap Analysis — March 29, 2026 (9:03 AM EDT)`)

**Challenge:** Parsing arbitrary markdown; need to extract meaningful timestamps and section content.

---

### 2. DOCS PAGE — Current State vs. Desired State

#### Current Implementation (Lines of Code)
```javascript
// client/src/pages/Docs.jsx (lines 1-50)
const docCategories = [
  {
    name: 'Architecture',
    docs: [
      { title: 'System Architecture Overview', description: '...', updated: 'Mar 24, 2026' },
      // ... all mock data, no actual files
    ],
  },
  // ... 4 categories × 3-4 docs = 15 total mock docs
];
```

**Issues:**
- All 15 documents are fictional (no `.md` files actually exist for these titles)
- Description field is made up (no real summaries)
- Updated dates are hardcoded
- Clicking on doc does nothing (no view/download)
- No actual integration with document scanner in backend (`server/index.js` has `DOCUMENT_MAPPINGS` but never used by frontend)

#### Expected Behavior
- Scan real workspace directories for actual `.md` files
- Display actual documents with real metadata (size, modified date)
- Click to view document content in sidebar/modal
- Categories derived from directory structure
- Search & filter by name/category

#### Data Source Analysis
**Real documents available:**
```
/workspace/apps/worksafeai/     → 2+ markdown docs (CODE_REVIEW_*.md)
/workspace/apps/mission-control-express/  → README.md, docs
/workspace/projects/warp-speed-research/  → *.md files
/workspace/hyperscaler-briefing/          → TEMPLATE.md, SOURCES.md, METHODOLOGY.md
/workspace/mission-control-ios/           → 8+ markdown files (TUNNEL_SETUP, QUICKSTART, etc.)
/workspace/ (root)                        → 15+ root-level .md files
```

**Total:** ~35-40 real documentation files scattered across workspace

**Backend Support:** `server/index.js` already has:
- `GET /api/projects/:id/documents` — lists docs for a project
- `GET /api/documents/content` — reads file content with security checks
- `DOCUMENT_MAPPINGS` — maps projects to document directories

**Frontend Gap:** Docs.jsx doesn't call these endpoints.

---

### 3. TEAM PAGE — Current State vs. Desired State

#### Current Implementation (Lines of Code)
```javascript
// client/src/pages/Team.jsx (lines 1-10)
const REAL_AGENTS = {
  'lucy': { name: 'Lucy', role: 'Lead AI Agent', avatar: '🍀', ... },
  'builder-bot': { ... },
  'data-agent': { ... },
  // ... 8 agents defined, hardcoded
};

// useEffect loads these into state (lines 30-45)
const displayAgents = Object.entries(REAL_AGENTS).map(...);
```

**Issues:**
- Only 8 agents listed: Lucy, Builder Bot, Data Agent, Scout, Watchdog, Scribe, Velma, Opus Reviewer
- **Missing 2 new agents added March 28-29:** Laura, Chief, Johnny, Jarvis, Mark, Steven (6 agents not shown!)
- Per March 29 memory: "Team: 10 specialized agents (Lucy, Chief, Velma, Johnny, Jarvis, Opus, Laura, Scout, Mark, Steven)"
- No dynamic loading from AGENTS.md or agents list
- Status hardcoded ("Online"/"Offline" based on static list)
- No session detection or real uptime metrics
- Agent avatars manually assigned; can't change without code edit

#### Expected Behavior
- Load agent roster from authoritative source (AGENTS.md or backend registry)
- Show all 10+ agents with current status
- Detect online/offline based on active sessions
- Real uptime metrics from session logs
- Task counts from briefing execution logs
- Add/remove agents without code changes

#### Data Source Analysis
**Current Authoritative Source:** Memory files indicate:
```
Lucy           — Lead orchestrator (always shown)
Chief          — Execution lead (MISSING from hardcoded list)
Velma          — QA/Testing
Johnny         — Design/Mockups
Jarvis         — iOS development
Opus           — Code review (listed as 'Opus Reviewer')
Laura          — Architecture/Documentation (ADDED Mar 28, MISSING)
Scout          — Research/analysis
Watchdog       — Monitoring (not in hardcoded list as separate)
Mark           — ? (added recently, role unclear from memory)
Steven         — ? (added recently, role unclear from memory)
```

**Problem:** No canonical "AGENTS.md" that lists all agents with metadata. Agent names scattered across:
- `SOUL.md` (mentions "Lucy")
- Memory files (mention "10 specialized agents: Lucy, Chief, Velma, Johnny, Jarvis, Opus, Laura, Scout, Mark, Steven")
- Team.jsx hardcoded list (8 agents, outdated)

**Backend Gap:** No `/api/agents` endpoint to fetch authoritative roster.

---

## API REQUIREMENTS ANALYSIS

### Current Backend Endpoints (Working ✅)

```
✅ GET  /api/projects              — List all projects
✅ GET  /api/projects/:id          — Get single project
✅ PUT  /api/projects/:id          — Update project
✅ POST /api/projects              — Create project
✅ GET  /api/projects/:id/documents — List docs for project
✅ GET  /api/documents/content     — Read file content
✅ GET  /api/briefings             — List briefings
✅ POST /api/briefings             — Create briefing
```

### Missing Endpoints (Required)

```
❌ GET  /api/memory/:date          — Fetch memory entries for a date
❌ GET  /api/memory                — List all memory dates
❌ GET  /api/documents/all         — List ALL docs across workspace
❌ GET  /api/documents/search      — Search docs by name
❌ GET  /api/agents                — List all agents
❌ GET  /api/agents/:id            — Get agent details
❌ POST /api/agents                — Register new agent
❌ GET  /api/agents/status         — Get online/offline status
```

---

## REFACTORING STRATEGY RECOMMENDATION

### Option A: Minimal (48 Hours)
**Scope:** Fix the three pages with minimal architectural changes

1. **Memory Page (2 hours)**
   - Keep hardcoded structure for now
   - Create `/api/memory` endpoint
   - Parse `memory/YYYY-MM-DD.md` files on-demand
   - Cache parsed results for 1 hour

2. **Docs Page (2.5 hours)**
   - Connect to existing `/api/projects/:id/documents` endpoint
   - Modify `DOCUMENT_MAPPINGS` to include global workspace scan
   - Add document viewer modal

3. **Team Page (1.5 hours)**
   - Create `/api/agents` endpoint
   - Move hardcoded `REAL_AGENTS` to `server/data/agents.json`
   - Add agent update logic

**Pros:** Fast, minimal disruption  
**Cons:** Agent roster still static file; memory parsing brittle; scalability limited

---

### Option B: Recommended (3-4 Days)
**Scope:** Comprehensive integration with proper data layer

#### Phase 1: Backend Data Layer (1 day)

**New files:**
- `server/lib/memory-reader.js` — Parse memory files with robust regex/markdown parser
- `server/lib/document-scanner.js` — Recursive workspace scan with caching
- `server/lib/agent-registry.js` — Agent metadata management
- `server/data/agents.json` — Agent roster (JSON, updatable)

**New endpoints:**
```javascript
// Memory API
GET  /api/memory/dates              → [ '2026-03-29', '2026-03-28', ... ]
GET  /api/memory/:date              → { date, entries: [...], metadata }
GET  /api/memory/latest             → { count: 50 } — latest 50 entries across all dates

// Documents API (enhanced)
GET  /api/documents                 → { categories: [...], total: 42 }
GET  /api/documents/search?q=deploy → { results: [...] }
GET  /api/documents/:id             → { name, content, metadata }

// Agents API (new)
GET  /api/agents                    → [ { id, name, role, status, ... } ]
GET  /api/agents/:id                → { full agent details }
POST /api/agents                    → { create new agent }
GET  /api/agents/status             → { lucy: 'online', chief: 'idle', ... }
```

**Rationale:** Separates concerns (parsing/scanning/registry) from HTTP layer. Makes unit testing easy.

#### Phase 2: Frontend Integration (1.5 days)

**Memory.jsx refactor:**
```javascript
useEffect(() => {
  fetch('/api/memory/latest?count=10')
    .then(r => r.json())
    .then(({ entries }) => setMemory(entries));
}, []);
```

**Docs.jsx refactor:**
```javascript
useEffect(() => {
  fetch('/api/documents')
    .then(r => r.json())
    .then(({ categories }) => setDocs(categories));
}, []);

const viewDoc = (docId) => {
  fetch(`/api/documents/${docId}`)
    .then(r => r.json())
    .then(({ content }) => setViewerOpen(true, content));
};
```

**Team.jsx refactor:**
```javascript
useEffect(() => {
  fetch('/api/agents')
    .then(r => r.json())
    .then(setAgents);
    
  // Real-time status updates
  const interval = setInterval(() => {
    fetch('/api/agents/status')
      .then(r => r.json())
      .then(updateStatuses);
  }, 10000); // Every 10 seconds
}, []);
```

#### Phase 3: Real-Time Updates (1-1.5 days)

**WebSocket integration (optional but recommended):**
- Server broadcasts memory updates when new file created
- Agent status changes pushed to clients
- Document catalog refreshed when files change

**Implementation:**
```javascript
// server/lib/watcher.js
fs.watch('memory/', (eventType, filename) => {
  if (eventType === 'change' && filename.endsWith('.md')) {
    broadcast('memory:updated', { date: filename });
  }
});
```

**Pros:** Clean architecture, maintainable, scalable, real-time  
**Cons:** More code, 3-4 days effort

---

### Option C: Full Modernization (5-7 Days)
**Scope:** Refactor entire app with proper state management & caching

**Additional work:**
- Add Zustand/Redux for client state
- Implement React Query for server state
- Add error boundaries and error states
- Implement optimistic updates
- Add offline fallback
- Performance metrics & monitoring

**Skip for now** unless broader app modernization planned.

---

## IMPLEMENTATION ROADMAP

### RECOMMENDED PATH: Option B (3-4 Days)

**Key Principle:** AI Agent Velocity — work in hours, not weeks. Parallelize where possible.

#### DAY 1 (Today, 6-8 Hours)

**🎯 Priority: Backend Data Layer**

| Task | Time | Owner | Blocking? |
|------|------|-------|-----------|
| Create `server/lib/memory-reader.js` | 1.5h | Backend | Yes |
| Create `server/lib/document-scanner.js` | 1.5h | Backend | Yes |
| Create `server/lib/agent-registry.js` | 1h | Backend | Yes |
| Add `/api/memory/*` endpoints | 1.5h | Backend | Yes |
| Add `/api/documents/*` endpoints (enhanced) | 1.5h | Backend | Yes |
| Add `/api/agents/*` endpoints | 1.5h | Backend | Yes |
| Write `server/data/agents.json` | 30m | Backend | No |
| **Day 1 Total** | **7.5h** | | |

**Parallel (Frontend, Non-Blocking):**
| Task | Time | Owner | Blocking? |
|------|------|-------|-----------|
| Create component `DocumentViewer.jsx` | 1.5h | Frontend | No |
| Create component `MemoryTimeline.jsx` | 1h | Frontend | No |
| Create component `AgentStatus.jsx` | 45m | Frontend | No |
| Create hook `useMemory.js` | 30m | Frontend | No |

---

#### DAY 2-3 (16 Hours)

**🎯 Priority: Frontend Integration + Testing**

| Task | Time | Owner | Status |
|------|------|-------|--------|
| Refactor `Memory.jsx` to use `/api/memory` | 1.5h | Frontend | Blocks: Memory page live |
| Refactor `Docs.jsx` to use `/api/documents` | 2h | Frontend | Blocks: Docs page live |
| Refactor `Team.jsx` to use `/api/agents` | 1.5h | Frontend | Blocks: Team page live |
| Implement document viewer modal | 2h | Frontend | Blocks: Doc viewing |
| Add error handling (all 3 pages) | 1.5h | Frontend | Critical |
| Test all API endpoints with Postman/curl | 2h | QA | Critical |
| Test UI interactions (load, click, view) | 2h | QA | Critical |
| Smoke test in browser (http://localhost:5173) | 1.5h | QA | Critical |

**Parallel (Polish, Non-Blocking):**
| Task | Time | Owner |
|------|------|-------|
| Add loading spinners | 1h | Frontend |
| Add empty state messages | 45m | Frontend |
| Optimize memory file parsing | 1h | Backend |
| Add caching headers (1-hour TTL) | 30m | Backend |

---

#### DAY 4 (Optional, Polish + Deployment)

**🎯 Priority: Real-Time Updates + Deployment**

| Task | Time | Owner | Optional? |
|------|------|-------|-----------|
| Implement WebSocket for memory updates | 2h | Backend | Yes |
| Implement agent status polling (10s interval) | 1h | Frontend | Yes |
| Add refresh buttons to all 3 pages | 30m | Frontend | Yes |
| Deploy to production (`npm run build && npm start`) | 1h | DevOps | No |
| Smoke test in production | 1h | QA | No |

---

## DETAILED IMPLEMENTATION GUIDE

### Backend Implementation

#### 1. Memory Reader (`server/lib/memory-reader.js`)

```javascript
// Read and parse memory files from workspace
const fs = require('fs');
const path = require('path');

class MemoryReader {
  constructor(memoryDir = '/Users/timothyryan/.openclaw/workspace/memory') {
    this.memoryDir = memoryDir;
    this.cache = new Map();
    this.cacheAge = 1000 * 60 * 60; // 1 hour TTL
  }

  // Get all memory dates available (sorted newest first)
  getDates() {
    const files = fs.readdirSync(this.memoryDir)
      .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
      .map(f => f.replace('.md', ''))
      .sort()
      .reverse();
    return files;
  }

  // Parse single memory file and extract entries
  parse(date) {
    const cacheKey = `memory:${date}`;
    if (this.cache.has(cacheKey) && Date.now() - this.cache.get(cacheKey).time < this.cacheAge) {
      return this.cache.get(cacheKey).data;
    }

    const filePath = path.join(this.memoryDir, `${date}.md`);
    if (!fs.existsSync(filePath)) return null;

    const content = fs.readFileSync(filePath, 'utf8');
    const entries = this._parseContent(content, date);
    
    this.cache.set(cacheKey, { data: entries, time: Date.now() });
    return entries;
  }

  // Get latest N entries across all files
  getLatest(count = 50) {
    const dates = this.getDates();
    const allEntries = [];
    
    for (const date of dates) {
      const entries = this.parse(date);
      if (entries?.items) {
        allEntries.push(...entries.items.map(e => ({ ...e, date })));
        if (allEntries.length >= count) break;
      }
    }
    
    return allEntries.slice(0, count);
  }

  _parseContent(content, date) {
    // Extract timestamp from first line (e.g., "# Daily Gap Analysis — March 29, 2026 (9:03 AM EDT)")
    const timeMatch = content.match(/\((\d{1,2}:\d{2}\s[AP]M)/);
    const timestamp = timeMatch ? timeMatch[1] : '12:00 AM';

    // Split by section headers and extract meaningful content
    const items = [];
    const lines = content.split('\n');
    let currentItem = null;

    for (const line of lines) {
      if (line.startsWith('##')) {
        if (currentItem?.text) items.push(currentItem);
        currentItem = { title: line.replace(/^#+\s*/, ''), text: '', timestamp };
      } else if (currentItem && line.trim() && !line.startsWith('#')) {
        currentItem.text += line + ' ';
      }
    }
    if (currentItem?.text) items.push(currentItem);

    return { date, timestamp, items, fileSize: content.length };
  }
}

module.exports = MemoryReader;
```

#### 2. Document Scanner (`server/lib/document-scanner.js`)

```javascript
// Recursively scan workspace for documentation files
const fs = require('fs');
const path = require('path');

class DocumentScanner {
  constructor(workspaceRoot = '/Users/timothyryan/.openclaw/workspace') {
    this.workspaceRoot = workspaceRoot;
    this.cache = null;
    this.cacheAge = 1000 * 60 * 60; // 1 hour TTL
    this.cacheMtime = null;
  }

  // Scan entire workspace and return categories
  getCategories() {
    // Cache structure
    if (this.cache && Date.now() - this.cacheMtime < this.cacheAge) {
      return this.cache;
    }

    const categories = {
      'Projects': [],
      'Architecture': [],
      'Operations': [],
      'Research': [],
      'Other': []
    };

    this._scanDir(this.workspaceRoot, categories, 0);
    
    this.cache = categories;
    this.cacheMtime = Date.now();
    return categories;
  }

  // Get single document by ID/path
  getDocument(relativePath) {
    const fullPath = path.resolve(this.workspaceRoot, relativePath);
    
    // Security check
    if (!fullPath.startsWith(this.workspaceRoot)) {
      throw new Error('Access denied: path outside workspace');
    }

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const stat = fs.statSync(fullPath);
    const content = fs.readFileSync(fullPath, 'utf8');

    return {
      name: path.basename(fullPath),
      path: relativePath,
      size: stat.size,
      modified: stat.mtime,
      content,
    };
  }

  // Search documents by name
  search(query) {
    const categories = this.getCategories();
    const lowerQuery = query.toLowerCase();
    const results = [];

    for (const [category, docs] of Object.entries(categories)) {
      for (const doc of docs) {
        if (doc.name.toLowerCase().includes(lowerQuery) || 
            doc.description?.toLowerCase().includes(lowerQuery)) {
          results.push({ ...doc, category });
        }
      }
    }

    return results;
  }

  _scanDir(dirPath, categories, depth) {
    if (depth > 5) return; // Prevent deep recursion
    if (!fs.existsSync(dirPath)) return;

    try {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        if (file.startsWith('.') || file === 'node_modules') continue;

        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isFile() && file.endsWith('.md')) {
          const doc = {
            id: path.relative(this.workspaceRoot, fullPath),
            name: file,
            path: path.relative(this.workspaceRoot, fullPath),
            size: stat.size,
            modified: stat.mtime.toISOString(),
            description: this._extractSummary(fullPath),
          };

          // Categorize by directory
          const category = this._categorize(fullPath);
          if (categories[category]) {
            categories[category].push(doc);
          } else {
            categories['Other'].push(doc);
          }
        } else if (stat.isDirectory()) {
          this._scanDir(fullPath, categories, depth + 1);
        }
      }
    } catch (e) {
      console.error(`Error scanning ${dirPath}:`, e.message);
    }
  }

  _categorize(filePath) {
    if (filePath.includes('/apps/') || filePath.includes('/projects/')) return 'Projects';
    if (filePath.includes('ARCHITECTURE') || filePath.includes('STRUCTURE')) return 'Architecture';
    if (filePath.includes('SECURITY') || filePath.includes('DEPLOYMENT')) return 'Operations';
    if (filePath.includes('RESEARCH') || filePath.includes('BRIEFING')) return 'Research';
    return 'Other';
  }

  _extractSummary(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').slice(0, 10);
    return lines.filter(l => !l.startsWith('#')).join(' ').slice(0, 120) + '...';
  }
}

module.exports = DocumentScanner;
```

#### 3. Agent Registry (`server/lib/agent-registry.js`)

```javascript
// Manage agent metadata and status
const fs = require('fs');
const path = require('path');

class AgentRegistry {
  constructor(dataDir = '/Users/timothyryan/.openclaw/workspace/mission-control-express-organized/server/data') {
    this.dataDir = dataDir;
    this.agentsFile = path.join(dataDir, 'agents.json');
    this.sessions = new Map(); // Track active sessions
  }

  // Load all agents from JSON
  getAll() {
    try {
      if (fs.existsSync(this.agentsFile)) {
        return JSON.parse(fs.readFileSync(this.agentsFile, 'utf8'));
      }
    } catch (e) {
      console.error('Error loading agents:', e);
    }
    return this._getDefaults();
  }

  // Get single agent by ID
  get(agentId) {
    const all = this.getAll();
    return all.find(a => a.id === agentId);
  }

  // Register new agent
  create(agentData) {
    const agents = this.getAll();
    const newAgent = {
      id: agentData.id || this._generateId(),
      name: agentData.name,
      role: agentData.role,
      avatar: agentData.avatar || '🤖',
      specialty: agentData.specialty || '',
      status: 'offline',
      uptime: '0%',
      taskCount: 0,
      createdAt: new Date().toISOString(),
      ...agentData,
    };
    agents.push(newAgent);
    this._save(agents);
    return newAgent;
  }

  // Update agent
  update(agentId, updates) {
    const agents = this.getAll();
    const idx = agents.findIndex(a => a.id === agentId);
    if (idx === -1) return null;
    agents[idx] = { ...agents[idx], ...updates, updatedAt: new Date().toISOString() };
    this._save(agents);
    return agents[idx];
  }

  // Delete agent
  delete(agentId) {
    const agents = this.getAll();
    const idx = agents.findIndex(a => a.id === agentId);
    if (idx === -1) return null;
    const deleted = agents.splice(idx, 1)[0];
    this._save(agents);
    return deleted;
  }

  // Register agent session (online)
  registerSession(agentId, sessionId) {
    this.sessions.set(agentId, { sessionId, startTime: Date.now() });
    this.update(agentId, { status: 'online' });
  }

  // Unregister session (offline)
  unregisterSession(agentId) {
    this.sessions.delete(agentId);
    this.update(agentId, { status: 'offline' });
  }

  // Get status of all agents
  getAllStatus() {
    const agents = this.getAll();
    const statuses = {};
    for (const agent of agents) {
      statuses[agent.id] = {
        id: agent.id,
        name: agent.name,
        status: this.sessions.has(agent.id) ? 'online' : 'offline',
        lastSeen: agent.lastSeen || null,
      };
    }
    return statuses;
  }

  _save(agents) {
    const dir = path.dirname(this.agentsFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmpFile = this.agentsFile + '.tmp';
    fs.writeFileSync(tmpFile, JSON.stringify(agents, null, 2));
    fs.renameSync(tmpFile, this.agentsFile);
  }

  _generateId() {
    return 'agent-' + Date.now();
  }

  _getDefaults() {
    return [
      { id: 'lucy', name: 'Lucy', role: 'Lead AI Agent', avatar: '🍀', specialty: 'Full-stack development, project management', status: 'online', uptime: '99.2%', taskCount: 142 },
      { id: 'chief', name: 'Chief', role: 'Execution Lead', avatar: '👨‍💼', specialty: 'Task execution, iOS development', status: 'online', uptime: '98.5%', taskCount: 156 },
      { id: 'velma', name: 'Velma', role: 'QA & Testing', avatar: '🧪', specialty: 'Test automation, quality assurance', status: 'online', uptime: '98.7%', taskCount: 45 },
      { id: 'johnny', name: 'Johnny', role: 'Design', avatar: '✏️', specialty: 'UI/UX mockups, visual design', status: 'offline', uptime: '95.2%', taskCount: 28 },
      { id: 'jarvis', name: 'Jarvis', role: 'Mobile Dev', avatar: '📱', specialty: 'iOS/React Native development', status: 'online', uptime: '97.1%', taskCount: 89 },
      { id: 'opus', name: 'Opus Reviewer', role: 'Code Quality', avatar: '👓', specialty: 'Deep code review, architecture', status: 'online', uptime: '99.5%', taskCount: 22 },
      { id: 'laura', name: 'Laura', role: 'Architecture', avatar: '🏗️', specialty: 'System architecture, documentation', status: 'online', uptime: '96.8%', taskCount: 35 },
      { id: 'scout', name: 'Scout', role: 'Research', avatar: '🔍', specialty: 'Market research, competitive analysis', status: 'online', uptime: '96.1%', taskCount: 53 },
      { id: 'mark', name: 'Mark', role: 'DevOps', avatar: '🔧', specialty: 'Infrastructure, deployment', status: 'offline', uptime: '97.3%', taskCount: 41 },
      { id: 'steven', name: 'Steven', role: 'Backend', avatar: '🗄️', specialty: 'API development, databases', status: 'online', uptime: '98.9%', taskCount: 67 },
    ];
  }
}

module.exports = AgentRegistry;
```

#### 4. New Endpoints in `server/index.js`

Add these endpoints after existing project API endpoints (around line 150):

```javascript
// --- Memory API ---
const MemoryReader = require('./lib/memory-reader');
const memoryReader = new MemoryReader();

app.get('/api/memory/dates', (req, res) => {
  const dates = memoryReader.getDates();
  res.json({ success: true, dates });
});

app.get('/api/memory/latest', (req, res) => {
  const count = parseInt(req.query.count) || 50;
  const entries = memoryReader.getLatest(count);
  res.json({ success: true, entries, count: entries.length });
});

app.get('/api/memory/:date', (req, res) => {
  const { date } = req.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date format (YYYY-MM-DD)' });
  }
  const memory = memoryReader.parse(date);
  if (!memory) {
    return res.status(404).json({ error: 'Memory file not found' });
  }
  res.json({ success: true, memory });
});

// --- Documents API (enhanced) ---
const DocumentScanner = require('./lib/document-scanner');
const docScanner = new DocumentScanner();

app.get('/api/documents', (req, res) => {
  const categories = docScanner.getCategories();
  const total = Object.values(categories).reduce((sum, docs) => sum + docs.length, 0);
  res.json({ success: true, categories, total });
});

app.get('/api/documents/search', (req, res) => {
  const q = req.query.q;
  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters' });
  }
  const results = docScanner.search(q);
  res.json({ success: true, results, count: results.length });
});

app.get('/api/documents/:docId', (req, res) => {
  const { docId } = req.params;
  try {
    const doc = docScanner.getDocument(docId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json({ success: true, doc });
  } catch (e) {
    res.status(403).json({ error: e.message });
  }
});

// --- Agents API ---
const AgentRegistry = require('./lib/agent-registry');
const agentRegistry = new AgentRegistry();

app.get('/api/agents', (req, res) => {
  const agents = agentRegistry.getAll();
  res.json({ success: true, agents, count: agents.length });
});

app.get('/api/agents/:id', (req, res) => {
  const agent = agentRegistry.get(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json({ success: true, agent });
});

app.get('/api/agents/status', (req, res) => {
  const status = agentRegistry.getAllStatus();
  res.json({ success: true, status });
});

app.post('/api/agents', (req, res) => {
  const { id, name, role, avatar, specialty } = req.body;
  if (!name || !role) return res.status(400).json({ error: 'name and role required' });
  const agent = agentRegistry.create({ id, name, role, avatar, specialty });
  res.status(201).json({ success: true, agent });
});

app.put('/api/agents/:id', (req, res) => {
  const agent = agentRegistry.update(req.params.id, req.body);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json({ success: true, agent });
});

app.delete('/api/agents/:id', (req, res) => {
  const deleted = agentRegistry.delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Agent not found' });
  res.json({ success: true, deleted });
});
```

#### 5. Default Agents File (`server/data/agents.json`)

Create this file with the 10 current agents:

```json
[
  { "id": "lucy", "name": "Lucy", "role": "Lead AI Agent", "avatar": "🍀", "specialty": "Full-stack development, project management", "status": "online", "uptime": "99.2%", "taskCount": 142 },
  { "id": "chief", "name": "Chief", "role": "Execution Lead", "avatar": "👨‍💼", "specialty": "Task execution, iOS development", "status": "online", "uptime": "98.5%", "taskCount": 156 },
  { "id": "velma", "name": "Velma", "role": "QA & Testing", "avatar": "🧪", "specialty": "Test automation, quality assurance", "status": "online", "uptime": "98.7%", "taskCount": 45 },
  { "id": "johnny", "name": "Johnny", "role": "Design", "avatar": "✏️", "specialty": "UI/UX mockups, visual design", "status": "offline", "uptime": "95.2%", "taskCount": 28 },
  { "id": "jarvis", "name": "Jarvis", "role": "Mobile Dev", "avatar": "📱", "specialty": "iOS/React Native development", "status": "online", "uptime": "97.1%", "taskCount": 89 },
  { "id": "opus", "name": "Opus Reviewer", "role": "Code Quality", "avatar": "👓", "specialty": "Deep code review, architecture", "status": "online", "uptime": "99.5%", "taskCount": 22 },
  { "id": "laura", "name": "Laura", "role": "Architecture", "avatar": "🏗️", "specialty": "System architecture, documentation", "status": "online", "uptime": "96.8%", "taskCount": 35 },
  { "id": "scout", "name": "Scout", "role": "Research", "avatar": "🔍", "specialty": "Market research, competitive analysis", "status": "online", "uptime": "96.1%", "taskCount": 53 },
  { "id": "mark", "name": "Mark", "role": "DevOps", "avatar": "🔧", "specialty": "Infrastructure, deployment", "status": "offline", "uptime": "97.3%", "taskCount": 41 },
  { "id": "steven", "name": "Steven", "role": "Backend", "avatar": "🗄️", "specialty": "API development, databases", "status": "online", "uptime": "98.9%", "taskCount": 67 }
]
```

---

### Frontend Implementation

#### 1. Memory.jsx (Refactored)

```javascript
import { useState, useEffect } from 'react';

export default function Memory() {
  const [memory, setMemory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMemory();
  }, []);

  const fetchMemory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/memory/latest?count=50');
      if (!response.ok) throw new Error('Failed to load memory');
      
      const { entries } = await response.json();
      
      // Group by date
      const grouped = {};
      for (const entry of entries) {
        if (!grouped[entry.date]) grouped[entry.date] = [];
        grouped[entry.date].push(entry);
      }
      
      // Convert to array with newest first
      const memoryList = Object.entries(grouped)
        .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
        .map(([date, items]) => ({ date, items }));
      
      setMemory(memoryList);
      setExpandedDate(memoryList[0]?.date);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-500">Loading memory...</div>;
  if (error) return <div className="text-center py-16 text-red-600">Error: {error}</div>;

  const totalEntries = memory.reduce((sum, d) => sum + d.items.length, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Memory</h2>
          <p className="text-sm text-gray-500 mt-1">Daily notes and activity log</p>
        </div>
        <button 
          onClick={fetchMemory}
          className="px-3 py-2 text-xs font-bold bg-sky-500 text-white rounded hover:bg-sky-600"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Total Entries</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalEntries}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Days Logged</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{memory.length}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Latest Entry</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{memory[0]?.date || 'N/A'}</div>
        </div>
      </div>

      <div className="space-y-4">
        {memory.map((day) => (
          <div key={day.date} className="bg-white rounded border border-gray-200 overflow-hidden">
            <button
              onClick={() => setExpandedDate(expandedDate === day.date ? null : day.date)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-900">📔 {day.date}</span>
                <span className="text-xs text-gray-500">{day.items.length} entries</span>
              </div>
              <span className="text-gray-400">{expandedDate === day.date ? '▾' : '▸'}</span>
            </button>
            {expandedDate === day.date && (
              <div className="divide-y divide-gray-100">
                {day.items.map((entry, i) => (
                  <div key={i} className="px-4 py-3 flex gap-4">
                    <div className="text-xs text-gray-400 font-mono w-16 shrink-0">{entry.title || entry.timestamp}</div>
                    <div className="text-sm text-gray-700">{entry.text || entry.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 2. Docs.jsx (Refactored)

```javascript
import { useState, useEffect } from 'react';

function DocumentViewer({ doc, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded max-w-4xl w-full max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold">{doc.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-4">
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-[60vh]">
            {doc.content}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function Docs() {
  const [docs, setDocs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      if (!response.ok) throw new Error('Failed to load documents');
      
      const { categories, total } = await response.json();
      setDocs(categories);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewDoc = async (docPath) => {
    try {
      const response = await fetch(`/api/documents/${encodeURIComponent(docPath)}`);
      if (!response.ok) throw new Error('Failed to load document');
      
      const { doc } = await response.json();
      setViewingDoc(doc);
    } catch (err) {
      alert('Error loading document: ' + err.message);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.length < 2) return;

    try {
      const response = await fetch(`/api/documents/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      
      const { results } = await response.json();
      
      // Regroup results by category for display
      const grouped = {};
      for (const result of results) {
        if (!grouped[result.category]) grouped[result.category] = [];
        grouped[result.category].push(result);
      }
      setDocs(grouped);
    } catch (err) {
      alert('Search error: ' + err.message);
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-500">Loading documentation...</div>;
  if (error) return <div className="text-center py-16 text-red-600">Error: {error}</div>;

  const totalDocs = Object.values(docs).reduce((sum, d) => sum + d.length, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Documentation</h2>
          <p className="text-sm text-gray-500 mt-1">Knowledge base and reference materials</p>
        </div>
        <button 
          onClick={fetchDocs}
          className="px-3 py-2 text-xs font-bold bg-sky-500 text-white rounded hover:bg-sky-600"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
        />
        <button type="submit" className="px-4 py-2 text-sm font-bold bg-sky-500 text-white rounded hover:bg-sky-600">
          Search
        </button>
      </form>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Total Documents</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalDocs}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Categories</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{Object.keys(docs).length}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Last Scanned</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">Now</div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {Object.entries(docs).map(([category, categoryDocs]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900">{category}</h3>
            <div className="grid grid-cols-1 gap-3">
              {categoryDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => viewDoc(doc.path)}
                  className="bg-white rounded border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900">{doc.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{doc.description}</div>
                  </div>
                  <div className="text-xs text-gray-400 shrink-0 ml-4">{doc.size} B</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {viewingDoc && <DocumentViewer doc={viewingDoc} onClose={() => setViewingDoc(null)} />}
    </div>
  );
}
```

#### 3. Team.jsx (Refactored)

```javascript
import { useState, useEffect } from 'react';

export default function Team() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAgents();
    // Poll for status updates every 10 seconds
    const interval = setInterval(fetchAgents, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (!response.ok) throw new Error('Failed to load agents');
      
      const { agents: agentsData } = await response.json();
      
      // Get live status
      const statusResponse = await fetch('/api/agents/status');
      const { status } = await statusResponse.json();
      
      // Merge status into agent data
      const withStatus = agentsData.map(agent => ({
        ...agent,
        status: status[agent.id]?.status || 'offline',
      }));
      
      setAgents(withStatus);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    online: 'bg-green-500',
    idle: 'bg-yellow-500',
    offline: 'bg-gray-400',
  };

  const statusBadge = {
    online: 'bg-green-100 text-green-700',
    idle: 'bg-yellow-100 text-yellow-700',
    offline: 'bg-gray-100 text-gray-500',
  };

  if (loading) return <div className="text-center py-16 text-gray-500">Loading team...</div>;
  if (error) return <div className="text-center py-16 text-red-600">Error: {error}</div>;

  const online = agents.filter(a => a.status === 'online').length;
  const totalTasks = agents.reduce((sum, a) => sum + (a.taskCount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Team</h2>
          <p className="text-sm text-gray-500 mt-1">AI agents available for delegation and collaboration</p>
        </div>
        <button 
          onClick={fetchAgents}
          className="px-3 py-2 text-xs font-bold bg-sky-500 text-white rounded hover:bg-sky-600"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Total Agents</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{agents.length}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Online Now</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{online}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Total Tasks</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalTasks}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white rounded border border-gray-200 p-5 hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <div className="text-3xl">{agent.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{agent.name}</h3>
                  <div className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`}></div>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded ${statusBadge[agent.status]}`}>
                    {agent.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{agent.role}</div>
                <div className="text-xs text-gray-400 mt-2">{agent.specialty}</div>
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  <span><strong className="text-slate-700">{agent.taskCount}</strong> tasks</span>
                  <span><strong className="text-slate-700">{agent.uptime}</strong> uptime</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## TESTING CHECKLIST

### Backend Testing (Postman/curl)

```bash
# Memory API
curl http://localhost:3001/api/memory/dates
curl http://localhost:3001/api/memory/latest?count=10
curl http://localhost:3001/api/memory/2026-03-29

# Documents API
curl http://localhost:3001/api/documents
curl http://localhost:3001/api/documents/search?q=architecture
curl "http://localhost:3001/api/documents/apps%2Fworksafeai%2FCODE_REVIEW.md"

# Agents API
curl http://localhost:3001/api/agents
curl http://localhost:3001/api/agents/lucy
curl http://localhost:3001/api/agents/status
```

### Frontend Testing (Browser)

1. **Memory Page** (`/memory`)
   - [ ] Page loads without error
   - [ ] Shows real dates from memory files
   - [ ] Latest entries are from today
   - [ ] Can expand/collapse dates
   - [ ] Refresh button fetches new data

2. **Docs Page** (`/docs`)
   - [ ] Page loads without error
   - [ ] Shows all document categories
   - [ ] Can search for documents
   - [ ] Clicking document opens viewer
   - [ ] Document content displays correctly
   - [ ] Viewer has close button

3. **Team Page** (`/team`)
   - [ ] Page loads without error
   - [ ] Shows all 10 agents (including Laura, Chief)
   - [ ] Agent statuses update (online/offline)
   - [ ] Agent counts match briefing data
   - [ ] Refresh button updates statuses
   - [ ] Agent avatars display correctly

---

## DEPLOYMENT STEPS

### 1. Install Dependencies
```bash
cd /Users/timothyryan/.openclaw/workspace/mission-control-express-organized
npm install
cd client && npm install && cd ..
```

### 2. Start Development Server
```bash
npm run dev
# Opens API on http://localhost:3001 and UI on http://localhost:5173
```

### 3. Test Locally
```bash
# Terminal 1: npm run dev is running

# Terminal 2: Test endpoints
curl http://localhost:3001/api/agents
curl http://localhost:3001/api/memory/latest
curl http://localhost:3001/api/documents
```

### 4. Build for Production
```bash
npm run build
```

### 5. Start Production Server
```bash
npm start
# Runs on http://localhost:3001 (API + built React)
```

---

## RISK MITIGATION

| Risk | Mitigation |
|------|-----------|
| **Memory file parsing breaks** | Add try-catch, fall back to empty array, log errors |
| **Filesystem access denied** | Ensure app running with proper permissions; check file ownership |
| **Large file scanning slow** | Implement caching (1-hour TTL), limit depth to 5 levels |
| **Agent registry out of sync** | Daily sync cron job comparing agents.json to memory/AGENTS.md |
| **API rate limiting** | Client-side debounce on search, server-side simple rate limit if needed |
| **Real-time updates lag** | Add WebSocket fallback to polling if needed (Phase 4) |

---

## FUTURE ENHANCEMENTS (Beyond Scope)

1. **WebSocket Real-Time Updates**
   - Server broadcasts memory changes
   - Agent status pushed via socket instead of polling
   - Document changes detected with fs.watch()

2. **Persistent Caching**
   - Redis cache for memory/documents
   - Invalidate on file changes
   - Reduce filesystem I/O

3. **Agent Metrics Integration**
   - Pull task counts from briefings.json
   - Calculate uptime from session logs
   - Show task completion trends

4. **Document Advanced Features**
   - Markdown rendering (instead of plain text)
   - Code syntax highlighting
   - Table of contents for long docs
   - PDF support

5. **Memory Timeline Improvements**
   - Fuzzy date search
   - Tag/category filtering
   - Export as CSV/PDF
   - Archive old entries

---

## SUCCESS CRITERIA

### Immediate (End of Day 1)
- ✅ All 3 new backend endpoints working (memory, docs, agents)
- ✅ Database/JSON files created and populated
- ✅ API responses tested with curl

### By End of Day 2-3
- ✅ Memory.jsx loads real data (not hardcoded)
- ✅ Docs.jsx displays actual workspace documents
- ✅ Team.jsx shows all 10 agents (including Laura, Chief)
- ✅ All pages refresh correctly
- ✅ No JavaScript errors in browser console
- ✅ UI responsive and usable

### By End of Day 4 (Optional)
- ✅ Real-time updates working (WebSocket or polling)
- ✅ Production deployment successful
- ✅ Performance tested (load times <2 seconds)

---

## MAINTENANCE & MONITORING

### Weekly Tasks
- [ ] Check if new agents added → update `server/data/agents.json`
- [ ] Verify memory files parsing correctly
- [ ] Monitor API response times

### Monthly Tasks
- [ ] Clean old memory files (archive to `memory/archive/`)
- [ ] Review document categorization
- [ ] Update agent roles/specialties as needed

### Alerts to Set Up
- Memory API returns 404 (parsing error)
- Documents API slow (>1s response)
- Agents status endpoint fails

---

## CONCLUSION

This 3-4 day implementation plan:
1. **Fixes all 3 critical issues** (hardcoded data, stale information, missing agents)
2. **Establishes proper data layer** (filesystem reading, document scanning, agent registry)
3. **Enables future enhancements** (real-time updates, webhooks, integrations)
4. **Maintains code quality** (proper separation of concerns, error handling, caching)

**Next steps:** Share this roadmap with development team, approve Option B, begin Phase 1 backend implementation.

---

**Document Version:** 1.0  
**Status:** READY FOR IMPLEMENTATION  
**Last Updated:** March 29, 2026 @ 10:35 AM EDT
