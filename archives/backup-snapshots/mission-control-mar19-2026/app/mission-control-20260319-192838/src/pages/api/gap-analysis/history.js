import fs from 'fs';
import path from 'path';

/**
 * GET /api/gap-analysis/history
 * Load assessment history
 */
export default function handler(req, res) {
  try {
    const workspacePath = '/Users/timothyryan/.openclaw/workspace';
    const historyFile = path.join(workspacePath, '.gap-analysis-history.json');

    if (!fs.existsSync(historyFile)) {
      return res.status(200).json([]);
    }

    const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to load assessment history', 
      message: error.message 
    });
  }
}
