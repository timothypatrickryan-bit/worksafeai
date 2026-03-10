# WorkSafeAI Code Review Report
**Date:** 2026-03-10  
**Scope:** Full backend API (`api/src/`) and frontend (`web/src/`)

---

## Summary

| Severity | Found | Fixed |
|----------|-------|-------|
| CRITICAL | 2     | 2     |
| HIGH     | 6     | 6     |
| MEDIUM   | 5     | 5     |
| LOW      | 3     | 3     |
| **Total** | **16** | **16** |

---

## CRITICAL Issues

### 1. Boot error fallback doesn't stop code execution
**File:** `api/src/server.js`  
**Problem:** After `bootError` detection, `module.exports = fallbackApp` was set but the rest of the server code continued executing, causing crashes when dependencies failed to load.  
**Fix:** Wrapped the entire main server code in an `else` block so it only runs when boot succeeds.

### 2. Diagnostic endpoint exposed in production
**File:** `api/src/server.js`  
**Problem:** `/diag/test-post` was accessible in all environments, exposing internal DB connectivity, bcrypt hashes, and request body parsing details.  
**Fix:** Wrapped in `if (process.env.NODE_ENV === 'development')` guard.

---

## HIGH Issues

### 3. Debug info leaked in production error responses
**File:** `api/src/routes/auth.js` (register endpoint)  
**Problem:** `_debug` and `_code` fields with raw error messages and codes were returned in all environments.  
**Fix:** Conditioned debug fields on `process.env.NODE_ENV === 'development'`.

### 4. `select('*')` exposing password hashes
**Files:** `routes/auth.js`, `services/authService.js`, `routes/billing.js`  
**Problem:** Multiple queries used `select('*')` pulling `password_hash` and all fields into memory unnecessarily. While not directly returned to clients, this increases attack surface for logging leaks or serialization bugs.  
**Fix:** Replaced all `select('*')` with explicit column lists across 8 queries in auth, billing routes, and authService.

### 5. Boot error handler exposed stack traces in production
**File:** `api/src/server.js`  
**Problem:** The fallback 503 handler returned `bootError.stack` in all environments.  
**Fix:** Only include stack/detailed message when `NODE_ENV !== 'production'`.

### 6. Missing rate limiting on registration endpoint
**File:** `api/src/server.js`  
**Problem:** `/auth/register` had no rate limiting, allowing automated account creation attacks.  
**Fix:** Added `authLimiter` to `/api/auth/register` and `/auth/register`.

### 7. Employee listing excluded invited (pending) users
**File:** `api/src/routes/companies.js` (GET `/:id/users`)  
**Problem:** Query filtered `.eq('is_active', true)`, hiding invited users who haven't accepted yet. The AdminPage shows "Pending" status based on `email_verified`, but these users never appeared.  
**Fix:** Removed `is_active` filter and added `email_verified` to the select columns.

