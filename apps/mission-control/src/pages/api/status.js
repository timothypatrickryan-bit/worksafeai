/**
 * GET /api/status
 * Returns the current status of the Mission Control application
 */
export default function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    res.status(200).json({
      online: true,
      status: 'operational',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get status',
      message: error.message,
    })
  }
}
