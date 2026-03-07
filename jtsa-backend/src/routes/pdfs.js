const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

// GET /api/pdfs/:jtsa_id - download JTSA PDF (with access control)
router.get('/:jtsa_id', authenticateToken, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;

    // Verify user has access to this JTSA's company
    const { data: jtsa, error: jtsaError } = await supabase
      .from('jtsas')
      .select('project:projects(company_id)')
      .eq('id', req.params.jtsa_id)
      .single();

    if (jtsaError || !jtsa) {
      return res.status(404).json({ error: 'JTSA not found' });
    }

    if (jtsa.project.company_id !== req.user.companyId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Construct safe file path using JTSA date (matches PDF generation naming)
    const filename = `JTSA_${req.params.jtsa_id}_${jtsa.date}.pdf`;
    const filepath = path.join(__dirname, '../../pdfs', filename);

    // Verify file exists and is within pdfs directory
    const pdfDir = path.join(__dirname, '../../pdfs');
    const resolvedPath = path.resolve(filepath);
    if (!resolvedPath.startsWith(pdfDir)) {
      return res.status(403).json({ error: 'Invalid file path' });
    }

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    // Send file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff'); // Prevent MIME sniffing
    fs.createReadStream(filepath).pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download PDF' });
  }
});

module.exports = router;
