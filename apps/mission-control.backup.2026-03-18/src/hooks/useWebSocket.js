import { useState, useEffect, useRef } from 'react'

export default function useWebSocket() {
  const [state, setState] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef(null)

  useEffect(() => {
    // Fetch initial state from API
    const fetchState = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/status')
        const data = await res.json()
        setState(data)
      } catch (err) {
        console.error('Failed to fetch state:', err)
      }
    }

    fetchState()

    // Connect to WebSocket
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${wsProtocol}//localhost:3000`

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.addEventListener('open', () => {
        setIsConnected(true)
      })

      ws.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data)
          if (message.type === 'state-update') {
            setState(message.payload)
          }
        } catch (err) {
          console.error('Failed to parse message:', err)
        }
      })

      ws.addEventListener('close', () => {
        setIsConnected(false)
        // Try to reconnect after 3 seconds
        setTimeout(fetchState, 3000)
      })

      ws.addEventListener('error', (err) => {
        console.error('WebSocket error:', err)
        setIsConnected(false)
      })
    } catch (err) {
      console.error('Failed to create WebSocket:', err)
    }

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
    }
  }, [])

  return [state, isConnected, wsRef.current]
}
