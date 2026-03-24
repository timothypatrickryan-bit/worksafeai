import React from 'react'

const alertEmoji = {
  critical: '🚨',
  warning: '⚠️',
  info: 'ℹ️',
}

const alertColors = {
  critical: 'bg-red-50 border-l-red-400',
  warning: 'bg-yellow-50 border-l-yellow-400',
  info: 'bg-gray-100 border-l-blue-400',
}

const alertTextColors = {
  critical: 'text-red-700',
  warning: 'text-yellow-700',
  info: 'text-slate-700',
}

export default function AlertsSection({ state }) {
  const alerts = state?.alerts || []

  if (alerts.length === 0) {
    return (
      <div className="bg-neutral-50 rounded-lg p-8 text-center text-neutral-500">
        No active alerts
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert, idx) => (
        <div
          key={idx}
          className={`border-l-4 rounded-lg p-4 ${alertColors[alert.level] || alertColors.info}`}
        >
          <div className="flex gap-3">
            <div className="text-2xl">{alertEmoji[alert.level] || '📌'}</div>
            <div className="flex-1">
              <div className={`font-semibold ${alertTextColors[alert.level] || alertTextColors.info}`}>
                {alert.message}
              </div>
              <div className="text-sm text-neutral-500 mt-1">
                {new Date(alert.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
