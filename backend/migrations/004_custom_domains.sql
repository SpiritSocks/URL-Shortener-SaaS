CREATE TABLE IF NOT EXISTS custom_domains (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(user_id),
    domain          VARCHAR(255) NOT NULL UNIQUE,
    verified        BOOLEAN DEFAULT FALSE,
    ssl_status      VARCHAR(20) DEFAULT 'pending',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_custom_domains_user_id ON custom_domains(user_id);

ALTER TABLE links ADD COLUMN IF NOT EXISTS custom_domain_id BIGINT REFERENCES custom_domains(id) ON DELETE SET NULL;
