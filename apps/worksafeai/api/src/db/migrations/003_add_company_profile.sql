-- Migration 003: Add company profile for enhanced safety context
-- Stores detailed company safety, operational, and compliance information

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS company_profile JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Company profile structure (for reference):
-- {
--   "companySize": "1-10" | "11-50" | "51-200" | "200+",
--   "yearsInBusiness": "<1" | "1-5" | "5-10" | "10+",
--   "primaryLocations": "single" | "multi" | "mobile",
--   "annualRevenue": "$0-250K" | "$250K-1M" | "$1M-5M" | "$5M-25M" | "$25M+",
--   "safetyProfile": {
--     "certifications": ["OSHA", "ISO 45001", "ANSI", "Other", "None"],
--     "complianceRequirements": ["OSHA", "EPA", "DOT", "State-specific", "None"],
--     "incidentHistory": "no-incidents" | "minor" | "moderate" | "frequent",
--     "insuranceRequired": true | false
--   },
--   "operationalContext": {
--     "workTypes": ["Residential", "Commercial", "Industrial", "Maintenance", ...],
--     "environmentalChallenges": ["High-altitude", "Extreme temps", "Confined spaces", ...],
--     "typicalTeamSize": "solo" | "2-5" | "5-20" | "20+"
--   },
--   "safetyPriorities": {
--     "concerns": ["Electrical hazards", "Fall protection", "Chemical exposure", ...],
--     "riskTolerance": "conservative" | "moderate" | "aggressive"
--   },
--   "completedAt": "2026-03-07T15:40:00Z"
-- }

-- Create index for faster onboarding queries
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_completed 
ON companies(onboarding_completed);

-- Create index for company profile queries
CREATE INDEX IF NOT EXISTS idx_companies_company_profile 
ON companies USING GIN (company_profile);
