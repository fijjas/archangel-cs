-- ArchangelCS Database Initialization

-- Create tables
CREATE TABLE IF NOT EXISTS users
(
    id          SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    language    VARCHAR(2) DEFAULT 'en',
    created_at  TIMESTAMP  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feeds
(
    id         SERIAL PRIMARY KEY,
    url        TEXT UNIQUE  NOT NULL,
    domain     VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news
(
    id           SERIAL PRIMARY KEY,
    feed_id      INTEGER NOT NULL REFERENCES feeds (id),
    url          TEXT    NOT NULL,
    title        TEXT    NOT NULL,
    content      TEXT,
    description  TEXT,
    published_at TIMESTAMP,
    cve_code     VARCHAR(50),
    is_analyzed  BOOLEAN   DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT NOW(),
    UNIQUE (feed_id, url)
);

CREATE TABLE IF NOT EXISTS tags
(
    tag_name VARCHAR(100) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS users_tags
(
    user_id  INTEGER      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    tag_name VARCHAR(100) NOT NULL REFERENCES tags (tag_name) ON DELETE CASCADE,
    PRIMARY KEY (user_id, tag_name)
);

CREATE TABLE IF NOT EXISTS news_tags
(
    news_id  INTEGER      NOT NULL REFERENCES news (id) ON DELETE CASCADE,
    tag_name VARCHAR(100) NOT NULL REFERENCES tags (tag_name) ON DELETE CASCADE,
    PRIMARY KEY (news_id, tag_name)
);

CREATE TABLE IF NOT EXISTS notifications
(
    id       SERIAL PRIMARY KEY,
    user_id  INTEGER   NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    news_ids INTEGER[] NOT NULL DEFAULT '{}',
    sent_at  TIMESTAMP          DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_feed_id ON news (feed_id);
CREATE INDEX IF NOT EXISTS idx_news_is_analyzed ON news (is_analyzed);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news (published_at);
CREATE INDEX IF NOT EXISTS idx_news_cve_code ON news (cve_code);
CREATE INDEX IF NOT EXISTS idx_users_tags_user_id ON users_tags (user_id);
CREATE INDEX IF NOT EXISTS idx_users_tags_tag_name ON users_tags (tag_name);
CREATE INDEX IF NOT EXISTS idx_news_tags_news_id ON news_tags (news_id);
CREATE INDEX IF NOT EXISTS idx_news_tags_tag_name ON news_tags (tag_name);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications (sent_at);


-- Predefined RSS feeds for cybersecurity news

INSERT INTO feeds (url, domain, created_at)
VALUES ('https://www.darkreading.com/rss.xml', 'darkreading.com', NOW()),
       ('https://cybersecuritynews.com/feed/', 'cybersecuritynews.com', NOW()),
       ('https://feeds.feedburner.com/TheHackersNews', 'thehackernews.com', NOW()),
       ('https://www.securityweek.com/feed/', 'securityweek.com', NOW()),
       ('https://news.sophos.com/en-us/feed/', 'sophos.com', NOW()),
       ('https://hackread.com/feed/', 'hackread.com', NOW()),
       ('https://cyble.com/feed/', 'cyble.com', NOW()),
       ('https://www.itsecurityguru.org/feed/', 'itsecurityguru.org', NOW()),
       ('https://searchsecurity.techtarget.com/rss/Security-Wire-Daily-News.xml', 'techtarget.com', NOW()),
       ('https://www.csoonline.com/feed/', 'csoonline.com', NOW()),
       ('https://gbhackers.com/feed/', 'gbhackers.com', NOW()),
       ('https://krebsonsecurity.com/feed/', 'krebsonsecurity.com', NOW()),
       ('https://www.bankinfosecurity.com/rss-feeds', 'bankinfosecurity.com', NOW()),
       ('https://www.cyberdefensemagazine.com/feed/', 'cyberdefensemagazine.com', NOW()),
       ('https://www.hackercombat.com/feed/', 'hackercombat.com', NOW()),
       ('https://cybersguards.com/feed/', 'cybersguards.com', NOW()),
       ('https://grahamcluley.com/feed/', 'grahamcluley.com', NOW()),
       ('https://www.govinfosecurity.com/rssFeeds.php?type=main', 'govinfosecurity.com', NOW()),
       ('https://feeds.feedblitz.com/thesecurityledger', 'securityledger.com', NOW()),
       ('https://cybersafe.news/feed/', 'cybersafe.news', NOW()),
       ('https://threatpost.com/feed/', 'threatpost.com', NOW()),
       ('https://news.cyberpress.io/feed/', 'cyberpress.io', NOW()),
       ('https://k12cybersecure.com/feed/', 'k12cybersecure.com', NOW()),
       ('https://virtualattacks.com/feed/', 'virtualattacks.com', NOW()),
       ('https://cyberinsider.com/feed/', 'cyberinsider.com', NOW()),
       ('https://www.esecurityplanet.com/feed/', 'esecurityplanet.com', NOW()),
       ('https://www.helpnetsecurity.com/feed/', 'helpnetsecurity.com', NOW()),
       ('https://www.cybersecuritydive.com/feeds/news/', 'cybersecuritydive.com', NOW()),
       ('https://upstream.auto/feed/', 'upstream.auto', NOW()),
       ('https://thecyberexpress.com/feed/', 'thecyberexpress.com', NOW()),
       ('https://news.mit.edu/topic/mitcyber-security-rss.xml', 'mit.edu', NOW()),
       ('https://www.nytimes.com/svc/collections/v1/publish/https://www.nytimes.com/spotlight/cybersecurity/rss.xml', 'nytimes.com', NOW()),
       ('https://techcrunch.com/tag/cybersecurity/feed/', 'techcrunch.com', NOW()),
       ('https://news.aliasrobotics.com/rss/', 'aliasrobotics.com', NOW()),
       ('https://theconversation.com/topics/cybersecurity-535/articles.atom', 'theconversation.com', NOW()),
       ('https://snwire.com/feed/', 'snwire.com', NOW()),
       ('https://heimdalsecurity.com/blog/category/cybersecurity-news/feed/', 'heimdalsecurity.com', NOW()),
       ('https://www.mitnicksecurity.com/blog/rss.xml', 'mitnicksecurity.com', NOW()),
       ('https://www.scmp.com/rss/296935/feed/', 'scmp.com', NOW()),
       ('https://www.securitymagazine.com/rss/topic/2788', 'securitymagazine.com', NOW()),
       ('https://www.usnews.com/topics/subjects/cybersecurity/rss', 'usnews.com', NOW()),
       ('https://2binnovations.com/category/cybersecurity-news-updates/feed/', '2binnovations.com', NOW()),
       ('https://www.bleepingcomputer.com/feed/', 'bleepingcomputer.com', NOW())
ON CONFLICT (url) DO NOTHING;
