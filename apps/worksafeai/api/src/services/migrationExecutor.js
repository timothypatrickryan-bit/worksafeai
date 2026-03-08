const fs = require('fs');
const path = require('path');

/**
 * Automatic migration executor
 * Reads SQL files from scripts/ directory and executes them against Supabase
 * Tracks applied migrations to prevent duplicates
 */
class MigrationExecutor {
  constructor(supabase) {
    this.supabase = supabase;
    this.migrationsDir = path.join(__dirname, '../..', 'scripts');
  }

  /**
   * Initialize migrations table if it doesn't exist
   */
  async initializeTable() {
    try {
      const { error } = await this.supabase.rpc('pg_temp', {
        sql: `
          CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            executed_at TIMESTAMP DEFAULT NOW(),
            status VARCHAR(20) DEFAULT 'success'
          )
        `
      }).catch(() => {
        // If RPC fails, try direct SQL execution
        return this.supabase.sql`
          CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            executed_at TIMESTAMP DEFAULT NOW(),
            status VARCHAR(20) DEFAULT 'success'
          )
        `;
      });

      if (error) {
        console.warn('⚠️ Could not create migrations table (may already exist):', error.message);
      }
    } catch (err) {
      console.warn('⚠️ Migrations table check skipped:', err.message);
    }
  }

  /**
   * Get list of already-applied migrations
   */
  async getAppliedMigrations() {
    try {
      const { data, error } = await this.supabase
        .from('migrations')
        .select('name')
        .eq('status', 'success');

      if (error) {
        console.warn('⚠️ Could not fetch applied migrations:', error.message);
        return [];
      }

      return data.map(m => m.name) || [];
    } catch (err) {
      console.warn('⚠️ Applied migrations fetch skipped:', err.message);
      return [];
    }
  }

  /**
   * Get list of pending SQL files
   */
  async getPendingMigrations() {
    try {
      if (!fs.existsSync(this.migrationsDir)) {
        console.log('📁 No migrations directory found');
        return [];
      }

      const files = fs.readdirSync(this.migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

      const applied = await this.getAppliedMigrations();
      const pending = files.filter(f => !applied.includes(f));

      return pending;
    } catch (err) {
      console.warn('⚠️ Could not read migrations directory:', err.message);
      return [];
    }
  }

  /**
   * Execute a single migration file
   */
  async executeMigration(filename) {
    try {
      const filepath = path.join(this.migrationsDir, filename);
      const sql = fs.readFileSync(filepath, 'utf8');

      if (!sql.trim()) {
        console.warn(`⚠️ Migration ${filename} is empty, skipping`);
        return false;
      }

      console.log(`  ⏳ Executing: ${filename}`);

      // Split by semicolons and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        const { error } = await this.supabase.rpc('execute_sql', {
          sql_query: statement
        }).catch(async () => {
          // Fallback: try direct query execution for common statements
          try {
            await this.supabase.query(statement);
            return { error: null };
          } catch (err) {
            return { error: err };
          }
        });

        if (error) {
          console.error(`❌ Migration ${filename} failed: ${error.message}`);
          
          // Log failure to migrations table
          await this.supabase
            .from('migrations')
            .insert({
              name: filename,
              status: 'failed',
            })
            .catch(() => {});

          return false;
        }
      }

      // Record successful migration
      const { error: logError } = await this.supabase
        .from('migrations')
        .insert({
          name: filename,
          status: 'success',
        })
        .catch(err => {
          // Ignore insert errors if table doesn't exist
          return { error: null };
        });

      console.log(`  ✅ ${filename} applied successfully`);
      return true;
    } catch (err) {
      console.error(`❌ Migration ${filename} error: ${err.message}`);
      return false;
    }
  }

  /**
   * Run all pending migrations
   */
  async runPending() {
    try {
      await this.initializeTable();
      const pending = await this.getPendingMigrations();

      if (pending.length === 0) {
        console.log('✅ No pending migrations');
        return true;
      }

      console.log(`\n📦 Found ${pending.length} pending migration(s):`);
      pending.forEach(m => console.log(`   • ${m}`));
      console.log('');

      let success = true;
      for (const migration of pending) {
        const result = await this.executeMigration(migration);
        if (!result) success = false;
      }

      if (success) {
        console.log('\n✅ All migrations applied successfully\n');
      } else {
        console.warn('\n⚠️ Some migrations failed (non-blocking in development)\n');
      }

      return success;
    } catch (err) {
      console.error('❌ Migration executor error:', err.message);
      return false;
    }
  }
}

module.exports = MigrationExecutor;
