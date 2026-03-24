# Mission Control Button Testing Guide

## Issue Description
Tim reported: "The clickable links aren't working"

## What to Test

### 1. Sidebar Navigation
- Click each item in the left sidebar (🎯, 📊, 👥, 👤, 📅, 📔, 📚)
- Expected: View should change to that section

### 2. Project Links (Projects Section)
- Look for "→ GitHub Repo" links in project cards
- Click them
- Expected: Opens GitHub repo in new tab

### 3. Approval Buttons (Unified Dashboard)
- Navigate to "Unified Dashboard" section
- Scroll to "🎯 Approvals Needed" section (if there are pending briefings)
- Click "✅ Approve" or "❌ Reject" buttons
- Expected: Alert confirms action, data updates

### 4. Task Status Navigation
- Click on task cards (in QUEUED, IN-PROGRESS, WHAT'S NEXT, COMPLETED columns)
- Expected: Task detail view opens
- Click "← Back to Project" to return

### 5. Create Buttons
- Click "+ Create Project" button
- Expected: Modal appears with form
- Click the X button to close
- Expected: Modal closes

### 6. Table/Item Selection
- Click on briefing items in the "Approvals Needed" section
- Expected: Item becomes highlighted/selected

## Common Issues & Fixes

### Issue: Buttons don't respond to clicks
**Possible Causes:**
1. Modal overlay z-index blocking clicks (z-index: 1000)
   - Check if a modal is open but not visible
   - Look for `showProjectModal` or `showTaskModal` = true

2. Pointer-events: none on parent container
   - Check CSS for `pointer-events: none`

3. Button styled as disabled
   - Check for `disabled` attribute or `:disabled` CSS

### Issue: Links open in same tab instead of new tab
**Fix:** Verify `<a>` tags have `target="_blank"` and `rel="noopener noreferrer"`

### Issue: OnClick handlers don't fire
**Possible Causes:**
1. Syntax error in component (breaks render)
   - Check browser console for errors
2. Event handler has wrong signature
3. State not updating correctly

## Debug Steps

1. **Open Browser Dev Tools** (F12)
2. **Check Console for errors** - look for red text
3. **Click a button and watch console** - should see `console.log()` output
4. **Check Network tab** - verify API calls are made

## How Buttons Should Work

```javascript
// Sidebar buttons (onChange view)
<button onClick={() => setCurrentSection('gap-analysis')}>
  Should change view immediately
</button>

// Approval buttons (API call)
<button onClick={() => handleApprove(briefing.id)}>
  ✅ Approve
</button>
→ Calls POST /api/tasks/{id}/approve
→ Shows alert on success/failure
→ Refreshes data

// Navigation buttons (change view state)
<button onClick={() => setView('task')}>
  Should change to task detail view
</button>
```

## Next Steps If Buttons Still Don't Work

1. Check browser console (F12 → Console tab) for JavaScript errors
2. Run: `npm run build` to check for syntax errors
3. Restart dev server: `npm run dev`
4. Clear browser cache: Hard refresh (Cmd+Shift+R on Mac)
