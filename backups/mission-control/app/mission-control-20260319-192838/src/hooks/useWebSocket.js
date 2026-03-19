import { useState, useEffect, useRef } from 'react'

export default function useWebSocket(initialState = null) {
  // Initialize with provided state or empty fallback
  const [state, setState] = useState(initialState || {
    tasks: [],
    projects: [],
    agents: [],
    team: [],
    inbox: [],
    alerts: [],
    contacts: {},
    status: 'loading'
  })
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    // Fetch initial state from API
    const fetchState = async () => {
      try {
        const res = await fetch('/api/status', { cache: 'no-store' })
        if (!res.ok) {
          throw new Error(`API error ${res.status}`)
        }
        const data = await res.json()
        
        // Only update if component is still mounted
        if (isMounted) {
          console.log('✅ Data loaded:', { 
            tasks: data.tasks?.length, 
            projects: data.projects?.length
          })
          setState(data)
          setIsConnected(true)
        }
      } catch (err) {
        console.error('❌ Fetch error:', err)
        if (isMounted) setIsConnected(false)
      }
    }

    // Fetch immediately
    fetchState()

    // Poll every 10 seconds
    const interval = setInterval(fetchState, 10000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return [state, isConnected, wsRef.current]
}
