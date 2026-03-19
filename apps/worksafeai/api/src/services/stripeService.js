const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Stripe service — handle subscriptions, payments, webhooks
 */

const SUBSCRIPTION_TIERS = {
  starter: {
    stripe_price_id: process.env.STRIPE_PRICE_STARTER,
    max_employees: 10,
    max_projects: 5,
    max_jtsas_per_month: 10,
    cost_cents: 2999, // $29.99/month
    features: [
      'Up to 10 employees',
      'Up to 5 projects',
      '10 JTSAs per month',
      'Basic hazard assessment',
      'Community support',
    ],
  },
  pro: {
    stripe_price_id: process.env.STRIPE_PRICE_PRO,
    max_employees: 50,
    max_projects: -1, // unlimited
    max_jtsas_per_month: 500,
    cost_cents: 7999, // $79.99/month
    features: [
      'Up to 50 employees',
      'Unlimited projects',
      '500 JTSAs per month',
      'Advanced hazard assessment',
      'Custom risk profiles',
      'Priority email support',
      'API access',
    ],
  },
  enterprise: {
    stripe_price_id: process.env.STRIPE_PRICE_ENTERPRISE,
    max_employees: -1, // unlimited
    max_projects: -1,
    max_jtsas_per_month: -1, // unlimited
    cost_cents: null, // custom
    features: [
      'Unlimited employees',
      'Unlimited projects',
      'Unlimited JTSAs',
      'Advanced hazard assessment',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 phone & email support',
      'Custom SLA',
      'On-premise deployment option',
    ],
  },
};

/**
 * Create a Stripe customer for a company
 */
const createCustomer = async (company) => {
  try {
    const customer = await stripe.customers.create({
      email: company.contact_email,
      name: company.name,
      metadata: {
        company_id: company.id,
      },
    });
    return customer;
  } catch (error) {
    console.error('Stripe customer creation failed:', error);
    throw new Error(`Failed to create Stripe customer: ${error.message}`);
  }
};

/**
 * Create a subscription for a company
 */
const createSubscription = async (customerId, tier, trialDays = 3) => {
  try {
    const tierConfig = SUBSCRIPTION_TIERS[tier];
    if (!tierConfig) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    const subscriptionParams = {
      customer: customerId,
      items: [{ price: tierConfig.stripe_price_id }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    };

    // Add trial if specified
    if (trialDays > 0) {
      subscriptionParams.trial_period_days = trialDays;
    }

    const subscription = await stripe.subscriptions.create(subscriptionParams);
    return subscription;
  } catch (error) {
    console.error('Stripe subscription creation failed:', error);
    throw new Error(`Failed to create subscription: ${error.message}`);
  }
};

/**
 * Change subscription tier
 */
const changeSubscriptionTier = async (subscriptionId, newTier) => {
  try {
    const tierConfig = SUBSCRIPTION_TIERS[newTier];
    if (!tierConfig) {
      throw new Error(`Invalid tier: ${newTier}`);
    }

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentItemId = subscription.items.data[0].id;

    // Update the subscription
    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: currentItemId,
          price: tierConfig.stripe_price_id,
        },
      ],
      billing_cycle_anchor: 'now',
      proration_behavior: 'always_invoice',
    });

    return updated;
  } catch (error) {
    console.error('Stripe subscription update failed:', error);
    throw new Error(`Failed to update subscription: ${error.message}`);
  }
};

/**
 * Cancel subscription at end of current billing period (not immediately).
 * This preserves access through the period already paid for.
 * Pass { immediately: true } to cancel right now (e.g. for fraud/abuse).
 */
const cancelSubscription = async (subscriptionId, { immediately = false } = {}) => {
  try {
    let subscription;
    if (immediately) {
      // Hard cancel — revokes access now; use only for fraud/abuse cases
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    } else {
      // Soft cancel — subscription remains active until billing_period_end
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
    return subscription;
  } catch (error) {
    console.error('Stripe subscription cancellation failed:', error);
    throw new Error(`Failed to cancel subscription: ${error.message}`);
  }
};

/**
 * Get subscription details
 */
const getSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Stripe subscription retrieval failed:', error);
    throw new Error(`Failed to retrieve subscription: ${error.message}`);
  }
};

/**
 * Verify webhook signature and parse event
 */
const verifyWebhookSignature = (body, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error(`Invalid webhook signature: ${error.message}`);
  }
};

/**
 * Handle common webhook events
 */
