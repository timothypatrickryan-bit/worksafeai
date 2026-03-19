import fs from 'fs';
import path from 'path';

/**
 * GET /api/projects - Get all projects
 * POST /api/projects - Create a new project
 */
export default function handler(req, res) {
  const stateFile = '/Users/timothyryan/.openclaw/workspace/.mission-control-state.json';

  if (req.method === 'GET') {
    try {
      if (!fs.existsSync(stateFile)) {
        return res.status(200).json({ projects: [] });
      }
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      res.status(200).json({ projects: state.projects || [] });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  } else if (req.method === 'POST') {
    try {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      const newProject = {
        id: `project-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
      };
      state.projects = state.projects || [];
      state.projects.push(newProject);
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
      res.status(201).json(newProject);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create project' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
