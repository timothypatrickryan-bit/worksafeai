/**
 * GET /api/mission-control/projects
 * Returns all projects with metadata for the dashboard
 */
export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Demo data - replace with database queries
    const projects = [
      {
        id: 1,
        name: 'WorkSafeAI',
        status: 'In Progress',
        progress: 72,
        taskCount: 15,
        description: 'Job Task Safety Analysis tool for construction industry',
      },
      {
        id: 2,
        name: 'Mission Control',
        status: 'In Progress',
        progress: 45,
        taskCount: 12,
        description: 'Complete visual redesign with improved UX and workflows',
      },
      {
        id: 3,
        name: 'Consensus',
        status: 'In Progress',
        progress: 28,
        taskCount: 8,
        description: 'Product Review Aggregation and Analysis Platform',
      },
      {
        id: 4,
        name: 'LinkedIn Automation',
        status: 'Active',
        progress: 100,
        taskCount: 5,
        description: 'Automated LinkedIn content posting with Brave Search',
      },
      {
        id: 5,
        name: 'Hyperscaler Briefings',
        status: 'Active',
        progress: 100,
        taskCount: 3,
        description: 'Automated daily briefings for data center industry',
      },
      {
        id: 6,
        name: 'Project Warp Speed',
        status: 'Active',
        progress: 15,
        taskCount: 35,
        description: 'Pro-Tel growth acceleration - data center infrastructure market leadership (Northeast PA/Upstate NY)',
        owner: 'Tim Ryan',
        team: 'Strategy',
      },
    ]

    res.status(200).json({
      success: true,
      projects,
      stats: {
        total: projects.length,
        active: projects.filter(p => p.status === 'Active').length,
        inProgress: projects.filter(p => p.status === 'In Progress').length,
        avgCompletion: Math.round(
          projects.reduce((sum, p) => sum + p.progress, 0) / projects.length
        ),
      },
      pendingApprovals: 3,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    res.status(500).json({
      error: 'Failed to fetch projects',
      message: error.message,
    })
  }
}
