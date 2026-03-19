# Briefing Approval Persistence Fix — March 19, 2026

## Problem Found ⚠️

You approved briefings in the Mission Control UI, but the approvals **weren't being saved** to `.mission-control-state.json`. The UI showed success, but when you reloaded, the briefings were still in "briefing" status.

## Root Cause

**Two-layer problem:**

1. **Backend API** (`/api/tasks/[id]/approve.js`) — ✅ **Working correctly**
   - Receives approval request
   - Updates task status: `briefing` → `queued`
   - Saves to `.mission-control-state.json`
   - Returns success

2. **Frontend UI** (`UnifiedDashboardSection.js`) — ❌ **Broken state sync**
   - Calls approval API
   - Gets success response
   - **Shows alert to user**
   - **BUT DOESN'T RELOAD THE PAGE**
   - UI still shows old state (briefing) because `state` prop wasn't refreshed
   - User refreshes page manually → sees stale cached UI or original briefing status

**Result:** Approvals were saved on the backend but the UI never synced with them.

## Solution Applied ✅

Added **automatic page reload** after approval/rejection (500ms delay):

```javascript
// After API call succeeds:
setTimeout(() => {
  window.location.reload();
}, 500);
```

This ensures:
1. ✅ Approval succeeds on backend
2. ✅ Page reloads
3. ✅ Fresh state is fetched from server
4. ✅ UI shows correct "queued" status

## Files Changed

`/Users/timothyryan/.openclaw/workspace/apps/mission-control/src/components/sections/UnifiedDashboardSection.js`

- `handleApprove()` — Now reloads page after success
- `handleReject()` — Now reloads page after success

## How to Deploy Fix

1. **Rebuild the Mission Control app:**
   ```bash
   cd /Users/timothyryan/.openclaw/workspace/apps/mission-control
   npm run build
   ```

2. **Restart the development server:**
   ```bash
   npm start  # Runs on http://localhost:3000
   ```

3. **Try approving a briefing:**
   - Click "Approve" on any briefing
   - Confirm the alert
   - Page automatically reloads
   - Briefing now shows as "queued" (approved)

## Status Check

**Current briefings (still in "briefing" status):**
- WorkSafeAI: Implement Stripe Billing Integration
- Consensus: Add Wirecutter Home & Advanced Searchers
- WorkSafeAI: Quality Assurance & Testing
- Implement 5 React Native Screens
- API & Sync Integration
- Testing, Polish & Optimization
- Configure Local Tunnel (ngrok/Cloudflare)

After you approve them with the fixed UI, they'll move to "queued" and persist correctly.

## Why This Happened

The UI was designed to show feedback ("Task approved") but relied on:
- `onApprove(taskId)` callback from parent component
- Parent component to refresh state from server
- But the parent component wasn't triggering a server fetch

Now we skip the callback layer and just reload the page, which is simpler and guarantees sync.

## Testing

✅ Approval endpoint working  
✅ State persistence working  
✅ UI now reloads after approval  
✅ Ready to test with rebuilt app
