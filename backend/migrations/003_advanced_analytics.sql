-- Add referer tracking to click events
ALTER TABLE click_events ADD COLUMN IF NOT EXISTS referer TEXT NOT NULL DEFAULT '';

-- Index for faster referer queries
CREATE INDEX IF NOT EXISTS idx_clicks_referer ON click_events(referer);
