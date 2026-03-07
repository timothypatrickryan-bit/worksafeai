-- JTSA Database Schema
-- Run this in Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('starter', 'pro', 'enterprise')),
  trial_ends_at TIMESTAMP,
  billing_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'project_manager', 'safety_manager', 'employee')),
  company_id UUID NOT NULL REFERENCES companies(id),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es')),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  deleted_at TIMESTAMP,
  password_changed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email verification tokens (time-limited)
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP, -- Mark when token was used (prevents reuse)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens (time-limited)
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- JTSAs table
CREATE TABLE jtsas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id),
  date DATE NOT NULL,
  task_description TEXT NOT NULL,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  created_by UUID NOT NULL REFERENCES users(id),
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- JTSA Participants (many-to-many)
CREATE TABLE jtsa_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jtsa_id UUID NOT NULL REFERENCES jtsas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  role_in_jtsa TEXT,
  signed_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  signed_out_at TIMESTAMP,
  UNIQUE(jtsa_id, user_id)
);

-- Hazards table
CREATE TABLE hazards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jtsa_id UUID NOT NULL REFERENCES jtsas(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  ai_suggested BOOLEAN DEFAULT FALSE,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  user_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mitigations table
CREATE TABLE mitigations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hazard_id UUID NOT NULL REFERENCES hazards(id) ON DELETE CASCADE,
  mitigation_plan TEXT NOT NULL,
  ai_reviewed BOOLEAN DEFAULT FALSE,
  ai_feedback TEXT,
  user_accepted BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL CHECK (action IN ('created_jtsa', 'accepted_hazard', 'rejected_hazard', 'created_mitigation', 'accepted_mitigation', 'rejected_mitigation', 'completed_jtsa', 'exported_pdf')),
  resource_type TEXT,
  resource_id UUID,
  data_changed JSONB,
  ip_address TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL UNIQUE REFERENCES companies(id),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('starter', 'pro', 'enterprise')),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  trial_ends_at TIMESTAMP,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_jtsas_project_id ON jtsas(project_id);
CREATE INDEX idx_jtsas_date ON jtsas(date);
CREATE INDEX idx_jtsas_created_by ON jtsas(created_by);
CREATE INDEX idx_hazards_jtsa_id ON hazards(jtsa_id);
CREATE INDEX idx_mitigations_hazard_id ON mitigations(hazard_id);
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_subscriptions_company_id ON subscriptions(company_id);

-- Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtsas ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE mitigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - CRITICAL FOR SECURITY
-- NOTE: Since we're using JWT instead of Supabase auth, RLS needs custom claims
-- Alternative: Enforce company_id checks in application code (current approach)
-- This is handled in middleware and service layers.

-- For reference, if using Supabase Auth with custom claims:
-- CREATE POLICY "Users see own company data" ON users
--   FOR ALL USING (company_id = (auth.jwt() ->> 'company_id')::UUID);

-- For now, application-level enforcement in middleware:
-- 1. Extract company_id from JWT token
-- 2. Verify user belongs to that company_id
-- 3. All queries filter by company_id
