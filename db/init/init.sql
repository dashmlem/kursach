-- Схема для управления кампаниями
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    budget NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Схема для постов в социальных сетях
CREATE TABLE social_posts (
    id SERIAL PRIMARY KEY,
    campaign_id INT REFERENCES campaigns(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Схема для аналитики
CREATE TABLE analytics (
    id SERIAL PRIMARY KEY,
    campaign_id INT REFERENCES campaigns(id) ON DELETE CASCADE,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    spend NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW()
);
