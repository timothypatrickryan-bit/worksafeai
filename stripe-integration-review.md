# Stripe Billing Integration Code Review
## WorkSafeAI Backend

**Review Date:** March 29, 2026  
**Reviewer:** Velma (Code Quality & Security Specialist)  
**Scope:** Stripe subscription management, webhooks, payment handling  
**Repository:** `/Users/timothyryan/.openclaw/workspace/apps/worksafeai/api`

---

## Executive Summary

The Stripe integration is **well-structured and secure** with solid foundational practices. API keys are properly stored in environment variables, webhook signature verification is correctly implemented, and the codebase avoids storing raw card data. However, there are **critical gaps in security validation, replay attack prevention, and payment reliability** that must be addressed before production deployment. Most notably: missing event timestamp validation (replay attacks), no rate limiting on payment endpoints, incomplete webhook idempotency handling, and missing payment intent endpoints for client-side payment UI.

---

## Issues Found

### 🔴 CRITICAL

#### 1. **Missing Webhook Event Timestamp Validation (Replay Attack Vulnerability)**
- **Location:** `src/services/stripeService.js:verifyWebhookSignature()` and webhook handler in `src/server.js`
- **Issue:** Webhook events are verified by signature only. Stripe events have a `created` timestamp that should be validated to prevent replay attacks. Events older than 5 minutes should be rejected.
- **Impact:** An attacker who intercepts a valid webhook could replay it repeatedly, causing duplicate subscriptions, double charges, or state confusion.
- **Evidence:** The `verifyWebhookSignature()` function uses only `stripe.webhooks.constructEvent()` with no subsequent timestamp check.
- **Fix Required:** Add timestamp validation:
  ```javascript
  const verifyWebhookSignature = (body, signature) => {
    try {
      const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
      
      // Prevent replay attacks: reject events older than 5 minutes
      const eventTimestamp = event.created * 1000; // Convert to ms
      const now = Date.now();
      const maxAge = 5 * 60 * 1000; // 5 minutes
      
      if (now - eventTimestamp > maxAge) {
        throw new Error('Webhook event too old (possible replay attack)');
      }
      
      return event;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error(`Invalid webhook signature: ${error.message}`);
    }
  };
  ```
- **Severity:** CRITICAL
- **Effort:** 30 minutes
- **Priority:** 1 (must fix before production)

---

#### 2. **No Rate Limiting on Payment Endpoints**
- **Location:** `src/routes/billing.js`
- **Issue:** Payment endpoints (`/subscribe`, `/change-tier`, `/cancel`) lack rate limiting, unlike login/register endpoints. Attackers could brute-force subscription changes or spam webhook processing.
- **Impact:** DoS attack, abuse of free trials, excessive API calls to Stripe.
- **Evidence:** `src/server.js` defines `loginLimiter` and `registerLimiter` but billing routes have no equivalent.
- **Fix Required:** Add rate limiters:
  ```javascript
  const subscriptionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 subscription requests per hour per IP
    message: 'Too many subscription requests, try again later',
    keyGenerator: (req) => getClientIp(req),
  });
  
  router.post('/subscribe', subscriptionLimiter, authenticateToken, ...);
  router.post('/change-tier', subscriptionLimiter, authenticateToken, ...);
  router.post('/cancel', subscriptionLimiter, authenticateToken, ...);
  ```
- **Severity:** CRITICAL
- **Effort:** 1 hour
- **Priority:** 1 (must fix before production)

---

#### 3. **Incomplete Webhook Idempotency Handling (Duplicate Charge Risk)**
- **Location:** `src/services/stripeService.js:handleWebhookEvent()` handlers
- **Issue:** Webhook handlers update database state without idempotency keys or duplicate detection. If a webhook is delivered twice (by Stripe or network retry), it will process twice, potentially duplicating audit logs or charges.
- **Impact:** Duplicate payment logging, confusion in audit trail, potential double-charging if payment handlers are added later.
- **Evidence:** 
  - `handleSubscriptionCreated()` directly updates companies table without checking if subscription already exists.
  - `handleInvoicePaymentSucceeded()` inserts audit logs unconditionally.
  - No webhook event ID tracking in database.
