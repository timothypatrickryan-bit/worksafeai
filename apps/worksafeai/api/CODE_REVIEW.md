# WorkSafeAI API — Code Review Report

**Date:** 2026-03-08  
**Reviewer:** Lucy (AI)  
**Scope:** Full API codebase at `src/`  

---

## Summary

The codebase is reasonably well-structured with solid patterns in place: Zod validation schemas, bcrypt password hashing, JWT authentication, RBAC middleware, HTML escaping in emails, path traversal guards in multiple places, and Stripe webhook signature verification. However, several critical and high-severity issues were found and auto-fixed, plus a number of medium/low issues requiring manual attention.

**Overall health: 7/10** — Good baseline security posture, but with some critical operational bugs that would cause feature failures in production.

---

## Issues Found

### 🔴 CRITICAL (Auto-Fixed)

#### 1. PDF Download Completely Non-Functional — `src/routes/pdfs.js`
**Severity:** Critical (feature broken for all users)  
**Status:** ✅ Fixed

The PDF download route fetched only `project:projects(company_id)` from the JTSA table, meaning:
- `jtsa.date` was always `undefined` → date regex always failed → always returned "Invalid date format"
- For standalone JTSAs (no project), `jtsa.project` was `null` → `jtsa.project.company_id` crashed with `TypeError`
- UUID validation ran *after* the database query (dead code)

**Fix:** Fetch `company_id` and `date` directly from the `jtsas` table; validate UUID before DB call; access-control via `jtsa.company_id` directly.

---

#### 2. Path Traversal in Admin Migrations Route — `src/routes/admin-migrations.js`
**Severity:** Critical (security vulnerability)  
**Status:** ✅ Fixed

```js
// BEFORE (vulnerable)
if (!filepath.startsWith(migrationsDir)) { ... }
// e.g. /app/scripts_evil/file.sql starts with /app/scripts ✓ — wrong!

// AFTER (fixed)
const normalizedBase = path.normalize(migrationsDir) + path.sep;
if (!filepath.startsWith(normalizedBase)) { ... }
```

A filename like `../etc/passwd` or a base-dir prefix match (`/app/scripts_evil/x.sql`) could have bypassed the guard.

---

### 🟠 HIGH (Auto-Fixed)

#### 3. JWT Algorithm Confusion on Refresh Token Verify — `src/routes/auth.js`
**Severity:** High (algorithm substitution attack)  
**Status:** ✅ Fixed

`jwt.verify(refreshToken, JWT_SECRET)` without specifying `{ algorithms: ['HS256'] }` allows an attacker to submit a `none`-algorithm token if the library version supports it. Fixed to explicitly specify `{ algorithms: ['HS256'] }`.

#### 4. Access/Refresh Tokens Shared Same Secret — `src/services/authService.js`
**Severity:** High (token confusion risk)  
**Status:** ✅ Fixed

Both access and refresh tokens used `JWT_SECRET`. A refresh token could theoretically be used as an access token in certain edge cases, and vice versa. Now refresh tokens use `JWT_REFRESH_SECRET` (or `JWT_SECRET + '_refresh'` as fallback) and include `type: 'refresh'` in payload.

**Action needed:** Add `JWT_REFRESH_SECRET=<strong-random-secret>` to `.env` and production environment variables.

#### 5. Add Participant — No Company Membership Validation — `src/routes/jtsa.js`
**Severity:** High (IDOR / broken authorization)  
**Status:** ✅ Fixed

`POST /api/jtsas/:id/participants` accepted any UUID as `userId` without verifying it belonged to the requester's company. An attacker could add users from other companies (or fake UUIDs) as participants.

**Fix:** Added DB lookup to verify the participant user exists in the same company and is active.

#### 6. Wrong Field Name `req.user.full_name` — `src/routes/companies.js`
**Severity:** High (invite emails always show email as inviter name)  
**Status:** ✅ Fixed

