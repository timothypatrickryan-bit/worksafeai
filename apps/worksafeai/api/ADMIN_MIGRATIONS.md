# Admin Migrations Guide

This guide explains how to apply database migrations and manage schema changes.

---

## How It Works

**The system automatically detects pending migrations** from the `/scripts/*.sql` directory on startup.

When the backend starts, it:
1. ✅ Checks for `.sql` files in `/scripts/`
2. ✅ Lists them on startup
3. ✅ Provides an admin API endpoint to get the SQL
4. ✅ You copy/paste into Supabase and apply

---

## Applying Migrations

### Method 1: Via Admin API (Recommended)

**Step 1:** Log in as company owner or admin

**Step 2:** Call the admin API to get pending migrations:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/admin/migrations/pending
```

**Step 3:** Get SQL for a specific migration:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -X POST http://localhost:3000/api/admin/migrations/apply-script \
  -H "Content-Type: application/json" \
  -d '{"filename": "002_add_industry_and_refactor_jtsas.sql"}'
```

**Step 4:** Copy the returned SQL and paste into Supabase:
- Go to: https://app.supabase.com → Your Project → SQL Editor
- Paste the SQL
- Click "Run"
- Done! ✅

### Method 2: Direct Manual Application

1. **Check pending migrations:**
   - Backend logs will show pending migrations on startup
   - Look in `/scripts/` directory

2. **Open Supabase SQL Editor:**
   - https://app.supabase.com → Your Project → SQL Editor

3. **Copy/paste the SQL from the migration file**

4. **Execute** ✅

---

## Current Pending Migrations

### Migration 002: Add Industry & Standalone JTSAs
**File:** `scripts/002_add_industry_and_refactor_jtsas.sql`

**What it does:**
- Adds `industry` column to `companies` table
- Adds `company_id` column to `jtsas` table  
- Adds `project_number`, `location`, `type_of_work` columns to `jtsas`
- Makes `project_id` optional on `jtsas`
- Creates indexes for performance

**Status:** REQUIRED - Apply this before registering new users

### Migration 003: Add Company Onboarding Profile
**File:** `scripts/003_add_company_profile.sql`

**What it does:**
- Adds `company_profile` (JSONB) column to `companies` table
- Adds `onboarding_completed` (Boolean) column to `companies` table
- Creates indexes for efficient queries

**Status:** REQUIRED - Apply this before using onboarding wizard

---

## Admin API Endpoints

### GET /api/admin/migrations/pending
**Authorization:** Owner or Admin only

Lists all pending migrations with SQL preview.

**Example Response:**
```json
{
  "count": 2,
  "migrations": [
    {
      "filename": "002_add_industry_and_refactor_jtsas.sql",
      "preview": "-- Migration 002: Add industry...",
      "sql": "-- Full SQL here..."
    },
    {
      "filename": "003_add_company_profile.sql",
      "preview": "-- Migration 003: Add company profile...",
      "sql": "-- Full SQL here..."
    }
  ],
  "instructions": "Copy the SQL below and paste into Supabase SQL Editor..."
}
```

### POST /api/admin/migrations/apply-script
**Authorization:** Owner or Admin only
**Body:** `{ "filename": "002_add_industry_and_refactor_jtsas.sql" }`

Returns full SQL for a specific migration with copy-paste instructions.

---

## Future: Automated Application

Once Supabase adds direct SQL execution API support, we can:
1. Automatically execute migrations without manual steps
2. Track applied migrations in the database
3. Prevent duplicate applications
4. Log all changes for audit

For now, the manual copy-paste approach is secure and gives you full control.

---

## Troubleshooting

**Q: Backend shows pending migrations but they're not applying?**
- They're listed for your information only
- You must manually apply them in Supabase SQL Editor
- This is by design (gives you control over schema changes)

**Q: How do I know if a migration was applied?**
- ✅ No errors in Supabase SQL Editor after running it
- ✅ New columns should appear in Supabase Data Editor
- ✅ Indexes should show in the Indexing view

**Q: Can I apply migrations out of order?**
- ✅ Yes, they're designed to be idempotent (safe to re-run)
- ✅ All use `IF NOT EXISTS` clauses

**Q: What if a migration fails?**
- Check the error message in Supabase
- Fix the SQL (syntax errors, etc.)
- Reach out with the error details

---

## For Developers

When you need to add a new migration:

1. **Create file:** `/scripts/00X_descriptive_name.sql`
2. **Write SQL** with comments explaining the change
3. **Use `IF NOT EXISTS`** for schema changes (idempotent)
4. **Test** by applying it in Supabase manually first
5. **Commit** to git

Example:
```sql
-- Migration 004: Add new feature table
-- Description: Stores feature flags per company

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_companies_features ON companies USING GIN (features);
```

---

## Questions?

Check the logs when backend starts - they show exactly which migrations are pending and what they'll do.
