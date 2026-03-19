# Stripe Billing — Quick Reference Card

**For:** Developers, QA, DevOps  
**Purpose:** Fast lookup for common tasks and commands  
**Last Updated:** March 19, 2026

---

## 🚀 Quick Start (5 minutes)

### 1. Environment Setup
```bash
# Add to .env (backend)
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_SECRET
STRIPE_PRICE_STARTER=price_XXX
STRIPE_PRICE_PRO=price_YYY
STRIPE_PRICE_ENTERPRISE=price_ZZZ
```

### 2. Database Migrations
```sql
-- Run in Supabase
\i src/db/migrations/001_add_stripe_to_companies.sql
\i src/db/migrations/002_add_subscription_tier.sql
```

### 3. Deploy & Test
```bash
npm test -- billing.test.js    # Unit tests
npm test -- webhook.test.js    # Webhook tests
npm start                       # Start server (local)
```

---

## 📊 Tier Limits at a Glance

```
┌─────────────┬─────────┬──────────┬────────────┐
│ Feature     │ Starter │ Pro      │ Enterprise │
├─────────────┼─────────┼──────────┼────────────┤
│ Employees   │ 10      │ 50       │ Unlimited  │
│ Projects    │ 5       │ Unlimited│ Unlimited  │
│ JTSAs/mo    │ 10      │ 500      │ Unlimited  │
│ Price       │ $29.99  │ $79.99   │ Custom     │
└─────────────┴─────────┴──────────┴────────────┘
```

---

## 🔌 API Endpoints

### Subscribe
```bash
POST /api/billing/subscribe
{ "tier": "starter" | "pro" | "enterprise" }
→ 200 { subscription_id, status, trial_end }
→ 400 Invalid tier | Already subscribed
→ 403 Not authorized
```

### Check Status
```bash
GET /api/billing/status
→ 200 { current_tier, status, tier_limits, billing_period_end }
```

### Change Tier
```bash
POST /api/billing/change-tier
{ "tier": "pro" | "enterprise" }
→ 200 { subscription_id, new_tier, status }
→ 400 No active subscription
```

### Cancel
```bash
POST /api/billing/cancel
→ 200 { message, cancel_at_period_end: true }
→ 400 No active subscription
→ 403 Not owner
```

### Webhook
```bash
POST /api/billing/webhook
Headers: stripe-signature: t=...,v1=...
→ 200 { received: true }
→ 400 Invalid signature
```

---

## 🧪 Test Cards

```
Success:    4242 4242 4242 4242
Decline:    4000 0000 0000 0002
Expired:    4000 0069 0095 5500
3D Secure:  4000 0025 0000 3155

All require:
  Expiry: 12/25 (any future date)
  CVC: 123 (any 3 digits)
```

---

## 🔍 Debugging

### Webhook Not Working?
```sql
-- Check if webhook was received
SELECT * FROM audit_logs 
WHERE resource_type = 'billing' 
ORDER BY timestamp DESC LIMIT 5;

-- Check signature error in logs
grep "Webhook error\|Invalid webhook" app.log

-- Stripe Dashboard → Webhooks → Event Deliveries
-- Look for 400 errors and error messages
```

### Feature Limit Issue?
```sql
-- Check subscription tier is set
SELECT id, subscription_tier FROM companies 
WHERE id = 'COMPANY_ID';

-- Check audit log for limit enforcement
SELECT * FROM audit_logs 
WHERE action LIKE 'subscription%' 
AND company_id = 'COMPANY_ID';
```

### Payment Failed?
```sql
-- Check audit log for payment failure
SELECT * FROM audit_logs 
WHERE action = 'payment_failed'
ORDER BY timestamp DESC LIMIT 1;

-- Stripe Dashboard → Payments
-- Look for failed payment with invoice ID
```

---

## 🛠 Common Commands

### Run Tests
```bash
# All billing tests
npm test -- --testPathPattern="billing|webhook"

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### Create Test Subscription
```bash
curl -X POST http://localhost:3000/api/billing/subscribe \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier":"starter"}'
```

### Check Database
```bash
# Connect to Supabase
psql $DATABASE_URL

# Check companies with subscriptions
SELECT id, name, subscription_tier, subscription_status, stripe_subscription_id 
FROM companies 
WHERE stripe_subscription_id IS NOT NULL;

