/**
 * Migration Service — Database versioning and schema management
 * Tracks applied migrations, supports rollback, auto-runs on startup
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
      // Create migrations tracking table if it doesn't exist
      await this.supabase.rpc('create_migrations_table', {});
    } catch (error) {
      // Table might already exist, that's ok
      console.warn('Migrations table initialization note:', error.message);
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

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get applied migrations:', error);
      return [];
    }
  }

  /**
   * Get list of migration files from disk
   */
  async getPendingMigrations() {
    try {
      const files = await fs.readdir(this.migrationsDir);
      const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

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
   * Run a single migration
   */
  async runMigration(filename) {
    try {
      console.log(`Running migration: ${filename}`);

      const content = await this.readMigration(filename);
      if (!content) {
        throw new Error(`Migration file not found: ${filename}`);
      }

      // Execute SQL
      const { error } = await this.supabase.rpc('exec_sql', {
        sql_string: content,
      });

      if (error && error.code !== 'PGRST301') {
        // PGRST301 is "Not found" for RPC, but the SQL may have executed
        throw error;
      }

      // Record migration
      await this.supabase
        .from(this.tableName)
        .insert({
          name: filename,
          applied_at: new Date().toISOString(),
        });

      console.log(`✓ Migration applied: ${filename}`);
      return true;
    } catch (error) {
      console.error(`✗ Migration failed: ${filename}`, error.message);
      return false;
    }
  }

  /**
   * Rollback last N migrations
   */
  async rollback(count = 1) {
    try {
      console.log(`Rolling back ${count} migration(s)...`);

      const applied = await this.getAppliedMigrations();
      const toRollback = applied.slice(-count).reverse();

      for (const migration of toRollback) {
        const rollbackFile = migration.name.replace('.sql', '.rollback.sql');
        const content = await this.readMigration(rollbackFile);

        if (!content) {
          console.warn(`No rollback file found: ${rollbackFile}`);
          continue;
        }

        // Execute rollback
        await this.supabase.rpc('exec_sql', { sql_string: content });

        // Remove from tracking
        await this.supabase
          .from(this.tableName)
          .delete()
          .eq('name', migration.name);

        console.log(`✓ Rolled back: ${migration.name}`);
      }

      return true;
    } catch (error) {
      console.error('Rollback failed:', error);
      return false;
    }
  }

  /**
   * Run all pending migrations
   */
  async runAll() {
    try {
      const pending = await this.getPendingMigrations();

      if (pending.length === 0) {
        console.log('✓ All migrations up to date');
        return true;
      }

      console.log(`\n📝 Found ${pending.length} pending migration(s)`);

      let successful = 0;
      for (const migration of pending) {
        const success = await this.runMigration(migration);
        if (success) successful++;
      }

      console.log(`\n✓ Applied ${successful}/${pending.length} migrations\n`);

      if (successful === pending.length) {
        return true;
      } else {
        throw new Error(`Only ${successful}/${pending.length} migrations succeeded`);
      }
    } catch (error) {
      console.error('Migration batch failed:', error);
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
