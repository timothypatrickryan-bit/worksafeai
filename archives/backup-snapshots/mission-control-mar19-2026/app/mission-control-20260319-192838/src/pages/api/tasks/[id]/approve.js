import fs from 'fs';
import path from 'path';

/**
 * POST /api/tasks/:id/approve
 * Approve a briefing and move task to queued status
 */
export default function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stateFile = '/Users/timothyryan/.openclaw/workspace/.mission-control-state.json';
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));

    // Find and update task
    const taskIndex = (state.tasks || []).findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = state.tasks[taskIndex];
    task.status = 'queued';
    task.approvedAt = new Date().toISOString();
    task.approvedBy = req.body.approvedBy || 'user';

    // Add activity log
    if (!task.activity) task.activity = [];
    task.activity.push({
      timestamp: new Date().toISOString(),
      action: 'approved',
      by: req.body.approvedBy || 'user',
      message: `Task approved and queued for execution`,
    });

    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    res.status(200).json({ task, message: 'Task approved and queued' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve task', message: error.message });
  }
}
