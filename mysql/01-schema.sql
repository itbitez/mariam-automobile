-- =============================================================
-- Mariam Automobile — MySQL schema
-- Run in: hPanel → Databases → phpMyAdmin → SQL tab, against your site database.
--
-- Safe to run more than once.
--
-- Translation notes from the old Postgres/Supabase schema:
--   jsonb        -> JSON        (MySQL 5.7+ / MariaDB 10.2+)
--   uuid         -> CHAR(36)    generated in application code
--   timestamptz  -> DATETIME    stored UTC; MySQL has no tz-aware type
--   numeric      -> DECIMAL     explicit precision, never FLOAT for money
--   boolean      -> TINYINT(1)
--   text (keyed) -> VARCHAR(n)  MySQL cannot index unbounded TEXT
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ---------- cars ----------
CREATE TABLE IF NOT EXISTS cars (
  id            VARCHAR(191) NOT NULL PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  brand         VARCHAR(120) NOT NULL,
  model         VARCHAR(120) NOT NULL,
  grade         VARCHAR(120) NOT NULL DEFAULT '',
  year          INT NOT NULL,
  body          VARCHAR(60)  NOT NULL DEFAULT 'SUV',
  fuel          VARCHAR(60)  NOT NULL DEFAULT 'Hybrid',
  transmission  VARCHAR(60)  NOT NULL DEFAULT 'Automatic',
  drive         VARCHAR(60)  NOT NULL DEFAULT '2WD',
  engine        VARCHAR(120) NOT NULL DEFAULT '',
  mileage       VARCHAR(120) NOT NULL DEFAULT '',
  seats         INT NOT NULL DEFAULT 5,
  color         VARCHAR(120) NOT NULL DEFAULT '',
  `condition`   VARCHAR(60)  NOT NULL DEFAULT 'Recondition',  -- reserved word in MySQL
  auction       VARCHAR(120) NOT NULL DEFAULT '',
  reg           VARCHAR(120) NOT NULL DEFAULT '',
  price         DECIMAL(12,2) NOT NULL DEFAULT 0,
  featured      TINYINT(1) NOT NULL DEFAULT 0,
  status        VARCHAR(30) NOT NULL DEFAULT 'available',
  show_home     TINYINT(1) NOT NULL DEFAULT 0,
  photos        JSON NOT NULL,
  tagline       VARCHAR(255) NOT NULL DEFAULT '',
  about         TEXT NOT NULL,
  features      JSON NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX cars_status_idx (status),
  INDEX cars_show_home_idx (show_home)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- homepage content (single row, id = 1) ----------
CREATE TABLE IF NOT EXISTS home_content (
  id         INT NOT NULL PRIMARY KEY DEFAULT 1,
  hero       JSON NOT NULL,
  trust      JSON NOT NULL,
  inventory  JSON NOT NULL,
  process    JSON NOT NULL,
  faq        JSON NOT NULL,
  cta        JSON NOT NULL,
  contact    JSON NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- contact details (single row, id = 1) ----------
CREATE TABLE IF NOT EXISTS site_settings (
  id         INT NOT NULL PRIMARY KEY DEFAULT 1,
  phone      VARCHAR(60)  NOT NULL DEFAULT '',
  whatsapp   VARCHAR(60)  NOT NULL DEFAULT '',
  address    VARCHAR(255) NOT NULL DEFAULT '',
  hours_week VARCHAR(120) NOT NULL DEFAULT '',
  hours_fri  VARCHAR(120) NOT NULL DEFAULT '',
  emergency  VARCHAR(120) NOT NULL DEFAULT '',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- website enquiries ----------
CREATE TABLE IF NOT EXISTS leads (
  id         CHAR(36) NOT NULL PRIMARY KEY,
  name       VARCHAR(191) NOT NULL DEFAULT '',
  phone      VARCHAR(60)  NOT NULL DEFAULT '',
  car        VARCHAR(255) NOT NULL DEFAULT '',
  budget     VARCHAR(120) NOT NULL DEFAULT '',
  payment    VARCHAR(120) NOT NULL DEFAULT '',
  message    TEXT NOT NULL,
  source     VARCHAR(60)  NOT NULL DEFAULT 'homepage',
  status     VARCHAR(30)  NOT NULL DEFAULT 'new',   -- new | contacted | closed
  user_agent VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX leads_created_at_idx (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- finance estimator settings (single row, id = 1) ----------
CREATE TABLE IF NOT EXISTS calc_settings (
  id               INT NOT NULL PRIMARY KEY DEFAULT 1,
  price_min        DECIMAL(12,2) NOT NULL DEFAULT 1000000,
  price_max        DECIMAL(12,2) NOT NULL DEFAULT 6000000,
  price_step       DECIMAL(12,2) NOT NULL DEFAULT 50000,
  price_default    DECIMAL(12,2) NOT NULL DEFAULT 3000000,
  down_min         DECIMAL(6,2)  NOT NULL DEFAULT 20,
  down_max         DECIMAL(6,2)  NOT NULL DEFAULT 70,
  down_step        DECIMAL(6,2)  NOT NULL DEFAULT 5,
  down_default     DECIMAL(6,2)  NOT NULL DEFAULT 40,
  term_min         DECIMAL(6,2)  NOT NULL DEFAULT 1,
  term_max         DECIMAL(6,2)  NOT NULL DEFAULT 7,
  term_step        DECIMAL(6,2)  NOT NULL DEFAULT 1,
  term_default     DECIMAL(6,2)  NOT NULL DEFAULT 5,
  rate_min         DECIMAL(6,2)  NOT NULL DEFAULT 7,
  rate_max         DECIMAL(6,2)  NOT NULL DEFAULT 16,
  rate_step        DECIMAL(6,2)  NOT NULL DEFAULT 0.5,
  rate_default     DECIMAL(6,2)  NOT NULL DEFAULT 11,
  show_rate_slider TINYINT(1)    NOT NULL DEFAULT 1,
  car_page_rate    DECIMAL(6,2)  NOT NULL DEFAULT 11,
  heading          VARCHAR(255)  NOT NULL DEFAULT 'Monthly instalment estimator',
  intro            TEXT NOT NULL,
  disclaimer       TEXT NOT NULL,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- happy customers gallery ----------
CREATE TABLE IF NOT EXISTS happy_customers (
  id         CHAR(36) NOT NULL PRIMARY KEY,
  image_url  VARCHAR(500) NOT NULL,
  caption    VARCHAR(255) NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX happy_order_idx (sort_order ASC, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- media library ----------
-- Supabase Storage listed the bucket to build the media library. With files on
-- disk there is no bucket to list, so uploads are catalogued here instead.
CREATE TABLE IF NOT EXISTS media (
  id         CHAR(36) NOT NULL PRIMARY KEY,
  filename   VARCHAR(255) NOT NULL,
  url        VARCHAR(500) NOT NULL,
  mime       VARCHAR(100) NOT NULL DEFAULT '',
  size_bytes INT NOT NULL DEFAULT 0,
  width      INT NULL,
  height     INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY media_filename_uniq (filename),
  INDEX media_created_idx (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- admin users ----------
-- Replaces Supabase Auth. Passwords are stored as scrypt hashes, never plain.
-- Create the first user with:  npm run admin:create
CREATE TABLE IF NOT EXISTS admin_users (
  id            CHAR(36) NOT NULL PRIMARY KEY,
  email         VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL,
  UNIQUE KEY admin_users_email_uniq (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- admin sessions ----------
-- Replaces Supabase's JWT session handling. The browser holds only an opaque
-- token in an httpOnly cookie; everything else is looked up server side.
CREATE TABLE IF NOT EXISTS admin_sessions (
  token      CHAR(64) NOT NULL PRIMARY KEY,
  user_id    CHAR(36) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX admin_sessions_user_idx (user_id),
  INDEX admin_sessions_expiry_idx (expires_at),
  CONSTRAINT admin_sessions_user_fk
    FOREIGN KEY (user_id) REFERENCES admin_users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- seed the single-row settings tables ----------
INSERT IGNORE INTO site_settings (id) VALUES (1);
INSERT IGNORE INTO calc_settings (id, intro, disclaimer) VALUES (1, '', '');
