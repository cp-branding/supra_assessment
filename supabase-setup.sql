-- Run this in the Supabase SQL Editor to create the assessment_leads table.
-- RLS is disabled — access is only via the service key in Vercel functions.

CREATE TABLE assessment_leads (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  name            TEXT,
  company         TEXT,
  email           TEXT,
  answer_1        TEXT,
  answer_2        TEXT,
  answer_3        TEXT,
  score           INTEGER,
  einordnung      TEXT,
  full_assessment TEXT,
  chat_history    JSONB,
  source          TEXT,
  email_sent      BOOLEAN     DEFAULT FALSE
);

-- Disable RLS (service key only, no public access needed)
ALTER TABLE assessment_leads DISABLE ROW LEVEL SECURITY;
