import fs from 'fs';

/**
 * PATCH /api/projects/[id]
 * Update project fields
 */
export default function handler(req, res) {
  if (req.method === 'PATCH') {
    return handleUpdate(req, res);
  }
  if (req.method === 'DELETE') {
    return handleDelete(req, res);
  }
  if (req.method === 'GET') {
    return handleGet(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

function handleUpdate(req, res) {
  try {
    const { id } = req.query;
    const stateFile = '/Users/timothyryan/.openclaw/workspace/.mission-control-state.json';
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));

    const projectIndex = (state.projects || []).findIndex(p => p.id === id);
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { name, description, status, orchestratorPlan } = req.body;
    const project = state.projects[projectIndex];

    // Update fields if provided
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    if (orchestratorPlan !== undefined) project.orchestratorPlan = orchestratorPlan;

    project.updatedAt = new Date().toISOString();

    state.projects[projectIndex] = project;
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project', message: error.message });
  }
}

function handleDelete(req, res) {
  try {
    const { id } = req.query;
    const stateFile = '/Users/timothyryan/.openclaw/workspace/.mission-control-state.json';
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));

    const projectIndex = (state.projects || []).findIndex(p => p.id === id);
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Soft delete: mark tasks as orphaned
    const deletedProject = state.projects[projectIndex];
    state.tasks = (state.tasks || []).map(task => {
      if (task.projectId === id) {
        task.projectId = null;
        task.status = 'completed'; // Mark orphaned tasks as completed
      }
      return task;
    });

    // Remove project
    state.projects.splice(projectIndex, 1);
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

    res.status(200).json({ 
      success: true, 
      message: 'Project deleted', 
      project: deletedProject,
      archivedTasks: state.tasks.filter(t => t.projectId === null).length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project', message: error.message });
  }
}

function handleGet(req, res) {
  try {
    const { id } = req.query;
    const stateFile = '/Users/timothyryan/.openclaw/workspace/.mission-control-state.json';
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));

    const project = (state.projects || []).find(p => p.id === id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project', message: error.message });
  }
}
