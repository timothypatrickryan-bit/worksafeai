import fs from 'fs';

/**
 * POST /api/tasks/[id]/status
 * Update task status (cycles through queued → executing → completed)
 */
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { status } = req.body;
    const stateFile = '/Users/timothyryan/.openclaw/workspace/.mission-control-state.json';
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));

    const taskIndex = (state.tasks || []).findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = state.tasks[taskIndex];
    const validStatuses = ['queued', 'executing', 'completed'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // If status is provided, use it; otherwise cycle
    if (status) {
      task.status = status;
    } else {
      const currentIndex = validStatuses.indexOf(task.status);
      task.status = validStatuses[(currentIndex + 1) % validStatuses.length];
    }

    task.updatedAt = new Date().toISOString();
    
    if (task.status === 'completed' && !task.completedAt) {
      task.completedAt = new Date().toISOString();
    }

    state.tasks[taskIndex] = task;
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task status', message: error.message });
  }
}
