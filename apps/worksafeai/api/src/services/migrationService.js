/**
 * Migration Service — Database versioning and schema management
 * Simplified version that tracks migrations without requiring exec_sql RPC
 * 
 * NOTE: This service assumes the base schema has been created in Supabase manually.
 * Migrations are applied by tracking them in the 'migrations' table.
 * Actual SQL execution must be done manually or through a different mechanism.
 */

const fs = require('fs').promises;
const path = require('path');

class MigrationService {
  constructor(supabase) {
    this.supabase = supabase;
    this.migrationsDir = path.join(__dirname, '../db/migrations');
    this.tableName = 'migrations'; // Internal table to track versions
  }

  /**
   * Initialize migrations table (run once at startup)
   */
  async initTable() {
    try {
      // Try to read from migrations table to see if it exists
      const { error: selectError } = await this.supabase
        .from(this.tableName)
        .select('id')
        .limit(1);

      if (selectError && selectError.code === 'PGRST116') {
        // Table doesn't exist yet
        console.log('⚠️ Migrations table not found. Create it in Supabase using:');
        console.log(`   CREATE TABLE IF NOT EXISTS migrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`);
        return false;
      }

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      return true;
    } catch (error) {
      console.warn('⚠️ Could not verify migrations table:', error.message);
      console.log('⚠️ Continuing without migration tracking...');
      return false;
    }
  }

  /**
   * Get list of applied migrations
   */
  async getAppliedMigrations() {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('name, applied_at')
        .order('applied_at', { ascending: true });

      if (error) {
        // Table might not exist, return empty
        if (error.code === 'PGRST116') return [];
        throw error;
      }
      return data || [];
    } catch (error) {
      console.warn('⚠️ Could not get applied migrations:', error.message);
      return [];
    }
  }

  /**
   * Get list of migration files from disk
   */
  async getPendingMigrations() {
    try {
      const files = await fs.readdir(this.migrationsDir);
      const sqlFiles = files.filter(f => f.endsWith('.sql') && !f.endsWith('.rollback.sql')).sort();

      // Get applied migrations
      const applied = await this.getAppliedMigrations();
      const appliedNames = new Set(applied.map(m => m.name));

      // Filter out already-applied migrations
      const pending = sqlFiles.filter(f => !appliedNames.has(f));
      return pending;
    } catch (error) {
      console.error('Failed to get pending migrations:', error);
      return [];
    }
  }

  /**
   * Read migration file
   */
  async readMigration(filename) {
    try {
      const filePath = path.join(this.migrationsDir, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      console.error(`Failed to read migration ${filename}:`, error);
      return null;
    }
  }

  /**
   * Record a migration as applied (without executing SQL)
   * In production, SQL must be executed separately (via Supabase console or migrations tool)
   */
  async recordMigration(filename) {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .insert({
          name: filename,
          applied_at: new Date().toISOString(),
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Failed to record migration ${filename}:`, error);
      return false;
    }
  }

  /**
   * Run all pending migrations
   * In the current setup, this just tracks them (SQL must be applied separately)
   */
  async runAll() {
    try {
      const pending = await this.getPendingMigrations();

      if (pending.length === 0) {
        console.log('✓ All migrations up to date');
        return true;
      }

      console.log(`\n📝 Found ${pending.length} pending migration(s)`);

      // For now, just log the migrations that need to be applied
      // The actual SQL must be executed in Supabase
      for (const migration of pending) {
        const content = await this.readMigration(migration);
        if (content) {
          console.log(`\n📌 To apply migration: ${migration}`);
          console.log('   SQL to execute:');
          content.split('\n').slice(0, 3).forEach(line => console.log(`   ${line}`));
          console.log('   ...');
        }
      }

      console.log(`\n⚠️  ${pending.length} migrations need to be applied.`);
      console.log('   See SETUP_LOCAL.md or MIGRATIONS.md for instructions.');
      console.log('   Migrations can be applied manually in Supabase console or automatically with a migration tool.\n');

      // In development, continue anyway. In production, this should fail.
      if (process.env.NODE_ENV === 'production') {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Migration check failed:', error);
      return false;
    }
  }

  /**
   * Get migration status
   */
  async getStatus() {
    try {
      const applied = await this.getAppliedMigrations();
      const pending = await this.getPendingMigrations();

      return {
        applied_count: applied.length,
        pending_count: pending.length,
        applied_migrations: applied.map(m => m.name),
        pending_migrations: pending,
        status: pending.length === 0 ? 'up_to_date' : 'pending',
      };
    } catch (error) {
      console.error('Failed to get migration status:', error);
      return null;
    }
  }
}

module.exports = MigrationService;
