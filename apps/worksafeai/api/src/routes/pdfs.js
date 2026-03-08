const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

// GET /api/pdfs/:jtsa_id - download JTSA PDF (with access control)
router.get('/:jtsa_id', authenticateToken, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;

    // Validate JTSA ID format (UUID only to prevent path traversal)
    // Validate BEFORE any DB call so we never pass garbage to Supabase
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.params.jtsa_id)) {
      return res.status(400).json({ error: 'Invalid JTSA ID format' });
    }

    // Fetch company_id and date directly from the JTSA row.
    // Standalone JTSAs have no project; project-linked JTSAs have both.
    // We rely on JTSA.company_id for access control in all cases.
    const { data: jtsa, error: jtsaError } = await supabase
      .from('jtsas')
      .select('id, company_id, date')
      .eq('id', req.params.jtsa_id)
      .single();

    if (jtsaError || !jtsa) {
      return res.status(404).json({ error: 'JTSA not found' });
    }

    // Access control: user must belong to the same company as the JTSA
    if (jtsa.company_id !== req.user.companyId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate date format (YYYY-MM-DD only) — guard against corrupt DB data
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!jtsa.date || !dateRegex.test(jtsa.date)) {
      return res.status(400).json({ error: 'Invalid date format in JTSA record' });
    }

    // Construct safe file path using JTSA UUID and date (matches PDF generation naming)
    const filename = `JTSA_${req.params.jtsa_id}_${jtsa.date}.pdf`;
    const pdfDir = path.normalize(path.resolve(__dirname, '../../pdfs'));
    const resolvedPath = path.normalize(path.resolve(pdfDir, filename));

    // Ensure the resolved path stays within the pdfs directory (prevent traversal)
    if (!resolvedPath.startsWith(pdfDir + path.sep) && resolvedPath !== pdfDir) {
      return res.status(403).json({ error: 'Invalid file path' });
    }

    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ error: 'PDF not found. Generate the PDF first.' });
    }

    // Send file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff'); // Prevent MIME sniffing
    fs.createReadStream(resolvedPath).pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download PDF' });
  }
});

module.exports = router;
