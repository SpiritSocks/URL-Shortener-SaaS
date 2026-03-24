CREATE TABLE IF NOT EXISTS users (
    user_id    BIGSERIAL PRIMARY KEY,
    user_name  VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_admin   BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS links (
    link_id    BIGSERIAL PRIMARY KEY,
    owner_id   BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    slug       VARCHAR(20) NOT NULL UNIQUE,
    target_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_links_slug ON links(slug);
CREATE INDEX IF NOT EXISTS idx_links_owner ON links(owner_id);

CREATE TABLE IF NOT EXISTS click_events (
    event_id   BIGSERIAL PRIMARY KEY,
    link_id    BIGINT NOT NULL REFERENCES links(link_id) ON DELETE CASCADE,
    clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_agent TEXT NOT NULL DEFAULT '',
    country    VARCHAR(100) NOT NULL DEFAULT '',
    device     VARCHAR(50)  NOT NULL DEFAULT '',
    browser    VARCHAR(100) NOT NULL DEFAULT '',
    os         VARCHAR(100) NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_clicks_link ON click_events(link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_time ON click_events(clicked_at);