JWT payload stores `fullName` (camelCase) but code referenced `req.user.full_name` (snake_case). Invite emails always showed the inviter's email address instead of their name.

#### 7. Stripe Cancellation Was Immediate, Not At-Period-End — `src/services/stripeService.js`
**Severity:** High (business logic / data loss risk)  
**Status:** ✅ Fixed

`stripe.subscriptions.del()` (deprecated) cancelled subscriptions immediately, revoking access for time already paid for. Changed to `update({ cancel_at_period_end: true })` for graceful cancellation. Added `{ immediately: true }` option for fraud/abuse scenarios.

#### 8. Refresh Token Missing Dev Bypass for Email Verification — `src/routes/auth.js`
**Severity:** High (refresh-token flow broken in development/testing)  
**Status:** ✅ Fixed

The login endpoint skips `email_verified` check in development, but the refresh-token endpoint did not, causing all token refresh calls to fail in dev/test with 403 even after successful login.

#### 9. Internal Error Messages Exposed in `accept-invite` — `src/routes/auth.js`
**Severity:** High (information disclosure)  
**Status:** ✅ Fixed

The catch block returned `res.status(500).json({ error: error.message })` verbatim, potentially exposing Supabase internals or database error details. Fixed to return a generic message and log the error server-side.

---

### 🟡 MEDIUM (Manual Fix Recommended)

#### 10. Zod v4 Compatibility Bug in Validation Middleware — `src/middleware/validation.js`
**Severity:** Medium (validation errors silently fall through)  
**Status:** ✅ Fixed

Zod v4 changed `ZodError.errors` → `ZodError.issues` as primary array. The old check `error.errors && Array.isArray(error.errors)` could fail, causing validation errors to return an unhelpful generic message instead of field-specific detail. Fixed to try `.issues` first, then `.errors`.

#### 11. GET Users List Returns Deleted/Inactive Users — `src/routes/companies.js`
**Severity:** Medium (data exposure)  
**Status:** ✅ Fixed

`GET /api/companies/:id/users` returned all users including soft-deleted/inactive ones. Added `.eq('is_active', true).is('deleted_at', null)` filters.

#### 12. JTSA GET `/jtsas/:id` — Access Control After Data Use — `src/routes/jtsa.js`
**Severity:** Medium (logic error / potential crash)  
**Status:** ✅ Fixed

The error check (`if (error) throw error`) appeared *after* the company access check that used `jtsa` — if the DB query itself errored, the access-control code would crash on null before the error was thrown. Reordered checks and converted parallel fetches for hazards/participants to `Promise.all` for efficiency.

#### 13. Production Debug Log Leaking Request Body — `src/routes/company.js`
**Severity:** Medium (log data exposure)  
**Status:** ✅ Fixed

`console.log('Onboarding request body:', JSON.stringify(req.body, null, 2))` logged the full body in all environments. Wrapped in `if (NODE_ENV === 'development')`.

---

### 🔵 LOW (Recommendations — Manual Fixes)

#### 14. No Billing Enforcement Middleware
**Recommendation:** There's no middleware that checks `subscription_status` and blocks access when a subscription expires. Users can continue creating JTSAs after trial/subscription lapses. Implement a `requireActiveBilling` middleware that checks `company.subscription_status` and `trial_ends_at`.

#### 15. Dashboard Makes 4 Sequential DB Queries
**File:** `src/routes/dashboard.js`  
**Recommendation:** Convert to parallel fetches with `Promise.all([...])`. Could also be a single aggregate SQL query or a DB view for efficiency.

#### 16. `auditService.getClientIp` — IP Spoofing via `X-Forwarded-For`
**File:** `src/services/auditService.js`  
**Recommendation:** The current implementation trusts `X-Forwarded-For` header as-is. Without a trusted proxy configuration, this header can be spoofed. When running behind a reverse proxy (Nginx/Cloudflare), restrict to only trusting the last proxy's IP, or use the `express-ipware` package.

