import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Read the mission control state file from workspace
    const stateFilePath = path.join(
      process.cwd(),
      '..',
      '..',
      '.mission-control-state.json'
    )

    if (!fs.existsSync(stateFilePath)) {
      return res.status(404).json({ 
        error: 'State file not found',
        path: stateFilePath 
      })
    }

    const fileContent = fs.readFileSync(stateFilePath, 'utf8')
    const stateData = JSON.parse(fileContent)

    // Return the state data
    res.status(200).json(stateData)
  } catch (error) {
    console.error('Error reading mission control state:', error)
    res.status(500).json({ 
      error: 'Failed to read state file',
      message: error.message 
    })
  }
}
