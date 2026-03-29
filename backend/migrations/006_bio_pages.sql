CREATE TABLE IF NOT EXISTS bio_pages (
    bio_page_id   BIGSERIAL PRIMARY KEY,
    user_id       BIGINT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    handle        VARCHAR(50) NOT NULL UNIQUE CHECK (handle ~ '^[a-z0-9_-]{3,50}$'),
    display_name  VARCHAR(100) NOT NULL DEFAULT '',
    bio_text      TEXT NOT NULL DEFAULT '',
    avatar_url    TEXT NOT NULL DEFAULT '',
    theme         VARCHAR(30) NOT NULL DEFAULT 'default',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bio_pages_handle ON bio_pages(handle);
CREATE INDEX IF NOT EXISTS idx_bio_pages_user_id ON bio_pages(user_id);

CREATE TABLE IF NOT EXISTS bio_links (
    bio_link_id   BIGSERIAL PRIMARY KEY,
    bio_page_id   BIGINT NOT NULL REFERENCES bio_pages(bio_page_id) ON DELETE CASCADE,
    link_id       BIGINT NOT NULL REFERENCES links(link_id) ON DELETE CASCADE,
    title         VARCHAR(200) NOT NULL,
    position      INT NOT NULL DEFAULT 0,
    is_visible    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(bio_page_id, link_id)
);

CREATE INDEX IF NOT EXISTS idx_bio_links_page ON bio_links(bio_page_id);

ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_bio_links BIGINT NOT NULL DEFAULT 5;
UPDATE plans SET max_bio_links = 3 WHERE name = 'free';
UPDATE plans SET max_bio_links = 20 WHERE name = 'pro';
UPDATE plans SET max_bio_links = -1 WHERE name = 'unlimited';
