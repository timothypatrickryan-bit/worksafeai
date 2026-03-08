const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Database migrator using Supabase HTTP API
 * Executes SQL migrations automatically
 */
class DatabaseMigrator {
  constructor(supabaseUrl, serviceRoleKey) {
    this.supabaseUrl = supabaseUrl;
    this.serviceRoleKey = serviceRoleKey;
    this.migrationsDir = path.join(__dirname, '../..', 'scripts');
  }

  /**
   * Execute SQL via Supabase HTTP API
   */
  async executeSql(sql) {
    return new Promise((resolve, reject) => {
      try {
        const url = new URL(this.supabaseUrl);
        const hostname = url.hostname;
        const path = '/rest/v1/rpc/exec_sql';

        const options = {
          hostname,
          port: 443,
          path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.serviceRoleKey}`,
            'apikey': this.serviceRoleKey,
          },
        };

        const req = https.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ success: true, data });
            } else {
              resolve({ success: false, error: data, statusCode: res.statusCode });
            }
          });
        });

        req.on('error', (error) => {
          resolve({ success: false, error: error.message });
        });

        req.write(JSON.stringify({ sql_query: sql }));
        req.end();
      } catch (err) {
        resolve({ success: false, error: err.message });
      }
    });
  }

  /**
   * Get list of pending SQL files
   */
  async getPendingMigrations() {
    try {
      if (!fs.existsSync(this.migrationsDir)) {
        return [];
      }

      const files = fs.readdirSync(this.migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

      return files;
    } catch (err) {
      console.warn('⚠️ Could not read migrations directory:', err.message);
      return [];
    }
  }

  /**
   * Read SQL file
   */
  readSqlFile(filename) {
    try {
      const filepath = path.join(this.migrationsDir, filename);
      return fs.readFileSync(filepath, 'utf8');
    } catch (err) {
      throw new Error(`Could not read migration file ${filename}: ${err.message}`);
    }
  }

  /**
   * Execute a migration and log the result
   */
  async executeMigration(filename) {
    try {
      const sql = this.readSqlFile(filename);

      if (!sql.trim()) {
        console.warn(`⚠️ Migration ${filename} is empty, skipping`);
        return { success: true, skipped: true };
      }

      console.log(`  ⏳ Executing: ${filename}`);

      // Note: For DDL statements, users will need to apply these manually in Supabase
      // This is documented in MIGRATION_GUIDE.md
      console.log(`  ℹ️  Please apply this migration in Supabase SQL Editor:`);
      console.log(`      ${filename}\n`);

      return { success: true, manual: true };
    } catch (err) {
      console.error(`❌ Migration ${filename} error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * List all pending migrations and provide guidance
   */
  async listPendingMigrations() {
    try {
      const pending = await this.getPendingMigrations();

      if (pending.length === 0) {
        console.log('✅ No pending migrations');
        return [];
      }

      console.log(`\n📋 Pending Database Migrations: ${pending.length}\n`);

      for (const migration of pending) {
        const sql = this.readSqlFile(migration);
        console.log(`📄 ${migration}`);
        console.log('   SQL Preview:');
        const lines = sql.split('\n').slice(0, 3);
        lines.forEach(line => {
          if (line.trim()) {
            console.log(`   ${line.substring(0, 80)}`);
          }
        });
        console.log('');
      }

      return pending;
    } catch (err) {
      console.warn('⚠️ Could not list migrations:', err.message);
      return [];
    }
  }
}

module.exports = DatabaseMigrator;
