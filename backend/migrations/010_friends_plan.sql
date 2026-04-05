INSERT INTO plans (name, price_kop, max_links, has_analytics, max_bio_links) VALUES
    ('friends', 0, -1, TRUE, -1)
ON CONFLICT (name) DO NOTHING;