const handleWebhookEvent = async (event, supabase) => {
  switch (event.type) {
    case 'customer.subscription.created':
      return await handleSubscriptionCreated(event.data.object, supabase);

    case 'customer.subscription.updated':
      return await handleSubscriptionUpdated(event.data.object, supabase);

    case 'customer.subscription.deleted':
      return await handleSubscriptionDeleted(event.data.object, supabase);

    case 'invoice.payment_succeeded':
      return await handleInvoicePaymentSucceeded(event.data.object, supabase);

    case 'invoice.payment_failed':
      return await handleInvoicePaymentFailed(event.data.object, supabase);

    default:
      console.log(`Unhandled event type: ${event.type}`);
      return null;
  }
};

/**
 * Internal webhook handlers
 */

const handleSubscriptionCreated = async (subscription, supabase) => {
  try {
    const { customer, id: stripe_subscription_id, current_period_end } = subscription;
    const priceId = subscription.items.data[0].price.id;
    const tier = Object.entries(SUBSCRIPTION_TIERS).find(([_, config]) => config.stripe_price_id === priceId)?.[0] || 'starter';

    // Find company by Stripe customer ID
    const { data: company, error } = await supabase
      .from('companies')
      .select('id')
      .eq('stripe_customer_id', customer);

    if (error || !company || company.length === 0) {
      console.error('Company not found for Stripe customer:', customer);
      return;
    }

    // Update company subscription
    await supabase
      .from('companies')
      .update({
        stripe_subscription_id,
        subscription_tier: tier,
        subscription_status: 'active',
        billing_period_end: new Date(current_period_end * 1000).toISOString(),
      })
      .eq('id', company[0].id);

    console.log(`Subscription created for company ${company[0].id}: ${tier}`);
  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error);
  }
};

const handleSubscriptionUpdated = async (subscription, supabase) => {
  try {
    const { customer, id: stripe_subscription_id, current_period_end, status } = subscription;
    const priceId = subscription.items.data[0].price.id;
    const tier = Object.entries(SUBSCRIPTION_TIERS).find(([_, config]) => config.stripe_price_id === priceId)?.[0] || 'starter';

    const { data: company, error } = await supabase
      .from('companies')
      .select('id')
      .eq('stripe_customer_id', customer);

    if (error || !company || company.length === 0) return;

    await supabase
      .from('companies')
      .update({
        subscription_tier: tier,
        subscription_status: status === 'active' ? 'active' : 'paused',
        billing_period_end: new Date(current_period_end * 1000).toISOString(),
      })
      .eq('id', company[0].id);

    console.log(`Subscription updated for company ${company[0].id}: ${status}`);
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error);
  }
};

const handleSubscriptionDeleted = async (subscription, supabase) => {
  try {
    const { customer } = subscription;

    const { data: company, error } = await supabase
      .from('companies')
      .select('id')
      .eq('stripe_customer_id', customer);

    if (error || !company || company.length === 0) return;

    await supabase
      .from('companies')
      .update({
        subscription_status: 'cancelled',
        stripe_subscription_id: null,
      })
      .eq('id', company[0].id);

    console.log(`Subscription cancelled for company ${company[0].id}`);
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error);
  }
};

const handleInvoicePaymentSucceeded = async (invoice, supabase) => {
  try {
    const { customer, subscription } = invoice;

    const { data: company, error } = await supabase
      .from('companies')
      .select('id')
      .eq('stripe_customer_id', customer);

    if (error || !company || company.length === 0) return;

    // Log payment in audit
    await supabase
      .from('audit_logs')
      .insert({
        company_id: company[0].id,
        action: 'payment_succeeded',
        resource_type: 'billing',
        details: { invoice_id: invoice.id, subscription_id: subscription },
        timestamp: new Date().toISOString(),
      });

    console.log(`Payment succeeded for company ${company[0].id}`);
  } catch (error) {
    console.error('Error in handleInvoicePaymentSucceeded:', error);
  }
};

const handleInvoicePaymentFailed = async (invoice, supabase) => {
  try {
    const { customer, subscription } = invoice;

    const { data: company, error } = await supabase
      .from('companies')
      .select('id')
      .eq('stripe_customer_id', customer);

    if (error || !company || company.length === 0) return;

    await supabase
      .from('audit_logs')
      .insert({
        company_id: company[0].id,
        action: 'payment_failed',
        resource_type: 'billing',
        details: { invoice_id: invoice.id, subscription_id: subscription },
        timestamp: new Date().toISOString(),
      });

    console.log(`Payment failed for company ${company[0].id}`);
  } catch (error) {
    console.error('Error in handleInvoicePaymentFailed:', error);
  }
};

module.exports = {
  stripe,
  SUBSCRIPTION_TIERS,
  createCustomer,
  createSubscription,
  changeSubscriptionTier,
  cancelSubscription,
  getSubscription,
  verifyWebhookSignature,
  handleWebhookEvent,
};
