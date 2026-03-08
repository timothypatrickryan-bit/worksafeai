-- Migration 002: Add industry to companies, refactor JTSA workflow (remove project dependency)
-- This migration enables standalone JTSAs without requiring a project

-- 1. Add industry column to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS industry VARCHAR(100);

-- Add check constraint for valid industries
ALTER TABLE companies
ADD CONSTRAINT IF NOT EXISTS check_valid_industry CHECK (industry IN (
  'General Contracting',
  'Electrical',
  'Plumbing & HVAC',
  'Excavation & Demolition',
  'Heavy Equipment Operation',
  'Utility Services',
  'Concrete & Masonry',
  'Roofing',
  'Steel Erection',
  'Pipeline & Underground Utilities',
  'Telecommunications',
  'Other'
));

-- 2. Add company_id column to jtsas table for company-level queries
ALTER TABLE jtsas
ADD COLUMN IF NOT EXISTS company_id UUID;

-- 3. Add new fields to jtsas table for standalone workflow
ALTER TABLE jtsas
ADD COLUMN IF NOT EXISTS project_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS type_of_work VARCHAR(100);

-- 4. Make project_id optional (nullable) to support standalone JTSAs
ALTER TABLE jtsas
ALTER COLUMN project_id DROP NOT NULL;

-- 5. Add foreign key constraint for company_id if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'jtsas_company_id_fkey' 
    AND table_name = 'jtsas'
  ) THEN
    ALTER TABLE jtsas
    ADD CONSTRAINT jtsas_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 6. Create indexes for better query performance on new columns
CREATE INDEX IF NOT EXISTS idx_jtsas_project_number ON jtsas(project_number);
CREATE INDEX IF NOT EXISTS idx_jtsas_location ON jtsas(location);
CREATE INDEX IF NOT EXISTS idx_jtsas_type_of_work ON jtsas(type_of_work);
CREATE INDEX IF NOT EXISTS idx_jtsas_company_id ON jtsas(company_id);
CREATE INDEX IF NOT EXISTS idx_jtsas_company_standalone ON jtsas(company_id) WHERE project_id IS NULL;

-- 7. Add created_at index for sorting (if missing)
CREATE INDEX IF NOT EXISTS idx_jtsas_created_at ON jtsas(created_at);

-- 8. Document migration purpose
-- This migration:
-- - Adds industry tracking to companies for context-aware AI
-- - Enables standalone JTSAs without projects
-- - Maintains project-based JTSAs for backward compatibility
-- - Adds company_id tracking for efficient company-level queries
--
-- Note: Existing JTSAs will have NULL values for project_number, location, type_of_work
-- New JTSAs must provide these fields