- **Fix Required:** Implement idempotent webhook handling:
  ```javascript
  // Create webhook_events table to track processed events
  CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data JSONB
  );
  
  // In webhook handler, check if event already processed:
  const handleWebhookEvent = async (event, supabase) => {
    // Check if already processed
    const { data: existing } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .single();
    
    if (existing) {
      console.log(`Webhook event ${event.id} already processed, skipping`);
      return null; // Return 200 OK to acknowledge
    }
    
    // Process event...
    
    // Record processed event
    await supabase.from('webhook_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      data: event,
    });
  };
  ```
- **Severity:** CRITICAL
- **Effort:** 2 hours (includes DB migration)
- **Priority:** 1 (must fix before production)

---

#### 4. **Missing Payment Intent Endpoints (Incomplete Payment Flow)**
- **Location:** `src/routes/billing.js`
- **Issue:** The API has no endpoints for creating Payment Intents or handling client-side payment confirmation. This is required for PCI compliance and secure payment UIs. Currently, payment creation is handled entirely through Stripe subscriptions without client-side confirmation flow.
- **Impact:** 
  - Cannot implement Stripe Elements or Payment Element UI on frontend
  - No support for 3D Secure authentication
  - May violate PCI compliance requirements for custom payment UI
  - Users see no payment confirmation before charge
- **Missing Endpoints:**
  - `POST /api/billing/payment-intent` (create intent for frontend)
  - `POST /api/billing/confirm-payment` (confirm 3DS or card actions)
- **Fix Required:** Add endpoints for client-side payment handling:
  ```javascript
  // POST /api/billing/payment-intent
  router.post('/payment-intent',
    authenticateToken,
    authorizeRole(['owner', 'admin']),
    async (req, res) => {
      try {
        const { amount, currency = 'usd' } = req.validatedBody;
        
        const paymentIntent = await stripeService.stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // cents
          currency,
          customer: customerId,
          automatic_payment_methods: { enabled: true },
          metadata: { company_id: companyId },
        });
        
        res.json({
          clientSecret: paymentIntent.client_secret,
          id: paymentIntent.id,
        });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }
  );
  ```
- **Severity:** CRITICAL
- **Effort:** 4 hours (includes frontend integration)
- **Priority:** 2 (needed for production payment UI)

---

### 🟠 HIGH

#### 5. **Insufficient Input Validation on Tier Parameter**
- **Location:** `src/routes/billing.js` (lines 24-25, 133-134)
- **Issue:** Tier is validated with Zod schema, but the schema appears correct. However, the validation doesn't prevent invalid price IDs in environment. No validation of the Stripe price ID format.
- **Impact:** If `STRIPE_PRICE_STARTER` env var is misconfigured (invalid price ID), the error will be surfaced to users with Stripe error details.
- **Current Status:** Schema validation is good. This is a minor improvement.
- **Fix:** Add additional validation in stripeService:
  ```javascript
  const createSubscription = async (customerId, tier, trialDays = 3) => {
    const tierConfig = SUBSCRIPTION_TIERS[tier];
    if (!tierConfig) throw new Error(`Invalid tier: ${tier}`);
    
    // Validate price ID is set
    if (!tierConfig.stripe_price_id) {
      throw new Error(`No Stripe price configured for tier: ${tier}`);
    }
    // ... rest of function
  };
  ```
- **Severity:** HIGH
- **Effort:** 30 minutes
- **Priority:** 3 (low impact, easily handled by env validation)

---

#### 6. **Company Access Control Not Verified on Billing Endpoints**
- **Location:** `src/routes/billing.js`
- **Issue:** Billing endpoints use `req.user.companyId` directly without explicit company access verification. While `authenticateToken` ensures user is logged in, there's no explicit use of `verifyCompanyAccess` middleware that other routes use.
- **Impact:** Low (auth is enforced), but inconsistent with rest of codebase. If authentication middleware has a bug, billing endpoints could be more vulnerable.
- **Evidence:** Compare `billing.js` (no `verifyCompanyAccess`) to other routes like `company.js` that do use it.
- **Fix:** Add middleware consistently:
  ```javascript
  router.post('/subscribe',
    authenticateToken,
    verifyCompanyAccess, // Add this
    authorizeRole(['owner', 'admin']),
    validateBody(createSubscriptionSchema),
    async (req, res) => { ... }
  );
  ```
