/**
 * System health and status routes
 */

import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware.js';
import { getTaskStats } from '../database.js';
import { ApiResponse, DashboardStats } from '../types.js';
import { logger } from '../logger.js';

const router = Router();

/**
 * GET /api/health
 * Health check (no auth required)
 */
router.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/status
 * Dashboard stats (requires auth)
 */
router.get('/status', authenticateToken, async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getTaskStats();

    const dashboardStats: DashboardStats = {
      totalTasks: stats.total,
      executingTasks: stats.executing,
      completedTasks: stats.completed,
      activeAgents: 1, // Placeholder - would be dynamic
      systemHealth: 100, // Placeholder - would be computed
    };

    res.status(200).json({
      success: true,
      data: dashboardStats,
      timestamp: new Date().toISOString(),
    } as ApiResponse<DashboardStats>);
  } catch (error) {
    logger.error('Status check error', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({
      success: false,
      error: 'Failed to fetch status',
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
});

/**
 * GET /api/gap-analysis/scores
 * System health scores
 */
router.get('/gap-analysis/scores', authenticateToken, async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getTaskStats();

    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    const executionRate = stats.total > 0 ? Math.round((stats.executing / stats.total) * 100) : 0;

    const scores = {
      overallHealth: completionRate,
      executionRate,
      completionRate,
      activeAgents: 1,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      data: scores,
      timestamp: new Date().toISOString(),
    } as ApiResponse<typeof scores>);
  } catch (error) {
    logger.error('Gap analysis error', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({
      success: false,
      error: 'Failed to compute gap analysis',
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
});

export default router;
