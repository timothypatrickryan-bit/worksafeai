# Database Migration Guide

## Required Migrations for Workflow Refactor

This document outlines all SQL migrations needed to support the new standalone JTSA workflow and company onboarding system.

---

## Apply These Migrations in Order

### Migration 1: Add Industry & Standalone JTSA Support
**Status:** REQUIRED - App will not work without this

Go to: https://app.supabase.com → SQL Editor → Paste this:

```sql
-- Add industry to companies
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS industry VARCHAR(100);

-- Add company_id tracking to jtsas (if missing)
ALTER TABLE jtsas
ADD COLUMN IF NOT EXISTS company_id UUID;

-- Add new fields to jtsas for standalone workflow
ALTER TABLE jtsas
ADD COLUMN IF NOT EXISTS project_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS type_of_work VARCHAR(100);

-- Make project_id optional (allows standalone JTSAs)
ALTER TABLE jtsas
ALTER COLUMN project_id DROP NOT NULL;

-- Add foreign key constraint for company_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'jtsas_company_id_fkey'
  ) THEN
    ALTER TABLE jtsas
    ADD CONSTRAINT jtsas_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jtsas_company_id ON jtsas(company_id);
CREATE INDEX IF NOT EXISTS idx_jtsas_project_number ON jtsas(project_number);
CREATE INDEX IF NOT EXISTS idx_jtsas_location ON jtsas(location);
```

---

### Migration 2: Add Company Onboarding Profile
**Status:** REQUIRED - Onboarding won't work without this

Paste this in SQL Editor:

```sql
-- Add company profile for enhanced safety context
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS company_profile JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create indexes for onboarding queries
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_completed 
ON companies(onboarding_completed);

CREATE INDEX IF NOT EXISTS idx_companies_company_profile 
ON companies USING GIN (company_profile);
```

---

## What These Changes Enable

1. **Standalone JTSAs** - No longer require a project; can be created directly
2. **Company Profiling** - Deep company context for AI safety analysis
3. **Industry-Specific AI** - AI recommendations tailored to company type, size, and risks
4. **Better Hazard Analysis** - AI understands company certifications, compliance, team size, and priorities

---

## Testing After Migrations

1. Try to **register** a new account
   - Should now accept industry selection
   
2. After registration, you should be **redirected to onboarding**
   - 4-step wizard to complete company profile
   
3. After onboarding, go to **Dashboard**
   - Now shows company industry
   
4. Create a **JTSA**
   - No projects needed
   - Enter Project #, Location, Type of Work
   - AI should generate hazards based on company context

---

## Troubleshooting

**500 errors on JTSA list?**
- Migrations haven't been applied yet

**Registration fails with 400 Bad Request?**
- Industry column missing from companies table

**Frontend shows "Complete Onboarding" button?**
- onboarding_completed column missing from companies table

---

## When Ready

Once all migrations are applied:
1. Restart both backend and frontend (they should auto-reload)
2. Try registering a new account
3. Complete the 4-step onboarding wizard
4. You're ready to create JTSAs!
