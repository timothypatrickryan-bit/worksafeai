/**
 * GET /api/gap-analysis/assessment - Get current gap assessment
 * POST /api/gap-analysis/assessment - Save new assessment
 */
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGet(req, res)
  } else if (req.method === 'POST') {
    return handlePost(req, res)
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function handleGet(req, res) {
  try {
    // Demo assessment data
    const assessment = {
      id: 'current',
      lastUpdated: new Date().toISOString(),
      summary: {
        overallScore: 3,
        averageScore: 3,
        critical: 2,
        high: 3,
        medium: 1,
      },
      scores: {
        'autonomy-decision-making': 2,
        'autonomy-error-recovery': 3,
        'autonomy-learning': 2,
        'value-output': 4,
        'value-throughput': 3,
        'value-impact': 3,
        'org-roles': 4,
        'org-coordination': 2,
        'org-specialization': 3,
        'scale-team': 3,
        'scale-workload': 2,
        'scale-efficiency': 2,
        'reliability-uptime': 5,
        'reliability-recovery': 3,
        'reliability-data': 4,
        'collab-transparency': 4,
        'collab-feedback': 2,
        'collab-trust': 3,
      },
      swimlanes: [
        {
          id: 'autonomy',
          title: 'Autonomy & Independence',
          score: 2,
          status: 'low',
        },
        {
          id: 'value',
          title: 'Value Generation & Delivery',
          score: 3,
          status: 'moderate',
        },
        {
          id: 'organization',
          title: 'Organization & Structure',
          score: 3,
          status: 'moderate',
        },
        {
          id: 'scalability',
          title: 'Scalability & Growth',
          score: 2,
          status: 'low',
        },
        {
          id: 'reliability',
          title: 'Reliability & Resilience',
          score: 4,
          status: 'high',
        },
        {
          id: 'collaboration',
          title: 'Human-AI Collaboration',
          score: 3,
          status: 'moderate',
        },
      ],
    }

    res.status(200).json({
      success: true,
      ...assessment,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching assessment:', error)
    res.status(500).json({
      error: 'Failed to fetch assessment',
      message: error.message,
    })
  }
}

async function handlePost(req, res) {
  try {
    const { scores, notes, timestamp } = req.body

    if (!scores || typeof scores !== 'object') {
      return res.status(400).json({ error: 'Invalid scores data' })
    }

    // In a real app, save to database
    // For now, just return success

    const savedAssessment = {
      id: `assessment-${Date.now()}`,
      scores,
      notes,
      timestamp: timestamp || new Date().toISOString(),
      savedAt: new Date().toISOString(),
    }

    res.status(200).json({
      success: true,
      message: 'Assessment saved successfully',
      assessment: savedAssessment,
    })
  } catch (error) {
    console.error('Error saving assessment:', error)
    res.status(500).json({
      error: 'Failed to save assessment',
      message: error.message,
    })
  }
}
