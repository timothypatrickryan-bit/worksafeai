const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { verifyCompanyAccess } = require('../middleware/companyAccess');
const { validateBody } = require('../middleware/validation');
const { z } = require('zod');
const stripeService = require('../services/stripeService');

// Schemas
const createSubscriptionSchema = z.object({
  tier: z.enum(['starter', 'pro', 'enterprise']),
});

const changeSubscriptionSchema = z.object({
  tier: z.enum(['starter', 'pro', 'enterprise']),
});

// POST /api/billing/subscribe - Create subscription for company
router.post('/subscribe',
  authenticateToken,
  authorizeRole(['owner', 'admin']),
  verifyCompanyAccess,
  validateBody(createSubscriptionSchema),
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;
      const companyId = req.user.companyId;
      const { tier } = req.validatedBody;

      // Get company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('stripe_customer_id, stripe_subscription_id')
        .eq('id', companyId)
        .single();

      if (companyError || !company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // If already subscribed, return error
      if (company.stripe_subscription_id) {
        return res.status(400).json({ error: 'Company already has an active subscription' });
      }

      let customerId = company.stripe_customer_id;

      // Create Stripe customer if doesn't exist
      if (!customerId) {
        const { data: companyDetails } = await supabase
          .from('companies')
          .select('name, contact_email')
          .eq('id', companyId)
          .single();

        const stripeCustomer = await stripeService.createCustomer(companyDetails);
        customerId = stripeCustomer.id;

        // Save customer ID
        await supabase
          .from('companies')
          .update({ stripe_customer_id: customerId })
          .eq('id', companyId);
      }

      // Create subscription (3-day trial)
      const subscription = await stripeService.createSubscription(customerId, tier, 3);

      // Log audit
      await supabase
        .from('audit_logs')
        .insert({
          company_id: companyId,
          user_id: req.user.id,
          action: 'subscription_created',
          resource_type: 'billing',
          details: { subscription_id: subscription.id, tier },
          timestamp: new Date().toISOString(),
        });

      res.json({
        subscription_id: subscription.id,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
        trial_end: subscription.trial_end,
        message: '3-day free trial activated. Payment required after trial period.',
      });
    } catch (error) {
      console.error('Subscription creation error:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/billing/change-tier - Change subscription tier
router.post('/change-tier',
  authenticateToken,
  authorizeRole(['owner', 'admin']),
  verifyCompanyAccess,
  validateBody(changeSubscriptionSchema),
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;
      const companyId = req.user.companyId;
      const { tier } = req.validatedBody;

      // Get subscription
      const { data: company, error } = await supabase
        .from('companies')
        .select('stripe_subscription_id, subscription_tier')
        .eq('id', companyId)
        .single();

      if (error || !company?.stripe_subscription_id) {
        return res.status(400).json({ error: 'No active subscription found' });
      }

      // Prevent downgrade (for MVP)
      const tierOrder = { starter: 0, pro: 1, enterprise: 2 };
      if (tierOrder[tier] < tierOrder[company.subscription_tier]) {
        return res.status(400).json({ error: 'Downgrade not supported during trial period' });
      }

      // Update subscription
      const updated = await stripeService.changeSubscriptionTier(
        company.stripe_subscription_id,
        tier
      );

      // Log audit
      await supabase
        .from('audit_logs')
        .insert({
          company_id: companyId,
          user_id: req.user.id,
          action: 'subscription_tier_changed',
          resource_type: 'billing',
          details: {
            old_tier: company.subscription_tier,
            new_tier: tier,
            subscription_id: updated.id,
          },
          timestamp: new Date().toISOString(),
        });

      res.json({
        subscription_id: updated.id,
        new_tier: tier,
        status: updated.status,
        message: 'Subscription tier updated successfully',
      });
    } catch (error) {
      console.error('Tier change error:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// GET /api/billing/status - Get billing status
router.get('/status',
  authenticateToken,
  verifyCompanyAccess,
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;
      const companyId = req.user.companyId;

      const { data: company, error } = await supabase
        .from('companies')
        .select('subscription_tier, subscription_status, billing_period_end, stripe_subscription_id')
        .eq('id', companyId)
        .single();

      if (error) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // If has subscription, get details
      let subscriptionDetails = null;
      if (company.stripe_subscription_id) {
        subscriptionDetails = await stripeService.getSubscription(company.stripe_subscription_id);
      }

      const tierConfig = stripeService.SUBSCRIPTION_TIERS[company.subscription_tier] || {};

      res.json({
        current_tier: company.subscription_tier,
        status: company.subscription_status,
        billing_period_end: company.billing_period_end,
        tier_limits: {
          max_employees: tierConfig.max_employees,
          max_projects: tierConfig.max_projects,
        },
        stripe_subscription_id: company.stripe_subscription_id,
        subscription_details: subscriptionDetails ? {
          stripe_id: subscriptionDetails.id,
          status: subscriptionDetails.status,
          current_period_end: subscriptionDetails.current_period_end,
          trial_end: subscriptionDetails.trial_end,
          cancel_at_period_end: subscriptionDetails.cancel_at_period_end,
        } : null,
      });
    } catch (error) {
      console.error('Get billing status error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/billing/cancel - Cancel subscription
router.post('/cancel',
  authenticateToken,
  authorizeRole(['owner']),
  verifyCompanyAccess,
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;
      const companyId = req.user.companyId;

      const { data: company, error } = await supabase
        .from('companies')
        .select('stripe_subscription_id')
        .eq('id', companyId)
        .single();

      if (error || !company?.stripe_subscription_id) {
        return res.status(400).json({ error: 'No active subscription found' });
      }

      const cancelled = await stripeService.cancelSubscription(company.stripe_subscription_id);

      // Log audit
      await supabase
        .from('audit_logs')
        .insert({
          company_id: companyId,
          user_id: req.user.id,
          action: 'subscription_cancelled',
          resource_type: 'billing',
          details: { subscription_id: cancelled.id },
          timestamp: new Date().toISOString(),
        });

      res.json({
        message: 'Subscription cancelled',
        status: cancelled.status,
        cancel_at_period_end: cancelled.cancel_at_period_end,
      });
    } catch (error) {
      console.error('Cancellation error:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/billing/webhook - Stripe webhook handler
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];

    try {
      const event = stripeService.verifyWebhookSignature(req.body, signature);
      const supabase = req.app.locals.supabase;

      // Handle event
      await stripeService.handleWebhookEvent(event, supabase);

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

module.exports = router;
