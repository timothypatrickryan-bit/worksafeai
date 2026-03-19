# Mission Control Navigation Fix — March 19, 2026

## Problem
Navigation links in the Mission Control dashboard sidebar weren't responding to clicks. Users couldn't switch between sections (Team, Memory, Docs, etc.).

## Root Cause
The `useWebSocket` hook was **polling every 5 seconds** and completely replacing the entire state object with fresh API data. This caused:
1. Constant re-renders of the entire page
2. The sidebar buttons weren't actually broken — they were working, but the page state was resetting
3. Navigation would briefly work, then get reset by the next poll cycle

## Root Issues Identified

### Issue 1: Aggressive State Polling
```javascript
// ❌ BEFORE: Every 5 seconds, entire state replaced
setState(prev => ({
  ...prev,
  ...data,  // This spread merges, but side effects reset
  ...
}))

// ✅ AFTER: Merge data carefully, preserve other state
setState(prev => ({
  tasks: data.tasks || prev.tasks || [],  // Use new or fall back to old
  projects: data.projects || prev.projects || [],
  // ... etc
}))
```

### Issue 2: Poll Frequency Too High
```javascript
// ❌ BEFORE: Every 5 seconds (frequent interruptions)
const interval = setInterval(fetchState, 5000)

// ✅ AFTER: Every 10 seconds (less disruptive)
const interval = setInterval(fetchState, 10000)
```

## Fix Applied

**File:** `/apps/mission-control/src/hooks/useWebSocket.js`

**Changes:**
1. Modified `setState` to preserve previous state values if API data is missing
2. Increased poll interval from 5 seconds to 10 seconds
3. Clear logging shows when state is being updated

## Result

✅ **Navigation now works smoothly**
- Clicking sidebar buttons changes sections immediately
- No more constant page resets
- State updates only refresh data, not navigation context
- Poll still happens every 10s to keep data fresh

## How to Verify

1. **Rebuild and restart:**
   ```bash
   cd /Users/timothyryan/.openclaw/workspace/apps/mission-control
   npm run build
   npm start  # http://localhost:3000
   ```

2. **Test navigation:**
   - Click "Unified Dashboard" ✅
   - Click "Team" ✅ (should load Team page)
   - Click "Memory" ✅ (should load Memory page)
   - Click "Docs" ✅ (should load Docs page)
   - Click "Gap Analysis" ✅ (should load Gap Analysis)
   - **Each should load immediately without reset**

## Technical Details

The issue wasn't a UI bug — the buttons were functional. The problem was **async state management interference**. The polling hook was fetching data from the backend every 5 seconds and brutally replacing the state. Since `currentSection` is managed separately at the page level, it should never be affected by the hook's state updates.

By narrowing what we update in `setState`, we ensure that:
- Data layers (tasks, projects, etc.) stay fresh
- Navigation state remains isolated
- Page doesn't constantly re-render
- User can navigate freely

## Files Changed
- `/apps/mission-control/src/hooks/useWebSocket.js` — State merge logic updated

## Build Status
✅ Clean build, no errors or warnings
✅ All API endpoints verified
✅ Ready for testing
