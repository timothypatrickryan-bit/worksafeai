import fs from 'fs';
import path from 'path';

/**
 * GET /api/tasks - Get all tasks
 * POST /api/tasks - Create a new task
 */
export default function handler(req, res) {
  const stateFile = '/Users/timothyryan/.openclaw/workspace/.mission-control-state.json';

  if (req.method === 'GET') {
    try {
      if (!fs.existsSync(stateFile)) {
        return res.status(200).json({ tasks: [] });
      }
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      res.status(200).json({ tasks: state.tasks || [] });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  } else if (req.method === 'POST') {
    try {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      const newTask = {
        id: `task-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
      };
      state.tasks = state.tasks || [];
      state.tasks.push(newTask);
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create task' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
