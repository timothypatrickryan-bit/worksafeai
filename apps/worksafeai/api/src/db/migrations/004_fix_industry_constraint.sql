-- Migration 004: Fix industry constraint to include all valid industries
-- Drop the old constraint and recreate it with the correct list including Telecommunications

ALTER TABLE companies
DROP CONSTRAINT IF EXISTS check_valid_industry;

-- Recreate constraint with complete industry list
ALTER TABLE companies
ADD CONSTRAINT check_valid_industry CHECK (industry IN (
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
