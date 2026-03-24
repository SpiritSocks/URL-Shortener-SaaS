CREATE TABLE IF NOT EXISTS plans (
    plan_id   BIGSERIAL PRIMARY KEY,
    name      VARCHAR(50) NOT NULL UNIQUE,
    price_kop BIGINT NOT NULL DEFAULT 0,
    max_links BIGINT NOT NULL DEFAULT 3,
    has_analytics BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO plans (name, price_kop, max_links, has_analytics) VALUES
    ('free', 0, 3, FALSE),
    ('pro', 29900, 20, TRUE),
    ('unlimited', 59900, -1, TRUE)
ON CONFLICT (name) DO NOTHING;

ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_id BIGINT REFERENCES plans(plan_id) DEFAULT 1;

CREATE TABLE IF NOT EXISTS payments (
    payment_id     BIGSERIAL PRIMARY KEY,
    user_id        BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    plan_id        BIGINT NOT NULL REFERENCES plans(plan_id),
    yookassa_id    VARCHAR(255) NOT NULL DEFAULT '',
    amount_kop     BIGINT NOT NULL,
    status         VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at   TIMESTAMPTZ
);
