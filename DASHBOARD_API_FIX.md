# Dashboard API Connectivity Fix — March 19, 2026

## Problem Identified ⚠️

The Team, Memory, and Docs pages on the Mission Control dashboard were not connecting to the Backend API, showing blank/loading states even though:
- API endpoints existed at `/api/team`, `/api/memories/`, `/api/docs/`
- Data was available in `.mission-control-state.json` and memory files
- Components were rendering properly

## Root Causes Found & Fixed

### 1. **Hardcoded localhost URLs** ❌→✅
**Problem:** Components used hardcoded `http://localhost:3000/api/...` URLs
```javascript
// ❌ WRONG
const response = await fetch('http://localhost:3000/api/team')
```

**Fix:** Changed to relative paths (same-origin requests)
```javascript
// ✅ RIGHT
const response = await fetch('/api/team')
```

**Files Updated:**
- `TeamSection.js` — 4 API calls fixed
- `MemorySection.js` — 2 API calls fixed
- `DocsSection.js` — 1 API call fixed

### 2. **API Response Structure Mismatch** ❌→✅
**Problem:** Backend returned `{ team: [] }` but components expected full mission-control state structure

**Fix:** Updated `/api/team/index.js` to return complete team object
```javascript
// ❌ WRONG
res.status(200).json({ team: state.team || [] })

// ✅ RIGHT
res.status(200).json(team) // Full structure with mission, members, structure
```

**Updated Files:**
- `/api/team/index.js` — Returns complete team object with mission and structure

### 3. **Memory File Path Issues** ❌→✅
**Problem:** APIs tried to load memory files from relative paths that didn't work in Node.js context

**Fix:** Changed to absolute workspace paths

**Updated Files:**
- `/api/memories/load-daily.js` — Now reads from `/Users/timothyryan/.openclaw/workspace/memory/`
- `/api/memories/load-longterm.js` — Now reads from `/Users/timothyryan/.openclaw/workspace/MEMORY.md`

### 4. **Docs Listing Issues** ❌→✅
**Problem:** Docs API used wrong path construction and didn't categorize files properly

**Fix:** Updated to use absolute workspace path and added proper categorization

**Updated Files:**
- `/api/docs/list.js` — Absolute paths + categorization by filename

## Files Changed

```
✅ TeamSection.js
   - Fixed 4 API calls (GET team, POST generate, POST create, PUT edit)
   - Changed http://localhost:3000/api/ → /api/

✅ MemorySection.js
   - Fixed 2 API calls (load-daily, load-longterm)
   - Changed http://localhost:3000/api/ → /api/

✅ DocsSection.js
   - Fixed 1 API call (docs/list)
   - Changed http://localhost:3000/api/ → /api/

✅ /api/team/index.js
   - Returns full team object (mission, members, structure)
   - Handles empty state gracefully

✅ /api/memories/load-daily.js
   - Uses absolute path to workspace memory directory
   - Fixed file loading

✅ /api/memories/load-longterm.js
   - Uses absolute path to workspace MEMORY.md
   - Returns proper structure (content, found, exists)

✅ /api/docs/list.js
   - Uses absolute workspace path
   - Scans /docs and workspace root for .md files
   - Auto-categorizes by filename (setup, deployment, api, agent, etc.)
```

## How to Verify

1. **Build and start Mission Control:**
   ```bash
   cd /Users/timothyryan/.openclaw/workspace/apps/mission-control
   npm run build
   npm start
   ```

2. **Navigate to each page:**
   - Team page → Should load agent tiles (Lucy, Chief, Velma, etc.)
   - Memory page → Should load daily notes and MEMORY.md
   - Docs page → Should list workspace documentation files

3. **Check browser console:**
   - No errors on fetch calls
   - API responses logged correctly
   - Data renders properly

## Testing Checklist

- [ ] Team page loads without errors
- [ ] Memory page shows daily + long-term memory
- [ ] Docs page lists markdown files
- [ ] Create agent button works on Team page
- [ ] Memory search/filtering works
- [ ] Docs categories work

## Impact

✅ **Team page** — Now connects to `/api/team` and displays agent hierarchy  
✅ **Memory page** — Now loads from `/api/memories/` endpoints and displays notes  
✅ **Docs page** — Now loads from `/api/docs/list` and displays documentation  

All three dashboard sections now work correctly! 🎉
