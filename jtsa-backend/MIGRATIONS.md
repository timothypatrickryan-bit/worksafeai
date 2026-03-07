# Database Migrations

## Overview

JTSA Backend uses an automatic migration system to version and track all database schema changes. Migrations run automatically on startup and can be managed via CLI.

## How It Works

1. **Migration files** stored in `/src/db/migrations/` (SQL files)
2. **Applied migrations** tracked in `migrations` table
3. **Auto-run on startup** — any pending migrations execute before server starts
4. **Rollback support** — revert last N migrations with CLI tool

## Creating a Migration

### 1. Create SQL File

File: `/src/db/migrations/NNN_description.sql` (NNN = sequence number)

Example:
```sql
-- Migration 002: Add subscription limits to companies table
ALTER TABLE companies ADD COLUMN max_employees INT DEFAULT 10;
ALTER TABLE companies ADD COLUMN max_projects INT DEFAULT 5;

-- Create indexes for performance
CREATE INDEX idx_companies_subscription_tier ON companies(subscription_tier);
```

Naming convention:
- `000_init_migrations_table.sql` (runs first)
- `001_add_stripe_to_companies.sql`
- `002_add_subscription_limits.sql`
- `003_create_invoices_table.sql`

### 2. Optional: Create Rollback File

File: `/src/db/migrations/NNN_description.rollback.sql`

```sql
-- Rollback for 002_add_subscription_limits.sql
ALTER TABLE companies DROP COLUMN IF EXISTS max_employees;
ALTER TABLE companies DROP COLUMN IF EXISTS max_projects;
DROP INDEX IF EXISTS idx_companies_subscription_tier;
```

### 3. Deploy

Either:
- **Automatic:** Push to main, server runs migrations on next restart
- **Manual:** `node src/cli/migrate.js`

## CLI Commands

### Run Pending Migrations
```bash
node src/cli/migrate.js
```
Runs all migrations in `/src/db/migrations/` that haven't been applied yet.

### Check Status
```bash
node src/cli/migrate.js status
```
Output:
```
Status: pending
Applied: 2
Pending: 3

✓ Applied migrations:
  - 000_init_migrations_table.sql
  - 001_add_stripe_to_companies.sql

⏳ Pending migrations:
  - 002_add_subscription_limits.sql
  - 003_create_invoices_table.sql
  - 004_add_audit_fields.sql
```

### List Migrations
```bash
node src/cli/migrate.js list
```

### Rollback
```bash
node src/cli/migrate.js rollback 1    # Rollback last 1 migration
node src/cli/migrate.js rollback 3    # Rollback last 3 migrations
```

**⚠️ Warning:** Rollback requires `.rollback.sql` file for each migration.

## Best Practices

1. **One change per migration** — Keep migrations focused and reversible
2. **Test in development** — Always test migrations locally first
3. **Create rollback files** — Every migration should be reversible
4. **Idempotent operations** — Use `IF NOT EXISTS` / `IF EXISTS`
5. **No breaking changes** — Plan for zero-downtime deployments
6. **Document changes** — Add comments explaining schema decisions
7. **Timestamp carefully** — Check data consistency after migrations

## Migration Tracking

Migrations are tracked in the `migrations` table:

```sql
SELECT name, applied_at FROM migrations ORDER BY applied_at;
```

Schema version is tracked in `schema_versions`:

```sql
SELECT version, description FROM schema_versions;
```

## Troubleshooting

### Migration Failed on Startup

If a migration fails in production:
1. Check logs for the error
2. Fix the migration file
3. Either rollback or fix forward (add new migration)
4. Restart server

### Can't Rollback?

Rollback requires `.rollback.sql` file:
```bash
# Create if missing
touch src/db/migrations/NNN_description.rollback.sql
```

### Check What Migrations Will Run

```bash
node src/cli/migrate.js status
```

### Manually Execute SQL

If migrations are broken, execute SQL directly in Supabase:
```sql
-- In Supabase SQL editor
ALTER TABLE companies ADD COLUMN contact_email TEXT;
-- Then record it:
INSERT INTO migrations (name) VALUES ('001_add_stripe_to_companies.sql');
```

## Environment Variables

Migrations use same env vars as server:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Load from `.env` file automatically.

## Production Deployment

1. Test migrations locally
2. Commit to version control
3. Deploy code (migrations run automatically on restart)
4. Verify with: `node src/cli/migrate.js status`

If migration fails in production:
```bash
# View status
node src/cli/migrate.js status

# Rollback if needed
node src/cli/migrate.js rollback 1

# Fix and redeploy
```

## Examples

### Add User Permission Levels

```sql
-- Migration 005: Add user permission levels
CREATE TYPE permission_level AS ENUM ('view_only', 'edit', 'admin', 'owner');

ALTER TABLE users ADD COLUMN permission_level permission_level DEFAULT 'edit';
ALTER TABLE users ADD COLUMN can_manage_team BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN can_access_billing BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_users_permission_level ON users(permission_level);
```

### Create New Table

```sql
-- Migration 006: Create invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  amount_cents INT NOT NULL,
  status TEXT DEFAULT 'draft',
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_status ON invoices(status);
```

### Data Migration

```sql
-- Migration 007: Backfill subscription tier data
UPDATE companies
SET subscription_tier = 'pro'
WHERE created_at > '2026-03-01'
AND subscription_tier IS NULL;

-- Verify
SELECT COUNT(*) FROM companies WHERE subscription_tier IS NULL;
```

## See Also

- `/src/db/schema.sql` — Initial schema
- `/src/db/migrations/` — All migration files
- `/src/services/migrationService.js` — Migration engine
- `/src/cli/migrate.js` — CLI tool
