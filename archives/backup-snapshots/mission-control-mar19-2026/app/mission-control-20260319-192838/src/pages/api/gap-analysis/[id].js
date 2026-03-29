import fs from 'fs';
import path from 'path';

/**
 * DELETE /api/gap-analysis/[id]
 * Delete an assessment
 */
export default function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const workspacePath = '/Users/timothyryan/.openclaw/workspace';
    const historyFile = path.join(workspacePath, '.gap-analysis-history.json');

    if (!fs.existsSync(historyFile)) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    let history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));

    // Filter out the assessment to delete
    const originalLength = history.length;
    history = history.filter(a => a.id !== id);

    if (history.length === originalLength) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Save updated history
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));

    res.status(200).json({ 
      success: true,
      message: 'Assessment deleted'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to delete assessment', 
      message: error.message 
    });
  }
}
