# Mission Control Link/Button Diagnosis

**Issue:** "The clickable links aren't working"  
**Reported:** March 24, 2026 @ 2:10 PM EST  
**Status:** INVESTIGATING

## Quick Diagnostic Checklist

### For Tim:
Can you tell me which links specifically aren't working?

1. **Sidebar buttons** (left navigation) — 🎯📊👥👤📅📔📚
   - [ ] Click one of these. Does the page section change?
   - [ ] Or do they look clickable but nothing happens?

2. **Approval buttons** (Unified Dashboard)
   - [ ] Can you see "🎯 Approvals Needed" section?
   - [ ] If yes, click "✅ Approve" button
   - [ ] What happens? (Alert? Error? Nothing?)

3. **GitHub links** (Projects section)
   - [ ] In Projects section, find "→ GitHub Repo" link
   - [ ] Try clicking it
   - [ ] Should open GitHub in new tab

4. **Task cards** (Status columns in Unified Dashboard)
   - [ ] Can you click on tasks in QUEUED/IN-PROGRESS/COMPLETED sections?
   - [ ] Should open task detail view

5. **Create buttons**
   - [ ] Click "+ Create Project" button
   - [ ] Should show a modal form
   - [ ] Can you close it (X button)?

## Technical Analysis

### Potential Issues Found
1. ✅ No build errors (npm run build succeeded)
2. ✅ No syntax errors (node -c passed)
3. ✅ Component structure valid (all braces matched)
4. ⚠️ **GapAnalysisSection was recently updated** — may need tested

### Code Review: Recent Changes

**GapAnalysisSection.js changes (this session):**
- Extracted SWIMLANES_CONFIG to top-level
- Updated loadAutoScores() to fetch from `/api/mission-control/state`
- Updated loadRemediations() to read from state file
- All onClick handlers preserved (nothing changed)

**Risk Assessment:** LOW — component structure not modified, only data sources changed

### If It's A Specific Section:

**Gap Analysis Page?**
```
- Auto-score buttons: Might fail if API endpoint not reachable
- Manual assessment buttons: Should work (local state only)
- Save button: Requires POST to /api/gap-analysis/save
```

**Unified Dashboard?**
```
- Sidebar clicks: Pure state change, should work always
- Approval buttons: Requires POST to /api/tasks/{id}/approve
- Task cards: Pure state change, should work always
```

**Projects Page?**
```
- GitHub links: Standard <a> tag links, should always work
- Create button: Shows modal, should work
```

## How to Debug in Your Browser

1. **Open Developer Tools:** F12 (or Cmd+Option+I on Mac)
2. **Go to Console tab**
3. **Try clicking a button**
4. **Look for errors** — red text = JavaScript error

**If you see an error**, copy it and share it

Example good output:
```
✅ Task approved: Object { id: "task-123", status: "queued" }
```

Example bad output:
```
❌ Error: fetch is not a function
```

## Hypothesis

Since we just updated the Gap Analysis section with live data integration, the issue might be:

1. **API endpoint not working** (`/api/mission-control/state`)
   - Try opening: `http://localhost:3000/api/mission-control/state` in browser
   - Should see JSON data
   - If blank/error → API issue

2. **Modal overlay blocking everything**
   - Try scrolling down in browser dev tools inspector
   - Look for `<div style="position: fixed; z-index: 1000">`
   - If you see one, it might be stuck open

3. **CSS loading issue**
   - Check: Do buttons have visible styling? (Colors, borders, etc.)
   - If buttons look gray/disabled, that's a clue

## Quick Fix Attempts

### 1. Clear Browser Cache & Restart
```bash
# Kill dev server
pkill -f "npm run dev"

# Restart
cd /Users/timothyryan/.openclaw/workspace/apps/mission-control
npm run dev
```

Then:
- Hard refresh browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Try clicking buttons again

### 2. Check If API Endpoint Works
```bash
# In another terminal:
curl http://localhost:3000/api/mission-control/state | head -50
```

If you get JSON back → API is working  
If you get error → API is broken

### 3. Test Specific Section
```
1. Go to "Unified Dashboard" section (left sidebar)
2. Scroll down to find approval buttons
3. Right-click on button → "Inspect"
4. Look at HTML — should be <button> element
5. Try clicking it
6. Check console for error
```

## Files That Could Have Issues

| File | Status | Notes |
|------|--------|-------|
| `src/components/sections/GapAnalysisSection.js` | ⚠️ Recently updated | Might have broken something |
| `src/pages/api/mission-control/state.js` | 🆕 New | Might not work at runtime |
| `src/components/styles/UnifiedDashboard.module.css` | ✅ Unchanged | Should be fine |
| `src/components/Dashboard.js` | ✅ Unchanged | Should be fine |
| `src/pages/index.js` | ✅ Unchanged | Should be fine |

## Next Steps

**Please tell me:**
1. Which specific button/link isn't working?
2. What do you see when you click it? (Nothing? Error? Modal?)
3. Does hard-refresh help? (Cmd+Shift+R)
4. What's in the browser console? (F12 → Console)
5. Can you check the API endpoint? (curl command above)

Once I know more, I can fix it quickly.
