# WorkSafeAI Code Review - New Issues Found (March 7, 2026 - Heartbeat 2:44 PM)

## Overview
This review was conducted to verify the completeness of the previous code review and identify any new issues introduced or missed.

---

## Issues Found and Status

### 1. Dashboard Route - Undefined Variable Bug 🔴 CRITICAL
**File:** `src/routes/dashboard.js` (GET /api/companies/:id/jtsa-list)  
**Severity:** CRITICAL  
**Issue:** The route has duplicate code and references undefined `count` variable
- Line ~70-110: Duplicate query building logic
- Line ~119: Uses `count` variable that was never defined from database query
- This will cause a runtime error when accessing the jtsa-list endpoint

**Impact:** Endpoint crashes with ReferenceError, breaking JTSA listing functionality

**Fix Required:** Remove duplicate code, properly use `.count('exact')` in query

---

### 2. Missing Stripe Price ID Validation 🟡 MEDIUM
**File:** `src/config/envValidation.js`  
**Severity:** MEDIUM  
**Issue:** Environment validation doesn't check for required Stripe price IDs
- `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ENTERPRISE` are used in stripeService.js
- But not validated in envValidation.js
- Will cause runtime error when creating subscriptions if not set

**Impact:** Application starts but crashes when subscription is created

**Fix Required:** Add validation for Stripe price IDs as required environment variables

---

### 3. Stripe Service - Weak Error Handling 🟡 MEDIUM
**File:** `src/services/stripeService.js`  
**Severity:** MEDIUM  
**Issue:** Multiple `.single()` database queries without proper error handling
- Lines 156, 166, 184, 199, 229: `.single()` calls assume row exists
- Supabase throws error if no row found (not just returns null)
- Current code doesn't explicitly handle this case

**Impact:** Potential unhandled errors in webhook handlers

**Fix Required:** Wrap `.single()` calls with proper error checking

---

## Verification of Previous Fixes

✅ **All 14 previously reported issues are confirmed FIXED:**
- Webhook signature verification ✅
- Cache invalidation property mismatch ✅
- Password validation consistency ✅
- Cache key injection vulnerability ✅
- JTSA date validation ✅
- Email provider config validation ✅
- PDF path directory traversal ✅
- Registration audit logging ✅
- Failed login attempt logging ✅
- Verbose error messages ✅
- AI prompt injection prevention ✅
- AI response validation ✅
- Email input validation ✅

---

## Summary

- **New Critical Issues:** 1
- **New Medium Issues:** 2
- **Previous Issues Status:** All fixed ✅

The codebase is generally in good shape, but there are 3 issues that need immediate attention, especially the dashboard bug which will cause runtime errors.