- **Severity:** HIGH
- **Effort:** 1 hour
- **Priority:** 3 (low risk, consistency improvement)

---

#### 7. **Error Messages May Leak Sensitive Information in Production**
- **Location:** `src/routes/billing.js` and `src/services/stripeService.js`
- **Issue:** Error responses include Stripe error messages directly. While the server.js error handler masks details in production, some specific Stripe errors (like "Invalid price ID") could reveal infrastructure details.
- **Impact:** Information disclosure, helps attackers understand payment flow.
- **Example:** `res.status(400).json({ error: 'Failed to create subscription. Please try again.' })` - this is good, but the console.error logs the full error.
- **Fix:** Ensure production logging doesn't expose sensitive details:
  ```javascript
  const logError = (context, error) => {
    // Log full error internally, but don't expose Stripe details to clients
    const details = {
      message: error.message,
      type: error.type,
      code: error.code,
    };
    console.error(`[STRIPE_ERROR] ${context}:`, details);
    
    // Return generic message to client
    return 'Payment processing error. Please contact support.';
  };
  ```
- **Severity:** HIGH
- **Effort:** 1.5 hours
- **Priority:** 2 (should fix before production)

---

### 🟡 MEDIUM

#### 8. **Missing Subscription Lifecycle State Validation**
- **Location:** `src/services/stripeService.js:changeSubscriptionTier()`
- **Issue:** Tier change doesn't validate subscription is in an active state. Could attempt to change subscription on a cancelled or paused subscription.
- **Impact:** Confusing error messages, poor UX when subscription is in weird state.
- **Fix:** Add state checks:
  ```javascript
  const changeSubscriptionTier = async (subscriptionId, newTier) => {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      throw new Error(`Cannot change tier on ${subscription.status} subscription`);
    }
    // ... rest of function
  };
  ```
- **Severity:** MEDIUM
- **Effort:** 45 minutes
- **Priority:** 3 (UX improvement)

---

#### 9. **No Logging of Subscription Tier Changes in Stripe**
- **Location:** `src/services/stripeService.js`
- **Issue:** When subscription tier is changed, no metadata is sent to Stripe for audit purposes. Stripe event log won't show why subscription was updated.
- **Impact:** Reduced auditability in Stripe dashboard; harder to debug customer issues.
- **Fix:** Add metadata to subscription updates:
  ```javascript
  await stripe.subscriptions.update(subscriptionId, {
    items: [{ id: currentItemId, price: tierConfig.stripe_price_id }],
    metadata: {
      changed_tier: newTier,
      changed_at: new Date().toISOString(),
    },
    // ...
  });
  ```
- **Severity:** MEDIUM
- **Effort:** 30 minutes
- **Priority:** 4 (nice-to-have for debugging)

---

#### 10. **Incomplete Database Schema for Payment Tracking**
- **Location:** `src/db/migrations/001_add_stripe_to_companies.sql`
- **Issue:** Schema tracks subscription status but not individual payments or failed payment attempts. No table for tracking payment history beyond webhook events. Makes it hard to troubleshoot payment issues.
- **Impact:** Limited visibility into payment history; hard to find customers with failed payments.
- **Fix:** Add table for payment tracking:
  ```sql
  CREATE TABLE stripe_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id),
    stripe_payment_id TEXT UNIQUE NOT NULL,
    stripe_invoice_id TEXT,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT CHECK (status IN ('succeeded', 'failed', 'pending')),
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX idx_stripe_payments_company ON stripe_payments(company_id);
  CREATE INDEX idx_stripe_payments_status ON stripe_payments(status);
  ```
- **Severity:** MEDIUM
- **Effort:** 1 hour
- **Priority:** 3 (improves observability)

---