#### 17. No Rate Limiting on `POST /jtsas/:id/complete` and Participant Endpoints
**File:** `src/routes/jtsa.js`  
**Recommendation:** Add rate limiting via existing `express-rate-limit` patterns already used in `server.js`.

#### 18. Console Logs PII (Email Addresses) in Email Service
**File:** `src/services/emailService.js`  
**Recommendation:** `console.log('Invite sent to ${recipientEmail}')` logs email addresses to stdout. Use a structured logger that can be configured to redact PII in production.

#### 19. Stripe Enterprise Tier — No Price ID
**File:** `src/services/stripeService.js`  
**Recommendation:** `STRIPE_PRICE_ENTERPRISE` has `stripe_price_id: process.env.STRIPE_PRICE_ENTERPRISE` but `cost_cents: null` (custom pricing). If this is used, the Stripe subscription call will fail with an unhelpful error. Add a guard:
```js
if (!tierConfig.stripe_price_id) {
  throw new Error('Enterprise pricing requires manual setup. Contact sales.');
}
```

#### 20. Password Change Doesn't Invalidate Existing JWT Tokens
**File:** `src/routes/auth.js` (`/change-password`, `/reset-password`)  
**Recommendation:** After a password change, all existing access tokens remain valid until they expire (up to `JWT_EXPIRY`). Implement a token invalidation strategy (Redis allowlist, `password_changed_at` claim comparison, or short token expiry).

#### 21. Test Suite Has Stale Expectations
**Files:** `src/__tests__/auth.test.js`, `src/__tests__/jtsa.test.js`  
**Issues (pre-existing):**
- JTSA tests reference old route `/api/projects/:pid/jtsa` — this was refactored to `/api/companies/:cid/jtsas`
- Auth `/me` test checks `res.body.user.email` but API returns `res.body.email` directly
- Auth refresh test expects 401 for invalid token; code returns 403
- Billing tests require real Stripe test keys to pass
**Recommendation:** Update tests to match current API contract. Consider mocking Stripe in billing tests.

---

## Auto-Fixes Applied

| File | Change |
|------|--------|
| `src/routes/pdfs.js` | Rewrote: fetch `company_id`+`date` from JTSA; validate UUID first; path traversal fix |
| `src/routes/admin-migrations.js` | Path traversal fix: add `path.sep` to base dir comparison |
| `src/routes/auth.js` | Algorithm spec on refresh verify; separate refresh secret; dev bypass for email_verified; generic error on accept-invite |
| `src/routes/companies.js` | Fixed `req.user.full_name` → `req.user.fullName`; filter inactive users in GET /users |
| `src/routes/jtsa.js` | Company membership check on addParticipant; reordered error/access checks; parallel fetches |
| `src/routes/company.js` | Dev-only guard on request body logging |
| `src/services/authService.js` | Refresh token uses separate secret + `type: 'refresh'` in payload |
| `src/services/stripeService.js` | Cancel = at-period-end (not immediate); immediate option available |
| `src/middleware/validation.js` | Zod v4 compatibility (issues vs errors); removed validation noise from prod logs |
| `src/config/envValidation.js` | Documented `JWT_REFRESH_SECRET` as recommended optional env var |

---

## Recommended Next Steps (Priority Order)

1. **Add `JWT_REFRESH_SECRET`** to `.env` and all deployment environments (strong random secret, different from `JWT_SECRET`)
2. **Fix test suite** to match current API (JTSA routes, `/me` response shape, billing mocks)
3. **Implement billing enforcement middleware** to block expired accounts
4. **Add enterprise tier guard** in Stripe service before attempting to create subscription
5. **Convert dashboard to parallel queries** for performance
6. **Implement token invalidation** after password changes
7. **Review IP trust configuration** for `X-Forwarded-For` header in production proxy setup
