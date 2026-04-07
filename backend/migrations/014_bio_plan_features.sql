-- Pro: 30 bio links
UPDATE plans SET max_bio_links = 30 WHERE name = 'pro';

-- Custom colors for bio pages (Unlimited feature)
ALTER TABLE bio_pages ADD COLUMN IF NOT EXISTS custom_btn_color VARCHAR(20) NOT NULL DEFAULT '';
ALTER TABLE bio_pages ADD COLUMN IF NOT EXISTS custom_bg_color  VARCHAR(20) NOT NULL DEFAULT '';
