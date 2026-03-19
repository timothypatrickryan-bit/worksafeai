import React, { useState, useEffect } from 'react'

export default function ActivitySection({ state }) {
  const [activity, setActivity] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  // Polling for fresh state every 5 seconds
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:3000/api/status')
        if (res.ok) {
          const freshState = await res.json()
          // Trigger re-render by updating activity
          generateActivities(freshState)
        }
      } catch (err) {
        console.error('Activity polling error:', err)
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(pollInterval)
  }, [])

  const generateActivities = (freshState) => {
    // Generate activity from state
    const activities = []

    // Agent status changes
    Object.entries(freshState?.agents || {}).forEach(([key, agent]) => {
      if (agent.lastActivity) {
        if (agent.status === 'working') {
          activities.push({
            id: `${key}-working`,
            timestamp: agent.lastActivity,
            type: 'agent-working',
            title: `${agent.name} started working`,
            description: agent.currentTask || 'Processing...',
            icon: '🔄',
            color: 'yellow',
          })
        } else if (agent.status === 'complete') {
          activities.push({
            id: `${key}-complete`,
            timestamp: agent.lastActivity,
            type: 'agent-complete',
            title: `${agent.name} completed task`,
            description: agent.output?.type || 'Task done',
            icon: '✓',
            color: 'green',
          })
        }
      }
    })

    // Inbox items
    ;(freshState?.inbox || []).forEach((item) => {
      if (item.status === 'ready-to-send') {
        activities.push({
          id: item.id,
          timestamp: item.timestamp,
          type: 'inbox-ready',
          title: `Message ready: ${item.from} → ${item.to}`,
          description: item.message.substring(0, 60) + '...',
          icon: '📬',
          color: 'blue',
        })
      }
    })

    // Alerts
    ;(freshState?.alerts || []).forEach((alert) => {
      activities.push({
        id: `alert-${alert.timestamp}`,
        timestamp: alert.timestamp,
        type: 'alert',
        title: alert.message,
        icon: '⚠',
        color: alert.level === 'critical' ? 'red' : 'yellow',
      })
    })

    // Sort by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    setActivity(activities.slice(0, 50)) // Keep last 50
  }

  // Also update when props change
  useEffect(() => {
    if (state) {
      generateActivities(state)
    }
  }, [state])

  if (activity.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm">No activity yet</p>
      </div>
    )
  }

  const colorMap = {
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200',
  }

  const textColorMap = {
    yellow: 'text-yellow-700',
    green: 'text-green-700',
    blue: 'text-blue-700',
    red: 'text-red-700',
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const res = await fetch('http://localhost:3000/api/status')
      if (res.ok) {
        const freshState = await res.json()
        generateActivities(freshState)
      }
    } catch (err) {
      console.error('Refresh failed:', err)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Live Activity Feed</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${
            refreshing
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {refreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
        </button>
      </div>

      {/* Activity items */}
      <div className="space-y-2">
        {activity.map((item) => (
        <div
          key={item.id}
          className={`border rounded-md p-3 transition-all ${colorMap[item.color] || colorMap.gray}`}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm ${textColorMap[item.color]}`}>
                {item.title}
              </p>
              {item.description && (
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {item.description}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {formatTime(new Date(item.timestamp))}
              </p>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  )
}

function formatTime(date) {
  const now = new Date()
  const diffMs = now - date
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  
  return date.toLocaleTimeString()
}