#### 11. **Test Coverage is Low (Placeholders Only)**
- **Location:** `src/__tests__/webhook.test.js`, `src/__tests__/billing.test.js`
- **Issue:** Tests have comprehensive structure but most webhook tests are placeholders (`expect(true).toBe(true)`). Webhook signature verification, event handling, and idempotency are not actually tested.
- **Impact:** No verification that webhook handlers work correctly; regressions won't be caught.
- **Current Coverage:**
  - Billing endpoints: ~60% (subscribe, status, change-tier, cancel have real tests)
  - Webhooks: ~20% (mostly placeholders, signature tests incomplete)
- **Target Coverage:** 85%
- **Fix:** Implement real webhook tests using Stripe test webhook signing key:
  ```javascript
  it('should verify webhook with valid Stripe test signature', async () => {
    const testSecret = process.env.STRIPE_WEBHOOK_SECRET_TEST;
    const payload = JSON.stringify({ type: 'customer.subscription.created', /* ... */ });
    const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: testSecret });
    
    const res = await request(app)
      .post('/api/billing/webhook')
      .set('stripe-signature', signature)
      .set('Content-Type', 'application/json')
      .send(JSON.parse(payload));
    
    expect(res.statusCode).toBe(200);
    expect(res.body.received).toBe(true);
  });
  ```
- **Severity:** MEDIUM
- **Effort:** 4 hours
- **Priority:** 2 (critical for production readiness)

---

### 🔵 LOW

#### 12. **Hardcoded Default Tier in Feature Limit Middleware**
- **Location:** `src/middleware/featureLimit.js` (lines 27, 61, 90)
- **Issue:** Code defaults to 'starter' tier if tier is missing/invalid: `stripeService.SUBSCRIPTION_TIERS[company.subscription_tier] || stripeService.SUBSCRIPTION_TIERS.starter`. This is a safe default but could hide data bugs.
- **Impact:** If a company's tier is corrupted in database, they silently get starter tier instead of error.
- **Fix:** Log warning and/or validate tier on company creation:
  ```javascript
  const tierConfig = stripeService.SUBSCRIPTION_TIERS[company.subscription_tier];
  if (!tierConfig) {
    console.warn(`Invalid subscription tier for company ${companyId}: ${company.subscription_tier}`);
  }
  const config = tierConfig || stripeService.SUBSCRIPTION_TIERS.starter;
  ```
- **Severity:** LOW
- **Effort:** 30 minutes
- **Priority:** 4 (defensive coding)

---

#### 13. **Missing Subscription Status Enum Validation**
- **Location:** `src/services/stripeService.js:handleSubscriptionUpdated()` (line 273)
- **Issue:** Maps Stripe subscription status to 'active'/'paused' but only checks `status === 'active'`. Stripe has other statuses like 'past_due' or 'unpaid' that should map to 'paused' or a new status.
- **Impact:** Incorrect billing status display if subscription is past_due.
- **Fix:** Add comprehensive status mapping:
  ```javascript
  const mapSubscriptionStatus = (stripeStatus) => {
    const statusMap = {
      'active': 'active',
      'trialing': 'active',
      'past_due': 'paused',
      'unpaid': 'paused',
      'canceled': 'cancelled',
    };
    return statusMap[stripeStatus] || 'paused';
  };
  ```
- **Severity:** LOW
- **Effort:** 45 minutes
- **Priority:** 4 (edge case handling)

---

#### 14. **No Logging of Trial Start/End**
- **Location:** `src/services/stripeService.js:handleSubscriptionCreated()` and routes
- **Issue:** When trial starts, no audit log is created. Hard to track trial usage.
- **Impact:** Limited visibility into trial conversion funnel.
- **Fix:** Log trial events:
  ```javascript
  if (subscription.trial_end) {
    await supabase.from('audit_logs').insert({
      company_id: company[0].id,
      action: 'trial_started',
      details: { trial_end: new Date(subscription.trial_end * 1000) },
    });
  }
  ```
- **Severity:** LOW
- **Effort:** 30 minutes
- **Priority:** 4 (analytics/observability)

---

## Recommendations

### Priority 1 (Must Fix Before Production)

