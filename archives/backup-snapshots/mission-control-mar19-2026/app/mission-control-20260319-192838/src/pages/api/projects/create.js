import fs from 'fs';
import path from 'path';

/**
 * POST /api/projects/create
 * Create a new project
 */
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stateFile = '/Users/timothyryan/.openclaw/workspace/.mission-control-state.json';
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));

    const { name, description, status = 'active', orchestratorPlan } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const newProject = {
      id: `project-${Date.now()}`,
      name,
      description: description || '',
      status,
      orchestratorPlan: orchestratorPlan || {
        objective: '',
        phases: [],
        timeline: '',
        metrics: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to state
    state.projects = Array.isArray(state.projects) ? state.projects : [];
    state.projects.push(newProject);

    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project', message: error.message });
  }
}