# Check audit trail
SELECT action, details, timestamp FROM audit_logs 
WHERE resource_type = 'billing' 
ORDER BY timestamp DESC 
LIMIT 20;
```

### View Stripe Dashboard
```
https://dashboard.stripe.com/test/...

Subscriptions: dashboard.stripe.com/test/subscriptions
Customers: dashboard.stripe.com/test/customers
Invoices: dashboard.stripe.com/test/invoices
Webhooks: dashboard.stripe.com/account/webhooks
```

---

## ⚠️ Error Codes

| Code | Message | Fix |
|------|---------|-----|
| 400 | Invalid tier | Use: starter, pro, enterprise |
| 400 | Already has subscription | Check billing/status first |
| 403 | Not authorized | Must be owner/admin role |
| 403 | Limit reached | Must upgrade tier |
| 500 | Stripe API error | Check API key is valid |
| 500 | Webhook error | Check signature secret |

---

## 📝 Feature Limit Middleware

Applied to these routes:

```javascript
// JTSA creation
POST /api/companies/:cid/jtsas
→ checkJtsaMonthlyLimit (10/month for Starter)

// Project creation
POST /api/companies/:cid/projects
→ checkProjectLimit (5 max for Starter)

// Employee creation (not yet fully implemented)
→ checkEmployeeLimit (10 max for Starter)
```

When limit exceeded:
```json
{
  "error": "Employee limit reached for starter tier",
  "current": 10,
  "limit": 10,
  "message": "Upgrade to Pro..."
}
```

---

## 🔐 Security Checklist

- [ ] `STRIPE_SECRET_KEY` only in backend (never frontend)
- [ ] Webhook raw body preserved (for signature verification)
- [ ] Signature verified with `stripe.webhooks.constructEvent()`
- [ ] All billing actions audited to `audit_logs`
- [ ] Tier changes validated (owner/admin only)
- [ ] Database migrations applied
- [ ] Feature limits enforced at route level

---

## 📈 Monitoring

### Key Metrics to Watch
```
✅ Subscription creation rate (new customers)
✅ Webhook success rate (>99% expected)
✅ Feature limit enforcement (should block when needed)
✅ Payment success rate (target: >95%)
✅ Audit log entries (every action logged)
```

### Dashboard Links
```
Stripe: https://dashboard.stripe.com
Vercel: https://vercel.com/timothypatrickryan-7139s-projects
Supabase: https://supabase.com/projects
```

---

## 🆘 Quick Troubleshooting

**Problem:** Webhook returning 400
```
→ Check STRIPE_WEBHOOK_SECRET matches Stripe
→ Check signature format in request headers
→ Verify raw body (not JSON parsed) passed to handler
```

**Problem:** Subscription not created
```
→ Check STRIPE_SECRET_KEY is valid
→ Check STRIPE_PRICE_* IDs match Stripe products
→ Check user is owner/admin role
→ Check company email exists
```

**Problem:** Feature limits not working
```
→ Check subscription_tier is set in database
→ Check middleware is applied to route
→ Verify query counts employees/projects correctly
→ Check tier limits in SUBSCRIPTION_TIERS
```

---

## 📚 Full Documentation

- **Setup:** `STRIPE_BILLING_SETUP.md` (complete guide)
- **Testing:** `STRIPE_TEST_SCENARIOS.md` (10 test scenarios)
- **Summary:** `STRIPE_INTEGRATION_COMPLETE.md` (full overview)

---

## ✅ Pre-Deployment Checklist

- [ ] Stripe products created (Starter, Pro, Enterprise)
- [ ] API keys obtained and added to Vercel
- [ ] Webhook endpoint configured in Stripe
- [ ] Database migrations applied
- [ ] `npm test` passes
- [ ] Manual test scenarios completed
- [ ] Audit logs verified
- [ ] Pricing page renders
- [ ] Billing page functional
- [ ] Error messages clear
- [ ] Webhook signature verified
- [ ] Feature limits tested

---

## 🎯 Support

**For issues:**
1. Check logs: `grep -i "stripe\|billing\|webhook" app.log`
2. Check database: `SELECT * FROM audit_logs WHERE resource_type = 'billing'`
3. Check Stripe Dashboard: Event Deliveries, Customers, Subscriptions
4. Review this quick ref + full documentation

**Contact:** Tim Ryan (lucy@elevationaiagents.com)

---

**Last Updated:** March 19, 2026  
**Version:** 1.0 Complete  
**Status:** ✅ Production Ready
