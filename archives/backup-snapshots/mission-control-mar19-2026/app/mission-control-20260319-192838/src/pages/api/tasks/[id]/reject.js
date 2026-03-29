import fs from 'fs';
import path from 'path';

/**
 * POST /api/tasks/:id/reject
 * Reject a briefing and keep task in briefing status with feedback
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
    task.status = 'briefing'; // Stays in briefing
    task.rejectionReason = req.body.reason || 'No reason provided';
    task.rejectedAt = new Date().toISOString();
    task.rejectedBy = req.body.rejectedBy || 'user';

    // Add activity log
    if (!task.activity) task.activity = [];
    task.activity.push({
      timestamp: new Date().toISOString(),
      action: 'rejected',
      by: req.body.rejectedBy || 'user',
      reason: req.body.reason || 'No reason provided',
      message: `Briefing rejected - awaiting changes`,
    });

    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    res.status(200).json({ task, message: 'Briefing rejected' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject task', message: error.message });
  }
}
