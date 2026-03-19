# Stripe Billing Integration — Setup & Testing Guide

## Overview

WorkSafeAI now includes complete Stripe subscription billing with three tiers: Starter, Pro, and Enterprise. This document covers the implementation, setup, testing, and deployment.

---

## Part 1: Stripe Account Setup

### Prerequisites
- Stripe account (https://dashboard.stripe.com)
- Stripe CLI for webhook testing (optional but recommended)
- Test mode enabled (default)

### Step 1: Create Products in Stripe Dashboard

1. Go to **Products** → **+ Add Product**
2. Create three products:

#### Product 1: WorkSafeAI Starter
- **Name:** WorkSafeAI Starter
- **Description:** For small teams getting started with JTSA assessments
- **Price:** $29.99/month
- **Billing Interval:** Monthly
- **Recurring:** Enabled
- Copy the **Price ID** (format: `price_1XXXxxxx`)

#### Product 2: WorkSafeAI Pro
- **Name:** WorkSafeAI Pro
- **Description:** For growing teams with advanced safety features
- **Price:** $79.99/month
- **Billing Interval:** Monthly
- **Recurring:** Enabled
- Copy the **Price ID**

#### Product 3: WorkSafeAI Enterprise
- **Name:** WorkSafeAI Enterprise
- **Description:** Custom enterprise solution for large organizations
- **Price:** Custom (don't set a price yet; requires manual contact)
- **Billing Interval:** Monthly
- **Recurring:** Enabled
- Copy the **Price ID**

### Step 2: Set Up API Keys

1. Go to **Developers** → **API Keys**
2. You'll see two keys:
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)

3. Copy the **Secret Key** — you'll need it for the backend
4. Copy the **Publishable Key** — you'll need it for the frontend (not used in current implementation)

### Step 3: Set Up Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **+ Add Endpoint**
3. **Endpoint URL:** `https://worksafeai-api.elevationaiwork.com/api/billing/webhook`
4. **Events to listen for:** Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add Endpoint**
6. Copy the **Signing Secret** (format: `whsec_test_...`)

---

## Part 2: Backend Configuration

### Environment Variables

Add these to your backend `.env` (Vercel projects):

```env
# Stripe Test Mode Keys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_WEBHOOK_SECRET_HERE

# Stripe Price IDs (from products created above)
STRIPE_PRICE_STARTER=price_1XXXxxxx
STRIPE_PRICE_PRO=price_1YYYyyyy
STRIPE_PRICE_ENTERPRISE=price_1ZZZzzzz
```

### Database Migrations

The following tables/columns are required. Run these SQL migrations in Supabase:

```sql
-- Migration 001: Add Stripe fields to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' 
  CHECK (subscription_status IN ('trial', 'active', 'paused', 'cancelled'));
ALTER TABLE companies ADD COLUMN IF NOT EXISTS billing_period_end TIMESTAMP;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_email TEXT;

CREATE INDEX IF NOT EXISTS idx_companies_stripe_customer_id ON companies(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_companies_stripe_subscription_id ON companies(stripe_subscription_id);

-- Migration 002: Add subscription tier tracking
ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'starter' 
  CHECK (subscription_tier IN ('starter', 'pro', 'enterprise'));

CREATE INDEX IF NOT EXISTS idx_companies_subscription_tier ON companies(subscription_tier);
```

---

## Part 3: API Endpoints

### Billing Endpoints

#### POST /api/billing/subscribe
Create a subscription for a company.

**Request:**
```json
{
  "tier": "starter" | "pro" | "enterprise"
}
```

**Response:**
```json
{
  "subscription_id": "sub_1XXXxxxx",
  "status": "trialing",
  "current_period_end": "2026-04-19T19:39:00Z",
  "trial_end": "2026-03-22T19:39:00Z",
  "message": "3-day free trial activated. Payment required after trial period."
}
```

**Status Codes:**
- 200: Success
- 400: Invalid tier, company already has subscription
- 401: Not authenticated
- 403: Not authorized (must be owner/admin)

#### GET /api/billing/status
Get current billing status and tier limits.

**Response:**
```json
{
  "current_tier": "starter",
  "status": "active",
  "billing_period_end": "2026-04-19T19:39:00Z",
  "tier_limits": {
    "max_employees": 10,
    "max_projects": 5
  },
  "stripe_subscription_id": "sub_1XXXxxxx",
  "subscription_details": {
    "stripe_id": "sub_1XXXxxxx",
    "status": "active",
    "current_period_end": "2026-04-19T19:39:00Z",
    "trial_end": null,
    "cancel_at_period_end": false
  }
}
```

#### POST /api/billing/change-tier
Upgrade or change subscription tier.

**Request:**
```json
{
  "tier": "pro" | "enterprise"
}
```

**Response:**
```json
{
  "subscription_id": "sub_1XXXxxxx",
  "new_tier": "pro",
  "status": "active",
  "message": "Subscription tier updated successfully"
}
```

#### POST /api/billing/cancel
Cancel subscription at end of billing period.

**Response:**
```json
{
  "message": "Subscription cancelled",
  "status": "active",
  "cancel_at_period_end": true
}
```

---

## Part 4: Feature Limits

Feature limits are enforced via middleware. Limits per tier:

| Feature | Starter | Pro | Enterprise |
|---------|---------|-----|------------|
| Max Employees | 10 | 50 | Unlimited |
| Max Projects | 5 | Unlimited | Unlimited |
| JTSAs/Month | 10 | 500 | Unlimited |

### Implementing Limits

Feature limits are checked via middleware before resource creation:

1. **Employee Limit:** Applied when creating user accounts
2. **Project Limit:** Applied in `POST /api/companies/:cid/projects`
3. **JTSA Limit:** Applied in `POST /api/companies/:cid/jtsas`

When a limit is exceeded, the endpoint returns 403 Forbidden:

```json
{
  "error": "Employee limit reached for starter tier",
  "current": 10,
  "limit": 10,
  "message": "Upgrade to Pro or Enterprise to add more employees. Current: 10/10"
}
```

---

## Part 5: Webhook Handler

The webhook endpoint (`POST /api/billing/webhook`) handles Stripe events:

### Event Types Handled

- `customer.subscription.created` — Updates company subscription_tier and status
- `customer.subscription.updated` — Updates billing_period_end and status
- `customer.subscription.deleted` — Clears subscription and resets status
- `invoice.payment_succeeded` — Logs payment to audit_logs
- `invoice.payment_failed` — Logs payment failure to audit_logs

### Example Webhook Flow

1. Customer upgrades from Starter to Pro
2. Stripe sends `customer.subscription.updated` event
3. Webhook verifies signature and finds company by stripe_customer_id
4. Updates company record with new tier and period end
5. Logs to audit_logs for compliance
6. Returns 200 OK to acknowledge receipt

---

## Part 6: Testing

### Test Stripe Cards

Use these test card numbers in Stripe test mode. All require:
- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)

