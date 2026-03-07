-- Migration 001: Add Stripe billing fields to companies table
-- Run this in Supabase SQL editor to add Stripe support

ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'paused', 'cancelled'));
ALTER TABLE companies ADD COLUMN IF NOT EXISTS billing_period_end TIMESTAMP;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_companies_stripe_customer_id ON companies(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_companies_stripe_subscription_id ON companies(stripe_subscription_id);