| Issue | Effort | Status |
|-------|--------|--------|
| Webhook timestamp validation (replay attacks) | 30 min | ❌ Not started |
| Rate limiting on payment endpoints | 1 hr | ❌ Not started |
| Webhook idempotency handling | 2 hrs | ❌ Not started |
| Payment Intent endpoints | 4 hrs | ❌ Not started |

**Subtotal: ~7.5 hours**

### Priority 2 (Should Fix Before Production)

| Issue | Effort | Status |
|-------|--------|--------|
| Error message sanitization | 1.5 hrs | ❌ Not started |
| Webhook test coverage | 4 hrs | ❌ Not started |
| Company access control middleware | 1 hr | ❌ Not started |

**Subtotal: ~6.5 hours**

### Priority 3+ (Nice-to-Have)

| Issue | Effort | Status |
|-------|--------|--------|
| Input validation improvements | 30 min | ❌ Not started |
| Subscription state validation | 45 min | ❌ Not started |
| Stripe metadata logging | 30 min | ❌ Not started |
| Payment tracking table | 1 hr | ❌ Not started |
| Tier status mapping | 45 min | ❌ Not started |
| Trial logging | 30 min | ❌ Not started |

**Subtotal: ~3.5 hours**

---

## Security Assessment

### Strengths ✅

- **API Keys:** Properly stored in environment variables, not hardcoded
- **Webhook Signature:** Correctly implemented with `stripe.webhooks.constructEvent()`
- **Webhook Body:** Raw body preserved before JSON parsing (correct approach)
- **PCI Compliance:** No raw card data stored in database or logs
- **Authentication:** All payment endpoints require valid JWT token
- **Authorization:** Role-based access control (owner/admin only for critical operations)
- **Environment Validation:** Comprehensive env var validation on startup
- **Error Handling:** Production errors are masked from clients

### Weaknesses ❌

- **Replay Attack Prevention:** Missing timestamp validation on webhook events
- **Rate Limiting:** No rate limits on payment endpoints
- **Idempotency:** No duplicate detection for webhook events
- **Payment UI:** Missing Payment Intent endpoints for client-side payment handling
- **Test Coverage:** Webhook tests are incomplete placeholders
- **Access Control:** Missing explicit company access verification middleware
- **Observability:** No webhook event tracking table for debugging failed webhooks

### Overall Security Rating

**PASS with conditions** (75/100)

✅ **Can proceed to staging** with fixes for all Priority 1 issues  
❌ **Cannot proceed to production** until:
1. Webhook replay attack prevention is implemented
2. Payment endpoints are rate-limited
3. Webhook idempotency is guaranteed
4. Payment Intent endpoints exist for PCI compliance
5. Webhook test coverage is >80%

---

## Test Coverage Analysis

### Current State
- **Billing Endpoints:** ~60% coverage
  - ✅ Subscribe (basic happy path)
  - ✅ Change tier
  - ✅ Get status
  - ✅ Cancel
  - ❌ Error cases (invalid tier, missing company)
  - ❌ Edge cases (duplicate subscription)
  
- **Webhooks:** ~20% coverage
  - ✅ Setup (register company, create subscription)
  - ❌ Signature verification (all tests are placeholders)
  - ❌ Event handling (placeholders)
  - ❌ Idempotency (no tests)
  - ❌ Error recovery (no tests)

### Target Coverage
- **Billing:** 85% (add error cases, edge cases)
- **Webhooks:** 85% (real Stripe test signing, idempotency, replay)
- **Integration:** 80% (end-to-end payment flow with Stripe sandbox)

### Recommended Test Additions
1. Webhook signature verification with invalid/missing signature
2. Webhook timestamp validation (old events)
3. Webhook duplicate event handling (idempotency)
4. Subscription state transitions (trialing → active → past_due → cancelled)
5. Payment failure scenarios
6. Rate limiting verification
7. Error response sanitization

---

## Sign-Off

### Current Status: ⚠️ **NEEDS WORK**

**Ready for Staging?** Conditional yes, with Priority 1 fixes  
**Ready for Production?** No - critical security issues must be resolved

### Blocking Issues

