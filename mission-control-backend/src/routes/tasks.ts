/**
 * Task management routes
 */

import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware.js';
import { validateRequest, CreateTaskSchema, UpdateTaskSchema, CreateTaskPayload, UpdateTaskPayload } from '../validation.js';
import { createTask, getTaskById, getAllTasks, updateTask } from '../database.js';
import { generateId } from '../auth.js';
import { logger } from '../logger.js';
import { Task, ApiResponse } from '../types.js';

const router = Router();

// All task routes require authentication
router.use(authenticateToken);

/**
 * GET /api/tasks
 * List all tasks (optionally filter by status)
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await getAllTasks();

    res.status(200).json({
      success: true,
      data: tasks,
      timestamp: new Date().toISOString(),
    } as ApiResponse<Task[]>);
  } catch (error) {
    logger.error('Get tasks error', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks',
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
});

/**
 * POST /api/tasks
 * Create new task
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = validateRequest<CreateTaskPayload>(CreateTaskSchema, req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: validation.error,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
      return;
    }

    const { title, description, priority, project } = validation.data!;
    const taskId = generateId();
    const now = new Date().toISOString();

    const newTask: Task = {
      id: taskId,
      title,
      description,
      status: 'pending',
      priority,
      project,
      created_at: now,
      started_at: null,
      completed_at: null,
      output: null,
    };

    await createTask(newTask);

    logger.info('Task created', { taskId, title, project });

    res.status(201).json({
      success: true,
      data: newTask,
      timestamp: new Date().toISOString(),
    } as ApiResponse<Task>);
  } catch (error) {
    logger.error('Create task error', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({
      success: false,
      error: 'Failed to create task',
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
});

/**
 * PATCH /api/tasks/:id
 * Update task
 */
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verify task exists
    const existingTask = await getTaskById(id);
    if (!existingTask) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
      return;
    }

    // Validate update payload
    const validation = validateRequest<UpdateTaskPayload>(UpdateTaskSchema, req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: validation.error,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
      return;
    }

    const updates = validation.data!;

    // Update task
    await updateTask(id, updates);

    // Fetch updated task
    const updatedTask = await getTaskById(id);

    logger.info('Task updated', { taskId: id, updates: Object.keys(updates) });

    res.status(200).json({
      success: true,
      data: updatedTask,
      timestamp: new Date().toISOString(),
    } as ApiResponse<Task>);
  } catch (error) {
    logger.error('Update task error', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({
      success: false,
      error: 'Failed to update task',
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
});

/**
 * GET /api/tasks/:id
 * Get single task
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await getTaskById(id);

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
      return;
    }

    res.status(200).json({
      success: true,
      data: task,
      timestamp: new Date().toISOString(),
    } as ApiResponse<Task>);
  } catch (error) {
    logger.error('Get task error', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task',
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
});

export default router;
