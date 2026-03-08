-- Migration 005: Add trial start date to subscriptions table
-- Track when the trial period begins for better management

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS trial_start_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS trial_period_days INTEGER DEFAULT 7;

-- Update existing trial subscriptions to have a trial_start_at
-- If trial_ends_at exists but trial_start_at is null, calculate it
UPDATE subscriptions
SET trial_start_at = CASE
  WHEN trial_ends_at IS NOT NULL THEN trial_ends_at - INTERVAL '7 days'
  ELSE NULL
END
WHERE trial_start_at IS NULL AND trial_ends_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_start_at 
ON subscriptions(trial_start_at);
