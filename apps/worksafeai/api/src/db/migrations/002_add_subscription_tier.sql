-- Migration 002: Add subscription_tier column to companies table
-- Tracks the current subscription tier for feature limits

ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'pro', 'enterprise'));

-- Create index for tier-based queries
CREATE INDEX IF NOT EXISTS idx_companies_subscription_tier ON companies(subscription_tier);