| Card Number | Result | Use Case |
|-------------|--------|----------|
| 4242 4242 4242 4242 | Success | Valid payment |
| 4000 0000 0000 0002 | Decline | Card declined |
| 4000 0025 0000 3155 | 3D Secure | Authentication required |
| 5555 5555 5555 4444 | Success | Mastercard test |
| 3782 822463 10005 | Success | American Express |

### Manual Testing Steps

#### 1. Test Subscription Creation (Starter Tier)

```bash
curl -X POST https://worksafeai-api.elevationaiwork.com/api/billing/subscribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "starter"}'
```

Expected response:
- Status: 200
- Contains `subscription_id`
- Contains `trial_end` (3 days from now)
- Status: "trialing"

#### 2. Test Feature Limits

After subscribing to Starter tier (10 employee limit):

```bash
# Try to add 11th employee (should fail)
curl -X POST https://worksafeai-api.elevationaiwork.com/api/companies/:cid/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "user11@test.com", "role": "member"}'
```

Expected response:
- Status: 403
- Error message about employee limit

#### 3. Test Webhook Receipt

Using Stripe CLI (optional but recommended):

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your account
stripe login

# Forward webhooks to your local API
stripe listen --forward-to localhost:3000/api/billing/webhook

# In another terminal, trigger test event
stripe trigger customer.subscription.created
```

#### 4. Test Payment Success

```bash
# Use test card 4242 4242 4242 4242
# Upgrade subscription
curl -X POST https://worksafeai-api.elevationaiwork.com/api/billing/change-tier \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "pro"}'
```

Verify in Stripe Dashboard:
- New subscription created
- Status: "active"
- Items: Pro tier pricing

#### 5. Test Payment Failure

```bash
# Use test card 4000 0000 0000 0002 (declined)
# Try to subscribe
curl -X POST https://worksafeai-api.elevationaiwork.com/api/billing/subscribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "pro"}'
```

Expected: Payment fails, webhook sends `invoice.payment_failed` event

---

## Part 7: Audit Logging

All billing events are logged to `audit_logs` table:

| Action | Details Logged | Event Trigger |
|--------|---|---|
| `subscription_created` | subscription_id, tier | POST /api/billing/subscribe |
| `subscription_tier_changed` | old_tier, new_tier, subscription_id | POST /api/billing/change-tier |
| `subscription_cancelled` | subscription_id | POST /api/billing/cancel |
| `payment_succeeded` | invoice_id, subscription_id | Webhook: invoice.payment_succeeded |
| `payment_failed` | invoice_id, subscription_id | Webhook: invoice.payment_failed |

Query audit logs:

```sql
SELECT * FROM audit_logs 
WHERE action LIKE 'subscription%' OR action LIKE 'payment%'
ORDER BY timestamp DESC;
```

---

## Part 8: Deployment Checklist

### Before Going Live

- [ ] Create all three products in Stripe (Starter, Pro, Enterprise)
- [ ] Add Price IDs to Vercel environment variables
- [ ] Add Secret Key and Webhook Secret to Vercel
- [ ] Run database migrations in Supabase
- [ ] Deploy backend with billing routes
- [ ] Deploy frontend with Pricing and Billing pages
- [ ] Configure webhook endpoint in Stripe
- [ ] Test all 5 test scenarios above
- [ ] Verify audit logs are being written
- [ ] Test tier limit enforcement
- [ ] Test all card scenarios (success, decline, 3DS)

### Switching to Live Mode

1. Create products in Stripe **Live** mode
2. Get live API keys (starts with `sk_live_` and `pk_live_`)
3. Update environment variables to live keys
4. Update webhook endpoint to live URL
5. Test with live card (use small amount like $0.50)
6. Redeploy backend with live config
7. Monitor dashboard for successful transactions

---

## Part 9: Troubleshooting

### Webhook Not Receiving Events

**Symptom:** Subscriptions created via API but company subscription_tier not updated.

**Check:**
1. Verify webhook URL is publicly accessible
2. Verify Signing Secret matches `STRIPE_WEBHOOK_SECRET` env var
3. Check server logs for webhook errors: `console.error('Webhook error':`
4. Use Stripe Dashboard → Webhooks → endpoint → Event Deliveries to see failures
5. Ensure raw body is being passed to webhook (not parsed JSON)

### Payment Declined

**Symptom:** Subscription creation returns 400 error.

**Check:**
1. Verify test card number in Stripe dashboard docs
2. Check that Expiry is in future (not expired)
3. Verify Stripe API key is correct
4. Check server logs for Stripe error details
5. Contact Stripe support if card type not supported

### Feature Limits Not Enforced

**Symptom:** Users can exceed tier limits.

**Check:**
1. Verify middleware is registered on create endpoints
2. Verify SUBSCRIPTION_TIERS in stripeService.js has correct limits
3. Check that query counting employees/projects is correct
4. Verify company subscription_tier is being set correctly
5. Check audit logs to see what tier company is on

---

## Summary

WorkSafeAI Stripe integration is now complete with:

✅ Three subscription tiers (Starter, Pro, Enterprise)  
✅ Full API endpoints for subscription management  
✅ Feature limit enforcement per tier  
✅ Secure webhook handling for payment events  
✅ Comprehensive audit logging  
✅ Pricing page for public viewing  
✅ Billing dashboard for subscription management  
✅ Test mode for safe testing  

Next: Deploy to production and monitor transaction volume!
