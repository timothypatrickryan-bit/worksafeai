const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const migrationsDir = path.join(__dirname, '../..', 'scripts');

/**
 * GET /api/admin/migrations/pending - List pending migrations
 * Admin/Owner only - shows SQL that needs to be applied
 */
router.get('/admin/migrations/pending',
  authenticateToken,
  authorizeRole(['owner', 'admin']),
  async (req, res) => {
    try {
      if (!fs.existsSync(migrationsDir)) {
        return res.json({ pending: [] });
      }

      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

      const pending = files.map(filename => {
        const filepath = path.join(migrationsDir, filename);
        const sql = fs.readFileSync(filepath, 'utf8');
        return {
          filename,
          sql,
          preview: sql.split('\n').slice(0, 5).join('\n'),
        };
      });

      res.json({
        count: pending.length,
        migrations: pending,
        instructions: 'Copy the SQL below and paste into Supabase SQL Editor to apply these migrations',
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/admin/migrations/apply-script - Apply a migration by filename
 * Admin/Owner only
 * Body: { filename: "001_add_stripe_to_companies.sql" }
 */
router.post('/admin/migrations/apply-script',
  authenticateToken,
  authorizeRole(['owner', 'admin']),
  async (req, res) => {
    try {
      const { filename } = req.body;

      if (!filename || !filename.endsWith('.sql')) {
        return res.status(400).json({ error: 'Invalid filename' });
      }

      // Reject filenames with directory traversal characters
      if (/[\/\\]/.test(filename) || filename.includes('..')) {
        return res.status(400).json({ error: 'Invalid filename' });
      }

      // Security: normalise both paths and require a path separator after the
      // base directory to prevent prefix-based traversal attacks
      // (e.g. /app/scripts_evil/file.sql starts with /app/scripts)
      const normalizedBase = path.normalize(migrationsDir) + path.sep;
      const filepath = path.normalize(path.join(migrationsDir, filename));

      if (!filepath.startsWith(normalizedBase)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: 'Migration file not found' });
      }

      const sql = fs.readFileSync(filepath, 'utf8');

      res.json({
        filename,
        status: 'ready',
        instructions: `
1. Go to https://app.supabase.com → Your Project → SQL Editor
2. Paste this SQL:

${sql}

3. Click "Run" 
4. Once complete, it will be tracked automatically on next startup
        `,
        sql, // Full SQL for copying
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
