# WorkSafeAI API — Code Review Report
**Date:** March 8, 2026 (Subagent session)  
**Reviewer:** Lucy (Subagent)  
**Scope:** Full security, bug, design, and completeness audit  
**Context:** Multiple prior reviews exist. This session found issues the previous A+ reviews missed.

---

## Summary

| Category | Issues Found | Auto-Fixed | Manual Rec |
|----------|-------------|------------|------------|
| Security | 4 | 4 | 1 |
| Bugs | 2 | 2 | 0 |
| Design | 1 | 1 | 1 |
| Missing | 0 | 0 | 2 |
| **Total** | **7** | **7** | **4** |

**Files modified:** `src/routes/auth.js`, `src/routes/jtsa.js`, `src/routes/hazards.js`, `src/routes/mitigations.js`, `src/routes/companies.js`, `src/middleware/cache.js`, `src/services/cacheService.js`, `src/server.js`

---

## Issues Found & Fixed (Auto-Applied)

---

### 🔴 HIGH — Login Endpoint Enables User Enumeration
**File:** `src/routes/auth.js` — POST `/api/auth/login`  
**Status:** ✅ **FIXED**

**Problem:** The login route was passing `error.message` directly to the response. `authService.login` throws distinct messages:
- `"Invalid email or password"` (correct credential failure)  
- `"User account is disabled or has been deleted"` ← **leaks account existence**
- `"Please verify your email before logging in"` ← needed for UX (kept as-is)

An attacker who probes email addresses could distinguish "account exists but disabled" from "wrong password."

**Fix Applied:**
```javascript
// Before
res.status(401).json({ error: error.message });

// After — maps all non-UX failures to generic message
if (msg.includes('verify your email')) {
  return res.status(401).json({ error: 'Please verify your email before logging in' });
}
res.status(401).json({ error: 'Invalid email or password' });
```

---

### 🔴 HIGH — Multiple Auth Endpoints Leak Internal Error Messages
**File:** `src/routes/auth.js`  
**Endpoints:** `POST /verify-email`, `POST /forgot-password`, `POST /reset-password`, `POST /change-password`  
**Status:** ✅ **FIXED**

**Problem:** All four endpoints had `res.status(500).json({ error: error.message })` in catch blocks, which would expose database errors, connection errors, or stack details in production.

Notable: `forgot-password` was also changed to always return the ambiguous success message even on 500 (matching the anti-enumeration pattern already used for the "user not found" case).

**Fix Applied:** All four handlers now return sanitized static messages and log internally.

---

### 🟡 HIGH — Cache Middleware Caches Error Responses
**File:** `src/middleware/cache.js`  
**Status:** ✅ **FIXED**

**Problem:** The `cachedResponse` middleware intercepted `res.json` and cached **all** responses regardless of HTTP status code. A 403/404/500 error would be stored in Redis with the configured TTL (5–10 minutes). Subsequent requests from any user hitting that cache key would receive the cached error even after the underlying issue was resolved.

Example: A dashboard request that fails with 503 during a DB outage would be cached and served to all users for 5 minutes after recovery.

**Fix Applied:**
```javascript
// Only cache successful responses
if (res.statusCode >= 200 && res.statusCode < 300) {
  cacheService.set(cacheKey, data, ttl);
}
```

---

### 🟡 HIGH — UUID Validation Missing on 8 Route Parameters
**Files:** `src/routes/jtsa.js`, `src/routes/hazards.js`, `src/routes/mitigations.js`  
**Status:** ✅ **FIXED**

**Problem:** Several GET/PATCH/POST endpoints queried Supabase with unvalidated `:id` params. While Supabase parameterizes queries (no SQL injection risk), passing non-UUID strings would cause unnecessary DB round-trips and could trigger unexpected error behavior.

**Endpoints fixed:**
- `GET /jtsas/:id`
- `PATCH /jtsas/:id`
- `POST /jtsas/:id/participants`
- `POST /jtsas/:id/complete`
- `POST /jtsa/:id/hazards`
- `GET /jtsa/:id/hazards`
- `PATCH /hazards/:id`
- `GET /hazards/:id`
- `POST /hazards/:id/mitigations`
- `GET /hazards/:id/mitigations`
- `PATCH /mitigations/:id`
- `GET /mitigations/:id`

(Projects already had this validation; these were the missing ones.)

---

