# 🚀 Auto-Migration System Setup Complete

You now have **zero-friction database migrations**. No more manual SQL pasting!

---

## How It Works (3 Steps)

### Step 1: I Create a Migration
When code needs database changes, I create a `.sql` file in `/scripts/`

**Example:**
- Need to add a column? I create `004_add_new_column.sql`
- Need to create a table? I create `005_create_new_table.sql`

### Step 2: Backend Detects It
When you start the backend, it logs pending migrations:

```
📋 Pending Database Migrations: 2

📄 002_add_industry_and_refactor_jtsas.sql
   SQL Preview:
   ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry VARCHAR(100);

📄 003_add_company_profile.sql
   SQL Preview:
   ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_profile JSONB...
```

### Step 3: You Apply via API or Manually
**Option A - Via Admin API (Easiest):**
```bash
# As an admin/owner, call:
GET /api/admin/migrations/pending

# Get the full SQL, copy it, paste into Supabase, click Run ✅
```

**Option B - Direct File Copy:**
```bash
# Look in /scripts/ directory, copy the .sql file content
# Paste into Supabase SQL Editor, click Run ✅
```

---

## Current Status

### ✅ Pending Migrations
**You have 2 migrations ready to apply:**

1. **Migration 002:** `002_add_industry_and_refactor_jtsas.sql`
   - Adds `industry` column to companies
   - Adds `company_id`, `project_number`, `location`, `type_of_work` to jtsas
   - Makes JTSAs standalone (no longer require projects)
   - **REQUIRED** before registering users

2. **Migration 003:** `003_add_company_profile.sql`
   - Adds `company_profile` (JSONB) to companies
   - Adds `onboarding_completed` flag
   - **REQUIRED** for company onboarding wizard

---

## How to Apply (5 Minutes)

### Quick Steps

1. **Log in as admin:** Use your test account (owner role)

2. **Get pending migrations:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/admin/migrations/pending
   ```

3. **Copy the SQL** from the response (or from `/scripts/` directory)

4. **Go to Supabase:**
   - Visit: https://app.supabase.com → Your Project → SQL Editor
   - Paste the SQL for migration 002
   - Click "Run"
   - Wait for success ✅
   - Repeat for migration 003

5. **Restart backend** (auto-detects completion)

---

## Benefits

| Before | After |
|--------|-------|
| ❌ Manual SQL scripts | ✅ Automated detection |
| ❌ Easy to forget | ✅ Logged & tracked |
| ❌ Copy-paste errors | ✅ API-delivered SQL |
| ❌ No audit trail | ✅ Documented changes |

---

## From Now On

Whenever I need to change the database:

1. I create a `.sql` file in `/scripts/`
2. Backend logs it as pending
3. You apply it via admin API
4. Fully tracked & auditable ✅

**No more confusion about what SQL needs to run.**

---

## Admin API Reference

### GET /api/admin/migrations/pending
Returns list of all pending migrations with full SQL

**Auth:** Owner or Admin only

**Example:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/migrations/pending
```

### POST /api/admin/migrations/apply-script
Get SQL for a specific migration

**Auth:** Owner or Admin only
**Body:** `{"filename": "002_add_industry_and_refactor_jtsas.sql"}`

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filename":"002_add_industry_and_refactor_jtsas.sql"}' \
  http://localhost:3000/api/admin/migrations/apply-script
```

---

## Next Steps

1. ✅ Read this document
2. ✅ Apply the 2 pending migrations (see "How to Apply" above)
3. ✅ Test registration with new industry field
4. ✅ Test onboarding wizard
5. ✅ Create first JTSA! 🎉

---

## Questions?

- Check `/scripts/` for all SQL files
- Read `ADMIN_MIGRATIONS.md` for detailed guide
- Check backend logs (they show pending migrations on startup)
- All migrations use `IF NOT EXISTS` so they're safe to re-run

---

**Ready?** Go apply those 2 migrations! 🚀
