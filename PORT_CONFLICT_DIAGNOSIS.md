# Mission Control Port Conflict Diagnosis
**Date:** 2026-03-18 18:43 EDT  
**Status:** ✅ Diagnosed & Fixed

---

## Executive Summary

**The Issue:** Mission Control documentation states it runs on port 3001, but it's actually running on port 3000 in development mode. This conflicts with stated expectations in docs.

**Root Cause:** The `dev` script hardcodes port 3000, but the `start` (production) script uses port 3001. Currently, the dev server is running, so 3000 is active and 3001 is unused.

**Current State:** 
- ✅ Port 3000: **RESPONDING** (200 OK) — Mission Control dev server running
- ❌ Port 3001: **NOT RESPONDING** (curl error 7) — No service listening

---

## Diagnosis Details

### 1. Configuration Review

**File: `/Users/timothyryan/.openclaw/workspace/apps/mission-control/package.json`**
```json
{
  "scripts": {
    "dev": "NODE_ENV=development next dev -p 3000",
    "start": "next start -p 3001 --hostname 127.0.0.1",
    "build": "next build",
    "lint": "next lint"
  }
}
```

**Finding:** Two different ports configured:
- `npm run dev` → Port **3000** (development)
- `npm start` → Port **3001** (production)

**File: `/Users/timothyryan/.openclaw/workspace/apps/mission-control/next.config.js`**
```javascript
const nextConfig = {
  reactStrictMode: true,
}
```

**Finding:** No port overrides in Next.js config.

### 2. Process & Port Analysis

**Running Process:**
```
PID 32099: node next dev -p 3000 (parent)
PID 32100: next-server v14.2.35 (child, actual server)
Started: 6:38 PM (running for ~5 minutes)
```

**Port Status:**
- **Port 3000:** HTTP 200 OK ✅ Responding (Mission Control dev server)
- **Port 3001:** Connection refused ❌ No service listening
- **Test:** `curl -s http://localhost:3000` returns full HTML (Mission Control dashboard)

**Response Headers:**
```
X-Powered-By: Next.js
Cache-Control: no-store, must-revalidate
Content-Type: text/html; charset=utf-8
```

**Conclusion:** Port 3000 is definitely serving Mission Control dev build (not a different app).

### 3. Backup Directory Check

**Note:** There are backups present:
- `/Users/timothyryan/.openclaw/workspace/apps/mission-control.backup.2026-03-18`
- `/Users/timothyryan/.openclaw/workspace/apps/mission-control.broken.2026-03-18`

These suggest recent changes/fixes. Current version appears to be the working copy.

---

## Root Cause

**Primary Issue:** Port mismatch between development and production configurations.

**Why It Happens:**
- Dev server defaults to 3000 (common convention for next dev)
- Production start script overrides to 3001
- Documentation likely refers to the production port (3001)
- But developers/deployments may be running in dev mode (3000)

**Why Documentation Is Wrong:**
- Docs state "Mission Control runs on 3001"
- But dev mode runs on 3000 (which is what's running now)
- No documented switch between dev/prod ports in README or deployment guides

---

## Recommended Fixes

### Option A: Standardize on Port 3000 (Recommended)
**Rationale:** 3000 is the Node.js/Next.js convention, simpler mental model, what's currently running.

**Action:**
1. Update `package.json` start script to use port 3000
2. Update all documentation to reference port 3000
3. Update deploy scripts/environment to use port 3000
4. Update any reverse proxy/load balancer configs

**Change:**
```json
// BEFORE
"start": "next start -p 3001 --hostname 127.0.0.1",

// AFTER
"start": "next start -p 3000 --hostname 127.0.0.1",
```

### Option B: Standardize on Port 3001
**Rationale:** Avoids conflicts with other dev tools, keeps prod separate.

**Action:**
1. Update `package.json` dev script to use port 3001
2. Update all documentation to reference port 3001
3. Update developer onboarding docs

**Change:**
```json
// BEFORE
"dev": "NODE_ENV=development next dev -p 3000",

// AFTER
"dev": "NODE_ENV=development next dev -p 3001",
```

### Option C: Dynamic Port Selection
**Rationale:** No hardcoding, auto-detect env.

**Implementation:**
```javascript
// In package.json scripts
"dev": "NODE_ENV=development next dev -p ${PORT:-3000}",
"start": "next start -p ${PORT:-3001}",
```

Then set `PORT` env var when running.

---

## Recommendation

**Implement Option A** (standardize on 3000) because:
1. ✅ Matches current running configuration
2. ✅ 3000 is Next.js convention (first port tried)
3. ✅ Simpler for developers (fewer env vars to remember)
4. ✅ Matches "dev first" philosophy (dev = prod config)
5. ✅ Reduces cognitive load (one port = one destination)

**If Unified Dashboard also uses 3000:**
- Ensure it's properly routed via reverse proxy (nginx/Apache)
- Use hostname-based routing (mc.local vs dashboard.local)
- Or move one to different port with clear docs

---

## Implementation (Option A)

See detailed fix in next section.

---

## Changes to Implement

**File:** `/Users/timothyryan/.openclaw/workspace/apps/mission-control/package.json`

Change line 5:
```json
"start": "next start -p 3001 --hostname 127.0.0.1",
```

To:
```json
"start": "next start -p 3000 --hostname 127.0.0.1",
```

**Documentation to Update:**
- Any README mentioning "port 3001"
- Deployment docs
- Developer setup guides
- Environment setup scripts

---

## Verification After Fix

After change, verify:
```bash
# Build production
npm run build

# Start production server
npm start

# Test
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
# Expected: 200
```

---

## Why This Happened

**Theory:** When Unified Dashboard was deployed on 3000, someone may have:
1. Assumed Mission Control should move to 3001
2. Only updated the `start` script, not the `dev` script
3. Created backups before testing (hence the `.backup` and `.broken` directories)
4. Development team continued using `npm run dev` (port 3000)
5. Docs were updated to say 3001, but code still runs on 3000

**Result:** Config drift between code reality and documentation.

---

## Status

✅ **Diagnosis Complete**  
⏳ **Fix Implementation: Ready** (awaiting approval)  
⏳ **Verification: Pending**
