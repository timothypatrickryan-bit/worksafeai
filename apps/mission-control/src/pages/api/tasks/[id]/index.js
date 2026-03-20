import fs from 'fs';
import path from 'path';

/**
 * PATCH /api/tasks/[id]
 * Update task fields
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

    const taskIndex = (state.tasks || []).findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { title, description, projectId, priority, assignedTo, status } = req.body;
    const task = state.tasks[taskIndex];

    // Update fields if provided
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (projectId !== undefined) task.projectId = projectId;
    if (priority !== undefined) task.priority = priority;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (status !== undefined) task.status = status;

    task.updatedAt = new Date().toISOString();

    state.tasks[taskIndex] = task;
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task', message: error.message });
  }
}

function handleDelete(req, res) {
  try {
    const { id } = req.query;
    const stateFile = '/Users/timothyryan/.openclaw/workspace/.mission-control-state.json';
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));

    const taskIndex = (state.tasks || []).findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const deletedTask = state.tasks[taskIndex];
    state.tasks.splice(taskIndex, 1);
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

    res.status(200).json({ success: true, message: 'Task deleted', task: deletedTask });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task', message: error.message });
  }
}

function handleGet(req, res) {
  try {
    const { id } = req.query;
    const stateFile = '/Users/timothyryan/.openclaw/workspace/.mission-control-state.json';
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));

    const task = (state.tasks || []).find(t => t.id === id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task', message: error.message });
  }
}