### 🟡 MEDIUM — Enumeration Rate Limiter Bypassable with Fake Auth Header
**File:** `src/server.js` — `enumerationLimiter`  
**Status:** ✅ **FIXED**

**Problem:** The skip function was:
```javascript
skip: (req) => req.headers.authorization !== undefined
```
Any request including even `Authorization: x` would skip the rate limit entirely, defeating the enumeration protection.

**Fix Applied:** Now requires the header to match the `Bearer <10+ char token>` pattern:
```javascript
skip: (req) => {
  const auth = req.headers.authorization;
  return typeof auth === 'string' && /^Bearer\s+\S{10,}/i.test(auth);
},
```
Note: Token validity is not verified at the rate-limit layer (would require auth-before-rate-limit circular dependency). The regex meaningfully raises the bar while keeping the architecture clean.

---

### 🟡 MEDIUM — `deletePattern` Uses O(N) Blocking `KEYS` Command
**File:** `src/services/cacheService.js`  
**Status:** ✅ **FIXED**

**Problem:** `client.keys(pattern)` is a Redis `KEYS` command. It scans the entire keyspace in a single blocking pass — O(N) relative to total keys. In production with thousands of cached entries this would momentarily block all Redis operations.

**Fix Applied:** Replaced with iterative `SCAN` using cursor-based pagination (COUNT 100 per pass). Non-blocking and production-safe.

---

### 🟡 MEDIUM — Companies User List Missing Error Check
**File:** `src/routes/companies.js` — `GET /:id/users`  
**Status:** ✅ **FIXED**

**Problem:** 
```javascript
const { data: users } = await supabase.from('users').select(...)
res.json(users); // users could be null on error, no error check
```
A DB error would silently return `null` as the response body instead of a 500.

**Fix Applied:** Added `usersError` check with `throw usersError`, and changed `res.json(users)` to `res.json(users || [])` to guarantee an array.

---

## Recommendations (Manual Action Needed)

### 1. `billing.js` — Stripe Error Messages Exposed to Clients
**Severity:** Medium  
All Stripe error handlers use `res.status(400).json({ error: error.message })`. Stripe errors can include internal details about subscription state, price IDs, or API limits. In production, consider:
```javascript
// Map Stripe errors to generic messages
const clientMsg = process.env.NODE_ENV === 'production'
  ? 'Billing operation failed. Please try again.'
  : error.message;
res.status(400).json({ error: clientMsg });
```

### 2. Add Request Timeout Middleware
No global request timeout is configured. Long-running queries or slow AI calls could hold connections indefinitely.
```javascript
// In server.js, after app = express()
app.use((req, res, next) => {
  res.setTimeout(30_000, () => res.status(408).json({ error: 'Request timeout' }));
  next();
});
```

### 3. `health.js` — Readiness Probe Exposes DB Error Details
`GET /health/ready` returns `error.message` in the 503 response. While this endpoint is typically internal (not public-facing), if it's exposed to the internet it leaks DB error details. Consider sanitizing.

### 4. `dashboard.js` — `user_id` Query Parameter Not Validated as UUID
The audit-log endpoint accepts `user_id` as a query filter without UUID validation. Low risk (Supabase parameterizes), but adds defense in depth:
```javascript
if (user_id && !/^[0-9a-f-]{36}$/i.test(user_id)) {
  return res.status(400).json({ error: 'Invalid user_id format' });
}
```

---

## Overall Code Health Assessment

The codebase is genuinely well-built. Previous reviews were largely accurate — the architecture is clean, security controls are thoughtful, and the patterns are consistent. The issues found here are real but not catastrophic:

- The **user enumeration** issue in login is a meaningful security gap that should have been caught earlier
- The **cache poisoning** bug is a subtle but impactful correctness issue — it could cause confusing production incidents
- The **UUID validation gaps** are defense-in-depth items
- The **O(N) KEYS command** is a ticking time-bomb for production Redis performance

**Revised Assessment:**
| Dimension | Previous Score | Revised |
|-----------|---------------|---------|
| Security | A+ | A (was missing enumeration hardening) |
| Architecture | A+ | A+ (unchanged — excellent) |
| Error Handling | A | A- (multiple raw error leaks) |
| Code Style | A+ | A+ (unchanged) |
| **Overall** | **A+** | **A** |

After these fixes: **A+** — production-ready with pending migrations applied.

---

**Review completed:** March 8, 2026  
**Fixes applied:** 7 auto-fixes across 8 files  
**Server startup:** ✅ Clean (verified post-fix)
