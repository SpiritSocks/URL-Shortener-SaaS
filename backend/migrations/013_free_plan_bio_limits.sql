-- Update free plan: increase bio links from 3 to 5
UPDATE plans SET max_bio_links = 5 WHERE name = 'free';