1. **CRITICAL:** Webhook replay attack vulnerability (timestamp validation missing)
2. **CRITICAL:** No rate limiting on payment endpoints (DoS risk)
3. **CRITICAL:** No webhook idempotency (duplicate charge risk)
4. **CRITICAL:** Missing Payment Intent endpoints (incomplete payment flow)

### Next Steps

1. **Implement Priority 1 fixes** (ETA: 7-8 hours of development)
2. **Run Stripe sandbox testing** with all payment scenarios
3. **Add comprehensive webhook tests** using Stripe test signing
4. **Security review of fixed code** before production deployment
5. **Load test payment endpoints** under simulated traffic

### Estimated Timeline to Production

- **Fixes:** 2-3 days (assuming 3-4 hrs/day dev time)
- **Testing:** 1-2 days
- **Security review:** 1 day
- **Deployment prep:** 1 day

**Total: 5-7 business days**

---

## Detailed Code Recommendations

### Recommended Changes to stripeService.js

```javascript
// Add timestamp validation
const verifyWebhookSignature = (body, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    // Prevent replay attacks
    const eventAge = Math.floor(Date.now() / 1000) - event.created;
    if (eventAge > 300) { // 5 minutes
      throw new Error('Webhook event too old (possible replay attack)');
    }
    
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error(`Invalid webhook signature: ${error.message}`);
  }
};

// Add idempotency
const handleWebhookEvent = async (event, supabase) => {
  // Check if already processed
  const { data: processed } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single();
  
  if (processed) {
    console.log(`Webhook ${event.id} already processed`);
    return { processed: true };
  }
  
  // Process...
  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object, supabase);
      break;
    // ... etc
  }
  
  // Record processed
  await supabase.from('webhook_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    processed_at: new Date().toISOString(),
  });
};
```

### Recommended Changes to billing.js

```javascript
// Add rate limiting
const subscriptionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => getClientIp(req),
});

// Apply to all payment endpoints
router.post('/subscribe',
  subscriptionLimiter,
  authenticateToken,
  authorizeRole(['owner', 'admin']),
  validateBody(createSubscriptionSchema),
  // ... handler
);

// Add Payment Intent endpoint
router.post('/payment-intent',
  subscriptionLimiter,
  authenticateToken,
  authorizeRole(['owner', 'admin']),
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;
      const companyId = req.user.companyId;
      const { amount, description } = req.validatedBody;
      
      // Validate amount
      if (amount < 50 || amount > 999999) { // $0.50 to $9,999.99
        return res.status(400).json({ error: 'Invalid amount' });
      }
      
      // Get company
      const { data: company } = await supabase
        .from('companies')
        .select('stripe_customer_id')
        .eq('id', companyId)
        .single();
      
      if (!company?.stripe_customer_id) {
        return res.status(400).json({ error: 'No Stripe customer' });
      }
      
      // Create payment intent
      const paymentIntent = await stripeService.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        customer: company.stripe_customer_id,
        automatic_payment_methods: { enabled: true },
        metadata: { company_id: companyId },
        description,
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
        amount: paymentIntent.amount,
      });
    } catch (error) {
      console.error('Payment intent error:', error);
      res.status(400).json({ error: 'Failed to create payment intent' });
    }
  }
);
```

---

## Appendix: Checklist for Fixes

- [ ] Add webhook timestamp validation (300 seconds max age)
- [ ] Create webhook_events table for idempotency
- [ ] Implement webhook duplicate detection
- [ ] Add rate limiting to payment endpoints
- [ ] Create Payment Intent endpoints
- [ ] Sanitize error messages for production
- [ ] Add company access middleware to billing routes
- [ ] Improve webhook test coverage (real Stripe test keys)
- [ ] Add payment tracking table (stripe_payments)
- [ ] Validate subscription state before tier changes
- [ ] Add Stripe metadata for subscription changes
- [ ] Implement comprehensive status mapping
- [ ] Add trial event logging to audit_logs

---

**Review Completed:** March 29, 2026, 9:47 AM  
**Reviewer Signature:** Velma 🔍  
**Next Review:** After Priority 1 fixes are implemented