### 8. Missing DELETE endpoint for employee removal
**File:** `api/src/routes/companies.js`  
**Problem:** The AdminPage had a non-functional "Remove" button with no backend endpoint.  
**Fix:** Implemented `DELETE /:id/users/:userId` with:
- Self-deletion prevention
- Owner protection (can't remove owner)
- Company membership verification
- Soft delete (sets `deleted_at` + `is_active: false`)
- Audit logging

---

## MEDIUM Issues

### 9. Dashboard stat name mismatch
**File:** `web/src/pages/DashboardPage.jsx`  
**Problem:** Frontend referenced `stats.totalProjects` but the API returns `stats.totalJtsas`. The "Total Projects" stat card always showed 0.  
**Fix:** Changed to `stats.totalJtsas` and updated labels.

### 10. Auth store initialization race condition
**File:** `web/src/stores/authStore.js`  
**Problem:** `token` was not persisted to localStorage (only `user` and `isAuthenticated`), but `initializeAuth` checked `currentState.token` first. On page reload, `isAuthenticated` was `true` but `token` was `null`, causing broken state.  
**Fix:** Rewrote `initializeAuth` to:
- Use cookie as source of truth for token
- Clear stale state when no cookie exists
- Restore token from cookie when persisted user state exists
- Add JWT expiry check during initialization

### 11. API URL derivation bug for multiple subdomains
**File:** `web/src/api/client.js`  
**Problem:** `domain.replace('worksafeai.', 'worksafeai-api.')` always returns a string (even if no match), so the `|| apiDomain2` fallback for `superadmin.` subdomain never executed.  
**Fix:** Replaced with explicit `if/else if` logic for different subdomain patterns.

### 12. Invite rate limiter applied to GET requests
**File:** `api/src/server.js`  
**Problem:** The `inviteLimiter` (20/hour) was applied to all HTTP methods on `/companies/:id/users`, throttling the employee list fetch too.  
**Fix:** Added `skip: (req) => req.method !== 'POST'` to only rate-limit invite creation.

### 13. Dead try/catch in company onboarding
**File:** `api/src/routes/company.js`  
**Problem:** A try/catch wrapped simple property assignment (`updateData.company_profile = ...`) — property assignment doesn't throw, making the try/catch misleading dead code.  
**Fix:** Removed the try/catch and set properties directly.

---

## LOW Issues

### 14. Non-functional Remove button (frontend)
**File:** `web/src/pages/AdminPage.jsx`  
**Problem:** "Remove" button had no click handler, confirmation, or loading state. Also allowed removing yourself.  
**Fix:** Implemented full `handleRemoveEmployee` with:
- Confirmation dialog
- Loading/disabled state per row
- Self-removal prevention (hide button for current user)
- Error handling
- Replaced unused `LogOut` import with `Trash2` icon

### 15. Welcome message shows trailing comma with no name
**File:** `web/src/pages/DashboardPage.jsx`  
**Problem:** "Welcome back, " displayed with trailing comma when `user.fullName` was undefined.  
**Fix:** Changed to conditional: `Welcome back{name ? `, ${name}` : ''}`.

### 16. Unused `LogOut` import
**File:** `web/src/pages/AdminPage.jsx`  
**Problem:** `LogOut` was imported from lucide-react but never used.  
**Fix:** Replaced with `Trash2` (which is now used for the remove button).

---

## Architecture Observations (No Changes Made)

These aren't bugs but worth noting for future improvements:

1. **Dual route mounting (`/api/*` + `/*`):** Every route is mounted twice for Vercel compatibility. This works but doubles the route table and could cause confusion. Consider using Vercel rewrites instead.

2. **No request logging in production:** `structuredLogger` only logs in development mode. Consider adding minimal production logging (method, path, status, duration) for observability.

3. **AI service fails silently:** `generateHazards` returns `[]` on error, which means JTSA creation succeeds but with no hazards. Users get no indication the AI failed. Consider returning a warning flag.

4. **No pagination total count:** The JTSA list endpoint returns paginated data but no `total` count, making it impossible for the frontend to show "Page X of Y".

5. **JWT token in cookies + Authorization header:** The app uses cookies for persistence but Authorization header for API calls. This hybrid approach works but adds complexity. Consider standardizing on one approach.

6. **Missing JTSA delete endpoint:** Users can create and update JTSAs but cannot delete them. May be intentional for audit trail purposes.

7. **Email service is fire-and-forget:** Verification and invite emails are sent with `.catch()` — failures are logged but not surfaced. Consider a retry queue for critical emails.

---

## Files Modified

| File | Changes |
|------|---------|
| `api/src/server.js` | Boot error guard, diag endpoint guard, registration rate limit, invite limiter POST-only, else-block wrapping |
| `api/src/routes/auth.js` | Debug info guard, explicit select columns (5 queries) |
| `api/src/routes/companies.js` | Added DELETE user endpoint, fixed GET users query |
| `api/src/routes/company.js` | Removed dead try/catch |
| `api/src/routes/billing.js` | Explicit select columns (4 queries) |
| `api/src/services/authService.js` | Explicit select columns in login |
| `web/src/api/client.js` | Fixed API URL subdomain logic |
| `web/src/stores/authStore.js` | Rewrote initializeAuth with cookie-first logic + expiry check |
| `web/src/pages/DashboardPage.jsx` | Fixed stat name mismatch, welcome message fallback |
| `web/src/pages/AdminPage.jsx` | Implemented employee removal, fixed imports |
