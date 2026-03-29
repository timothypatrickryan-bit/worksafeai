import fs from 'fs';
import path from 'path';

/**
 * GET /api/memories/load-longterm
 * Load MEMORY.md (long-term memory)
 */
export default function handler(req, res) {
  try {
    const workspacePath = '/Users/timothyryan/.openclaw/workspace';
    const memoryFile = path.join(workspacePath, 'MEMORY.md');

    if (!fs.existsSync(memoryFile)) {
      return res.status(200).json({ content: '', found: false, exists: false });
    }

    const content = fs.readFileSync(memoryFile, 'utf8');
    res.status(200).json({ content, found: true, exists: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load long-term memory', message: error.message });
  }
}
