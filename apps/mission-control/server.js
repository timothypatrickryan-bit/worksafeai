const express = require('express')
const next = require('next')
const path = require('path')

const dev = false
const app = express()
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()

nextApp.prepare().then(() => {
  // Serve static files from .next directory with proper caching
  app.use('/_next', express.static(path.join(__dirname, '.next'), {
    maxAge: '1y',
    immutable: true,
  }))

  // Handle all other requests through Next.js
  app.all('*', (req, res) => {
    return handle(req, res)
  })

  // Start listening
  const server = app.listen(3000, (err) => {
    if (err) throw err
    console.log('✅ Mission Control ready on http://localhost:3000')
  })

  server.on('error', (err) => {
    console.error('Server error:', err)
    process.exit(1)
  })
}).catch((ex) => {
  console.error('Next.js preparation failed:', ex.stack)
  process.exit(1)
})
