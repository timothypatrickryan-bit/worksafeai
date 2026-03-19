import fs from 'fs';
import path from 'path';

/**
 * POST /api/tasks/create
 * Create a new task
 */
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stateFile = '/Users/timothyryan/.openclaw/workspace/.mission-control-state.json';
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));

    const { 
      title, 
      description, 
      projectId,
      status = 'queued',
      priority = 3,
      assignedTo,
      briefing
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const newTask = {
      id: `task-${Date.now()}`,
      title,
      description: description || '',
      projectId,
      status,
      priority,
      assignedTo: assignedTo || null,
      briefing: briefing || null,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activity: [
        {
          timestamp: new Date().toISOString(),
          action: 'created',
          message: 'Task created',
        }
      ],
    };

    // Add to state
    state.tasks = Array.isArray(state.tasks) ? state.tasks : [];
    state.tasks.push(newTask);

    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task', message: error.message });
  }
}
