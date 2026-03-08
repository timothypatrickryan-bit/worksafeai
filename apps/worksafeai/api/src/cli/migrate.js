#!/usr/bin/env node

/**
 * CLI Tool: Database Migration Runner
 * 
 * Usage:
 *   node src/cli/migrate.js                 # Run all pending migrations
 *   node src/cli/migrate.js status          # Check migration status
 *   node src/cli/migrate.js rollback [N]    # Rollback last N migrations (default: 1)
 *   node src/cli/migrate.js list            # List all migrations
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const MigrationService = require('../services/migrationService');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const migrationService = new MigrationService(supabase);

const command = process.argv[2];
const arg1 = process.argv[3];

const main = async () => {
  console.log('\n📦 JTSA Database Migration Tool\n');

  try {
    // Initialize migrations table
    await migrationService.initTable();

    switch (command) {
      case 'status':
        await handleStatus();
        break;

      case 'list':
        await handleList();
        break;

      case 'rollback':
        await handleRollback(arg1);
        break;

      case undefined:
        // Default: run all pending
        await handleRun();
        break;

      default:
        showHelp();
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
};

const handleRun = async () => {
  console.log('⏳ Running pending migrations...\n');
  const success = await migrationService.runAll();
  if (!success) {
    throw new Error('Migration batch failed');
  }
};

const handleStatus = async () => {
  const status = await migrationService.getStatus();
  console.log('Status:', status.status);
  console.log(`Applied: ${status.applied_count}`);
  console.log(`Pending: ${status.pending_count}`);

  if (status.applied_migrations.length > 0) {
    console.log('\n✓ Applied migrations:');
    status.applied_migrations.forEach(m => console.log(`  - ${m}`));
  }

  if (status.pending_migrations.length > 0) {
    console.log('\n⏳ Pending migrations:');
    status.pending_migrations.forEach(m => console.log(`  - ${m}`));
  }
};

const handleList = async () => {
  const applied = await migrationService.getAppliedMigrations();
  const pending = await migrationService.getPendingMigrations();

  console.log('Applied Migrations:');
  applied.forEach(m => {
    const date = new Date(m.applied_at).toISOString().split('T')[0];
    console.log(`  ✓ ${m.name} (${date})`);
  });

  if (pending.length > 0) {
    console.log('\nPending Migrations:');
    pending.forEach(m => {
      console.log(`  ⏳ ${m}`);
    });
  }
};

const handleRollback = async (count) => {
  const rollbackCount = parseInt(count) || 1;
  console.log(`\n⚠️  Rolling back ${rollbackCount} migration(s)...\n`);

  const success = await migrationService.rollback(rollbackCount);
  if (!success) {
    throw new Error('Rollback failed');
  }
};

const showHelp = () => {
  console.log(`Usage:
  node src/cli/migrate.js                 Run all pending migrations
  node src/cli/migrate.js status          Check migration status
  node src/cli/migrate.js list            List all migrations
  node src/cli/migrate.js rollback [N]    Rollback last N migrations (default: 1)
`);
};

main();
