CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  google_refresh_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS senders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(320) NOT NULL,
  smtp_host VARCHAR(255) NOT NULL,
  smtp_port INTEGER NOT NULL,
  smtp_user VARCHAR(320) NOT NULL,
  smtp_password TEXT,
  auth_type VARCHAR(20) NOT NULL DEFAULT 'smtp'
    CHECK(auth_type IN ('smtp', 'oauth2')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, email)
);

CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES senders(id) ON DELETE RESTRICT,
  recipient VARCHAR(320) NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled'
    CHECK(status IN ('scheduled','processing','sent','failed')),
  bullmq_job_id VARCHAR(255),
  message_id VARCHAR(998),
  idempotency_key VARCHAR(500) UNIQUE NOT NULL,
  hourly_limit INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emails_user_status
  ON emails(user_id, status);

CREATE INDEX IF NOT EXISTS idx_emails_scheduled_at
  ON emails(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_emails_recipient
  ON emails(recipient);

CREATE TABLE IF NOT EXISTS slack_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id VARCHAR(255),
  access_token TEXT NOT NULL,
  channel_id VARCHAR(255),
  webhook_url TEXT,
  connected BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe migrations for databases created by an older version.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;

ALTER TABLE senders
  ADD COLUMN IF NOT EXISTS auth_type VARCHAR(20) NOT NULL DEFAULT 'smtp';

ALTER TABLE senders
  ALTER COLUMN smtp_password DROP NOT NULL;

ALTER TABLE emails
  ADD COLUMN IF NOT EXISTS hourly_limit INTEGER NOT NULL DEFAULT 100;

CREATE INDEX IF NOT EXISTS idx_users_google_id
  ON users(google_id);
