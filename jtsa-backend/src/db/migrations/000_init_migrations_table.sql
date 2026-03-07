-- Migration 000: Initialize migrations tracking table
-- This must run first to set up the migration system itself

CREATE TABLE IF NOT EXISTS migrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  checksum TEXT, -- Optional: SHA256 of migration file for integrity checking
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_migrations_applied_at ON migrations(applied_at);

-- Store database schema version
CREATE TABLE IF NOT EXISTS schema_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version TEXT NOT NULL UNIQUE,
  description TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initialize schema version
INSERT INTO schema_versions (version, description)
VALUES ('1.0.0', 'Initial JTSA schema with auth, CRUD, AI integration, billing')
ON CONFLICT (version) DO NOTHING;
