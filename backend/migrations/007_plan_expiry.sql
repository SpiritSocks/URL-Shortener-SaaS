-- Add subscription expiry tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

-- Update plan link limits to match intended monthly quotas
UPDATE plans SET max_links = 5 WHERE name = 'free';
UPDATE plans SET max_links = 40 WHERE name = 'pro';
